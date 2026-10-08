import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface ProjectUser {
	id: string;
	email: string;
	name: string;
	passwordHash?: string;
	provider: 'email' | 'google' | 'github';
	role: string;
	avatarUrl?: string;
	metadata?: Record<string, any>;
	isBanned?: boolean;
	isEmailVerified?: boolean;
	createdAt: string;
	updatedAt: string;
	lastSignInAt?: string;
}

const USERS_FILE = path.resolve(process.cwd(), '.nodely-users.json');
const usersMap = new Map<string, ProjectUser>();

function hashPassword(password: string): string {
	return crypto.createHash('sha256').update(password + '_nodely_salt').digest('hex');
}

function seedDefaultUsers() {
	const now = new Date().toISOString();
	const defaults: ProjectUser[] = [
		{
			id: 'usr_default_admin',
			email: 'alex@example.com',
			name: 'Alex Rivera',
			passwordHash: hashPassword('password123'),
			provider: 'email',
			role: 'admin',
			avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&crop=face',
			metadata: { department: 'Engineering' },
			isBanned: false,
			isEmailVerified: true,
			createdAt: now,
			updatedAt: now,
			lastSignInAt: now
		},
		{
			id: 'usr_default_google',
			email: 'sarah.chen@gmail.com',
			name: 'Sarah Chen',
			provider: 'google',
			role: 'user',
			avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&fit=crop&crop=face',
			metadata: { googleSub: '109827364512398471203' },
			isBanned: false,
			isEmailVerified: true,
			createdAt: now,
			updatedAt: now,
			lastSignInAt: now
		}
	];

	for (const u of defaults) {
		usersMap.set(u.id, u);
	}
	saveToDisk();
}

function loadFromDisk() {
	try {
		if (fs.existsSync(USERS_FILE)) {
			const data = fs.readFileSync(USERS_FILE, 'utf-8');
			const list: ProjectUser[] = JSON.parse(data);
			usersMap.clear();
			for (const u of list) {
				usersMap.set(u.id, u);
			}
			if (usersMap.size === 0) {
				seedDefaultUsers();
			}
		} else {
			seedDefaultUsers();
		}
	} catch (e) {
		console.error('Failed to load project users from disk:', e);
		seedDefaultUsers();
	}
}

function saveToDisk() {
	try {
		const list = Array.from(usersMap.values());
		fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
	} catch (e) {
		console.error('Failed to save project users to disk:', e);
	}
}

// Initial load
loadFromDisk();

export function getAllUsers(): ProjectUser[] {
	return Array.from(usersMap.values()).sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

export function getUserById(id: string): ProjectUser | null {
	return usersMap.get(id) || null;
}

export function getUserByEmail(email: string): ProjectUser | null {
	const normalized = email.trim().toLowerCase();
	for (const u of usersMap.values()) {
		if (u.email.toLowerCase() === normalized) {
			return u;
		}
	}
	return null;
}

export function createUser(data: {
	email: string;
	password?: string;
	name?: string;
	role?: string;
	provider?: 'email' | 'google' | 'github';
	metadata?: Record<string, any>;
	avatarUrl?: string;
}): { success: boolean; user?: ProjectUser; error?: string } {
	const email = (data.email || '').trim().toLowerCase();
	if (!email || !email.includes('@')) {
		return { success: false, error: 'A valid email address is required' };
	}

	if (getUserByEmail(email)) {
		return { success: false, error: `A user with email ${email} already exists` };
	}

	const now = new Date().toISOString();
	const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

	const newUser: ProjectUser = {
		id,
		email,
		name: data.name || email.split('@')[0],
		passwordHash: data.password ? hashPassword(data.password) : undefined,
		provider: data.provider || (data.password ? 'email' : 'email'),
		role: data.role || 'user',
		avatarUrl: data.avatarUrl,
		metadata: data.metadata || {},
		isBanned: false,
		isEmailVerified: data.provider === 'google',
		createdAt: now,
		updatedAt: now,
		lastSignInAt: now
	};

	usersMap.set(newUser.id, newUser);
	saveToDisk();

	return { success: true, user: sanitizeUser(newUser) };
}

export function authenticateUser(
	email: string,
	password: string
): { success: boolean; user?: ProjectUser; sessionToken?: string; error?: string } {
	const user = getUserByEmail(email);
	if (!user) {
		return { success: false, error: 'Invalid email or password' };
	}

	if (user.isBanned) {
		return { success: false, error: 'User account has been suspended' };
	}

	if (!user.passwordHash || user.passwordHash !== hashPassword(password)) {
		return { success: false, error: 'Invalid email or password' };
	}

	// Update last sign in
	user.lastSignInAt = new Date().toISOString();
	usersMap.set(user.id, user);
	saveToDisk();

	const sessionToken = `tok_${user.id}_${Date.now().toString(36)}_${crypto.randomBytes(16).toString('hex')}`;

	return {
		success: true,
		user: sanitizeUser(user),
		sessionToken
	};
}

export function createOrUpdateGoogleUser(data: {
	googleSub: string;
	email: string;
	name: string;
	avatarUrl?: string;
}): { success: boolean; user: ProjectUser; sessionToken: string } {
	let user = getUserByEmail(data.email);
	const now = new Date().toISOString();

	if (user) {
		user.name = data.name || user.name;
		user.avatarUrl = data.avatarUrl || user.avatarUrl;
		user.metadata = { ...(user.metadata || {}), googleSub: data.googleSub };
		user.lastSignInAt = now;
		user.updatedAt = now;
		usersMap.set(user.id, user);
	} else {
		const id = `usr_g_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
		user = {
			id,
			email: data.email.toLowerCase(),
			name: data.name,
			provider: 'google',
			role: 'user',
			avatarUrl: data.avatarUrl,
			metadata: { googleSub: data.googleSub },
			isBanned: false,
			isEmailVerified: true,
			createdAt: now,
			updatedAt: now,
			lastSignInAt: now
		};
		usersMap.set(id, user);
	}

	saveToDisk();

	const sessionToken = `tok_${user.id}_${Date.now().toString(36)}_${crypto.randomBytes(16).toString('hex')}`;

	return {
		success: true,
		user: sanitizeUser(user),
		sessionToken
	};
}

export function updateUser(
	id: string,
	updates: Partial<Omit<ProjectUser, 'id' | 'createdAt'>> & { password?: string }
): { success: boolean; user?: ProjectUser; error?: string } {
	const user = usersMap.get(id);
	if (!user) {
		return { success: false, error: 'User not found' };
	}

	if (updates.email && updates.email !== user.email) {
		const existing = getUserByEmail(updates.email);
		if (existing && existing.id !== id) {
			return { success: false, error: 'Email already in use by another user' };
		}
		user.email = updates.email.trim().toLowerCase();
	}

	if (updates.name !== undefined) user.name = updates.name;
	if (updates.role !== undefined) user.role = updates.role;
	if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
	if (updates.isBanned !== undefined) user.isBanned = updates.isBanned;
	if (updates.isEmailVerified !== undefined) user.isEmailVerified = updates.isEmailVerified;
	if (updates.metadata !== undefined) user.metadata = { ...(user.metadata || {}), ...updates.metadata };
	if (updates.password) {
		user.passwordHash = hashPassword(updates.password);
	}

	user.updatedAt = new Date().toISOString();
	usersMap.set(id, user);
	saveToDisk();

	return { success: true, user: sanitizeUser(user) };
}

export function deleteUser(id: string): boolean {
	const existed = usersMap.delete(id);
	if (existed) {
		saveToDisk();
	}
	return existed;
}

export function sanitizeUser(user: ProjectUser): ProjectUser {
	const copy = { ...user };
	delete copy.passwordHash;
	return copy;
}

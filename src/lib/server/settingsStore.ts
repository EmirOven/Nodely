import fs from 'node:fs';
import path from 'node:path';

export interface NodelySettings {
	openaiApiKey: string;
	openaiDefaultModel: string;
	openaiDefaultTemperature: number;
	googleClientId: string;
	googleClientSecret: string;
	jwtSecret: string;
	jwtExpiresIn: string;
	corsOrigins: string;
	updatedAt: string;
}

const SETTINGS_FILE = path.resolve(process.cwd(), '.nodely-settings.json');

const defaultSettings: NodelySettings = {
	openaiApiKey: '',
	openaiDefaultModel: 'gpt-4o-mini',
	openaiDefaultTemperature: 0.7,
	googleClientId: '',
	googleClientSecret: '',
	jwtSecret: 'nodely_jwt_secret_' + Math.random().toString(36).substring(2, 15),
	jwtExpiresIn: '7d',
	corsOrigins: '*',
	updatedAt: new Date().toISOString()
};

let cachedSettings: NodelySettings = { ...defaultSettings };

function loadFromDisk(): NodelySettings {
	try {
		if (fs.existsSync(SETTINGS_FILE)) {
			const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
			const parsed = JSON.parse(data);
			cachedSettings = { ...defaultSettings, ...parsed };
		} else {
			saveToDisk(cachedSettings);
		}
	} catch (e) {
		console.error('Failed to load settings from disk:', e);
	}
	return cachedSettings;
}

function saveToDisk(settings: NodelySettings) {
	try {
		settings.updatedAt = new Date().toISOString();
		fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
		cachedSettings = settings;
	} catch (e) {
		console.error('Failed to save settings to disk:', e);
	}
}

// Initial load
loadFromDisk();

export function getSettings(): NodelySettings {
	return { ...cachedSettings };
}

export function updateSettings(partial: Partial<NodelySettings>): NodelySettings {
	const current = getSettings();
	const updated = {
		...current,
		...partial,
		updatedAt: new Date().toISOString()
	};
	saveToDisk(updated);
	return updated;
}

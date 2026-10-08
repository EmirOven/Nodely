import { json, type RequestHandler } from '@sveltejs/kit';
import { getAllUsers, createUser, sanitizeUser } from '../../../lib/server/userStore';

export const GET: RequestHandler = async () => {
	const users = getAllUsers().map(sanitizeUser);
	return json({ users });
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const result = createUser(body);
		if (!result.success) {
			return json({ error: result.error }, { status: 400 });
		}
		return json({ user: result.user }, { status: 201 });
	} catch (err: any) {
		return json({ error: err.message || 'Invalid request body' }, { status: 400 });
	}
};

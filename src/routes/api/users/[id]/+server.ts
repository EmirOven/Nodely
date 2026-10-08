import { json, type RequestHandler } from '@sveltejs/kit';
import { getUserById, updateUser, deleteUser, sanitizeUser } from '../../../../lib/server/userStore';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) return json({ error: 'User ID is required' }, { status: 400 });

	const user = getUserById(id);
	if (!user) return json({ error: 'User not found' }, { status: 404 });

	return json({ user: sanitizeUser(user) });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) return json({ error: 'User ID is required' }, { status: 400 });

	try {
		const updates = await request.json();
		const result = updateUser(id, updates);
		if (!result.success) {
			return json({ error: result.error }, { status: 400 });
		}
		return json({ user: result.user });
	} catch (err: any) {
		return json({ error: err.message || 'Failed to update user' }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) return json({ error: 'User ID is required' }, { status: 400 });

	const deleted = deleteUser(id);
	if (!deleted) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	return json({ success: true, message: `User ${id} deleted` });
};

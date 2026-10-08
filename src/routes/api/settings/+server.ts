import { json, type RequestHandler } from '@sveltejs/kit';
import { getSettings, updateSettings } from '../../../lib/server/settingsStore';

export const GET: RequestHandler = async () => {
	const settings = getSettings();
	// Mask the apiKey slightly for display security if needed, or send as is for editing
	return json({ settings });
};

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const updates = await request.json();
		const updated = updateSettings(updates);
		return json({ success: true, settings: updated });
	} catch (err: any) {
		return json({ error: err.message || 'Failed to update settings' }, { status: 400 });
	}
};

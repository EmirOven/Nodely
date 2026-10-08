import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { token } = await request.json();
		if (!token || typeof token !== 'string') {
			return json({ success: false, error: 'Telegram Bot Token is required' }, { status: 400 });
		}

		const res = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
		const data = await res.json();

		if (data.ok && data.result) {
			return json({
				success: true,
				bot: {
					id: data.result.id,
					firstName: data.result.first_name,
					username: data.result.username,
					canJoinGroups: data.result.can_join_groups,
					canReadAllGroupMessages: data.result.can_read_all_group_messages
				}
			});
		} else {
			return json({
				success: false,
				error: data.description || 'Invalid Telegram Bot Token or unauthorized request'
			}, { status: 400 });
		}
	} catch (err: any) {
		return json({
			success: false,
			error: err.message || 'Failed to connect to Telegram Bot API'
		}, { status: 500 });
	}
};

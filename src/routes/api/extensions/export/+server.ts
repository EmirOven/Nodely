import { json, type RequestHandler } from '@sveltejs/kit';
import { getAllExtensions, getExtensionById } from '../../../../lib/server/extensionStore';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		const ext = getExtensionById(id);
		if (!ext) {
			return json({ success: false, error: 'Extension not found' }, { status: 404 });
		}

		return new Response(JSON.stringify(ext, null, 2), {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="${ext.id}-manifest.json"`
			}
		});
	}

	const all = getAllExtensions();
	return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), extensions: all }, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': 'attachment; filename="nodeflow-extensions-bundle.json"'
		}
	});
};

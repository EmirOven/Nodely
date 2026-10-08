import { json, type RequestHandler } from '@sveltejs/kit';
import { getAllRoutes, saveRoute, type ManagedRoute } from '../../../lib/server/routeStore';

export const GET: RequestHandler = async () => {
	const routes = getAllRoutes();
	return json({
		success: true,
		routes
	});
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id, title, description, method, path, nodes, edges, isPublished } = body;

		if (!method || !path) {
			return json({ error: 'method and path are required' }, { status: 400 });
		}

		const routeId = id || `route_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
		const saved = saveRoute({
			id: routeId,
			title: title || 'Untitled Endpoint',
			description: description || '',
			method: method.toUpperCase(),
			path,
			nodes: nodes || [],
			edges: edges || [],
			isPublished: Boolean(isPublished)
		});

		return json({
			success: true,
			route: saved
		});
	} catch (err: any) {
		return json({ error: err.message || 'Failed to save route' }, { status: 500 });
	}
};

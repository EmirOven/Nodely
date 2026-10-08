import { json, type RequestHandler } from '@sveltejs/kit';
import { publishFlow, unpublishFlow, getAllPublishedFlows, type PublishedFlow } from '../../../lib/server/publishedStore';

export const GET: RequestHandler = async () => {
	const flows: PublishedFlow[] = getAllPublishedFlows();
	return json({
		success: true,
		endpoints: flows.map((f: PublishedFlow) => ({
			id: f.id,
			title: f.title,
			method: f.method,
			path: f.path,
			publishedAt: f.publishedAt,
			nodeCount: f.nodes.length
		}))
	});
};

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const body = await request.json();
		const { id, title, method, path: endpointPath, nodes, edges } = body;

		if (!method || !endpointPath) {
			return json({ error: 'method and path are required to publish an API' }, { status: 400 });
		}

		// Ensure path starts with /
		let formattedPath = endpointPath.trim();
		if (!formattedPath.startsWith('/')) {
			formattedPath = '/' + formattedPath;
		}

		const published: PublishedFlow = {
			id: id || `pub_${Date.now()}`,
			title: title || 'Nodely API Endpoint',
			method: method.toUpperCase(),
			path: formattedPath,
			nodes: nodes || [],
			edges: edges || [],
			publishedAt: new Date().toISOString()
		};

		const { key, flow } = publishFlow(published);
		const fullUrl = `${url.origin}${flow.path}`;

		return json({
			success: true,
			message: `API endpoint ${flow.method} ${flow.path} is now live!`,
			key,
			endpoint: flow,
			fullUrl,
			relativeUrl: flow.path
		});
	} catch (err: any) {
		return json({ error: err.message || 'Failed to publish endpoint' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { method, path } = body;
		if (!method || !path) {
			return json({ error: 'method and path required' }, { status: 400 });
		}
		const ok = unpublishFlow(method, path);
		return json({ success: ok });
	} catch (err: any) {
		return json({ error: err.message || 'Failed to delete' }, { status: 500 });
	}
};

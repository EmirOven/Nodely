import { json, type RequestHandler } from '@sveltejs/kit';
import { getRoute, saveRoute, deleteRoute, setRoutePublishStatus } from '../../../../lib/server/routeStore';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) return json({ error: 'Route ID required' }, { status: 400 });

	const route = getRoute(id);
	if (!route) {
		return json({ error: `Route not found with ID "${id}"` }, { status: 404 });
	}

	return json({ success: true, route });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) return json({ error: 'Route ID required' }, { status: 400 });

	try {
		const body = await request.json();
		const saved = saveRoute({
			...body,
			id
		});

		return json({ success: true, route: saved });
	} catch (err: any) {
		return json({ error: err.message || 'Failed to update route' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) return json({ error: 'Route ID required' }, { status: 400 });

	try {
		const body = await request.json();
		const { isPublished } = body;
		if (typeof isPublished !== 'boolean') {
			return json({ error: 'isPublished boolean is required' }, { status: 400 });
		}

		const updated = setRoutePublishStatus(id, isPublished);
		if (!updated) {
			return json({ error: `Route not found with ID "${id}"` }, { status: 404 });
		}

		return json({ success: true, route: updated });
	} catch (err: any) {
		return json({ error: err.message || 'Failed to toggle status' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) return json({ error: 'Route ID required' }, { status: 400 });

	const ok = deleteRoute(id);
	if (!ok) {
		return json({ error: `Route not found with ID "${id}"` }, { status: 404 });
	}

	return json({ success: true, message: `Route "${id}" deleted.` });
};

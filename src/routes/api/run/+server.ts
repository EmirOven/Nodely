import { json, type RequestHandler } from '@sveltejs/kit';
import { executeFlow } from '$lib/engine/executor';
import type { Node, Edge } from '@xyflow/svelte';
import type { TestRequestPayload } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const nodes = (body.nodes || []) as Node[];
		const edges = (body.edges || []) as Edge[];
		const testReq = (body.request || {
			method: 'GET',
			path: '/api/v1/resource',
			headers: {},
			query: {},
			body: {}
		}) as TestRequestPayload;

		const result = await executeFlow(nodes, edges, testReq);

		return json(result, { status: result.statusCode });
	} catch (err: any) {
		return json({ error: err.message || 'Execution failed' }, { status: 500 });
	}
};

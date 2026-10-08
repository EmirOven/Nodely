import { json, type RequestHandler, type RequestEvent } from '@sveltejs/kit';
import { getPublishedFlow, getAllPublishedFlows } from '$lib/server/publishedStore';
import { executeFlow } from '$lib/engine/executor';
import type { TestRequestPayload } from '$lib/types';

async function handlePublishedRequest(event: RequestEvent) {
	const { request, params, url } = event;
	const method = request.method as any;
	const endpointParam = params.endpoint || '';

	// Reconstruct the full path e.g. "/api/v1/weather"
	const fullPath = `/api/${endpointParam}`.replace(/\/+$/, '');

	// Look up the flow for this method and path
	let flow = getPublishedFlow(method, fullPath);

	// Try without "/api" prefix if user entered "/v1/weather"
	if (!flow) {
		flow = getPublishedFlow(method, `/${endpointParam}`);
	}

	if (!flow) {
		const all = getAllPublishedFlows();
		return json(
			{
				error: `404 Not Found: No published Nodely endpoint matches ${method} ${fullPath}`,
				method,
				requestedPath: fullPath,
				availableEndpoints: all.map((f) => `${f.method} ${f.path}`),
				hint: 'Click "Publish API" in the Nodely editor to host this workflow live!'
			},
			{ status: 404 }
		);
	}

	// Extract request details
	let requestBody: any = null;
	if (method !== 'GET' && method !== 'HEAD') {
		try {
			const text = await request.text();
			if (text) {
				try {
					requestBody = JSON.parse(text);
				} catch {
					requestBody = text;
				}
			}
		} catch {
			requestBody = null;
		}
	}

	const query = Object.fromEntries(url.searchParams.entries());
	const headers = Object.fromEntries(request.headers.entries());

	const testPayload: TestRequestPayload = {
		method,
		path: fullPath,
		headers,
		query,
		body: requestBody
	};

	try {
		const result = await executeFlow(flow.nodes, flow.edges, testPayload);

		const responseHeaders = {
			'Content-Type': 'application/json',
			'X-Powered-By': 'Nodely API Builder',
			...(result.responseHeaders || {})
		};

		return new Response(JSON.stringify(result.responseBody), {
			status: result.statusCode,
			headers: responseHeaders
		});
	} catch (err: any) {
		return json(
			{
				error: 'Internal Server Error executing published Nodely workflow',
				details: err.message || String(err)
			},
			{ status: 500 }
		);
	}
}

export const GET: RequestHandler = (event) => handlePublishedRequest(event);
export const POST: RequestHandler = (event) => handlePublishedRequest(event);
export const PUT: RequestHandler = (event) => handlePublishedRequest(event);
export const DELETE: RequestHandler = (event) => handlePublishedRequest(event);
export const PATCH: RequestHandler = (event) => handlePublishedRequest(event);
export const fallback: RequestHandler = (event) => handlePublishedRequest(event);

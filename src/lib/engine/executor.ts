import type { Node, Edge } from '@xyflow/svelte';
import type {
	ExecutionResult,
	ExecutionStepTrace,
	ExecutionLog,
	TestRequestPayload,
	HttpTriggerData,
	CodeBlockData,
	ConditionalData,
	FetchNodeData,
	DataStoreData,
	HttpResponseData,
	AuthNodeData,
	ValidatorData,
	DelayData
} from '../types';

// Global in-memory storage for simulated database
const inMemoryDatabase: Record<string, Record<string, any>> = {
	users: {
		'usr_1': { id: 'usr_1', name: 'Alice Smith', email: 'alice@example.com', role: 'admin' },
		'usr_2': { id: 'usr_2', name: 'Bob Jones', email: 'bob@example.com', role: 'user' }
	},
	products: {
		'prod_1': { id: 'prod_1', name: 'Mechanical Keyboard', price: 120, stock: 15 },
		'prod_2': { id: 'prod_2', name: 'Wireless Mouse', price: 65, stock: 40 }
	}
};

export async function executeFlow(
	nodes: Node[],
	edges: Edge[],
	request: TestRequestPayload
): Promise<ExecutionResult> {
	const startTime = performance.now();
	const logs: ExecutionLog[] = [];
	const steps: ExecutionStepTrace[] = [];
	const executedNodeIds: string[] = [];

	const addLog = (nodeId: string, nodeTitle: string, level: 'info' | 'warn' | 'error', message: string, data?: any) => {
		logs.push({
			nodeId,
			nodeTitle,
			timestamp: Date.now(),
			level,
			message,
			data
		});
	};

	// Find the trigger node
	const triggerNode = nodes.find((n: Node) => n.type === 'httpTrigger');
	if (!triggerNode) {
		return {
			success: false,
			statusCode: 400,
			responseBody: { error: 'No HTTP Trigger node found in this API workflow' },
			responseHeaders: { 'content-type': 'application/json' },
			durationMs: Math.round(performance.now() - startTime),
			executedNodeIds: [],
			steps: [],
			logs: [{
				nodeId: 'none',
				nodeTitle: 'System',
				timestamp: Date.now(),
				level: 'error',
				message: 'Cannot execute flow without an HTTP Trigger starting node.'
			}],
			error: 'No HTTP Trigger node found.'
		};
	}

	// Execution state
	const state: Record<string, any> = {};
	let payload = typeof request.body === 'object' && request.body !== null
		? JSON.parse(JSON.stringify(request.body))
		: (request.body !== undefined && request.body !== null ? request.body : {});
	const req = {
		method: request.method,
		path: request.path,
		headers: { ...request.headers },
		query: { ...request.query },
		body: payload
	};

	let currentNode: Node | undefined = triggerNode;
	let maxSteps = 40;
	let responseResult: { statusCode: number; body: any; headers: Record<string, string> } | null = null;

	while (currentNode && maxSteps > 0) {
		maxSteps--;
		const nodeStartTime = performance.now();
		const currentId: string = currentNode.id;
		executedNodeIds.push(currentId);

		const nodeType: string = currentNode.type || '';
		const nodeData = (currentNode.data || {}) as Record<string, any>;
		const nodeTitle: string = (nodeData.title as string) || nodeType;

		const inputSnapshot = JSON.parse(JSON.stringify({ payload, state, query: req.query }));
		let stepOutput: any = null;
		let stepError: string | undefined = undefined;
		let nextHandleOut: string | undefined = undefined;

		try {
			if (nodeType === 'httpTrigger') {
				const triggerData = nodeData as unknown as HttpTriggerData;
				addLog(currentId, nodeTitle, 'info', `Trigger received ${req.method} request to ${triggerData.path || req.path}`);
				stepOutput = { received: true, method: req.method, path: req.path, body: payload };
				nextHandleOut = 'output';
			} else if (nodeType === 'codeBlock') {
				const codeData = nodeData as unknown as CodeBlockData;
				const userCode = codeData.code || 'return payload;';

				addLog(currentId, nodeTitle, 'info', `Executing code block...`);

				const customLog = (msg: string, extra?: any) => {
					addLog(currentId, nodeTitle, 'info', `[Console] ${msg}`, extra);
				};

				// Create isolated function wrapper
				const fn = new Function(
					'req',
					'payload',
					'body',
					'query',
					'headers',
					'state',
					'store',
					'log',
					`
					"use strict";
					try {
						${userCode}
					} catch (err) {
						throw err;
					}
					`
				);

				const result = fn(req, payload, payload, req.query, req.headers, state, inMemoryDatabase, customLog);
				stepOutput = result;
				state[currentId] = result;
				state.lastResult = result;

				// If returned an object with properties, update payload reference if suitable
				if (result && typeof result === 'object' && !Array.isArray(result)) {
					if (typeof payload === 'object' && payload !== null) {
						Object.assign(payload, result);
					} else {
						payload = { ...result };
					}
				}

				addLog(currentId, nodeTitle, 'info', `Code block completed successfully`, result);
				nextHandleOut = 'output';
			} else if (nodeType === 'conditional') {
				const condData = nodeData as unknown as ConditionalData;
				const expression = condData.expression || 'true';

				const evalCondition = new Function(
					'req',
					'payload',
					'body',
					'query',
					'headers',
					'state',
					'store',
					`
					"use strict";
					try {
						return Boolean(${expression});
					} catch (e) {
						return false;
					}
					`
				);

				const conditionValue = evalCondition(req, payload, payload, req.query, req.headers, state, inMemoryDatabase);
				nextHandleOut = conditionValue ? 'true' : 'false';
				stepOutput = { condition: expression, evaluatedTo: conditionValue, branchTaken: nextHandleOut };

				addLog(
					currentId,
					nodeTitle,
					'info',
					`Condition "${expression}" evaluated to ${conditionValue ? 'TRUE' : 'FALSE'}. Routing to ${nextHandleOut} branch.`
				);
			} else if (nodeType === 'fetchNode') {
				const fetchData = nodeData as unknown as FetchNodeData;
				const url = fetchData.url || 'https://jsonplaceholder.typicode.com/posts/1';
				const method = fetchData.method || 'GET';

				addLog(currentId, nodeTitle, 'info', `Dispatching ${method} request to ${url}`);

				try {
					const res = await fetch(url, {
						method,
						headers: {
							'Content-Type': 'application/json'
						}
					});
					const json = await res.json().catch(() => ({ status: res.statusText }));
					stepOutput = json;
					state[currentId] = json;
					state.lastResult = json;
					addLog(currentId, nodeTitle, 'info', `Fetch returned HTTP ${res.status}`, json);
				} catch (fetchErr: any) {
					stepError = fetchErr.message || 'Network request failed';
					stepOutput = { error: stepError };
					addLog(currentId, nodeTitle, 'error', `Fetch error: ${stepError}`);
				}
				nextHandleOut = 'output';
			} else if (nodeType === 'dataStore') {
				const storeData = nodeData as unknown as DataStoreData;
				const collection = storeData.collection || 'records';
				if (!inMemoryDatabase[collection]) {
					inMemoryDatabase[collection] = {};
				}

				const op = storeData.operation || 'get';
				const evalExpr = (expr: string) => {
					try {
						const fn = new Function('req', 'payload', 'body', 'query', 'state', `"use strict"; return (${expr});`);
						return fn(req, payload, payload, req.query, state);
					} catch {
						return expr;
					}
				};

				const key = evalExpr(storeData.keyExpr || 'defaultKey');

				if (op === 'get') {
					const item = inMemoryDatabase[collection][key];
					stepOutput = item ?? null;
					state[currentId] = stepOutput;
					state.lastResult = stepOutput;
					addLog(currentId, nodeTitle, 'info', `Store GET "${collection}[${key}]" =>`, stepOutput);
				} else if (op === 'set') {
					const val = evalExpr(storeData.valueExpr || 'payload');
					inMemoryDatabase[collection][key] = val;
					stepOutput = { saved: true, key, value: val };
					state[currentId] = stepOutput;
					state.lastResult = stepOutput;
					addLog(currentId, nodeTitle, 'info', `Store SET "${collection}[${key}]" =>`, val);
				} else if (op === 'delete') {
					delete inMemoryDatabase[collection][key];
					stepOutput = { deleted: true, key };
					state[currentId] = stepOutput;
					addLog(currentId, nodeTitle, 'info', `Store DELETE "${collection}[${key}]"`);
				} else if (op === 'list') {
					stepOutput = Object.values(inMemoryDatabase[collection]);
					state[currentId] = stepOutput;
					state.lastResult = stepOutput;
					addLog(currentId, nodeTitle, 'info', `Store LIST "${collection}" (${stepOutput.length} items)`);
				}
				nextHandleOut = 'output';
			} else if (nodeType === 'authNode') {
				const authData = nodeData as unknown as AuthNodeData;
				const headerKey = (authData.headerName || (authData.authType === 'bearer' ? 'authorization' : 'x-api-key')).toLowerCase();
				const expected = (authData.expectedValue || '').trim();
				const reqHeaderVal = (req.headers[headerKey] || req.headers[headerKey.toUpperCase()] || '') as string;
				let isAuthed = false;

				if (authData.authType === 'bearer') {
					const match = reqHeaderVal.match(/^Bearer\s+(.*)$/i);
					const token = match ? match[1].trim() : reqHeaderVal.trim();
					isAuthed = Boolean(expected && token === expected);
				} else {
					isAuthed = Boolean(expected && reqHeaderVal === expected);
				}

				nextHandleOut = isAuthed ? 'valid' : 'invalid';
				stepOutput = {
					authenticated: isAuthed,
					headerChecked: headerKey,
					authType: authData.authType || 'apiKey',
					branchTaken: nextHandleOut
				};
				state[currentId] = stepOutput;
				state.lastResult = stepOutput;

				if (!isAuthed && typeof payload === 'object' && payload !== null) {
					payload.authError = 'Unauthorized request: missing or invalid credentials';
				}

				addLog(
					currentId,
					nodeTitle,
					isAuthed ? 'info' : 'warn',
					`Auth Gate check: ${isAuthed ? 'PASSED (Authorized)' : 'FAILED (Unauthorized)'}. Routing to "${nextHandleOut}" branch.`
				);
			} else if (nodeType === 'validatorNode') {
				const valData = nodeData as unknown as ValidatorData;
				const requiredKeys = (valData.requiredFields || '')
					.split(',')
					.map((k: string) => k.trim())
					.filter(Boolean);

				const missingKeys: string[] = [];
				for (const key of requiredKeys) {
					const val = payload && typeof payload === 'object' ? payload[key] : undefined;
					if (val === undefined || val === null || val === '') {
						missingKeys.push(key);
					}
				}

				const isValid = missingKeys.length === 0;
				nextHandleOut = isValid ? 'valid' : 'invalid';
				const validationResult = {
					isValid,
					required: requiredKeys,
					missing: missingKeys,
					branchTaken: nextHandleOut
				};

				stepOutput = validationResult;
				state[currentId] = validationResult;
				state.lastResult = validationResult;

				if (!isValid && typeof payload === 'object' && payload !== null) {
					payload.validationErrors = missingKeys.map((k: string) => `Field '${k}' is required and cannot be empty`);
				}

				addLog(
					currentId,
					nodeTitle,
					isValid ? 'info' : 'warn',
					`Validation check: ${isValid ? 'PASSED' : 'FAILED'} (missing: [${missingKeys.join(', ')}]). Routing to "${nextHandleOut}" branch.`
				);
			} else if (nodeType === 'delayNode') {
				const delayData = nodeData as unknown as DelayData;
				const delayMs = Math.min(Math.max(delayData.delayMs ?? 500, 0), 30000);
				addLog(currentId, nodeTitle, 'info', `Sleeping execution for ${delayMs}ms...`);
				if (delayMs > 0) {
					await new Promise((resolve) => setTimeout(resolve, delayMs));
				}
				stepOutput = { delayedMs: delayMs, resumedAt: Date.now() };
				state[currentId] = stepOutput;
				state.lastResult = stepOutput;
				nextHandleOut = 'output';
			} else if (nodeType === 'httpResponse') {
				const respData = nodeData as unknown as HttpResponseData;
				const statusCode = respData.statusCode || 200;
				let parsedBody: any = null;

				try {
					const evalBody = new Function(
						'req',
						'payload',
						'body',
						'query',
						'state',
						'store',
						`
						"use strict";
						return (${respData.bodyExpression || 'state.lastResult || payload'});
						`
					);
					parsedBody = evalBody(req, payload, payload, req.query, state, inMemoryDatabase);
				} catch (e: any) {
					parsedBody = { error: `Evaluation error in response body: ${e.message}`, payload };
				}

				responseResult = {
					statusCode,
					body: parsedBody,
					headers: { 'content-type': 'application/json' }
				};

				stepOutput = responseResult;
				addLog(currentId, nodeTitle, 'info', `Returning HTTP ${statusCode} response`, parsedBody);
				currentNode = undefined;
			}
		} catch (err: any) {
			stepError = err.message || String(err);
			addLog(currentId, nodeTitle, 'error', `Execution failed: ${stepError}`);
		}

		steps.push({
			nodeId: currentId,
			nodeType,
			nodeTitle,
			durationMs: Math.round((performance.now() - nodeStartTime) * 100) / 100,
			inputState: inputSnapshot,
			outputState: stepOutput,
			error: stepError
		});

		if (stepError) {
			responseResult = {
				statusCode: 500,
				body: { error: `Internal Server Error in node "${nodeTitle}": ${stepError}` },
				headers: { 'content-type': 'application/json' }
			};
			break;
		}

		if (!currentNode) {
			break;
		}

		// Find next node along connected edges
		const outgoingEdges: Edge[] = edges.filter((e: Edge) => e.source === currentId);
		let chosenEdge: Edge | undefined;

		if (nextHandleOut) {
			chosenEdge = outgoingEdges.find((e: Edge) => e.sourceHandle === nextHandleOut);
		}

		if (!chosenEdge && outgoingEdges.length > 0) {
			chosenEdge = outgoingEdges[0];
		}

		if (chosenEdge) {
			currentNode = nodes.find((n: Node) => n.id === chosenEdge?.target);
		} else {
			currentNode = undefined;
		}
	}

	const totalDuration = Math.round(performance.now() - startTime);

	if (!responseResult) {
		responseResult = {
			statusCode: 200,
			body: state.lastResult !== undefined ? state.lastResult : { success: true, message: 'Workflow completed', payload },
			headers: { 'content-type': 'application/json' }
		};
	}

	return {
		success: responseResult.statusCode >= 200 && responseResult.statusCode < 400,
		statusCode: responseResult.statusCode,
		responseBody: responseResult.body,
		responseHeaders: responseResult.headers,
		durationMs: totalDuration,
		executedNodeIds,
		steps,
		logs
	};
}

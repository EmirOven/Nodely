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
	DelayData,
	GoogleAuthData,
	UserManagementData,
	OpenAiData,
	AiNodeData,
	TelegramTriggerData,
	TelegramSendMessageData
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

	// Find the trigger node (match HTTP method, or default HTTP trigger, or Telegram Bot webhook)
	const triggerNode =
		nodes.find(
			(n: Node) => n.type === 'httpTrigger' && ((n.data as any)?.method === request.method)
		) ||
		nodes.find((n: Node) => n.type === 'httpTrigger') ||
		nodes.find((n: Node) => n.type === 'telegramTrigger');

	if (!triggerNode) {
		return {
			success: false,
			statusCode: 400,
			responseBody: { error: 'No HTTP or Telegram Trigger entrypoint found in this workflow' },
			responseHeaders: { 'content-type': 'application/json' },
			durationMs: Math.round(performance.now() - startTime),
			executedNodeIds: [],
			steps: [],
			logs: [{
				nodeId: 'none',
				nodeTitle: 'System',
				timestamp: Date.now(),
				level: 'error',
				message: 'Cannot execute flow without an HTTP Trigger or Telegram Bot Trigger starting node.'
			}],
			error: 'No Trigger starting node found.'
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
			} else if (nodeType === 'googleAuthNode') {
				const googleData = nodeData as unknown as GoogleAuthData;
				let token = '';

				if (googleData.tokenSource === 'payload') {
					const field = googleData.tokenField || 'credential';
					token = payload && typeof payload === 'object' ? payload[field] || payload['id_token'] || payload['token'] : '';
				} else {
					const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;
					const match = authHeader.match(/^Bearer\s+(.*)$/i);
					token = match ? match[1].trim() : authHeader.trim();
				}

				let googleUser: any = null;
				let isValid = false;

				if (token) {
					try {
						const parts = token.split('.');
						if (parts.length === 3) {
							const base64Url = parts[1];
							const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
							const jsonPayload = decodeURIComponent(
								atob(base64)
									.split('')
									.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
									.join('')
							);
							const parsed = JSON.parse(jsonPayload);
							if (parsed && (parsed.email || parsed.sub)) {
								googleUser = {
									sub: parsed.sub || 'google_sub_' + Math.random().toString(36).substring(2, 8),
									email: parsed.email || 'user@gmail.com',
									name: parsed.name || 'Google User',
									picture: parsed.picture,
									email_verified: parsed.email_verified ?? true
								};
								isValid = true;
							}
						} else if (token === 'test_google_token' || token.length > 10) {
							googleUser = {
								sub: 'google_usr_test_' + Math.random().toString(36).substring(2, 6),
								email: 'test.user@gmail.com',
								name: 'Test Google User',
								email_verified: true
							};
							isValid = true;
						}
					} catch {
						isValid = false;
					}
				}

				nextHandleOut = isValid ? 'valid' : 'invalid';
				stepOutput = {
					isValid,
					googleUser: isValid ? googleUser : null,
					tokenSource: googleData.tokenSource,
					branchTaken: nextHandleOut
				};
				state[currentId] = stepOutput;
				state.lastResult = stepOutput;
				if (isValid) {
					state.googleUser = googleUser;
					if (typeof payload === 'object' && payload !== null) {
						payload.googleUser = googleUser;
					}
				} else {
					if (typeof payload === 'object' && payload !== null) {
						payload.authError = 'Invalid or missing Google OAuth ID token';
					}
				}

				addLog(
					currentId,
					nodeTitle,
					isValid ? 'info' : 'warn',
					`Google OAuth Token Verification: ${isValid ? 'VALID' : 'INVALID'}. Routing to "${nextHandleOut}".`
				);
			} else if (nodeType === 'userManagementNode') {
				const uData = nodeData as unknown as UserManagementData;
				const action = uData.action || 'signup';

				const evalExpr = (expr?: string) => {
					if (!expr) return undefined;
					try {
						const fn = new Function('req', 'payload', 'state', `return (${expr});`);
						return fn(req, payload, state);
					} catch {
						return undefined;
					}
				};

				const email = evalExpr(uData.emailExpr) ?? (payload && payload.email);
				const password = evalExpr(uData.passwordExpr) ?? (payload && payload.password);
				const name = evalExpr(uData.nameExpr) ?? (payload && payload.name);
				const userId = evalExpr(uData.userIdExpr) ?? (payload && payload.userId);
				const role = uData.role || 'user';

				let success = false;
				let resultData: any = null;
				let errorMsg: string | undefined = undefined;

				if (!inMemoryDatabase.users) inMemoryDatabase.users = {};

				if (action === 'signup') {
					if (!email || !String(email).includes('@')) {
						errorMsg = 'Invalid email address provided for sign up';
					} else {
						const existing = Object.values(inMemoryDatabase.users).find((u: any) => u.email === email);
						if (existing) {
							errorMsg = `User with email ${email} already exists`;
						} else {
							const id = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
							const newUser = {
								id,
								email: String(email).toLowerCase(),
								name: name || String(email).split('@')[0],
								role,
								provider: 'email',
								createdAt: new Date().toISOString()
							};
							inMemoryDatabase.users[id] = newUser;
							const sessionToken = `tok_${id}_${Math.random().toString(36).substring(2, 10)}`;
							resultData = { user: newUser, sessionToken, status: 'created' };
							success = true;
						}
					}
				} else if (action === 'login') {
					if (!email) {
						errorMsg = 'Email is required for sign in';
					} else {
						const user = Object.values(inMemoryDatabase.users).find((u: any) => u.email?.toLowerCase() === String(email).toLowerCase());
						if (user) {
							const sessionToken = `tok_${(user as any).id}_${Math.random().toString(36).substring(2, 10)}`;
							resultData = { user, sessionToken, status: 'authenticated' };
							success = true;
						} else {
							errorMsg = 'Invalid email or password';
						}
					}
				} else if (action === 'getUser') {
					const targetId = userId || (payload && payload.userId);
					const user = (targetId && inMemoryDatabase.users[targetId]) || Object.values(inMemoryDatabase.users)[0];
					if (user) {
						resultData = { user };
						success = true;
					} else {
						errorMsg = 'User not found';
					}
				} else if (action === 'deleteUser') {
					const targetId = userId || (payload && payload.userId);
					if (targetId && inMemoryDatabase.users[targetId]) {
						delete inMemoryDatabase.users[targetId];
						resultData = { deleted: true, userId: targetId };
						success = true;
					} else {
						errorMsg = 'User not found for deletion';
					}
				} else if (action === 'listUsers') {
					const users = Object.values(inMemoryDatabase.users);
					resultData = { users, count: users.length };
					success = true;
				}

				nextHandleOut = success ? 'success' : 'error';
				stepOutput = {
					action,
					success,
					data: resultData,
					error: errorMsg,
					branchTaken: nextHandleOut
				};
				state[currentId] = stepOutput;
				state.lastResult = stepOutput;
				if (success && resultData?.user) {
					state.user = resultData.user;
					if (resultData.sessionToken) state.sessionToken = resultData.sessionToken;
					if (typeof payload === 'object' && payload !== null) {
						payload.user = resultData.user;
						if (resultData.sessionToken) payload.sessionToken = resultData.sessionToken;
					}
				} else if (!success && errorMsg) {
					if (typeof payload === 'object' && payload !== null) {
						payload.authError = errorMsg;
					}
				}

				addLog(
					currentId,
					nodeTitle,
					success ? 'info' : 'warn',
					`User Management (${action}): ${success ? 'SUCCESS' : 'FAILED: ' + errorMsg}. Routing to "${nextHandleOut}".`
				);
			} else if (nodeType === 'aiNode' || nodeType === 'openAiNode') {
				const aiData = nodeData as unknown as AiNodeData;
				const provider = (aiData.provider || 'openai') as string;
				const model =
					aiData.model ||
					(provider === 'anthropic'
						? 'claude-3-5-sonnet-20241022'
						: provider === 'google'
							? 'gemini-1.5-flash'
							: 'gpt-4o-mini');

				const interpolate = (tpl: string) => {
					if (!tpl) return '';
					return tpl.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
						try {
							const fn = new Function('req', 'payload', 'state', `return (${expr});`);
							const val = fn(req, payload, state);
							return val !== undefined && val !== null ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : '';
						} catch {
							return '';
						}
					});
				};

				const resolvedSystem = interpolate(aiData.systemPrompt || 'You are an AI assistant.');
				const resolvedUser = interpolate(aiData.userPrompt || 'Process this request');
				const env = typeof process !== 'undefined' ? process.env : ({} as any);

				let apiKey = aiData.apiKeyOverride || '';
				if (!apiKey) {
					if (provider === 'openai') apiKey = env?.OPENAI_API_KEY || '';
					else if (provider === 'anthropic') apiKey = env?.ANTHROPIC_API_KEY || '';
					else if (provider === 'google') apiKey = env?.GEMINI_API_KEY || '';
					else if (provider === 'groq') apiKey = env?.GROQ_API_KEY || '';
				}

				let aiText = '';
				let aiJson: any = null;
				let success = true;
				let errorMsg: string | undefined = undefined;

				if (provider === 'openai' && apiKey) {
					try {
						addLog(currentId, nodeTitle, 'info', `Calling OpenAI API (${model})...`);
						const res = await fetch('https://api.openai.com/v1/chat/completions', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${apiKey}`
							},
							body: JSON.stringify({
								model,
								messages: [
									{ role: 'system', content: resolvedSystem },
									{ role: 'user', content: resolvedUser }
								],
								temperature: aiData.temperature ?? 0.7,
								max_tokens: aiData.maxTokens ?? 1000,
								response_format: aiData.responseFormat === 'json_object' ? { type: 'json_object' } : undefined
							})
						});

						if (res.ok) {
							const completion = await res.json();
							aiText = completion.choices?.[0]?.message?.content || '';
							success = true;
						} else {
							const errBody = await res.json().catch(() => ({}));
							errorMsg = errBody?.error?.message || `OpenAI error ${res.status}`;
							success = false;
						}
					} catch (e: any) {
						errorMsg = e.message || 'Failed to call OpenAI API';
						success = false;
					}
				} else if (provider === 'anthropic' && apiKey) {
					try {
						addLog(currentId, nodeTitle, 'info', `Calling Anthropic API (${model})...`);
						const res = await fetch('https://api.anthropic.com/v1/messages', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'x-api-key': apiKey,
								'anthropic-version': '2023-06-01'
							},
							body: JSON.stringify({
								model,
								system: resolvedSystem,
								messages: [{ role: 'user', content: resolvedUser }],
								temperature: aiData.temperature ?? 0.7,
								max_tokens: aiData.maxTokens ?? 1000
							})
						});

						if (res.ok) {
							const completion = await res.json();
							aiText = completion.content?.[0]?.text || '';
							success = true;
						} else {
							const errBody = await res.json().catch(() => ({}));
							errorMsg = errBody?.error?.message || `Anthropic error ${res.status}`;
							success = false;
						}
					} catch (e: any) {
						errorMsg = e.message || 'Failed to call Anthropic API';
						success = false;
					}
				} else if (provider === 'google' && apiKey) {
					try {
						addLog(currentId, nodeTitle, 'info', `Calling Google Gemini API (${model})...`);
						const res = await fetch(
							`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
							{
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									contents: [
										{
											role: 'user',
											parts: [{ text: `${resolvedSystem ? resolvedSystem + '\n\n' : ''}${resolvedUser}` }]
										}
									],
									generationConfig: {
										temperature: aiData.temperature ?? 0.7,
										maxOutputTokens: aiData.maxTokens ?? 1000
									}
								})
							}
						);

						if (res.ok) {
							const data = await res.json();
							aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
							success = true;
						} else {
							const errBody = await res.json().catch(() => ({}));
							errorMsg = errBody?.error?.message || `Google Gemini error ${res.status}`;
							success = false;
						}
					} catch (e: any) {
						errorMsg = e.message || 'Failed to call Google Gemini API';
						success = false;
					}
				} else if (provider === 'groq' && apiKey) {
					try {
						addLog(currentId, nodeTitle, 'info', `Calling Groq API (${model})...`);
						const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${apiKey}`
							},
							body: JSON.stringify({
								model,
								messages: [
									{ role: 'system', content: resolvedSystem },
									{ role: 'user', content: resolvedUser }
								],
								temperature: aiData.temperature ?? 0.7,
								max_tokens: aiData.maxTokens ?? 1000
							})
						});

						if (res.ok) {
							const completion = await res.json();
							aiText = completion.choices?.[0]?.message?.content || '';
							success = true;
						} else {
							const errBody = await res.json().catch(() => ({}));
							errorMsg = errBody?.error?.message || `Groq error ${res.status}`;
							success = false;
						}
					} catch (e: any) {
						errorMsg = e.message || 'Failed to call Groq API';
						success = false;
					}
				} else if (provider === 'custom') {
					const baseUrl = aiData.baseUrl || 'http://localhost:11434/v1';
					try {
						addLog(currentId, nodeTitle, 'info', `Calling Custom LLM Endpoint at ${baseUrl} (${model})...`);
						const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
							},
							body: JSON.stringify({
								model,
								messages: [
									{ role: 'system', content: resolvedSystem },
									{ role: 'user', content: resolvedUser }
								],
								temperature: aiData.temperature ?? 0.7,
								max_tokens: aiData.maxTokens ?? 1000
							})
						});

						if (res.ok) {
							const completion = await res.json();
							aiText = completion.choices?.[0]?.message?.content || '';
							success = true;
						} else {
							const errBody = await res.json().catch(() => ({}));
							errorMsg = errBody?.error?.message || `Custom API error ${res.status}`;
							success = false;
						}
					} catch (e: any) {
						errorMsg = e.message || 'Failed to call custom LLM endpoint';
						success = false;
					}
				} else {
					addLog(
						currentId,
						nodeTitle,
						'info',
						`Simulating ${provider.toUpperCase()} completion via AI SDK (no API key configured).`
					);
					aiText = `[Simulated ${provider.toUpperCase()} (${model}) via AI SDK]: Successfully processed prompt "${resolvedUser.slice(0, 80)}${resolvedUser.length > 80 ? '...' : ''}". Add API Key in Settings to execute live LLM calls.`;
					if (aiData.responseFormat === 'json_object') {
						aiJson = {
							status: 'simulated_success',
							provider,
							model,
							promptReceived: resolvedUser,
							note: 'Configure Provider API Key in Settings for live LLM completions.'
						};
					}
					success = true;
				}

				if (success && aiData.responseFormat === 'json_object' && !aiJson && aiText) {
					try {
						aiJson = JSON.parse(aiText);
					} catch {
						aiJson = { text: aiText };
					}
				}

				nextHandleOut = success ? 'success' : 'error';
				stepOutput = {
					text: aiText,
					json: aiJson,
					provider,
					model,
					success,
					error: errorMsg,
					branchTaken: nextHandleOut
				};
				state[currentId] = stepOutput;
				state.lastResult = stepOutput;
				if (success) {
					state.aiResponse = stepOutput;
					if (typeof payload === 'object' && payload !== null) {
						payload.aiResponse = stepOutput;
					}
				} else if (errorMsg) {
					if (typeof payload === 'object' && payload !== null) {
						payload.aiError = errorMsg;
					}
				}

				addLog(
					currentId,
					nodeTitle,
					success ? 'info' : 'error',
					`AI Node (${provider}/${model}): ${success ? 'COMPLETED' : 'FAILED: ' + errorMsg}. Routing to "${nextHandleOut}".`
				);
			} else if (nodeType === 'telegramTrigger') {
				const tgData = nodeData as unknown as TelegramTriggerData;
				const update = payload || {};
				const msg = update.message || update.callback_query?.message || {};
				const from = update.message?.from || update.callback_query?.from || {};
				const text = String(msg.text || update.text || update.messageText || update.caption || '');
				const chatId = msg.chat?.id || update.chat_id || update.chatId || from.id || 123456789;
				const messageId = msg.message_id || update.message_id || update.messageId || 1;
				const isCommand = text.startsWith('/');
				const command = isCommand ? text.slice(1).split(' ')[0].split('@')[0] : '';
				const filterCmd = String(tgData.filterCommand || '').trim();

				if (filterCmd) {
					const normalizedFilter = filterCmd.startsWith('/') ? filterCmd.slice(1) : filterCmd;
					if (command.toLowerCase() !== normalizedFilter.toLowerCase() && text.toLowerCase() !== filterCmd.toLowerCase()) {
						addLog(
							currentId,
							nodeTitle,
							'warn',
							`Incoming message "${text}" does not match filter "${filterCmd}". Flow will proceed with warning.`
						);
					}
				}

				const parsedTelegram = {
					updateId: update.update_id || Date.now(),
					chatId,
					messageId,
					text,
					isCommand,
					command,
					sender: {
						id: from.id || chatId,
						username: from.username || 'telegram_user',
						firstName: from.first_name || 'Telegram User',
						lastName: from.last_name || ''
					},
					callbackData: update.callback_query?.data || ''
				};

				state.telegram = parsedTelegram;
				state[currentId] = parsedTelegram;
				state.lastResult = parsedTelegram;
				if (typeof payload === 'object' && payload !== null) {
					payload.telegram = parsedTelegram;
					payload.chatId = chatId;
					payload.text = text;
				}

				addLog(
					currentId,
					nodeTitle,
					'info',
					`Telegram Webhook update parsed: chat ID ${chatId}, user @${parsedTelegram.sender.username}, text "${text}"`
				);
				stepOutput = parsedTelegram;
				nextHandleOut = 'output';
			} else if (nodeType === 'telegramSendMessage') {
				const tgData = nodeData as unknown as TelegramSendMessageData;
				const action = tgData.action || 'sendMessage';

				const interpolate = (tpl: string) => {
					if (!tpl) return '';
					return tpl.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
						try {
							const fn = new Function('req', 'payload', 'state', `return (${expr});`);
							const val = fn(req, payload, state);
							return val !== undefined && val !== null
								? typeof val === 'object'
									? JSON.stringify(val)
									: String(val)
								: '';
						} catch {
							return '';
						}
					});
				};

				const env = typeof process !== 'undefined' ? process.env : ({} as any);
				let botToken = (tgData.botToken || '').trim();
				if (!botToken) {
					botToken = env?.TELEGRAM_BOT_TOKEN || '';
				}

				const resolvedChatId = interpolate(tgData.chatId || '{{telegram.chatId}}') || state.telegram?.chatId || payload.chatId || 123456789;
				const resolvedText = interpolate(tgData.text || '') || 'Hello from Nodeflow Telegram bot!';
				const resolvedPhoto = interpolate(tgData.photoUrl || '');

				let success = true;
				let errorMsg: string | undefined = undefined;
				let apiResult: any = null;

				if (botToken) {
					try {
						addLog(currentId, nodeTitle, 'info', `Calling Telegram Bot API (${action}) to chat ${resolvedChatId}...`);
						const url = `https://api.telegram.org/bot${botToken}/${action}`;
						const bodyPayload: any = {
							chat_id: resolvedChatId,
							parse_mode: tgData.parseMode !== 'None' ? tgData.parseMode : undefined
						};
						if (action === 'sendMessage') {
							bodyPayload.text = resolvedText;
						} else if (action === 'sendPhoto') {
							bodyPayload.photo = resolvedPhoto;
							bodyPayload.caption = resolvedText;
						} else if (action === 'answerCallbackQuery') {
							bodyPayload.callback_query_id = state.telegram?.update?.callback_query?.id || 'cq_1';
							bodyPayload.text = resolvedText;
						}

						const res = await fetch(url, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(bodyPayload)
						});
						apiResult = await res.json();
						if (res.ok && apiResult.ok) {
							success = true;
						} else {
							errorMsg = apiResult.description || `Telegram Bot API error ${res.status}`;
							success = false;
						}
					} catch (e: any) {
						errorMsg = e.message || 'Failed to dispatch Telegram request';
						success = false;
					}
				} else {
					addLog(
						currentId,
						nodeTitle,
						'info',
						`Simulating Telegram Bot API ${action} (no live bot token configured in node or Settings).`
					);
					apiResult = {
						ok: true,
						simulated: true,
						result: {
							message_id: Math.floor(Math.random() * 80000) + 1000,
							chat: { id: resolvedChatId, type: 'private' },
							date: Math.floor(Date.now() / 1000),
							text: resolvedText
						}
					};
					success = true;
				}

				nextHandleOut = success ? 'success' : 'error';
				stepOutput = {
					action,
					chatId: resolvedChatId,
					text: resolvedText,
					success,
					error: errorMsg,
					telegramResponse: apiResult
				};
				state[currentId] = stepOutput;
				state.lastResult = stepOutput;
				state.telegramResponse = apiResult;
				if (typeof payload === 'object' && payload !== null) {
					payload.telegramResponse = apiResult;
				}

				addLog(
					currentId,
					nodeTitle,
					success ? 'info' : 'error',
					`Telegram Bot (${action}): ${success ? 'SENT successfully' : 'FAILED: ' + errorMsg}. Routing to "${nextHandleOut}".`
				);
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

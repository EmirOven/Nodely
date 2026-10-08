export interface SchemaField {
	name: string;
	type: string;
	required?: boolean;
	description: string;
	example?: any;
}

export interface SchemaHandle {
	id: string;
	label: string;
	color: string;
	description?: string;
}

export interface NodeSchemaDefinition {
	nodeType: string;
	title: string;
	category: string;
	accentColor: string;
	badge: string;
	summary: string;
	howItWorks: string;
	input: {
		handleType: string;
		description: string;
		fields: SchemaField[];
		sampleJson: Record<string, any>;
		typescriptType: string;
	};
	output: {
		handles: SchemaHandle[];
		description: string;
		fields: SchemaField[];
		sampleJson: Record<string, any>;
		typescriptType: string;
	};
}

export function getNodeSchema(
	nodeType: string = '',
	data: Record<string, any> = {},
	fallbackTitle: string = 'Node',
	customOutputs?: Array<{ id: string; label?: string; color?: string }>
): NodeSchemaDefinition {
	const type = nodeType || 'generic';

	switch (type) {
		case 'httpTrigger': {
			const method = (data.method || 'GET').toUpperCase();
			const path = data.path || '/api/endpoint';
			return {
				nodeType: 'httpTrigger',
				title: data.title || 'HTTP Trigger',
				category: 'Triggers & Ingress',
				accentColor: 'blue',
				badge: `${method} Trigger`,
				summary: `Entrypoint receiver for external HTTP ${method} requests targeting "${path}".`,
				howItWorks:
					'Initializes the Nodeflow execution pipeline. It binds incoming HTTP parameters (query, headers, and body payload) and forwards them to downstream nodes.',
				input: {
					handleType: 'Entrypoint (No input handle; triggered by external HTTP client)',
					description: 'Client HTTP request payload, headers, query string, and route parameters.',
					fields: [
						{ name: 'method', type: 'string', required: true, description: `HTTP Verb (${method})`, example: method },
						{ name: 'path', type: 'string', required: true, description: 'Route pathname of the nodeflow endpoint', example: path },
						{ name: 'headers', type: 'Record<string, string>', required: true, description: 'Incoming HTTP request headers', example: { 'content-type': 'application/json', authorization: 'Bearer eyJ...' } },
						{ name: 'query', type: 'Record<string, string>', required: false, description: 'URL query string key-value pairs', example: { limit: '20', search: 'demo' } },
						{ name: 'body', type: 'Record<string, any>', required: false, description: 'Parsed JSON request body payload', example: { email: 'user@example.com', name: 'Alice' } }
					],
					sampleJson: {
						method,
						path,
						headers: {
							host: 'nodeflow.api',
							'content-type': 'application/json',
							authorization: 'Bearer token_abc123'
						},
						query: {
							page: '1',
							filter: 'active'
						},
						body: {
							email: 'alex@example.com',
							role: 'member'
						}
					},
					typescriptType: `interface HttpRequestInput {\n  method: '${method}';\n  path: string;\n  headers: Record<string, string>;\n  query: Record<string, string>;\n  body: Record<string, any>;\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'NEXT', color: 'blue', description: 'Emits the parsed request body as the initial pipeline payload.' }],
					description: 'Initializes the working payload with the client body and exposes request context.',
					fields: [
						{ name: 'received', type: 'boolean', description: 'Acknowledgment flag', example: true },
						{ name: 'method', type: 'string', description: 'HTTP method used', example: method },
						{ name: 'path', type: 'string', description: 'Route path called', example: path },
						{ name: 'body', type: 'Record<string, any>', description: 'Request payload forwarded to downstream nodes', example: { email: 'alex@example.com', role: 'member' } }
					],
					sampleJson: {
						received: true,
						method,
						path,
						body: {
							email: 'alex@example.com',
							role: 'member'
						}
					},
					typescriptType: `interface HttpTriggerOutput {\n  received: boolean;\n  method: string;\n  path: string;\n  body: Record<string, any>;\n}`
				}
			};
		}

		case 'codeBlock': {
			return {
				nodeType: 'codeBlock',
				title: data.title || 'Code Block (Transform)',
				category: 'Compute & Logic',
				accentColor: 'indigo',
				badge: 'JS / TS Sandbox',
				summary: 'Executes arbitrary JavaScript or TypeScript logic with full access to pipeline payload and state.',
				howItWorks:
					'Takes the current pipeline payload, state, request context, and in-memory database store. The returned value from your code block replaces or merges into the downstream payload.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Context arguments injected into the script function scope: req, payload, body, query, headers, state, store, and log().',
					fields: [
						{ name: 'payload', type: 'Record<string, any>', required: true, description: 'Active pipeline payload forwarded from the previous node', example: { email: 'test@example.com', items: [1, 2] } },
						{ name: 'state', type: 'Record<string, any>', required: true, description: 'Shared execution state dictionary across all nodes in this run', example: { prevNode: { status: 'ok' } } },
						{ name: 'req', type: 'object', required: true, description: 'Original request metadata (method, path, headers, query)', example: { method: 'POST', path: '/api/v1/resource' } },
						{ name: 'log()', type: 'function', required: false, description: 'Logger utility function that writes to test runner logs', example: 'log("Debug point", payload)' }
					],
					sampleJson: {
						payload: {
							userId: 'usr_102',
							plan: 'pro',
							metrics: { views: 420, clicks: 88 }
						},
						state: {
							triggerReceivedAt: 1791480410000
						},
						req: {
							method: 'POST',
							path: '/api/v1/calculate'
						}
					},
					typescriptType: `interface CodeBlockContext {\n  payload: any;\n  state: Record<string, any>;\n  req: { method: string; path: string; headers: Record<string, string>; query: Record<string, string>; body: any };\n  log: (message: string, data?: any) => void;\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'FORWARD', color: 'indigo', description: 'Outputs the value returned by "return <value>;" in the code editor.' }],
					description: 'The return value of the script. Objects are merged into the pipeline payload and stored in state[nodeId].',
					fields: [
						{ name: 'return_value', type: 'any', description: 'Custom evaluated object or primitive returned by the script', example: { calculatedScore: 98.4, status: 'approved' } }
					],
					sampleJson: {
						calculatedScore: 98.4,
						status: 'approved',
						processedAt: new Date().toISOString()
					},
					typescriptType: `type CodeBlockOutput = Record<string, any> | any;`
				}
			};
		}

		case 'conditional': {
			const expr = data.expression || 'payload.isValid === true';
			return {
				nodeType: 'conditional',
				title: data.title || 'Conditional Branch',
				category: 'Control Flow',
				accentColor: 'amber',
				badge: 'Decision Gateway',
				summary: `Evaluates boolean expression: "${expr}". Routes execution to either TRUE or FALSE branch.`,
				howItWorks:
					'Evaluates JavaScript expression against incoming payload. If truthy, the execution flow continues exclusively down the TRUE handle; otherwise down the FALSE handle.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Pipeline payload and state variables inspected by the boolean expression.',
					fields: [
						{ name: 'expression', type: 'string', required: true, description: 'JavaScript expression evaluated to boolean', example: expr },
						{ name: 'payload', type: 'any', required: true, description: 'Working payload evaluated in expression', example: { role: 'admin', age: 24 } }
					],
					sampleJson: {
						expression: expr,
						payload: {
							role: 'admin',
							isVerified: true,
							credits: 150
						}
					},
					typescriptType: `interface ConditionalInput {\n  payload: Record<string, any>;\n  state: Record<string, any>;\n}`
				},
				output: {
					handles: [
						{ id: 'true', label: 'TRUE', color: 'emerald', description: 'Followed when expression evaluates to true' },
						{ id: 'false', label: 'FALSE', color: 'rose', description: 'Followed when expression evaluates to false' }
					],
					description: 'Emits condition evaluation metadata and propagates the existing payload along the winning branch.',
					fields: [
						{ name: 'condition', type: 'string', description: 'Evaluated expression string', example: expr },
						{ name: 'evaluatedTo', type: 'boolean', description: 'Resulting boolean determination', example: true },
						{ name: 'branchTaken', type: "'true' | 'false'", description: 'The handle path chosen for subsequent execution', example: 'true' }
					],
					sampleJson: {
						condition: expr,
						evaluatedTo: true,
						branchTaken: 'true'
					},
					typescriptType: `interface ConditionalOutput {\n  condition: string;\n  evaluatedTo: boolean;\n  branchTaken: 'true' | 'false';\n}`
				}
			};
		}

		case 'fetchNode': {
			const method = data.method || 'GET';
			const url = data.url || 'https://jsonplaceholder.typicode.com/posts/1';
			return {
				nodeType: 'fetchNode',
				title: data.title || 'HTTP Fetch Request',
				category: 'Network & API',
				accentColor: 'emerald',
				badge: `${method} Client`,
				summary: `Sends an asynchronous HTTP ${method} request to "${url}".`,
				howItWorks:
					'Performs an outbound HTTP request using standard fetch. The JSON response from the remote server is parsed and passed downstream as the new working payload.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Incoming payload optionally forwarded as HTTP request body (for POST/PUT/PATCH).',
					fields: [
						{ name: 'url', type: 'string', required: true, description: 'Target remote API URL', example: url },
						{ name: 'method', type: 'string', required: true, description: 'HTTP method used for request', example: method },
						{ name: 'headers', type: 'Record<string, string>', required: false, description: 'Outgoing headers (defaults to application/json)' }
					],
					sampleJson: {
						url,
						method,
						forwardedPayload: {
							queryParam: 'active'
						}
					},
					typescriptType: `interface FetchInputConfig {\n  url: string;\n  method: '${method}';\n  headers?: Record<string, string>;\n  body?: any;\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'RESPONSE', color: 'emerald', description: 'Passes remote API response payload downstream.' }],
					description: 'Parsed JSON response body returned from the external API server.',
					fields: [
						{ name: 'status', type: 'number', description: 'HTTP Status Code returned from remote server', example: 200 },
						{ name: 'responseBody', type: 'any', description: 'JSON payload received from endpoint', example: { id: 1, title: 'Sample post', completed: true } }
					],
					sampleJson: {
						id: 1,
						title: 'Example post title from remote service',
						author: 'external_system',
						status: 'success'
					},
					typescriptType: `type FetchOutput = Record<string, any>;`
				}
			};
		}

		case 'dataStore': {
			const op = (data.operation || 'get').toUpperCase();
			const collection = data.collection || 'records';
			return {
				nodeType: 'dataStore',
				title: data.title || 'Data Store (Database)',
				category: 'Storage & Database',
				accentColor: 'purple',
				badge: `${op} [${collection}]`,
				summary: `Executes "${op}" database operation against the in-memory "${collection}" collection.`,
				howItWorks:
					'Performs key-value CRUD operations. "get" retrieves records by key, "set" stores records, and "delete" purges keys. Useful for persistent state, caching, and sessions.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Key and Value expressions evaluated in real-time from the active pipeline payload.',
					fields: [
						{ name: 'operation', type: "'get' | 'set' | 'delete'", required: true, description: 'Storage command to execute', example: op.toLowerCase() },
						{ name: 'collection', type: 'string', required: true, description: 'Target database collection or table', example: collection },
						{ name: 'keyExpr', type: 'string', required: true, description: 'Expression resolving to storage key', example: data.keyExpr || 'payload.id' },
						{ name: 'valueExpr', type: 'string', required: false, description: 'Expression resolving to record value for SET operations', example: data.valueExpr || 'payload' }
					],
					sampleJson: {
						operation: op.toLowerCase(),
						collection,
						resolvedKey: 'usr_84920',
						resolvedValue: {
							id: 'usr_84920',
							tier: 'gold',
							updatedAt: new Date().toISOString()
						}
					},
					typescriptType: `interface DataStoreInput {\n  operation: 'get' | 'set' | 'delete';\n  collection: string;\n  key: string;\n  value?: any;\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'STORED', color: 'purple', description: 'Outputs the retrieved or modified record.' }],
					description: 'Returns the retrieved record (for GET) or operation confirmation (for SET / DELETE).',
					fields: [
						{ name: 'result', type: 'any', description: 'Record data or status object', example: { saved: true, key: 'usr_84920' } }
					],
					sampleJson:
						op.toLowerCase() === 'set'
							? { saved: true, key: 'usr_84920', value: { tier: 'gold', active: true } }
							: op.toLowerCase() === 'delete'
								? { deleted: true, key: 'usr_84920' }
								: { id: 'usr_84920', tier: 'gold', active: true },
					typescriptType: `type DataStoreOutput = Record<string, any> | { saved: boolean; key: string } | null;`
				}
			};
		}

		case 'httpResponse': {
			const statusCode = data.statusCode || 200;
			return {
				nodeType: 'httpResponse',
				title: data.title || 'Send Response',
				category: 'Output & Egress',
				accentColor: 'rose',
				badge: `HTTP ${statusCode}`,
				summary: `Terminating node that sends an HTTP ${statusCode} JSON response back to the API caller.`,
				howItWorks:
					'Completes the execution of the Nodeflow endpoint. Evaluates the body expression (e.g. payload or custom JSON) and returns it with HTTP headers to the calling client.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Incoming payload or evaluated body expression returned to client.',
					fields: [
						{ name: 'statusCode', type: 'number', required: true, description: 'HTTP status code (200, 201, 400, 404, 500)', example: statusCode },
						{ name: 'bodyExpression', type: 'string', required: true, description: 'JavaScript expression or JSON returning the response body', example: data.bodyExpression || 'payload' }
					],
					sampleJson: {
						statusCode,
						body: {
							success: true,
							message: 'Workflow completed successfully',
							data: {
								id: 'rec_9281',
								status: 'processed'
							}
						}
					},
					typescriptType: `interface HttpResponseConfig {\n  statusCode: number;\n  bodyExpression: string;\n}`
				},
				output: {
					handles: [],
					description: 'Pipeline endpoint terminal. Emits HTTP response over network; no downstream handles.',
					fields: [
						{ name: 'statusCode', type: 'number', description: 'Final response status code', example: statusCode },
						{ name: 'headers', type: 'Record<string, string>', description: 'Response headers sent to caller', example: { 'content-type': 'application/json' } },
						{ name: 'body', type: 'any', description: 'Final serialized response body', example: { success: true } }
					],
					sampleJson: {
						status: statusCode,
						headers: {
							'Content-Type': 'application/json',
							'X-Powered-By': 'Nodeflow Engine'
						},
						body: {
							success: true,
							data: {
								id: 'rec_9281',
								status: 'processed'
							}
						}
					},
					typescriptType: `interface FinalClientResponse {\n  statusCode: ${statusCode};\n  headers: Record<string, string>;\n  body: any;\n}`
				}
			};
		}

		case 'authNode': {
			return {
				nodeType: 'authNode',
				title: data.title || 'Bearer Auth Validator',
				category: 'Security & Auth',
				accentColor: 'blue',
				badge: 'Bearer Token',
				summary: 'Inspects and verifies incoming Authorization Bearer tokens.',
				howItWorks:
					'Checks req.headers["authorization"] for a Bearer token. If valid, passes through the VALID handle and attaches authenticated user claims; otherwise routes to INVALID handle.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Request headers containing Bearer authorization string.',
					fields: [
						{ name: 'authorization', type: 'string', required: true, description: 'Header formatted as "Bearer <token>"', example: 'Bearer eyJhbGciOi...' }
					],
					sampleJson: {
						headers: {
							authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
						}
					},
					typescriptType: `interface AuthHeaderInput {\n  headers: { authorization: string };\n}`
				},
				output: {
					handles: [
						{ id: 'valid', label: 'VALID (200)', color: 'emerald', description: 'Followed if token is valid and user is verified' },
						{ id: 'invalid', label: 'INVALID (401)', color: 'rose', description: 'Followed if token is missing, expired, or invalid' }
					],
					description: 'Attaches user profile and authentication status to payload.',
					fields: [
						{ name: 'authenticated', type: 'boolean', description: 'True if token verified', example: true },
						{ name: 'user', type: 'object', description: 'Verified user attributes', example: { id: 'usr_1', email: 'alice@example.com', role: 'admin' } }
					],
					sampleJson: {
						authenticated: true,
						user: {
							id: 'usr_1',
							email: 'alice@example.com',
							role: 'admin'
						}
					},
					typescriptType: `interface AuthOutput {\n  authenticated: boolean;\n  user?: { id: string; email: string; role: string };\n  error?: string;\n}`
				}
			};
		}

		case 'validatorNode': {
			const reqFields = data.requiredFields || 'email, password';
			return {
				nodeType: 'validatorNode',
				title: data.title || 'Schema Validator',
				category: 'Validation',
				accentColor: 'teal',
				badge: 'Input Guard',
				summary: `Guards pipeline by requiring fields: "${reqFields}".`,
				howItWorks:
					'Inspects the working payload. If all required keys are defined and non-empty, routes through VALID. If any field is missing, routes through INVALID with validation error messages.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Pipeline payload containing fields to test against the required fields list.',
					fields: [
						{ name: 'requiredFields', type: 'string', required: true, description: 'Comma-separated field names', example: reqFields },
						{ name: 'payload', type: 'Record<string, any>', required: true, description: 'Object containing fields to validate' }
					],
					sampleJson: {
						requiredFields: reqFields,
						payload: {
							email: 'user@example.com',
							password: 'securePassword123'
						}
					},
					typescriptType: `interface ValidatorInput {\n  payload: Record<string, any>;\n}`
				},
				output: {
					handles: [
						{ id: 'valid', label: 'VALID', color: 'emerald', description: 'All required fields are present and valid' },
						{ id: 'invalid', label: 'INVALID', color: 'rose', description: 'One or more required fields are missing' }
					],
					description: 'Emits validation result and error diagnostics.',
					fields: [
						{ name: 'valid', type: 'boolean', description: 'Overall validation status', example: true },
						{ name: 'missingFields', type: 'string[]', description: 'List of missing fields (if invalid)', example: [] },
						{ name: 'errors', type: 'string[]', description: 'Validation error messages', example: [] }
					],
					sampleJson: {
						valid: true,
						missingFields: [],
						errors: [],
						payload: {
							email: 'user@example.com',
							password: 'securePassword123'
						}
					},
					typescriptType: `interface ValidatorOutput {\n  valid: boolean;\n  missingFields: string[];\n  errors: string[];\n  payload: Record<string, any>;\n}`
				}
			};
		}

		case 'delayNode': {
			const delay = data.delayMs ?? 500;
			return {
				nodeType: 'delayNode',
				title: data.title || 'Delay / Sleep',
				category: 'Utility & Timing',
				accentColor: 'yellow',
				badge: `${delay}ms Sleep`,
				summary: `Pauses pipeline execution for ${delay} milliseconds.`,
				howItWorks:
					'Asynchronously pauses the execution thread using setTimeout. Once elapsed, passes the incoming payload through without alteration.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'DelayMs duration in milliseconds and current payload.',
					fields: [
						{ name: 'delayMs', type: 'number', required: true, description: 'Sleep duration in milliseconds (0 - 30,000)', example: delay }
					],
					sampleJson: {
						delayMs: delay,
						payload: {
							status: 'queued'
						}
					},
					typescriptType: `interface DelayInput {\n  delayMs: number;\n  payload: any;\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'RESUME', color: 'yellow', description: 'Resumes flow after duration elapses.' }],
					description: 'Forwards original payload with delay execution confirmation.',
					fields: [
						{ name: 'delayed', type: 'boolean', description: 'Sleep completed flag', example: true },
						{ name: 'waitedMs', type: 'number', description: 'Actual duration waited', example: delay }
					],
					sampleJson: {
						delayed: true,
						waitedMs: delay,
						payload: {
							status: 'queued'
						}
					},
					typescriptType: `interface DelayOutput {\n  delayed: boolean;\n  waitedMs: number;\n  payload: any;\n}`
				}
			};
		}

		case 'googleAuthNode': {
			const tokenSource = data.tokenSource || 'header';
			const tokenField = data.tokenField || 'id_token';
			return {
				nodeType: 'googleAuthNode',
				title: data.title || 'Google OAuth Validator',
				category: 'Security & Identity',
				accentColor: 'blue',
				badge: 'Google ID Token',
				summary: `Verifies Google ID tokens extracted from ${tokenSource === 'header' ? 'Authorization Header' : `payload.${tokenField}`}.`,
				howItWorks:
					'Decodes and validates Google JWT ID tokens. On verification, extracts the Google account claims (sub, email, name, picture) and routes through VALID handle.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Token payload or headers containing Google ID token.',
					fields: [
						{ name: 'tokenSource', type: "'header' | 'payload'", required: true, description: 'Location of JWT token', example: tokenSource },
						{ name: 'tokenField', type: 'string', required: false, description: 'Payload field name if source is payload', example: tokenField },
						{ name: 'clientId', type: 'string', required: false, description: 'Optional Google OAuth Client ID audience' }
					],
					sampleJson: {
						tokenSource,
						tokenField,
						id_token: 'ya29.a0AfH6SMB...'
					},
					typescriptType: `interface GoogleAuthInput {\n  tokenSource: 'header' | 'payload';\n  tokenField: string;\n  clientId?: string;\n}`
				},
				output: {
					handles: [
						{ id: 'valid', label: 'VALID (200)', color: 'emerald', description: 'Google token successfully verified' },
						{ id: 'invalid', label: 'INVALID (401)', color: 'rose', description: 'Token missing, malformed, or rejected' }
					],
					description: 'Outputs Google user profile claims to downstream nodes.',
					fields: [
						{ name: 'authenticated', type: 'boolean', description: 'Authentication success flag', example: true },
						{ name: 'user.id', type: 'string', description: 'Google Subject ID (sub)', example: 'google_1028391823' },
						{ name: 'user.email', type: 'string', description: 'Verified Google Email', example: 'developer@gmail.com' },
						{ name: 'user.name', type: 'string', description: 'Display Name', example: 'Alex Developer' },
						{ name: 'user.picture', type: 'string', description: 'Avatar URL', example: 'https://lh3.googleusercontent.com/...' }
					],
					sampleJson: {
						authenticated: true,
						user: {
							id: 'google_1028391823',
							email: 'developer@gmail.com',
							name: 'Alex Developer',
							picture: 'https://lh3.googleusercontent.com/a/sample',
							email_verified: true
						}
					},
					typescriptType: `interface GoogleAuthOutput {\n  authenticated: boolean;\n  user: {\n    id: string;\n    email: string;\n    name: string;\n    picture?: string;\n    email_verified: boolean;\n  };\n}`
				}
			};
		}

		case 'userManagementNode': {
			const action = data.action || 'signup';
			return {
				nodeType: 'userManagementNode',
				title: data.title || 'User Management (Auth Store)',
				category: 'Security & Database',
				accentColor: 'indigo',
				badge: `Auth: ${action}`,
				summary: `Performs built-in authentication action "${action}" against project user directory.`,
				howItWorks:
					'Built-in user management system. Securely handles user creation (with SHA-256 password hashing), login verification, user queries, role updates, and user deletions with zero external dependencies.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Authentication parameters resolved from payload expressions.',
					fields: [
						{ name: 'action', type: 'string', required: true, description: 'Action: signup, login, getUser, updateUser, deleteUser, listUsers', example: action },
						{ name: 'email', type: 'string', required: action === 'signup' || action === 'login', description: 'User email address', example: 'user@example.com' },
						{ name: 'password', type: 'string', required: action === 'signup' || action === 'login', description: 'Raw user password to verify or hash', example: 'SecretP@ss1' },
						{ name: 'name', type: 'string', required: false, description: 'User full display name', example: 'Jane Smith' },
						{ name: 'role', type: 'string', required: false, description: 'User role (e.g. user, admin, editor)', example: 'user' }
					],
					sampleJson: {
						action,
						email: 'jane@example.com',
						password: 'StrongPassword123!',
						name: 'Jane Smith',
						role: 'user'
					},
					typescriptType: `interface UserManagementInput {\n  action: '${action}';\n  email?: string;\n  password?: string;\n  name?: string;\n  role?: string;\n}`
				},
				output: {
					handles: [
						{ id: 'success', label: 'SUCCESS', color: 'emerald', description: 'Action succeeded (user registered, logged in, or updated)' },
						{ id: 'error', label: 'ERROR', color: 'rose', description: 'Action failed (duplicate email, wrong password, or not found)' }
					],
					description: 'Emits user object and bearer session token on success.',
					fields: [
						{ name: 'success', type: 'boolean', description: 'Operation status', example: true },
						{ name: 'user.id', type: 'string', description: 'Unique user identifier', example: 'usr_f89a2b' },
						{ name: 'user.email', type: 'string', description: 'User email', example: 'jane@example.com' },
						{ name: 'user.name', type: 'string', description: 'User full name', example: 'Jane Smith' },
						{ name: 'user.role', type: 'string', description: 'Assigned role', example: 'user' },
						{ name: 'token', type: 'string', description: 'Bearer authentication token for client sessions', example: 'usr_token_f89a2b...' }
					],
					sampleJson: {
						success: true,
						user: {
							id: 'usr_f89a2b',
							email: 'jane@example.com',
							name: 'Jane Smith',
							role: 'user',
							createdAt: new Date().toISOString()
						},
						token: 'usr_token_f89a2b10928374'
					},
					typescriptType: `interface UserManagementOutput {\n  success: boolean;\n  user?: {\n    id: string;\n    email: string;\n    name?: string;\n    role: string;\n    createdAt: string;\n  };\n  token?: string;\n  error?: string;\n}`
				}
			};
		}

		case 'aiNode':
		case 'openAiNode': {
			const provider = data.provider || 'openai';
			const model = data.model || 'gpt-4o-mini';
			return {
				nodeType: 'aiNode',
				title: data.title || 'AI Model Completion',
				category: 'Artificial Intelligence',
				accentColor: 'emerald',
				badge: `${provider}: ${model}`,
				summary: `Generates AI completions using ${provider} (${model}).`,
				howItWorks:
					'Interpolates payload variables into system and user prompts (using {{payload.field}} syntax). Calls the AI provider API and merges the resulting text or JSON object into payload.aiResponse.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Prompt templates, model configuration, and variables available for {{template}} interpolation.',
					fields: [
						{ name: 'provider', type: 'string', required: true, description: 'Provider: openai, anthropic, google, groq', example: provider },
						{ name: 'model', type: 'string', required: true, description: 'Model ID', example: model },
						{ name: 'systemPrompt', type: 'string', required: false, description: 'Guiding persona prompt', example: data.systemPrompt || 'You are an API assistant.' },
						{ name: 'userPrompt', type: 'string', required: true, description: 'User prompt with {{payload.var}} placeholders', example: data.userPrompt || 'Analyze: {{payload.text}}' },
						{ name: 'temperature', type: 'number', required: false, description: 'Creativity temperature (0.0 - 1.0)', example: data.temperature ?? 0.7 },
						{ name: 'responseFormat', type: "'text' | 'json_object'", required: false, description: 'Output formatting mode', example: data.responseFormat || 'text' }
					],
					sampleJson: {
						provider,
						model,
						interpolatedUserPrompt: 'Analyze this customer message: "I want to upgrade my tier to Enterprise."',
						temperature: 0.7
					},
					typescriptType: `interface AiNodeInput {\n  provider: string;\n  model: string;\n  systemPrompt?: string;\n  userPrompt: string;\n  temperature?: number;\n  responseFormat?: 'text' | 'json_object';\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'COMPLETION', color: 'emerald', description: 'Outputs the generated AI text or parsed JSON.' }],
					description: 'Appends aiResponse to the pipeline payload with content and token metrics.',
					fields: [
						{ name: 'content', type: 'string', description: 'Generated text or JSON string', example: 'Detected intent: Upgrade Plan. Priority: High.' },
						{ name: 'model', type: 'string', description: 'Model used', example: model },
						{ name: 'usage.total_tokens', type: 'number', description: 'Tokens consumed', example: 54 }
					],
					sampleJson: {
						content: 'The user wants to upgrade to Enterprise. Routing to Sales tier.',
						model,
						usage: {
							prompt_tokens: 38,
							completion_tokens: 16,
							total_tokens: 54
						}
					},
					typescriptType: `interface AiNodeOutput {\n  content: string;\n  model: string;\n  usage: {\n    prompt_tokens: number;\n    completion_tokens: number;\n    total_tokens: number;\n  };\n}`
				}
			};
		}

		case 'telegramTrigger': {
			const cmd = data.filterCommand || '/all';
			return {
				nodeType: 'telegramTrigger',
				title: data.title || 'Telegram Bot Webhook Trigger',
				category: 'Telegram Bot',
				accentColor: 'cyan',
				badge: `Trigger [${cmd}]`,
				summary: `Receives incoming webhook updates from Telegram Bot API with command filter "${cmd}".`,
				howItWorks:
					'Entrypoint for Telegram Bots. Listens for incoming chat messages, commands, or callback queries. Filters by command if specified and initializes payload with chat and message details.',
				input: {
					handleType: 'Entrypoint (No input handle; triggered by Telegram webhook)',
					description: 'Telegram Update payload dispatched from https://api.telegram.org/bot<TOKEN>/setWebhook.',
					fields: [
						{ name: 'update_id', type: 'number', required: true, description: 'Telegram update identifier', example: 10928301 },
						{ name: 'message', type: 'object', required: true, description: 'Telegram Message object', example: { message_id: 1, text: '/help' } }
					],
					sampleJson: {
						update_id: 8492019,
						message: {
							message_id: 341,
							from: { id: 981273, first_name: 'David', username: 'david_dev' },
							chat: { id: -1009876543, type: 'supergroup', title: 'Dev Community' },
							date: 1791480410,
							text: '/start welcome'
						}
					},
					typescriptType: `interface TelegramWebhookInput {\n  update_id: number;\n  message: {\n    message_id: number;\n    from: { id: number; first_name: string; username?: string };\n    chat: { id: number; type: string };\n    text: string;\n  };\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'MESSAGE', color: 'cyan', description: 'Forwards parsed Telegram message context.' }],
					description: 'Normalized Telegram message parameters ready for logic and reply nodes.',
					fields: [
						{ name: 'chatId', type: 'number | string', description: 'Target Telegram chat ID to reply to', example: -1009876543 },
						{ name: 'text', type: 'string', description: 'Incoming message body', example: '/start welcome' },
						{ name: 'command', type: 'string', description: 'Parsed command prefix', example: '/start' },
						{ name: 'fromUser', type: 'string', description: 'Sender display name or username', example: 'david_dev' }
					],
					sampleJson: {
						received: true,
						chatId: -1009876543,
						text: '/start welcome',
						command: '/start',
						from: {
							id: 981273,
							username: 'david_dev',
							name: 'David'
						}
					},
					typescriptType: `interface TelegramTriggerOutput {\n  chatId: number;\n  text: string;\n  command: string;\n  from: { id: number; username?: string; name: string };\n}`
				}
			};
		}

		case 'telegramSendMessage': {
			const action = data.action || 'sendMessage';
			return {
				nodeType: 'telegramSendMessage',
				title: data.title || 'Telegram Send Message',
				category: 'Telegram Bot',
				accentColor: 'cyan',
				badge: `Telegram: ${action}`,
				summary: `Calls Telegram Bot API "${action}" to deliver messages, photos, or notifications.`,
				howItWorks:
					'Formats and sends messages using Telegram Bot API. Supports HTML and MarkdownV2 formatting, photo attachments, and dynamic chatId expressions.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Message parameters and target chatId expression.',
					fields: [
						{ name: 'action', type: "'sendMessage' | 'sendPhoto' | 'answerCallbackQuery'", required: true, description: 'Telegram API method', example: action },
						{ name: 'chatId', type: 'string', required: true, description: 'Chat ID or expression (e.g. payload.chatId)', example: 'payload.chatId' },
						{ name: 'text', type: 'string', required: true, description: 'Message body or caption', example: data.text || 'Hello from Nodeflow!' },
						{ name: 'parseMode', type: "'HTML' | 'MarkdownV2' | 'None'", required: false, description: 'Formatting style', example: data.parseMode || 'HTML' }
					],
					sampleJson: {
						action,
						chatId: '981273',
						text: '<b>Nodeflow Update:</b> Your order has shipped! 🚀',
						parseMode: 'HTML'
					},
					typescriptType: `interface TelegramSendMessageInput {\n  action: 'sendMessage' | 'sendPhoto' | 'answerCallbackQuery';\n  chatId: string | number;\n  text: string;\n  parseMode?: 'HTML' | 'MarkdownV2';\n}`
				},
				output: {
					handles: [{ id: 'output', label: 'SENT', color: 'cyan', description: 'Outputs the Telegram message receipt.' }],
					description: 'Telegram Bot API response object with sent message_id and delivery confirmation.',
					fields: [
						{ name: 'ok', type: 'boolean', description: 'Telegram API status', example: true },
						{ name: 'result.message_id', type: 'number', description: 'Created message ID in chat', example: 892 },
						{ name: 'result.date', type: 'number', description: 'Unix timestamp', example: 1791480410 }
					],
					sampleJson: {
						ok: true,
						result: {
							message_id: 892,
							chat: { id: 981273, type: 'private' },
							date: 1791480410,
							text: 'Nodeflow Update: Your order has shipped!'
						}
					},
					typescriptType: `interface TelegramMessageReceipt {\n  ok: boolean;\n  result: {\n    message_id: number;\n    chat: { id: number; type: string };\n    date: number;\n    text: string;\n  };\n}`
				}
			};
		}

		default: {
			// Dynamic extension or generic node
			const outputsList = customOutputs && customOutputs.length > 0
				? customOutputs.map((o) => ({ id: o.id, label: o.label || o.id.toUpperCase(), color: o.color || 'indigo' }))
				: [{ id: 'output', label: 'OUTPUT', color: 'indigo', description: 'Passes transformed payload downstream.' }];

			const properties = data.properties as Array<any> | undefined;
			const inputFields: SchemaField[] = properties && properties.length > 0
				? properties.map((p) => ({
						name: p.name,
						type: p.type || 'string',
						required: false,
						description: p.label || p.name,
						example: data[p.name] ?? p.defaultValue ?? ''
					}))
				: [
						{ name: 'payload', type: 'Record<string, any>', required: true, description: 'Incoming pipeline payload from previous node' },
						{ name: 'state', type: 'Record<string, any>', required: false, description: 'Shared pipeline state variables' }
					];

			return {
				nodeType: type,
				title: data.title || fallbackTitle,
				category: data.category || 'Extensions & Custom',
				accentColor: data.accentColor || 'indigo',
				badge: data.badge || 'Extension Node',
				summary: data.description || `Custom extension node: ${fallbackTitle}.`,
				howItWorks:
					'Receives the incoming pipeline payload, executes the extension logic or integration, and emits the resulting output through its configured output handles.',
				input: {
					handleType: 'Single Input Handle (Top)',
					description: 'Properties configured on the node and the incoming pipeline payload.',
					fields: inputFields,
					sampleJson: {
						configuredProperties: data,
						payload: {
							sampleKey: 'sampleValue'
						}
					},
					typescriptType: `interface CustomExtensionInput {\n  payload: Record<string, any>;\n  state?: Record<string, any>;\n}`
				},
				output: {
					handles: outputsList,
					description: 'Outputs the result of the extension execution to connected downstream nodes.',
					fields: [
						{ name: 'payload', type: 'Record<string, any>', description: 'Updated working payload forwarded to downstream nodes' }
					],
					sampleJson: {
						status: 'success',
						updatedPayload: {
							processedBy: fallbackTitle,
							timestamp: new Date().toISOString()
						}
					},
					typescriptType: `type CustomExtensionOutput = Record<string, any>;`
				}
			};
		}
	}
}

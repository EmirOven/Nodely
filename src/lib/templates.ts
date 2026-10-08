import type { Node, Edge } from '@xyflow/svelte';

export interface TemplateDefinition {
	nodes: Node[];
	edges: Edge[];
	defaultRequest: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
		path: string;
		body: string;
	};
}

export const templatesData: Record<string, TemplateDefinition> = {
	'user-auth': {
		nodes: [
			{
				id: 'trigger-1',
				type: 'httpTrigger',
				position: { x: 300, y: 50 },
				data: {
					title: 'Register Endpoint',
					method: 'POST',
					path: '/api/v1/auth/register'
				}
			},
			{
				id: 'code-1',
				type: 'codeBlock',
				position: { x: 260, y: 280 },
				data: {
					title: 'Validate & Hash',
					code: `// Validate payload\nconst errors = [];\nif (!payload.email || !payload.email.includes('@')) {\n  errors.push('Valid email is required');\n}\nif (!payload.password || payload.password.length < 6) {\n  errors.push('Password must be at least 6 characters');\n}\n\nlog('Validation checked. Errors count: ' + errors.length);\n\nconst isValid = errors.length === 0;\nconst userId = 'usr_' + Math.random().toString(36).substring(2, 9);\n\nreturn {\n  isValid,\n  errors,\n  user: isValid ? {\n    id: userId,\n    name: payload.name || 'Anonymous',\n    email: payload.email,\n    role: payload.role || 'member',\n    createdAt: new Date().toISOString()\n  } : null\n};`
				}
			},
			{
				id: 'cond-1',
				type: 'conditional',
				position: { x: 300, y: 540 },
				data: {
					title: 'Check Validity',
					expression: 'payload.isValid === true'
				}
			},
			{
				id: 'store-1',
				type: 'dataStore',
				position: { x: 100, y: 760 },
				data: {
					title: 'Save New User',
					operation: 'set',
					collection: 'users',
					keyExpr: 'payload.user.id',
					valueExpr: 'payload.user'
				}
			},
			{
				id: 'resp-success',
				type: 'httpResponse',
				position: { x: 100, y: 1020 },
				data: {
					title: '201 Created',
					statusCode: 201,
					bodyExpression: `{\n  success: true,\n  message: 'User registered successfully',\n  user: payload.user\n}`
				}
			},
			{
				id: 'resp-error',
				type: 'httpResponse',
				position: { x: 520, y: 760 },
				data: {
					title: '400 Bad Request',
					statusCode: 400,
					bodyExpression: `{\n  success: false,\n  error: 'Validation failed',\n  details: payload.errors\n}`
				}
			}
		],
		edges: [
			{
				id: 'e1-2',
				source: 'trigger-1',
				target: 'code-1',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #6366f1; stroke-width: 2px;'
			},
			{
				id: 'e2-3',
				source: 'code-1',
				target: 'cond-1',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #6366f1; stroke-width: 2px;'
			},
			{
				id: 'e3-4-true',
				source: 'cond-1',
				target: 'store-1',
				sourceHandle: 'true',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #10b981; stroke-width: 2.5px;'
			},
			{
				id: 'e4-5',
				source: 'store-1',
				target: 'resp-success',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #10b981; stroke-width: 2px;'
			},
			{
				id: 'e3-6-false',
				source: 'cond-1',
				target: 'resp-error',
				sourceHandle: 'false',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #ef4444; stroke-width: 2.5px;'
			}
		],
		defaultRequest: {
			method: 'POST',
			path: '/api/v1/auth/register',
			body: JSON.stringify(
				{
					name: 'Alice Johnson',
					email: 'alice@nodely.dev',
					password: 'secret_password_123',
					role: 'developer'
				},
				null,
				2
			)
		}
	},
	'weather-api': {
		nodes: [
			{
				id: 'trigger-w',
				type: 'httpTrigger',
				position: { x: 300, y: 50 },
				data: {
					title: 'Weather Query',
					method: 'GET',
					path: '/api/v1/weather'
				}
			},
			{
				id: 'fetch-w',
				type: 'fetchNode',
				position: { x: 300, y: 280 },
				data: {
					title: 'OpenMeteo API',
					method: 'GET',
					url: 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true'
				}
			},
			{
				id: 'code-w',
				type: 'codeBlock',
				position: { x: 260, y: 500 },
				data: {
					title: 'Format Data',
					code: `const data = state['fetch-w'] || {};\nconst current = data.current_weather || {};\n\nlog('Parsed weather data for location');\n\nreturn {\n  city: 'Berlin',\n  temperatureCelsius: current.temperature,\n  windSpeedKmh: current.windspeed,\n  timestamp: current.time\n};`
				}
			},
			{
				id: 'resp-w',
				type: 'httpResponse',
				position: { x: 300, y: 760 },
				data: {
					title: '200 OK',
					statusCode: 200,
					bodyExpression: `state.lastResult`
				}
			}
		],
		edges: [
			{
				id: 'ew1-2',
				source: 'trigger-w',
				target: 'fetch-w',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #06b6d4; stroke-width: 2px;'
			},
			{
				id: 'ew2-3',
				source: 'fetch-w',
				target: 'code-w',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #6366f1; stroke-width: 2px;'
			},
			{
				id: 'ew3-4',
				source: 'code-w',
				target: 'resp-w',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #10b981; stroke-width: 2px;'
			}
		],
		defaultRequest: {
			method: 'GET',
			path: '/api/v1/weather',
			body: '{}'
		}
	},
	'note-crud': {
		nodes: [
			{
				id: 'trigger-n',
				type: 'httpTrigger',
				position: { x: 300, y: 50 },
				data: {
					title: 'Create Note',
					method: 'POST',
					path: '/api/v1/notes'
				}
			},
			{
				id: 'code-n',
				type: 'codeBlock',
				position: { x: 260, y: 280 },
				data: {
					title: 'Attach Metadata',
					code: `const noteId = 'note_' + Math.random().toString(36).substring(2, 7);\nlog('Generated note id: ' + noteId);\n\nreturn {\n  id: noteId,\n  title: payload.title || 'Untitled',\n  content: payload.content || '',\n  tags: payload.tags || [],\n  createdAt: new Date().toISOString()\n};`
				}
			},
			{
				id: 'store-n',
				type: 'dataStore',
				position: { x: 300, y: 520 },
				data: {
					title: 'Store Note',
					operation: 'set',
					collection: 'notes',
					keyExpr: 'payload.id',
					valueExpr: 'payload'
				}
			},
			{
				id: 'resp-n',
				type: 'httpResponse',
				position: { x: 300, y: 760 },
				data: {
					title: '201 Created',
					statusCode: 201,
					bodyExpression: `{\n  success: true,\n  note: payload\n}`
				}
			}
		],
		edges: [
			{
				id: 'en1-2',
				source: 'trigger-n',
				target: 'code-n',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #6366f1; stroke-width: 2px;'
			},
			{
				id: 'en2-3',
				source: 'code-n',
				target: 'store-n',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #10b981; stroke-width: 2px;'
			},
			{
				id: 'en3-4',
				source: 'store-n',
				target: 'resp-n',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #10b981; stroke-width: 2px;'
			}
		],
		defaultRequest: {
			method: 'POST',
			path: '/api/v1/notes',
			body: JSON.stringify(
				{
					title: 'Ideas for Nodely',
					content: 'Add OpenAPI 3.0 import and export.',
					tags: ['roadmap', 'v1']
				},
				null,
				2
			)
		}
	},
	'empty': {
		nodes: [
			{
				id: 'trigger-empty',
				type: 'httpTrigger',
				position: { x: 320, y: 120 },
				data: {
					title: 'HTTP Trigger',
					method: 'GET',
					path: '/api/v1/hello'
				}
			},
			{
				id: 'resp-empty',
				type: 'httpResponse',
				position: { x: 320, y: 380 },
				data: {
					title: '200 OK',
					statusCode: 200,
					bodyExpression: `{\n  message: 'Hello from Nodely API!',\n  status: 'active',\n  timestamp: new Date().toISOString()\n}`
				}
			}
		],
		edges: [
			{
				id: 'e-empty-1',
				source: 'trigger-empty',
				target: 'resp-empty',
				sourceHandle: 'output',
				targetHandle: 'input',
				animated: true,
				style: 'stroke: #6366f1; stroke-width: 2px;'
			}
		],
		defaultRequest: {
			method: 'GET',
			path: '/api/v1/hello',
			body: '{}'
		}
	},
	'blank': {
		nodes: [],
		edges: [],
		defaultRequest: {
			method: 'GET',
			path: '/api/v1/custom',
			body: '{}'
		}
	}
};

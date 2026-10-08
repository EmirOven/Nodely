import fs from 'node:fs';
import path from 'node:path';
import type { ExtensionPackage, ExtensionAccentColor } from '../types';

const EXTENSIONS_FILE = path.resolve(process.cwd(), '.nodely-extensions.json');
const extensionsMap = new Map<string, ExtensionPackage>();

function seedDefaults(): ExtensionPackage[] {
	const now = new Date().toISOString();

	return [
		// --- BUILT-IN CORE EXTENSIONS ---
		{
			id: 'ext_http_trigger',
			name: 'HTTP Endpoint Trigger',
			version: '1.1.0',
			description: 'Entrypoint router for incoming HTTP calls supporting GET, POST, PUT, PATCH, and DELETE with strict single-endpoint isolation.',
			category: 'Triggers',
			author: 'Nodeflow Core',
			icon: 'Globe',
			accentColor: 'blue',
			nodeType: 'httpTrigger',
			enabled: true,
			isBuiltIn: true,
			tags: ['http', 'gateway', 'trigger', 'api'],
			nodeDefinition: {
				title: 'HTTP Trigger',
				badgeText: '1 per Method',
				width: 'w-84',
				hasInputHandle: false,
				hasOutputHandle: true,
				properties: [
					{ name: 'method', label: 'HTTP Method', type: 'select', defaultValue: 'GET', options: [
						{ label: 'GET - Retrieve Resources', value: 'GET' },
						{ label: 'POST - Create & Action', value: 'POST' },
						{ label: 'PUT - Replace Entire Resource', value: 'PUT' },
						{ label: 'PATCH - Partial Update', value: 'PATCH' },
						{ label: 'DELETE - Remove Resource', value: 'DELETE' }
					] }
				],
				defaultData: { method: 'GET', path: '/api/endpoint' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_user_management',
			name: 'Project User Management & Auth',
			version: '1.0.0',
			description: 'Built-in authentication & database for Nodeflow apps. Handles signup, login, password hashing, and user queries with zero external dependencies.',
			category: 'Security',
			author: 'Nodeflow Core',
			icon: 'Users',
			accentColor: 'indigo',
			nodeType: 'userManagementNode',
			enabled: true,
			isBuiltIn: true,
			tags: ['auth', 'users', 'passwords', 'tokens', 'database'],
			nodeDefinition: {
				title: 'User Management',
				badgeText: 'User Auth',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'SUCCESS', color: 'emerald' },
					{ id: 'error', label: 'ERROR', color: 'rose' }
				],
				properties: [
					{ name: 'action', label: 'Auth Action', type: 'select', defaultValue: 'signup', options: [
						{ label: 'Sign Up (Create User)', value: 'signup' },
						{ label: 'Sign In (Authenticate)', value: 'login' },
						{ label: 'Get User By ID', value: 'getUser' },
						{ label: 'Update User Profile', value: 'updateUser' },
						{ label: 'Delete User', value: 'deleteUser' },
						{ label: 'List All Users', value: 'listUsers' }
					] }
				],
				defaultData: { action: 'signup', emailExpr: 'payload.email', passwordExpr: 'payload.password' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_ai_sdk',
			name: 'AI Unified Completion (AI SDK)',
			version: '1.2.0',
			description: 'Universal Large Language Model connector powered by Vercel AI SDK patterns. Seamlessly connects to OpenAI, Anthropic, Gemini, Groq, or local Ollama.',
			category: 'AI',
			author: 'Nodeflow Core',
			icon: 'Sparkles',
			accentColor: 'emerald',
			nodeType: 'aiNode',
			enabled: true,
			isBuiltIn: true,
			tags: ['ai', 'llm', 'openai', 'gemini', 'claude', 'groq', 'ollama'],
			nodeDefinition: {
				title: 'AI Completion',
				badgeText: 'AI SDK',
				width: 'w-84',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'SUCCESS', color: 'emerald' },
					{ id: 'error', label: 'ERROR', color: 'rose' }
				],
				properties: [
					{ name: 'provider', label: 'Provider', type: 'select', defaultValue: 'openai', options: [
						{ label: 'OpenAI (GPT-4o, o3-mini)', value: 'openai' },
						{ label: 'Anthropic (Claude 3.5 Sonnet)', value: 'anthropic' },
						{ label: 'Google (Gemini 2.0 / 1.5)', value: 'google' },
						{ label: 'Groq (LPU Ultra-Fast)', value: 'groq' },
						{ label: 'Custom / Local Ollama', value: 'custom' }
					] },
					{ name: 'model', label: 'Model Name', type: 'text', defaultValue: 'gpt-4o-mini' },
					{ name: 'systemPrompt', label: 'System Instructions', type: 'textarea', defaultValue: 'You are an AI assistant helping with API processing.' },
					{ name: 'userPrompt', label: 'Prompt Expression', type: 'textarea', defaultValue: 'Process this request: {{payload.prompt || payload.text}}' }
				],
				defaultData: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7 }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_telegram_bot',
			name: 'Telegram Bot Platform',
			version: '1.0.0',
			description: 'End-to-end Telegram bot integration featuring real-time webhook listeners and automatic message/media dispatching.',
			category: 'Telegram Bots',
			author: 'Nodeflow Core',
			icon: 'Send',
			accentColor: 'cyan',
			nodeType: 'telegramSendMessage',
			enabled: true,
			isBuiltIn: true,
			tags: ['telegram', 'bot', 'chat', 'webhook', 'messaging'],
			nodeDefinition: {
				title: 'Telegram Send Message',
				badgeText: 'Bot API',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'SUCCESS', color: 'emerald' },
					{ id: 'error', label: 'ERROR', color: 'rose' }
				],
				properties: [
					{ name: 'action', label: 'Action', type: 'select', defaultValue: 'sendMessage', options: [
						{ label: 'Send Text Message', value: 'sendMessage' },
						{ label: 'Send Photo / Image', value: 'sendPhoto' },
						{ label: 'Answer Callback Query', value: 'answerCallbackQuery' }
					] },
					{ name: 'chatId', label: 'Chat ID Expression', type: 'text', defaultValue: '{{telegram.chatId}}' },
					{ name: 'text', label: 'Message Text', type: 'textarea', defaultValue: 'Hello from Nodeflow Telegram bot!' }
				],
				defaultData: { action: 'sendMessage', chatId: '{{telegram.chatId}}', text: 'Hello from Nodeflow Telegram bot!' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_google_oauth',
			name: 'Google OAuth Gate',
			version: '1.0.0',
			description: 'Validates Google ID tokens and JWT identity assertions, populating verified user profile data into flow state.',
			category: 'Security',
			author: 'Nodeflow Core',
			icon: 'ShieldCheck',
			accentColor: 'blue',
			nodeType: 'googleAuthNode',
			enabled: true,
			isBuiltIn: true,
			tags: ['google', 'oauth', 'jwt', 'identity'],
			nodeDefinition: {
				title: 'Google Auth',
				badgeText: 'OAuth 2.0',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'valid', label: 'VALID (200)', color: 'emerald' },
					{ id: 'invalid', label: 'INVALID (401)', color: 'rose' }
				],
				properties: [
					{ name: 'tokenSource', label: 'Token Source', type: 'select', defaultValue: 'header', options: [
						{ label: 'Authorization Header', value: 'header' },
						{ label: 'Request Payload Field', value: 'payload' }
					] },
					{ name: 'tokenField', label: 'Field Name', type: 'text', defaultValue: 'id_token' }
				],
				defaultData: { tokenSource: 'header', tokenField: 'id_token' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_data_store',
			name: 'KV & Collection Storage',
			version: '1.0.0',
			description: 'Internal key-value persistence store allowing flows to set, get, delete, or query categorized records.',
			category: 'Storage',
			author: 'Nodeflow Core',
			icon: 'Database',
			accentColor: 'emerald',
			nodeType: 'dataStore',
			enabled: true,
			isBuiltIn: true,
			tags: ['kv', 'database', 'persistence', 'cache'],
			nodeDefinition: {
				title: 'Data Store (KV/DB)',
				badgeText: 'KV Store',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: true,
				properties: [
					{ name: 'operation', label: 'Operation', type: 'select', defaultValue: 'set', options: [
						{ label: 'Set Record', value: 'set' },
						{ label: 'Get Record by Key', value: 'get' },
						{ label: 'Delete Record', value: 'delete' },
						{ label: 'List Collection', value: 'list' }
					] },
					{ name: 'collection', label: 'Collection Name', type: 'text', defaultValue: 'items' },
					{ name: 'keyExpr', label: 'Key Expression', type: 'text', defaultValue: 'payload.id || Date.now()' }
				],
				defaultData: { operation: 'set', collection: 'items', keyExpr: 'payload.id' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_code_block',
			name: 'JavaScript / TypeScript Sandbox',
			version: '1.0.0',
			description: 'Inline runtime code block executing custom transformations and logic with access to req, payload, and state.',
			category: 'Logic',
			author: 'Nodeflow Core',
			icon: 'Code2',
			accentColor: 'indigo',
			nodeType: 'codeBlock',
			enabled: true,
			isBuiltIn: true,
			tags: ['code', 'javascript', 'typescript', 'transform'],
			nodeDefinition: {
				title: 'Code Block',
				badgeText: 'JS / TS',
				width: 'w-96',
				hasInputHandle: true,
				hasOutputHandle: true,
				properties: [
					{ name: 'code', label: 'Transformation Script', type: 'textarea', defaultValue: 'return { ...payload, processedAt: Date.now() };' }
				],
				defaultData: { code: 'return { ...payload, processedAt: Date.now() };' }
			},
			createdAt: now,
			updatedAt: now
		},

		// --- CURATED / IMPORTED EXTENSIONS ---
		{
			id: 'ext_discord_webhook',
			name: 'Discord Webhook Dispatcher',
			version: '1.0.0',
			description: 'Send notifications, custom messages, and rich embeds to Discord channels via standard Discord webhook URLs.',
			category: 'Integrations',
			author: 'Community / Discord',
			icon: 'MessageSquare',
			accentColor: 'indigo',
			nodeType: 'discordWebhook',
			enabled: true,
			isBuiltIn: false,
			tags: ['discord', 'webhook', 'notifications', 'chat'],
			website: 'https://discord.com/developers/docs/resources/webhook',
			nodeDefinition: {
				title: 'Discord Webhook',
				badgeText: 'Discord',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'SENT', color: 'emerald' },
					{ id: 'error', label: 'FAILED', color: 'rose' }
				],
				properties: [
					{ name: 'webhookUrl', label: 'Discord Webhook URL', type: 'password', placeholder: 'https://discord.com/api/webhooks/...', description: 'Generated in channel settings' },
					{ name: 'content', label: 'Message Content', type: 'textarea', defaultValue: 'New event received: {{payload.title || payload.message}}' },
					{ name: 'username', label: 'Bot Override Name (Optional)', type: 'text', placeholder: 'Nodeflow Bot' },
					{ name: 'avatarUrl', label: 'Avatar URL (Optional)', type: 'text', placeholder: 'https://...' }
				],
				defaultData: { content: 'New event received: {{payload.title || payload.message}}', username: 'Nodeflow Bot' },
				runtimeHandler: `
					const webhookUrl = node.data?.webhookUrl || '';
					const content = node.data?.content || 'Hello from Discord Node!';
					if (!webhookUrl) {
						addLog(currentId, nodeTitle, 'warn', 'Mock mode: No Discord webhook URL specified, simulated delivery.');
						return { delivered: true, mock: true, content };
					}
					// Live dispatch
					const res = await fetch(webhookUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ content, username: node.data?.username })
					});
					return { status: res.status, ok: res.ok };
				`
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_stripe_payments',
			name: 'Stripe Payment Gateway',
			version: '1.0.0',
			description: 'Create PaymentIntents, capture charges, and manage customers using Stripe Payments API.',
			category: 'Payments',
			author: 'Community / Stripe',
			icon: 'CreditCard',
			accentColor: 'emerald',
			nodeType: 'stripeCharge',
			enabled: true,
			isBuiltIn: false,
			tags: ['stripe', 'payments', 'checkout', 'finance', 'billing'],
			website: 'https://stripe.com/docs/api',
			nodeDefinition: {
				title: 'Stripe Payments',
				badgeText: 'Stripe API',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'APPROVED', color: 'emerald' },
					{ id: 'error', label: 'DECLINED', color: 'rose' }
				],
				properties: [
					{ name: 'apiKey', label: 'Stripe Secret Key', type: 'password', placeholder: 'sk_test_...', description: 'Stripe API private secret' },
					{ name: 'action', label: 'Action', type: 'select', defaultValue: 'createPaymentIntent', options: [
						{ label: 'Create Payment Intent', value: 'createPaymentIntent' },
						{ label: 'Create Customer', value: 'createCustomer' },
						{ label: 'Retrieve Charge', value: 'getCharge' }
					] },
					{ name: 'amountExpr', label: 'Amount in Cents Expr', type: 'text', defaultValue: 'payload.amount || 2000' },
					{ name: 'currency', label: 'Currency', type: 'text', defaultValue: 'usd' }
				],
				defaultData: { action: 'createPaymentIntent', amountExpr: 'payload.amount || 2000', currency: 'usd' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_slack_notifier',
			name: 'Slack Block Kit Notifier',
			version: '1.0.0',
			description: 'Post structured alerts, deployment notifications, and rich message blocks directly to Slack channels.',
			category: 'Integrations',
			author: 'Community / Slack',
			icon: 'Slack',
			accentColor: 'purple',
			nodeType: 'slackNotifier',
			enabled: true,
			isBuiltIn: false,
			tags: ['slack', 'chat', 'alerts', 'integrations'],
			website: 'https://api.slack.com/messaging/webhooks',
			nodeDefinition: {
				title: 'Slack Notifier',
				badgeText: 'Slack Bot',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'SUCCESS', color: 'emerald' },
					{ id: 'error', label: 'ERROR', color: 'rose' }
				],
				properties: [
					{ name: 'webhookUrl', label: 'Incoming Webhook URL', type: 'password', placeholder: 'https://hooks.slack.com/services/...' },
					{ name: 'channel', label: 'Channel Override (Optional)', type: 'text', placeholder: '#general' },
					{ name: 'messageText', label: 'Message Text', type: 'textarea', defaultValue: 'Alert from Nodeflow: {{payload.summary || "Triggered"}}' }
				],
				defaultData: { messageText: 'Alert from Nodeflow: {{payload.summary || "Triggered"}}' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_resend_email',
			name: 'Resend Transactional Email',
			version: '1.0.0',
			description: 'Deliver modern transactional emails with HTML templates, dynamic variables, and custom sender domains via Resend.',
			category: 'Messaging',
			author: 'Community / Resend',
			icon: 'Mail',
			accentColor: 'teal',
			nodeType: 'resendEmail',
			enabled: true,
			isBuiltIn: false,
			tags: ['email', 'resend', 'transactional', 'mailer'],
			website: 'https://resend.com/docs',
			nodeDefinition: {
				title: 'Resend Email',
				badgeText: 'Resend',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'SENT', color: 'emerald' },
					{ id: 'error', label: 'FAILED', color: 'rose' }
				],
				properties: [
					{ name: 'apiKey', label: 'Resend API Key', type: 'password', placeholder: 're_123...' },
					{ name: 'from', label: 'From Email Address', type: 'text', defaultValue: 'notifications@example.com' },
					{ name: 'toExpr', label: 'Recipient Email Expr', type: 'text', defaultValue: 'payload.email' },
					{ name: 'subject', label: 'Subject Line', type: 'text', defaultValue: 'Welcome to our platform!' },
					{ name: 'htmlBody', label: 'HTML Body Content', type: 'textarea', defaultValue: '<p>Hi {{payload.name || "there"}},</p><p>Thank you for signing up!</p>' }
				],
				defaultData: { from: 'notifications@example.com', toExpr: 'payload.email', subject: 'Welcome to our platform!' }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_redis_cache',
			name: 'Redis Cache & Rate Limiter',
			version: '1.0.0',
			description: 'Fast memory cache and rate limiting counter using Redis. Supports Get, Set, Delete, and Increment with TTL.',
			category: 'Storage',
			author: 'Community / Redis',
			icon: 'Database',
			accentColor: 'rose',
			nodeType: 'redisCache',
			enabled: true,
			isBuiltIn: false,
			tags: ['redis', 'cache', 'kv', 'ratelimit', 'fast'],
			nodeDefinition: {
				title: 'Redis Cache',
				badgeText: 'Redis KV',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'hit', label: 'HIT / OK', color: 'emerald' },
					{ id: 'miss', label: 'MISS / EMPTY', color: 'amber' },
					{ id: 'error', label: 'ERROR', color: 'rose' }
				],
				properties: [
					{ name: 'redisUrl', label: 'Redis Connection URL', type: 'password', placeholder: 'redis://default:token@host:port' },
					{ name: 'operation', label: 'Operation', type: 'select', defaultValue: 'get', options: [
						{ label: 'GET (Retrieve Cached Value)', value: 'get' },
						{ label: 'SET (Cache Value with TTL)', value: 'set' },
						{ label: 'INCR (Increment Counter)', value: 'incr' },
						{ label: 'DEL (Invalidate Key)', value: 'del' }
					] },
					{ name: 'keyExpr', label: 'Key Expression', type: 'text', defaultValue: 'payload.cacheKey || "item:" + payload.id' },
					{ name: 'ttlSeconds', label: 'TTL in Seconds (for SET)', type: 'number', defaultValue: 300 }
				],
				defaultData: { operation: 'get', keyExpr: 'payload.cacheKey', ttlSeconds: 300 }
			},
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'ext_github_dispatcher',
			name: 'GitHub Event Dispatcher',
			version: '1.0.0',
			description: 'Trigger GitHub repository dispatches and webhook actions to automate CI/CD pipelines directly from Nodeflow.',
			category: 'DevOps',
			author: 'Community / GitHub',
			icon: 'Github',
			accentColor: 'slate',
			nodeType: 'githubDispatch',
			enabled: true,
			isBuiltIn: false,
			tags: ['github', 'devops', 'cicd', 'actions', 'git'],
			website: 'https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event',
			nodeDefinition: {
				title: 'GitHub Dispatcher',
				badgeText: 'GitHub API',
				width: 'w-80',
				hasInputHandle: true,
				hasOutputHandle: false,
				outputs: [
					{ id: 'success', label: 'DISPATCHED', color: 'emerald' },
					{ id: 'error', label: 'FAILED', color: 'rose' }
				],
				properties: [
					{ name: 'token', label: 'GitHub Personal Access Token', type: 'password', placeholder: 'ghp_...' },
					{ name: 'owner', label: 'Repo Owner / Org', type: 'text', placeholder: 'octocat' },
					{ name: 'repo', label: 'Repository Name', type: 'text', placeholder: 'my-project' },
					{ name: 'eventType', label: 'Event Type Name', type: 'text', defaultValue: 'nodeflow_event' }
				],
				defaultData: { eventType: 'nodeflow_event' }
			},
			createdAt: now,
			updatedAt: now
		}
	];
}

function loadFromDisk(): void {
	try {
		if (fs.existsSync(EXTENSIONS_FILE)) {
			const data = fs.readFileSync(EXTENSIONS_FILE, 'utf-8');
			const parsed = JSON.parse(data) as ExtensionPackage[];
			extensionsMap.clear();
			for (const ext of parsed) {
				extensionsMap.set(ext.id, ext);
			}
			return;
		}
	} catch (err) {
		console.error('Failed to load extensions from disk, fallback to defaults:', err);
	}

	// Seed defaults
	extensionsMap.clear();
	const defaults = seedDefaults();
	for (const ext of defaults) {
		extensionsMap.set(ext.id, ext);
	}
	saveToDisk();
}

function saveToDisk(): void {
	try {
		const list = Array.from(extensionsMap.values());
		fs.writeFileSync(EXTENSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
	} catch (err) {
		console.error('Failed to save extensions to disk:', err);
	}
}

// Initial load
loadFromDisk();

export function getAllExtensions(): ExtensionPackage[] {
	if (extensionsMap.size === 0) {
		loadFromDisk();
	}
	return Array.from(extensionsMap.values());
}

export function getExtensionById(id: string): ExtensionPackage | undefined {
	return extensionsMap.get(id);
}

export function saveExtension(ext: ExtensionPackage): ExtensionPackage {
	ext.updatedAt = new Date().toISOString();
	if (!ext.createdAt) {
		ext.createdAt = ext.updatedAt;
	}
	extensionsMap.set(ext.id, ext);
	saveToDisk();
	return ext;
}

export function toggleExtension(id: string, enabled: boolean): ExtensionPackage | null {
	const ext = extensionsMap.get(id);
	if (!ext) return null;
	ext.enabled = enabled;
	ext.updatedAt = new Date().toISOString();
	extensionsMap.set(id, ext);
	saveToDisk();
	return ext;
}

export function deleteExtension(id: string): boolean {
	const ext = extensionsMap.get(id);
	if (!ext) return false;
	if (ext.isBuiltIn) {
		throw new Error('Cannot delete built-in extension');
	}
	const deleted = extensionsMap.delete(id);
	if (deleted) {
		saveToDisk();
	}
	return deleted;
}

export function importExtensionFromManifest(manifest: any): ExtensionPackage {
	if (!manifest || typeof manifest !== 'object') {
		throw new Error('Invalid manifest object');
	}

	const name = manifest.name?.trim();
	if (!name) {
		throw new Error('Manifest missing required field: name');
	}

	const id = manifest.id?.trim() || `ext_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
	const nodeType = manifest.nodeType?.trim() || id;
	const now = new Date().toISOString();

	const pkg: ExtensionPackage = {
		id,
		name,
		version: manifest.version || '1.0.0',
		description: manifest.description || 'Custom imported node extension',
		category: manifest.category || 'Integrations',
		author: manifest.author || 'Imported Extension',
		icon: manifest.icon || 'Blocks',
		accentColor: (manifest.accentColor as ExtensionAccentColor) || 'indigo',
		nodeType,
		enabled: manifest.enabled !== false,
		isBuiltIn: false,
		tags: Array.isArray(manifest.tags) ? manifest.tags : ['imported'],
		website: manifest.website || undefined,
		readme: manifest.readme || undefined,
		nodeDefinition: {
			title: manifest.nodeDefinition?.title || name,
			badgeText: manifest.nodeDefinition?.badgeText || manifest.category || 'Extension',
			width: manifest.nodeDefinition?.width || 'w-80',
			hasInputHandle: manifest.nodeDefinition?.hasInputHandle !== false,
			hasOutputHandle: manifest.nodeDefinition?.hasOutputHandle,
			outputs: Array.isArray(manifest.nodeDefinition?.outputs) ? manifest.nodeDefinition.outputs : [
				{ id: 'success', label: 'SUCCESS', color: 'emerald' },
				{ id: 'error', label: 'ERROR', color: 'rose' }
			],
			properties: Array.isArray(manifest.nodeDefinition?.properties) ? manifest.nodeDefinition.properties : [],
			defaultData: manifest.nodeDefinition?.defaultData || {},
			runtimeHandler: manifest.nodeDefinition?.runtimeHandler || undefined
		},
		createdAt: now,
		updatedAt: now
	};

	extensionsMap.set(id, pkg);
	saveToDisk();
	return pkg;
}

export function resetExtensionsToDefault(): ExtensionPackage[] {
	extensionsMap.clear();
	const defaults = seedDefaults();
	for (const ext of defaults) {
		extensionsMap.set(ext.id, ext);
	}
	saveToDisk();
	return defaults;
}

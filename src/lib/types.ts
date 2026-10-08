export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpTriggerData {
	title: string;
	method: HttpMethod;
	path: string;
	description?: string;
	sampleBody?: string;
	sampleQuery?: string;
	sampleHeaders?: string;
	isExecuting?: boolean;
}

export interface CodeBlockData {
	title: string;
	code: string;
	description?: string;
	error?: string | null;
	isExecuting?: boolean;
}

export interface ConditionalData {
	title: string;
	expression: string;
	description?: string;
	isExecuting?: boolean;
}

export interface FetchNodeData {
	title: string;
	method: HttpMethod;
	url: string;
	headers?: string;
	body?: string;
	isExecuting?: boolean;
}

export interface DataStoreData {
	title: string;
	operation: 'get' | 'set' | 'delete' | 'list';
	collection: string;
	keyExpr: string;
	valueExpr?: string;
	isExecuting?: boolean;
}

export interface HttpResponseData {
	title: string;
	statusCode: number;
	headersJson?: string;
	bodyExpression: string;
	isExecuting?: boolean;
}

export interface AuthNodeData {
	title: string;
	authType: 'apiKey' | 'bearer';
	headerName: string;
	expectedValue: string;
	description?: string;
	isExecuting?: boolean;
}

export interface ValidatorData {
	title: string;
	requiredFields: string;
	description?: string;
	isExecuting?: boolean;
}

export interface DelayData {
	title: string;
	delayMs: number;
	description?: string;
	isExecuting?: boolean;
}

export interface GoogleAuthData {
	title: string;
	clientId?: string;
	tokenSource: 'header' | 'payload';
	tokenField: string;
	description?: string;
	isExecuting?: boolean;
}

export type UserActionType = 'signup' | 'login' | 'getUser' | 'updateUser' | 'deleteUser' | 'listUsers';

export interface UserManagementData {
	title: string;
	action: UserActionType;
	emailExpr?: string;
	passwordExpr?: string;
	nameExpr?: string;
	userIdExpr?: string;
	role?: string;
	metadataExpr?: string;
	description?: string;
	isExecuting?: boolean;
}

export type AiProviderType = 'openai' | 'anthropic' | 'google' | 'groq' | 'custom';

export interface AiNodeData {
	title: string;
	provider: AiProviderType;
	model: string;
	systemPrompt: string;
	userPrompt: string;
	temperature: number;
	maxTokens: number;
	responseFormat: 'text' | 'json_object';
	apiKeyOverride?: string;
	baseUrl?: string;
	description?: string;
	isExecuting?: boolean;
}

export interface TelegramTriggerData {
	title: string;
	filterCommand?: string;
	description?: string;
	isExecuting?: boolean;
}

export interface TelegramSendMessageData {
	title: string;
	action: 'sendMessage' | 'sendPhoto' | 'answerCallbackQuery';
	botToken?: string;
	chatId: string;
	text: string;
	photoUrl?: string;
	parseMode: 'HTML' | 'MarkdownV2' | 'None';
	replyToMessage?: boolean;
	description?: string;
	isExecuting?: boolean;
}

// Backwards compatibility alias
export type OpenAiData = AiNodeData;

export type NodelyNodeType =
	| 'httpTrigger'
	| 'codeBlock'
	| 'conditional'
	| 'fetchNode'
	| 'dataStore'
	| 'httpResponse'
	| 'authNode'
	| 'validatorNode'
	| 'delayNode'
	| 'googleAuthNode'
	| 'userManagementNode'
	| 'aiNode'
	| 'openAiNode'
	| 'telegramTrigger'
	| 'telegramSendMessage';

export type NodeflowNodeType = NodelyNodeType;

export interface ExecutionLog {
	nodeId: string;
	nodeTitle: string;
	timestamp: number;
	level: 'info' | 'warn' | 'error';
	message: string;
	data?: any;
}

export interface ExecutionStepTrace {
	nodeId: string;
	nodeType: string;
	nodeTitle: string;
	durationMs: number;
	inputState: any;
	outputState: any;
	error?: string;
}

export interface ExecutionResult {
	success: boolean;
	statusCode: number;
	responseBody: any;
	responseHeaders: Record<string, string>;
	durationMs: number;
	executedNodeIds: string[];
	steps: ExecutionStepTrace[];
	logs: ExecutionLog[];
	error?: string;
}

export interface TestRequestPayload {
	method: HttpMethod;
	path: string;
	headers: Record<string, string>;
	query: Record<string, string>;
	body: any;
}

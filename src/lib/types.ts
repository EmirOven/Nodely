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

export type NodelyNodeType =
	| 'httpTrigger'
	| 'codeBlock'
	| 'conditional'
	| 'fetchNode'
	| 'dataStore'
	| 'httpResponse'
	| 'authNode'
	| 'validatorNode'
	| 'delayNode';

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

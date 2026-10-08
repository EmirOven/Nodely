<script lang="ts">
	import {
		Play,
		X,
		Copy,
		Check,
		Clock,
		AlertCircle,
		CheckCircle2,
		ListTree,
		Terminal
	} from '@lucide/svelte';
	import type { ExecutionResult, HttpMethod, TestRequestPayload } from '../types';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onExecute: (req: TestRequestPayload) => Promise<ExecutionResult>;
		defaultMethod?: HttpMethod;
		defaultPath?: string;
		defaultBody?: string;
	}

	let {
		isOpen,
		onClose,
		onExecute,
		defaultMethod = 'POST',
		defaultPath = '/api/v1/users',
		defaultBody = '{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "role": "admin"\n}'
	}: Props = $props();

	let method = $state<HttpMethod>('POST');
	let path = $state('/api/v1/users');
	let bodyJson = $state('{}');
	let queryJson = $state('{}');

	let isRunning = $state(false);
	let activeTab = $state<'response' | 'trace' | 'logs'>('response');
	let result = $state<ExecutionResult | null>(null);
	let copied = $state(false);

	// Sync when defaults change
	$effect(() => {
		method = defaultMethod;
		path = defaultPath;
		if (defaultBody) bodyJson = defaultBody;
	});

	async function runTest() {
		isRunning = true;
		try {
			let parsedBody: any = {};
			try {
				parsedBody = JSON.parse(bodyJson);
			} catch {
				parsedBody = bodyJson;
			}

			let parsedQuery: Record<string, string> = {};
			try {
				parsedQuery = JSON.parse(queryJson);
			} catch {
				parsedQuery = {};
			}

			const payload: TestRequestPayload = {
				method,
				path,
				headers: { 'Content-Type': 'application/json' },
				query: parsedQuery,
				body: parsedBody
			};

			result = await onExecute(payload);
		} finally {
			isRunning = false;
		}
	}

	function copyResponse() {
		if (!result) return;
		navigator.clipboard.writeText(JSON.stringify(result.responseBody, null, 2));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function formatBody() {
		try {
			bodyJson = JSON.stringify(JSON.parse(bodyJson), null, 2);
		} catch {
			// keep as is
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-y-0 right-0 z-50 flex w-[540px] flex-col border-l border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300"
	>
		<!-- Panel Header -->
		<div class="flex items-center justify-between border-b border-slate-800 px-4 py-3">
			<div class="flex items-center gap-2">
				<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
					<Play class="h-4 w-4 fill-current" />
				</div>
				<div>
					<h3 class="text-sm font-semibold text-slate-100">API Test Runner</h3>
					<p class="text-[11px] text-slate-400">Simulate incoming requests to your node graph</p>
				</div>
			</div>

			<button
				type="button"
				onclick={onClose}
				class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
			>
				<X class="h-4 w-4" />
			</button>
		</div>

		<!-- Request Configuration -->
		<div class="border-b border-slate-800 p-4 space-y-3">
			<!-- Method + URL bar -->
			<div class="flex items-center gap-2">
				<select
					bind:value={method}
					aria-label="Request HTTP method"
					class="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 outline-none"
				>
					<option value="GET">GET</option>
					<option value="POST">POST</option>
					<option value="PUT">PUT</option>
					<option value="DELETE">DELETE</option>
					<option value="PATCH">PATCH</option>
				</select>

				<input
					type="text"
					bind:value={path}
					aria-label="Request route path"
					placeholder="/api/v1/resource"
					class="flex-1 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
				/>

				<button
					type="button"
					onclick={runTest}
					disabled={isRunning}
					class="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95"
				>
					{#if isRunning}
						<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
						<span>Running...</span>
					{:else}
						<Play class="h-3.5 w-3.5 fill-current" />
						<span>Send</span>
					{/if}
				</button>
			</div>

			<!-- JSON Body Editor -->
			{#if method !== 'GET'}
				<div class="space-y-1">
					<div class="flex items-center justify-between text-[11px] text-slate-400">
						<span>JSON Request Body</span>
						<button
							type="button"
							onclick={formatBody}
							class="text-blue-400 hover:underline hover:text-blue-300"
						>
							Format JSON
						</button>
					</div>
					<textarea
						bind:value={bodyJson}
						aria-label="Request JSON payload"
						rows="4"
						class="w-full rounded-lg border border-slate-800 bg-slate-900/90 p-2 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
						placeholder="json payload..."
					></textarea>
				</div>
			{/if}
		</div>

		<!-- Tabs Bar -->
		<div class="flex items-center border-b border-slate-800 bg-slate-900/40 px-4 text-xs font-medium">
			<button
				type="button"
				onclick={() => (activeTab = 'response')}
				class="border-b-2 py-2.5 px-3 transition {activeTab === 'response'
					? 'border-blue-500 text-blue-400 font-semibold'
					: 'border-transparent text-slate-400 hover:text-slate-200'}"
			>
				Response
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'trace')}
				class="flex items-center gap-1.5 border-b-2 py-2.5 px-3 transition {activeTab === 'trace'
					? 'border-blue-500 text-blue-400 font-semibold'
					: 'border-transparent text-slate-400 hover:text-slate-200'}"
			>
				<ListTree class="h-3.5 w-3.5" />
				Execution Trace
				{#if result?.steps}
					<span class="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
						{result.steps.length}
					</span>
				{/if}
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'logs')}
				class="flex items-center gap-1.5 border-b-2 py-2.5 px-3 transition {activeTab === 'logs'
					? 'border-blue-500 text-blue-400 font-semibold'
					: 'border-transparent text-slate-400 hover:text-slate-200'}"
			>
				<Terminal class="h-3.5 w-3.5" />
				Logs
				{#if result?.logs}
					<span class="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
						{result.logs.length}
					</span>
				{/if}
			</button>
		</div>

		<!-- Tab Content Area -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if !result}
				<div class="flex h-full flex-col items-center justify-center text-center text-slate-500">
					<Play class="h-8 w-8 text-slate-700 mb-2 stroke-[1.5]" />
					<p class="text-xs font-medium text-slate-400">No execution yet</p>
					<p class="mt-1 text-[11px] text-slate-600 max-w-xs">
						Click "Send" above to run the API workflow and inspect node trace & results.
					</p>
				</div>
			{:else}
				<!-- Status Banner -->
				<div class="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
					<div class="flex items-center gap-2">
						{#if result.success}
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
								<CheckCircle2 class="h-4 w-4" />
							</div>
							<span class="font-mono text-xs font-bold text-emerald-400">
								{result.statusCode} OK
							</span>
						{:else}
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
								<AlertCircle class="h-4 w-4" />
							</div>
							<span class="font-mono text-xs font-bold text-rose-400">
								{result.statusCode} Error
							</span>
						{/if}
					</div>

					<div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
						<span class="flex items-center gap-1">
							<Clock class="h-3 w-3 text-slate-500" />
							{result.durationMs}ms
						</span>
						<span class="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
							{result.executedNodeIds.length} nodes
						</span>
					</div>
				</div>

				<!-- Tab: Response -->
				{#if activeTab === 'response'}
					<div class="space-y-2">
						<div class="flex items-center justify-between text-xs text-slate-400">
							<span>Response Body</span>
							<button
								type="button"
								onclick={copyResponse}
								class="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
							>
								{#if copied}
									<Check class="h-3 w-3 text-emerald-400" />
									<span class="text-emerald-400">Copied!</span>
								{:else}
									<Copy class="h-3 w-3" />
									<span>Copy</span>
								{/if}
							</button>
						</div>

						<pre class="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-96">{JSON.stringify(result.responseBody, null, 2)}</pre>
					</div>
				{/if}

				<!-- Tab: Execution Trace -->
				{#if activeTab === 'trace'}
					<div class="space-y-3">
						{#each result.steps as step, i}
							<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
											{i + 1}
										</span>
										<span class="text-xs font-semibold text-slate-200">{step.nodeTitle}</span>
										<span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
											{step.nodeType}
										</span>
									</div>

									<span class="font-mono text-[11px] text-slate-400">{step.durationMs}ms</span>
								</div>

								{#if step.error}
									<div class="rounded bg-rose-500/10 p-2 text-xs text-rose-400 border border-rose-500/20">
										{step.error}
									</div>
								{/if}

								{#if step.outputState}
									<div class="text-[11px] space-y-1">
										<span class="text-slate-500 font-mono">Output:</span>
										<pre class="rounded bg-slate-950 p-2 font-mono text-[10px] text-slate-300 overflow-x-auto">{JSON.stringify(step.outputState, null, 2)}</pre>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Tab: Logs -->
				{#if activeTab === 'logs'}
					<div class="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs space-y-1.5 max-h-96 overflow-y-auto">
						{#each result.logs as log}
							<div class="flex items-start gap-2 leading-relaxed">
								<span class="text-slate-500 text-[10px]">
									{new Date(log.timestamp).toLocaleTimeString()}
								</span>
								<span class="text-blue-400 text-[11px]">[{log.nodeTitle}]</span>
								<span class="text-slate-300">{log.message}</span>
							</div>
						{/each}

						{#if result.logs.length === 0}
							<div class="text-slate-600 text-center py-4">No console logs recorded</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

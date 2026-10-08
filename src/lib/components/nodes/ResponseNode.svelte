<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { CheckCheck } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { HttpResponseData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const respData = $derived(data as unknown as HttpResponseData);

	const statusOptions = [
		{ code: 200, label: '200 OK', color: 'text-emerald-400 bg-emerald-500/20' },
		{ code: 201, label: '201 Created', color: 'text-emerald-400 bg-emerald-500/20' },
		{ code: 400, label: '400 Bad Request', color: 'text-rose-400 bg-rose-500/20' },
		{ code: 401, label: '401 Unauthorized', color: 'text-amber-400 bg-amber-500/20' },
		{ code: 403, label: '403 Forbidden', color: 'text-amber-400 bg-amber-500/20' },
		{ code: 404, label: '404 Not Found', color: 'text-rose-400 bg-rose-500/20' },
		{ code: 500, label: '500 Server Error', color: 'text-rose-400 bg-rose-500/20' }
	];

	const currentStatusOption = $derived(
		statusOptions.find((o) => o.code === (respData.statusCode || 200)) || statusOptions[0]
	);
</script>

<BaseNode
	{id}
	nodeType="httpResponse"
	{selected}
	title={respData.title || 'HTTP Response'}
	icon={CheckCheck}
	badge={String(respData.statusCode || 200)}
	accentColor="purple"
	isExecuting={respData.isExecuting}
	hasOutputHandle={false}
>
	<div class="space-y-2.5">
		<div class="space-y-1">
			<label for="resp-status-{id}" class="text-[11px] font-medium text-slate-400">HTTP Status Code</label>
			<select
				id="resp-status-{id}"
				class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-bold {currentStatusOption.color} outline-none cursor-pointer"
				value={respData.statusCode || 200}
				onchange={(e) => updateNodeData(id, { statusCode: Number((e.target as HTMLSelectElement).value) })}
			>
				{#each statusOptions as opt}
					<option value={opt.code} class="bg-slate-900 text-slate-200">{opt.label}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-1">
			<label for="resp-body-{id}" class="text-[11px] font-medium text-slate-400">Response Body Expression (JSON / Object)</label>
			<textarea
				id="resp-body-{id}"
				class="w-full h-20 rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-purple-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none resize-none nodrag"
				placeholder="payload"
				value={respData.bodyExpression || 'payload'}
				oninput={(e) => updateNodeData(id, { bodyExpression: (e.target as HTMLTextAreaElement).value })}
			></textarea>
		</div>

		<div class="text-[10px] text-slate-400">
			Terminal node: Sends final HTTP response and ends the flow execution.
		</div>
	</div>
</BaseNode>

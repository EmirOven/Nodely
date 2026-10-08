<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { CheckCheck, Trash2, GripVertical } from '@lucide/svelte';
	import type { HttpResponseData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

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

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-purple-500 ring-2 ring-purple-500/30 shadow-purple-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-purple-500 hover:!bg-purple-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400">
				<CheckCheck class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Response title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-purple-500 max-w-[140px]"
				value={respData.title || 'HTTP Response'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
				Output
			</span>
			<button
				type="button"
				class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-rose-400 transition"
				onclick={() => deleteElements({ nodes: [{ id }] })}
				title="Delete Node"
			>
				<Trash2 class="h-3.5 w-3.5" />
			</button>
		</div>
	</div>

	<!-- Content -->
	<div class="p-3 space-y-2.5">
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
</div>

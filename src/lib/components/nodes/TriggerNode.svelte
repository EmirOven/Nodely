<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Globe, Trash2, GripVertical } from '@lucide/svelte';
	import type { HttpTriggerData, HttpMethod } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const triggerData = $derived(data as unknown as HttpTriggerData);

	const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

	const methodColors: Record<HttpMethod, string> = {
		GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
		POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
		PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
		DELETE: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
		PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
	};
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
				<Globe class="h-3.5 w-3.5" />
			</div>
			<span class="text-xs font-semibold tracking-wide text-slate-200 uppercase">
				{triggerData.title || 'HTTP Trigger'}
			</span>
		</div>

		<div class="flex items-center gap-1">
			<span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
				Entrypoint
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
	<div class="p-3 space-y-3">
		<!-- Method and Path Input -->
		<div class="space-y-1.5">
			<label for="route-input-{id}" class="text-[11px] font-medium text-slate-400">Endpoint Route</label>
			<div class="flex items-center gap-1.5">
				<select
					id="method-select-{id}"
					class="rounded-lg border px-2 py-1.5 text-xs font-bold outline-none cursor-pointer {methodColors[
						triggerData.method || 'GET'
					]}"
					value={triggerData.method || 'GET'}
					onchange={(e) => updateNodeData(id, { method: (e.target as HTMLSelectElement).value as HttpMethod })}
				>
					{#each methods as m}
						<option value={m} class="bg-slate-900 text-slate-200">{m}</option>
					{/each}
				</select>

				<input
					id="route-input-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
					placeholder="/api/v1/resource"
					value={triggerData.path || '/api/v1/resource'}
					oninput={(e) => updateNodeData(id, { path: (e.target as HTMLInputElement).value })}
				/>
			</div>
		</div>

		<div class="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-[11px] text-slate-400 space-y-1">
			<div class="flex items-center justify-between font-mono text-[10px] text-slate-500">
				<span>PROVIDES CONTEXT:</span>
				<span class="text-blue-400">req.body, query, headers</span>
			</div>
			<p class="text-slate-400 leading-relaxed text-[11px]">
				Receives the inbound request and passes parsed JSON body & query params to subsequent blocks.
			</p>
		</div>
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative py-1">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-blue-500 hover:!bg-blue-400 transition"
		/>
	</div>
</div>

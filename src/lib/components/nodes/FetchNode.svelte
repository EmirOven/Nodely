<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Send, Trash2, GripVertical } from '@lucide/svelte';
	import type { FetchNodeData, HttpMethod } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const fetchData = $derived(data as unknown as FetchNodeData);
	const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-cyan-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-cyan-500 hover:!bg-cyan-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
				<Send class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="API fetch title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-cyan-500 max-w-[140px]"
				value={fetchData.title || 'External API'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">
				HTTP Fetch
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
			<label for="fetch-url-{id}" class="text-[11px] font-medium text-slate-400">External Endpoint</label>
			<div class="flex items-center gap-1.5">
				<select
					aria-label="HTTP method"
					class="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-bold text-cyan-400 outline-none cursor-pointer"
					value={fetchData.method || 'GET'}
					onchange={(e) => updateNodeData(id, { method: (e.target as HTMLSelectElement).value as HttpMethod })}
				>
					{#each methods as m}
						<option value={m} class="bg-slate-900 text-slate-200">{m}</option>
					{/each}
				</select>

				<input
					id="fetch-url-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-cyan-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
					placeholder="https://api.example.com/data"
					value={fetchData.url || ''}
					oninput={(e) => updateNodeData(id, { url: (e.target as HTMLInputElement).value })}
				/>
			</div>
		</div>

		<div class="text-[10px] text-slate-400">
			Response data is saved to <code class="text-cyan-400">state['{id}']</code> and passed downstream.
		</div>
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative py-0.5">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-cyan-500 hover:!bg-cyan-400 transition"
		/>
	</div>
</div>

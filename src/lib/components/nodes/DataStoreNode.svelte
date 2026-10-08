<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Database, Trash2, GripVertical } from '@lucide/svelte';
	import type { DataStoreData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const storeData = $derived(data as unknown as DataStoreData);
	const operations: Array<DataStoreData['operation']> = ['get', 'set', 'delete', 'list'];
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
				<Database class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Data store title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-emerald-500 max-w-[140px]"
				value={storeData.title || 'Data Store'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 uppercase">
				{storeData.operation || 'set'}
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
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-1">
				<label for="ds-op-{id}" class="text-[11px] font-medium text-slate-400">Operation</label>
				<select
					id="ds-op-{id}"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-bold text-emerald-400 outline-none cursor-pointer"
					value={storeData.operation || 'set'}
					onchange={(e) => updateNodeData(id, { operation: (e.target as HTMLSelectElement).value as any })}
				>
					{#each operations as op}
						<option value={op} class="bg-slate-900 text-slate-200">{op.toUpperCase()}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-1">
				<label for="ds-coll-{id}" class="text-[11px] font-medium text-slate-400">Collection</label>
				<input
					id="ds-coll-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
					placeholder="users"
					value={storeData.collection || 'users'}
					oninput={(e) => updateNodeData(id, { collection: (e.target as HTMLInputElement).value })}
				/>
			</div>
		</div>

		{#if storeData.operation !== 'list'}
			<div class="space-y-1">
				<label for="ds-key-{id}" class="text-[11px] font-medium text-slate-400">Key Expression</label>
				<input
					id="ds-key-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-emerald-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
					placeholder="payload.id || 'record_1'"
					value={storeData.keyExpr || ''}
					oninput={(e) => updateNodeData(id, { keyExpr: (e.target as HTMLInputElement).value })}
				/>
			</div>
		{/if}

		{#if storeData.operation === 'set'}
			<div class="space-y-1">
				<label for="ds-val-{id}" class="text-[11px] font-medium text-slate-400">Value Expression</label>
				<input
					id="ds-val-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-emerald-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
					placeholder="payload"
					value={storeData.valueExpr || 'payload'}
					oninput={(e) => updateNodeData(id, { valueExpr: (e.target as HTMLInputElement).value })}
				/>
			</div>
		{/if}
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative py-0.5">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
		/>
	</div>
</div>

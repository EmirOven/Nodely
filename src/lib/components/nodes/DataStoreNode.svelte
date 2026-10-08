<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Database } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { DataStoreData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const storeData = $derived(data as unknown as DataStoreData);
	const operations: Array<DataStoreData['operation']> = ['get', 'set', 'delete', 'list'];
</script>

<BaseNode
	{id}
	nodeType="dataStore"
	{selected}
	title={storeData.title || 'Data Store'}
	icon={Database}
	badge={storeData.operation || 'set'}
	badgeClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase"
	accentColor="emerald"
	isExecuting={storeData.isExecuting}
>
	<div class="space-y-2.5">
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
</BaseNode>

<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { GitFork, Check, X } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { ConditionalData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const condData = $derived(data as unknown as ConditionalData);
</script>

<BaseNode
	{id}
	nodeType="conditional"
	{selected}
	title={condData.title || 'Condition'}
	icon={GitFork}
	badge="Branching"
	accentColor="amber"
	isExecuting={condData.isExecuting}
	outputs={[
		{ id: 'true', label: 'TRUE', color: 'emerald' },
		{ id: 'false', label: 'FALSE', color: 'rose' }
	]}
>
	<div class="space-y-2.5">
		<div class="space-y-1">
			<label for="condition-expr-{id}" class="text-[11px] font-medium text-slate-400">
				If Expression (evaluates to boolean)
			</label>
			<input
				id="condition-expr-{id}"
				type="text"
				class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-amber-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
				placeholder="payload.role === 'admin'"
				value={condData.expression || ''}
				oninput={(e) => updateNodeData(id, { expression: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<!-- Branch Labels -->
		<div class="flex items-center justify-between pt-1 text-[11px] font-bold">
			<div class="flex items-center gap-1 text-emerald-400">
				<Check class="h-3 w-3" /> TRUE branch
			</div>
			<div class="flex items-center gap-1 text-rose-400">
				<X class="h-3 w-3" /> FALSE branch
			</div>
		</div>
	</div>
</BaseNode>

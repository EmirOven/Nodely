<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { GitFork, Trash2, GripVertical, Check, X } from '@lucide/svelte';
	import type { ConditionalData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const condData = $derived(data as unknown as ConditionalData);
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-amber-500 hover:!bg-amber-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
				<GitFork class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Condition title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-amber-500 max-w-[140px]"
				value={condData.title || 'Condition'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
				Branching
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

	<!-- Dual Handles Container at bottom -->
	<div class="relative flex justify-between px-6 pb-2">
		<div class="flex flex-col items-center">
			<Handle
				type="source"
				position={Position.Bottom}
				id="true"
				class="!static !transform-none !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
			/>
			<span class="text-[9px] font-bold text-emerald-500 mt-1">TRUE</span>
		</div>

		<div class="flex flex-col items-center">
			<Handle
				type="source"
				position={Position.Bottom}
				id="false"
				class="!static !transform-none !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
			/>
			<span class="text-[9px] font-bold text-rose-500 mt-1">FALSE</span>
		</div>
	</div>
</div>

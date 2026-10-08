<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Clock, Trash2, GripVertical, Timer } from '@lucide/svelte';
	import type { DelayData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const delayData = $derived(data as unknown as DelayData);
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-amber-400 ring-2 ring-amber-400/30 shadow-amber-400/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-amber-400 hover:!bg-amber-300 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/20 text-amber-400">
				<Clock class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Delay title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-amber-400 max-w-[140px]"
				value={delayData.title || 'Delay / Sleep'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
				Utility
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
			<div class="flex items-center justify-between">
				<label for="delay-ms-{id}" class="text-[11px] font-medium text-slate-400">
					Wait Duration (milliseconds)
				</label>
				<span class="text-[9px] text-amber-400 font-mono">
					{((delayData.delayMs || 500) / 1000).toFixed(1)}s
				</span>
			</div>
			<div class="relative">
				<Timer class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
				<input
					id="delay-ms-{id}"
					type="number"
					min="0"
					max="30000"
					step="100"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-2.5 py-1.5 font-mono text-xs text-amber-200 placeholder-slate-600 focus:border-amber-400 focus:outline-none"
					value={delayData.delayMs ?? 500}
					oninput={(e) => {
						const val = parseInt((e.target as HTMLInputElement).value, 10);
						updateNodeData(id, { delayMs: isNaN(val) ? 0 : val });
					}}
				/>
			</div>
		</div>

		<p class="text-[10px] text-slate-400 leading-relaxed">
			Pauses pipeline execution asynchronously. Useful for mock pacing, rate limit buffers, or webhook throttling.
		</p>
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative pb-2">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-amber-400 hover:!bg-amber-300 transition"
		/>
	</div>
</div>

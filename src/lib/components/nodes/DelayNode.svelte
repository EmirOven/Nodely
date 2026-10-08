<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Clock, Timer } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { DelayData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const delayData = $derived(data as unknown as DelayData);
</script>

<BaseNode
	{id}
	nodeType="delayNode"
	{selected}
	title={delayData.title || 'Delay / Sleep'}
	icon={Clock}
	badge="Utility"
	accentColor="yellow"
	isExecuting={delayData.isExecuting}
>
	<div class="space-y-2.5">
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<label for="delay-ms-{id}" class="text-[11px] font-medium text-slate-400">
					Wait Duration (milliseconds)
				</label>
				<span class="text-[9px] text-yellow-400 font-mono">
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
					class="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-2.5 py-1.5 font-mono text-xs text-yellow-200 placeholder-slate-600 focus:border-yellow-400 focus:outline-none"
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
</BaseNode>

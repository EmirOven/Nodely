<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Send } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { FetchNodeData, HttpMethod } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const fetchData = $derived(data as unknown as FetchNodeData);
	const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
</script>

<BaseNode
	{id}
	nodeType="fetchNode"
	{selected}
	title={fetchData.title || 'External API'}
	icon={Send}
	badge={fetchData.method || 'GET'}
	badgeClass="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold"
	accentColor="cyan"
	isExecuting={fetchData.isExecuting}
>
	<div class="space-y-2.5">
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
</BaseNode>

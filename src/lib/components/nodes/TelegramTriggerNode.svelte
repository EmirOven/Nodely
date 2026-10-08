<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Filter } from '@lucide/svelte';
	import TelegramIcon from '../icons/TelegramIcon.svelte';
	import BaseNode from './BaseNode.svelte';
	import type { TelegramTriggerData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const triggerData = $derived(data as unknown as TelegramTriggerData);
	const filterCmd = $derived(triggerData.filterCommand || '');

	const quickCommands = ['', '/start', '/help', '/ask', '/status'];
</script>

<BaseNode
	{id}
	nodeType="telegramTrigger"
	{selected}
	title={triggerData.title || 'Telegram Bot Trigger'}
	icon={TelegramIcon}
	badge="Bot Webhook"
	badgeClass="bg-sky-500/10 text-sky-400 border border-sky-500/20"
	accentColor="cyan"
	width="w-84"
	hasInputHandle={false}
	isExecuting={triggerData.isExecuting}
>
	<div class="space-y-3">
		<!-- Filter by command -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between text-[11px] font-medium text-slate-400">
				<span class="flex items-center gap-1">
					<Filter class="h-3 w-3 text-sky-400" /> Command Filter
				</span>
				<span class="text-[10px] text-slate-500">Optional</span>
			</div>

			<div class="flex items-center gap-1.5">
				<input
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
					placeholder="Leave empty for all updates, or e.g. /start"
					value={filterCmd}
					oninput={(e) => updateNodeData(id, { filterCommand: (e.target as HTMLInputElement).value })}
				/>
			</div>

			<!-- Quick Filter Pills -->
			<div class="flex flex-wrap items-center gap-1 pt-0.5">
				{#each quickCommands as cmd}
					<button
						type="button"
						class="rounded px-2 py-0.5 text-[10px] font-mono transition border {filterCmd === cmd
							? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
							: 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'}"
						onclick={() => updateNodeData(id, { filterCommand: cmd })}
					>
						{cmd || 'Any Message'}
					</button>
				{/each}
			</div>
		</div>

		<!-- Provided Context Box -->
		<div class="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-[11px] text-slate-400 space-y-1.5">
			<div class="flex items-center justify-between font-mono text-[10px]">
				<span class="text-slate-500">PARSED TELEGRAM CONTEXT:</span>
				<span class="text-sky-400 font-semibold">state.telegram</span>
			</div>
			<div class="grid grid-cols-2 gap-1 font-mono text-[10px] text-slate-300">
				<div class="rounded bg-slate-900/80 px-1.5 py-0.5 border border-slate-800/80 truncate">
					<span class="text-slate-500">chatId:</span> 123456
				</div>
				<div class="rounded bg-slate-900/80 px-1.5 py-0.5 border border-slate-800/80 truncate">
					<span class="text-slate-500">text:</span> "Hello"
				</div>
				<div class="rounded bg-slate-900/80 px-1.5 py-0.5 border border-slate-800/80 truncate">
					<span class="text-slate-500">command:</span> "{filterCmd || '/start'}"
				</div>
				<div class="rounded bg-slate-900/80 px-1.5 py-0.5 border border-slate-800/80 truncate">
					<span class="text-slate-500">sender:</span> user object
				</div>
			</div>
		</div>
	</div>
</BaseNode>

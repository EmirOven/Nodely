<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Trash2, GripVertical, Terminal, Filter } from '@lucide/svelte';
	import TelegramIcon from '../icons/TelegramIcon.svelte';
	import type { TelegramTriggerData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const triggerData = $derived(data as unknown as TelegramTriggerData);
	const filterCmd = $derived(triggerData.filterCommand || '');

	const quickCommands = ['', '/start', '/help', '/ask', '/status'];
</script>

<div
	class="w-84 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-sky-500 ring-2 ring-sky-500/30 shadow-sky-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/20 text-sky-400">
				<TelegramIcon class="h-4 w-4" />
			</div>
			<span class="text-xs font-semibold tracking-wide text-slate-200 uppercase">
				{triggerData.title || 'Telegram Bot Trigger'}
			</span>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/20">
				Bot Webhook
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
					<span class="text-slate-500">command:</span> "/start"
				</div>
				<div class="rounded bg-slate-900/80 px-1.5 py-0.5 border border-slate-800/80 truncate">
					<span class="text-slate-500">sender:</span> user
				</div>
			</div>
			<p class="text-slate-400 leading-snug text-[10.5px]">
				Captures incoming Telegram webhook requests and extracts message, chat ID, and user details.
			</p>
		</div>
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative py-1">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-sky-500 hover:!bg-sky-400 transition"
		/>
	</div>
</div>

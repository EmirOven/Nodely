<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import {
		Send,
		Trash2,
		GripVertical,
		KeyRound,
		MessageSquare,
		Image as ImageIcon,
		CheckCircle2,
		AlertTriangle,
		Code
	} from '@lucide/svelte';
	import TelegramIcon from '../icons/TelegramIcon.svelte';
	import type { TelegramSendMessageData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const telegramData = $derived(data as unknown as TelegramSendMessageData);

	const action = $derived(telegramData.action || 'sendMessage');
	const parseMode = $derived(telegramData.parseMode || 'HTML');

	const parseModes: Array<'HTML' | 'MarkdownV2' | 'None'> = ['HTML', 'MarkdownV2', 'None'];
</script>

<div
	class="w-88 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-sky-500 ring-2 ring-sky-500/30 shadow-sky-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-1">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-sky-500 hover:!bg-sky-400 transition"
		/>
	</div>

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
				{telegramData.title || 'Telegram Send Message'}
			</span>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/20">
				Bot API
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
		<!-- Action Selector -->
		<div class="space-y-1">
			<label class="text-[11px] font-medium text-slate-400" for="tg-action-{id}">Telegram Action</label>
			<select
				id="tg-action-{id}"
				class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
				value={action}
				onchange={(e) => updateNodeData(id, { action: (e.target as HTMLSelectElement).value })}
			>
				<option value="sendMessage">sendMessage (Send Text Message)</option>
				<option value="sendPhoto">sendPhoto (Send Image with Caption)</option>
				<option value="answerCallbackQuery">answerCallbackQuery (Respond to Button Click)</option>
			</select>
		</div>

		<!-- Chat ID Expression -->
		<div class="space-y-1">
			<div class="flex items-center justify-between text-[11px] font-medium text-slate-400">
				<label for="tg-chat-{id}">Target Chat ID</label>
				<span class="text-[10px] font-mono text-sky-400">Expr / Static</span>
			</div>
			<input
				id="tg-chat-{id}"
				type="text"
				class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
				placeholder="{'{{telegram.chatId}}'}"
				value={telegramData.chatId ?? '{{telegram.chatId}}'}
				oninput={(e) => updateNodeData(id, { chatId: (e.target as HTMLInputElement).value })}
			/>
		</div>

		{#if action === 'sendPhoto'}
			<!-- Photo URL -->
			<div class="space-y-1">
				<label class="text-[11px] font-medium text-slate-400" for="tg-photo-{id}">Photo URL</label>
				<input
					id="tg-photo-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
					placeholder="https://example.com/image.png or expr"
					value={telegramData.photoUrl || ''}
					oninput={(e) => updateNodeData(id, { photoUrl: (e.target as HTMLInputElement).value })}
				/>
			</div>
		{/if}

		<!-- Message Text / Caption -->
		<div class="space-y-1">
			<div class="flex items-center justify-between text-[11px] font-medium text-slate-400">
				<label for="tg-text-{id}">
					{action === 'sendPhoto' ? 'Caption' : action === 'answerCallbackQuery' ? 'Alert Text' : 'Message Text'}
				</label>
				<span class="text-[10px] text-slate-500">Supports {'{{vars}}'}</span>
			</div>
			<textarea
				id="tg-text-{id}"
				rows="3"
				class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-sky-500 focus:outline-none resize-none leading-relaxed"
				placeholder="Hello {`{{telegram.sender?.firstName || 'there'}}`}! {`{{aiResponse?.text || payload.result}}`}"
				value={telegramData.text ?? "Hello {{telegram.sender?.firstName || 'there'}}! Your message has been processed."}
				oninput={(e) => updateNodeData(id, { text: (e.target as HTMLTextAreaElement).value })}
			></textarea>
		</div>

		<!-- Parse Mode Pills -->
		<div class="space-y-1">
			<span class="text-[11px] font-medium text-slate-400 block">Formatting Parse Mode</span>
			<div class="flex items-center gap-1.5">
				{#each parseModes as pm}
					<button
						type="button"
						class="flex-1 rounded-lg py-1 text-center font-mono text-[11px] font-semibold transition border {parseMode === pm
							? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
							: 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'}"
						onclick={() => updateNodeData(id, { parseMode: pm })}
					>
						{pm}
					</button>
				{/each}
			</div>
		</div>

		<!-- Token Override (Optional) -->
		<div class="space-y-1 pt-1 border-t border-slate-800/80">
			<div class="flex items-center justify-between text-[10px] text-slate-400">
				<span class="flex items-center gap-1 font-medium">
					<KeyRound class="h-3 w-3 text-slate-500" /> Bot Token Override
				</span>
				<span class="text-slate-500">Defaults to Settings</span>
			</div>
			<input
				type="password"
				class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[11px] text-slate-300 placeholder-slate-600 focus:border-sky-500 focus:outline-none"
				placeholder="123456789:ABCdefGHIjklMNO..."
				value={telegramData.botToken || ''}
				oninput={(e) => updateNodeData(id, { botToken: (e.target as HTMLInputElement).value })}
			/>
		</div>
	</div>

	<!-- Output Handles -->
	<div class="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/40 px-3 py-2 text-[10px] font-mono">
		<div class="relative flex items-center gap-1.5 text-emerald-400">
			<Handle
				type="source"
				position={Position.Bottom}
				id="success"
				class="!left-4 !h-3 !w-3 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
			/>
			<span class="pl-3">SUCCESS</span>
		</div>

		<div class="relative flex items-center gap-1.5 text-rose-400">
			<span>ERROR</span>
			<Handle
				type="source"
				position={Position.Bottom}
				id="error"
				class="!left-auto !right-4 !h-3 !w-3 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
			/>
		</div>
	</div>
</div>

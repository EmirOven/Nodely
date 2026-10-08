<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { KeyRound } from '@lucide/svelte';
	import TelegramIcon from '../icons/TelegramIcon.svelte';
	import BaseNode from './BaseNode.svelte';
	import type { TelegramSendMessageData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const telegramData = $derived(data as unknown as TelegramSendMessageData);

	const action = $derived(telegramData.action || 'sendMessage');
	const parseMode = $derived(telegramData.parseMode || 'HTML');

	const parseModes: Array<'HTML' | 'MarkdownV2' | 'None'> = ['HTML', 'MarkdownV2', 'None'];
</script>

<BaseNode
	{id}
	{selected}
	title={telegramData.title || 'Telegram Send Message'}
	icon={TelegramIcon}
	badge="Bot API"
	badgeClass="bg-sky-500/10 text-sky-400 border border-sky-500/20"
	accentColor="cyan"
	width="w-88"
	isExecuting={telegramData.isExecuting}
	outputs={[
		{ id: 'success', label: 'SUCCESS', color: 'emerald' },
		{ id: 'error', label: 'ERROR', color: 'rose' }
	]}
>
	<div class="space-y-3">
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
</BaseNode>

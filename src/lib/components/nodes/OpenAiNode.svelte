<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Sparkles, Trash2, GripVertical, Check, X, KeyRound, Bot, Sliders } from '@lucide/svelte';
	import type { OpenAiData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const openAiData = $derived(data as unknown as OpenAiData);
	let showAdvanced = $state(false);

	const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'o1-mini'];
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
				<Sparkles class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="OpenAI Node title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-emerald-500 max-w-[130px]"
				value={openAiData.title || 'OpenAI LLM'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
				AI / LLM
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
		<!-- Model Selector -->
		<div class="space-y-1">
			<label for="model-select-{id}" class="text-[11px] font-medium text-slate-400">Model</label>
			<select
				id="model-select-{id}"
				class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
				value={openAiData.model || 'gpt-4o-mini'}
				onchange={(e) => updateNodeData(id, { model: (e.target as HTMLSelectElement).value })}
			>
				{#each models as m}
					<option value={m}>{m}</option>
				{/each}
			</select>
		</div>

		<!-- System Prompt -->
		<div class="space-y-1">
			<label for="system-prompt-{id}" class="text-[11px] font-medium text-slate-400">System Prompt</label>
			<textarea
				id="system-prompt-{id}"
				rows="2"
				class="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-[11px] text-slate-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
				placeholder="You are an expert AI assistant that responds concisely."
				value={openAiData.systemPrompt ?? 'You are an AI assistant helping with API processing.'}
				oninput={(e) => updateNodeData(id, { systemPrompt: (e.target as HTMLTextAreaElement).value })}
			></textarea>
		</div>

		<!-- User Prompt Template -->
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<label for="user-prompt-{id}" class="text-[11px] font-medium text-slate-400">User Prompt</label>
				<span class="text-[9px] text-slate-500 font-mono">supports &#123;&#123;payload.field&#125;&#125;</span>
			</div>
			<textarea
				id="user-prompt-{id}"
				rows="3"
				class="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-[11px] text-slate-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
				placeholder="Analyze this text: &#123;&#123;payload.text&#125;&#125;"
				value={openAiData.userPrompt ?? 'Process this request: {{payload.prompt || payload.text}}'}
				oninput={(e) => updateNodeData(id, { userPrompt: (e.target as HTMLTextAreaElement).value })}
			></textarea>
		</div>

		<!-- Advanced Settings Toggle -->
		<div>
			<button
				type="button"
				onclick={() => (showAdvanced = !showAdvanced)}
				class="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition"
			>
				<Sliders class="h-3 w-3" />
				<span>{showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}</span>
			</button>

			{#if showAdvanced}
				<div class="mt-2.5 space-y-2.5 rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 animate-in fade-in duration-100">
					<!-- Temperature & Max Tokens -->
					<div class="grid grid-cols-2 gap-2">
						<div class="space-y-1">
							<div class="flex justify-between text-[10px] text-slate-400">
								<span>Temp</span>
								<span>{openAiData.temperature ?? 0.7}</span>
							</div>
							<input
								type="range"
								min="0"
								max="2"
								step="0.1"
								class="w-full accent-emerald-500"
								value={openAiData.temperature ?? 0.7}
								oninput={(e) => updateNodeData(id, { temperature: parseFloat((e.target as HTMLInputElement).value) })}
							/>
						</div>
						<div class="space-y-1">
							<label for="max-tokens-{id}" class="text-[10px] text-slate-400">Max Tokens</label>
							<input
								id="max-tokens-{id}"
								type="number"
								class="w-full rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-200"
								value={openAiData.maxTokens ?? 1000}
								oninput={(e) => updateNodeData(id, { maxTokens: parseInt((e.target as HTMLInputElement).value, 10) || 1000 })}
							/>
						</div>
					</div>

					<!-- Response Format -->
					<div class="space-y-1">
						<label for="resp-format-{id}" class="text-[10px] text-slate-400">Format</label>
						<div class="grid grid-cols-2 gap-1.5">
							<button
								type="button"
								onclick={() => updateNodeData(id, { responseFormat: 'text' })}
								class="rounded py-1 text-[10px] border transition {openAiData.responseFormat !== 'json_object'
									? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
									: 'border-slate-800 text-slate-400'}"
							>
								Text
							</button>
							<button
								type="button"
								onclick={() => updateNodeData(id, { responseFormat: 'json_object' })}
								class="rounded py-1 text-[10px] border transition {openAiData.responseFormat === 'json_object'
									? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
									: 'border-slate-800 text-slate-400'}"
							>
								JSON Object
							</button>
						</div>
					</div>

					<!-- API Key Override -->
					<div class="space-y-1">
						<label for="api-key-override-{id}" class="text-[10px] text-slate-400">API Key Override (Optional)</label>
						<input
							id="api-key-override-{id}"
							type="password"
							class="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
							placeholder="Defaults to Settings OpenAI Key"
							value={openAiData.apiKeyOverride ?? ''}
							oninput={(e) => updateNodeData(id, { apiKeyOverride: (e.target as HTMLInputElement).value })}
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Info Note -->
		<div class="rounded-lg bg-slate-950/80 p-2 text-[10px] text-slate-400 border border-slate-800/80 flex items-center justify-between">
			<span>Injects: <code class="text-emerald-300 font-mono">state.aiResponse</code></span>
			<span class="text-slate-500 font-mono">text, json, usage</span>
		</div>
	</div>

	<!-- Output Branches -->
	<div class="border-t border-slate-800/80 bg-slate-950/40 px-3 py-2.5 rounded-b-xl flex items-center justify-between">
		<!-- Success Branch -->
		<div class="flex items-center gap-1.5 relative">
			<div class="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
				<Check class="h-2.5 w-2.5" />
			</div>
			<span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">SUCCESS</span>
			<Handle
				type="source"
				position={Position.Bottom}
				id="success"
				class="!left-4 !bottom-[-10px] !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
			/>
		</div>

		<!-- Error Branch -->
		<div class="flex items-center gap-1.5 relative">
			<span class="text-[10px] font-bold text-rose-400 uppercase tracking-wider">ERROR</span>
			<div class="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
				<X class="h-2.5 w-2.5" />
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				id="error"
				class="!right-4 !bottom-[-10px] !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
			/>
		</div>
	</div>
</div>

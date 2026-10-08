<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Sparkles, Sliders } from '@lucide/svelte';
	import type { OpenAiData } from '../../types';
	import BaseNode, { type OutputHandleConfig } from './BaseNode.svelte';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const openAiData = $derived(data as unknown as OpenAiData);
	let showAdvanced = $state(false);

	const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'o1-mini'];

	const outputs: OutputHandleConfig[] = [
		{ id: 'success', label: 'SUCCESS', color: 'emerald' },
		{ id: 'error', label: 'ERROR', color: 'rose' }
	];
</script>

<BaseNode
	{id}
	{selected}
	title={openAiData.title || 'OpenAI LLM'}
	accentColor="emerald"
	icon={Sparkles}
	badge="AI / LLM"
	width="w-80"
	{outputs}
	onTitleChange={(title) => updateNodeData(id, { title })}
>
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
</BaseNode>

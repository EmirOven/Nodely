<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Sparkles, Sliders } from '@lucide/svelte';
	import type { AiNodeData, AiProviderType } from '../../types';
	import BaseNode, { type OutputHandleConfig } from './BaseNode.svelte';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const aiData = $derived(data as unknown as AiNodeData);
	let showAdvanced = $state(false);

	const providers: { id: AiProviderType; name: string; tag: string }[] = [
		{ id: 'openai', name: 'OpenAI', tag: 'GPT' },
		{ id: 'anthropic', name: 'Anthropic', tag: 'Claude' },
		{ id: 'google', name: 'Google', tag: 'Gemini' },
		{ id: 'groq', name: 'Groq', tag: 'LPU' },
		{ id: 'custom', name: 'Ollama / Custom', tag: 'Local/API' }
	];

	const defaultModels: Record<AiProviderType, string[]> = {
		openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'o1-mini', 'o3-mini'],
		anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
		google: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
		groq: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
		custom: ['llama3.2', 'deepseek-r1', 'mistral', 'qwen2.5']
	};

	const currentProvider = $derived((aiData.provider || 'openai') as AiProviderType);
	const availableModels = $derived(defaultModels[currentProvider] || defaultModels.openai);

	function setProvider(prov: AiProviderType) {
		const newModel = defaultModels[prov]?.[0] || 'gpt-4o-mini';
		updateNodeData(id, {
			provider: prov,
			model: newModel,
			baseUrl: prov === 'custom' ? (aiData.baseUrl || 'http://localhost:11434/v1') : undefined
		});
	}

	const outputs: OutputHandleConfig[] = [
		{ id: 'success', label: 'SUCCESS', color: 'emerald' },
		{ id: 'error', label: 'ERROR', color: 'rose' }
	];
</script>

<BaseNode
	{id}
	{selected}
	title={aiData.title || 'AI Completion'}
	accentColor="emerald"
	icon={Sparkles}
	badge="AI SDK"
	width="w-84"
	{outputs}
	onTitleChange={(title) => updateNodeData(id, { title })}
>
	<!-- Provider Selector -->
	<div class="space-y-1">
		<label for="provider-select-{id}" class="text-[11px] font-medium text-slate-400">Model Provider</label>
		<div class="grid grid-cols-3 gap-1">
			{#each providers as p}
				<button
					type="button"
					onclick={() => setProvider(p.id)}
					class="flex items-center justify-center gap-1 rounded-lg border py-1.5 px-1 text-[10px] font-medium transition {currentProvider === p.id
						? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-sm'
						: 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}"
				>
					<span>{p.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Model Selector & Custom Model -->
	<div class="space-y-1">
		<div class="flex justify-between items-center">
			<label for="model-select-{id}" class="text-[11px] font-medium text-slate-400">Model Name</label>
			<span class="text-[9px] font-mono text-slate-500">{currentProvider}</span>
		</div>
		<div class="flex gap-1.5">
			<select
				id="model-select-{id}"
				class="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
				value={aiData.model || availableModels[0]}
				onchange={(e) => updateNodeData(id, { model: (e.target as HTMLSelectElement).value })}
			>
				{#each availableModels as m}
					<option value={m}>{m}</option>
				{/each}
			</select>
		</div>
		<!-- Custom model override input -->
		<input
			type="text"
			placeholder="Or enter custom model ID..."
			class="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] font-mono text-slate-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
			value={aiData.model || ''}
			oninput={(e) => updateNodeData(id, { model: (e.target as HTMLInputElement).value })}
		/>
	</div>

	<!-- System Prompt -->
	<div class="space-y-1">
		<label for="system-prompt-{id}" class="text-[11px] font-medium text-slate-400">System Prompt</label>
		<textarea
			id="system-prompt-{id}"
			rows="2"
			class="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-[11px] text-slate-300 placeholder-slate-600 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
			placeholder="You are an expert AI assistant that responds concisely."
			value={aiData.systemPrompt ?? 'You are an AI assistant helping with API processing.'}
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
			value={aiData.userPrompt ?? 'Process this request: {{payload.prompt || payload.text}}'}
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
			<div class="mt-2.5 space-y-2.5 rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
				<!-- Temperature & Max Tokens -->
				<div class="grid grid-cols-2 gap-2">
					<div class="space-y-1">
						<div class="flex justify-between text-[10px] text-slate-400">
							<span>Temp</span>
							<span>{aiData.temperature ?? 0.7}</span>
						</div>
						<input
							type="range"
							min="0"
							max="2"
							step="0.1"
							class="w-full accent-emerald-500"
							value={aiData.temperature ?? 0.7}
							oninput={(e) => updateNodeData(id, { temperature: parseFloat((e.target as HTMLInputElement).value) })}
						/>
					</div>
					<div class="space-y-1">
						<label for="max-tokens-{id}" class="text-[10px] text-slate-400">Max Tokens</label>
						<input
							id="max-tokens-{id}"
							type="number"
							class="w-full rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-200"
							value={aiData.maxTokens ?? 1000}
							oninput={(e) => updateNodeData(id, { maxTokens: parseInt((e.target as HTMLInputElement).value, 10) || 1000 })}
						/>
					</div>
				</div>

				<!-- Response Format -->
				<div class="space-y-1">
					<label for="resp-format-{id}" class="text-[10px] text-slate-400">Response Format</label>
					<div class="grid grid-cols-2 gap-1.5">
						<button
							type="button"
							onclick={() => updateNodeData(id, { responseFormat: 'text' })}
							class="rounded py-1 text-[10px] border transition {aiData.responseFormat !== 'json_object'
								? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
								: 'border-slate-800 text-slate-400'}"
						>
							Text
						</button>
						<button
							type="button"
							onclick={() => updateNodeData(id, { responseFormat: 'json_object' })}
							class="rounded py-1 text-[10px] border transition {aiData.responseFormat === 'json_object'
								? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
								: 'border-slate-800 text-slate-400'}"
						>
							JSON Object
						</button>
					</div>
				</div>

				<!-- Custom Base URL (if custom or local) -->
				{#if currentProvider === 'custom'}
					<div class="space-y-1">
						<label for="base-url-{id}" class="text-[10px] text-slate-400">API Base URL</label>
						<input
							id="base-url-{id}"
							type="text"
							class="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
							placeholder="http://localhost:11434/v1"
							value={aiData.baseUrl ?? 'http://localhost:11434/v1'}
							oninput={(e) => updateNodeData(id, { baseUrl: (e.target as HTMLInputElement).value })}
						/>
					</div>
				{/if}

				<!-- API Key Override -->
				<div class="space-y-1">
					<label for="api-key-override-{id}" class="text-[10px] text-slate-400">API Key Override (Optional)</label>
					<input
						id="api-key-override-{id}"
						type="password"
						class="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
						placeholder="Defaults to Settings provider key"
						value={aiData.apiKeyOverride ?? ''}
						oninput={(e) => updateNodeData(id, { apiKeyOverride: (e.target as HTMLInputElement).value })}
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- Info Note -->
	<div class="rounded-lg bg-slate-950/80 p-2 text-[10px] text-slate-400 border border-slate-800/80 flex items-center justify-between">
		<span>Injects: <code class="text-emerald-300 font-mono">state.aiResponse</code></span>
		<span class="text-slate-500 font-mono">text, json, provider</span>
	</div>
</BaseNode>

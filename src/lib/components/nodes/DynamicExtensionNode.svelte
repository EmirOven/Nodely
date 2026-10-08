<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Eye, EyeOff } from '@lucide/svelte';
	import BaseNode, { type OutputHandleConfig, type AccentColor } from './BaseNode.svelte';
	import DynamicIcon from '../DynamicIcon.svelte';
	import type { ExtensionFieldProperty } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	// Hidden passwords tracking
	let showPasswords = $state<Record<string, boolean>>({});

	const nodeTitle = $derived((data as any)?.title || 'Custom Extension');
	const accentColor = $derived(((data as any)?.accentColor || 'indigo') as AccentColor);
	const iconName = $derived((data as any)?.icon || 'Blocks');
	const badgeText = $derived((data as any)?.badgeText || (data as any)?.category || 'Extension');
	const width = $derived((data as any)?.width || 'w-80');

	const properties = $derived<ExtensionFieldProperty[]>(((data as any)?.properties as ExtensionFieldProperty[]) || []);
	const outputs = $derived<OutputHandleConfig[]>(((data as any)?.outputs as OutputHandleConfig[]) || [
		{ id: 'success', label: 'SUCCESS', color: 'emerald' },
		{ id: 'error', label: 'ERROR', color: 'rose' }
	]);

	function togglePassword(propName: string) {
		showPasswords[propName] = !showPasswords[propName];
	}
</script>

<BaseNode
	{id}
	nodeType={(data as any)?.nodeType || 'dynamicExtension'}
	{selected}
	title={nodeTitle}
	{accentColor}
	badge={badgeText}
	{width}
	{outputs}
	onTitleChange={(title) => updateNodeData(id, { title })}
>
	{#snippet headerBadge()}
		<div class="flex items-center gap-1.5">
			<span class="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700/50">
				{badgeText}
			</span>
		</div>
	{/snippet}

	{#if properties && properties.length > 0}
		<div class="space-y-2.5">
			{#each properties as prop}
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<label for="field-{id}-{prop.name}" class="text-[11px] font-medium text-slate-400">
							{prop.label}
						</label>
						{#if prop.description}
							<span class="text-[9px] text-slate-500 truncate max-w-[150px]" title={prop.description}>
								{prop.description}
							</span>
						{/if}
					</div>

					{#if prop.type === 'text'}
						<input
							id="field-{id}-{prop.name}"
							type="text"
							class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
							placeholder={prop.placeholder || ''}
							value={(data as any)[prop.name] ?? prop.defaultValue ?? ''}
							oninput={(e) => updateNodeData(id, { [prop.name]: (e.target as HTMLInputElement).value })}
						/>
					{:else if prop.type === 'password'}
						<div class="relative flex items-center">
							<input
								id="field-{id}-{prop.name}"
								type={showPasswords[prop.name] ? 'text' : 'password'}
								class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 pr-7 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
								placeholder={prop.placeholder || 'Enter secret key...'}
								value={(data as any)[prop.name] ?? prop.defaultValue ?? ''}
								oninput={(e) => updateNodeData(id, { [prop.name]: (e.target as HTMLInputElement).value })}
							/>
							<button
								type="button"
								class="absolute right-1.5 text-slate-500 hover:text-slate-300"
								onclick={() => togglePassword(prop.name)}
								title={showPasswords[prop.name] ? 'Hide' : 'Show'}
							>
								{#if showPasswords[prop.name]}
									<EyeOff class="h-3 w-3" />
								{:else}
									<Eye class="h-3 w-3" />
								{/if}
							</button>
						</div>
					{:else if prop.type === 'textarea'}
						<textarea
							id="field-{id}-{prop.name}"
							rows="2"
							class="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
							placeholder={prop.placeholder || ''}
							value={(data as any)[prop.name] ?? prop.defaultValue ?? ''}
							oninput={(e) => updateNodeData(id, { [prop.name]: (e.target as HTMLTextAreaElement).value })}
						></textarea>
					{:else if prop.type === 'select'}
						<select
							id="field-{id}-{prop.name}"
							class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
							value={(data as any)[prop.name] ?? prop.defaultValue ?? prop.options?.[0]?.value}
							onchange={(e) => updateNodeData(id, { [prop.name]: (e.target as HTMLSelectElement).value })}
						>
							{#each prop.options || [] as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					{:else if prop.type === 'number'}
						<input
							id="field-{id}-{prop.name}"
							type="number"
							class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
							value={(data as any)[prop.name] ?? prop.defaultValue ?? 0}
							oninput={(e) => updateNodeData(id, { [prop.name]: Number((e.target as HTMLInputElement).value) })}
						/>
					{:else if prop.type === 'boolean'}
						<label class="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-300">
							<input
								type="checkbox"
								class="rounded border-slate-700 bg-slate-900 text-indigo-500"
								checked={(data as any)[prop.name] ?? prop.defaultValue ?? false}
								onchange={(e) => updateNodeData(id, { [prop.name]: (e.target as HTMLInputElement).checked })}
							/>
							<span>{prop.label}</span>
						</label>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-500">
			Extension node initialized with default configuration.
		</div>
	{/if}
</BaseNode>

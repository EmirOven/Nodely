<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import GoogleIcon from '../icons/GoogleIcon.svelte';
	import BaseNode from './BaseNode.svelte';
	import type { GoogleAuthData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const googleData = $derived(data as unknown as GoogleAuthData);
</script>

<BaseNode
	{id}
	{selected}
	title={googleData.title || 'Google Auth'}
	icon={GoogleIcon}
	badge="OAuth"
	accentColor="rose"
	isExecuting={googleData.isExecuting}
	outputs={[
		{ id: 'valid', label: 'VALID', color: 'emerald' },
		{ id: 'invalid', label: 'INVALID', color: 'rose' }
	]}
>
	<div class="space-y-3">
		<!-- Token Source Selector -->
		<div class="space-y-1">
			<label for="token-source-{id}" class="text-[11px] font-medium text-slate-400">Token Location</label>
			<div class="grid grid-cols-2 gap-1.5">
				<button
					type="button"
					onclick={() => updateNodeData(id, { tokenSource: 'header' })}
					class="rounded-lg border px-2 py-1.5 text-[11px] font-medium transition {googleData.tokenSource !== 'payload'
						? 'border-red-500/50 bg-red-500/10 text-red-300'
						: 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'}"
				>
					Auth Header
				</button>
				<button
					type="button"
					onclick={() => updateNodeData(id, { tokenSource: 'payload' })}
					class="rounded-lg border px-2 py-1.5 text-[11px] font-medium transition {googleData.tokenSource === 'payload'
						? 'border-red-500/50 bg-red-500/10 text-red-300'
						: 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'}"
				>
					JSON Payload
				</button>
			</div>
		</div>

		<!-- Token Field / Client ID -->
		{#if googleData.tokenSource === 'payload'}
			<div class="space-y-1">
				<label for="token-field-{id}" class="text-[11px] font-medium text-slate-400">Payload Property</label>
				<input
					id="token-field-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-red-500 focus:outline-none"
					placeholder="credential or id_token"
					value={googleData.tokenField || 'credential'}
					oninput={(e) => updateNodeData(id, { tokenField: (e.target as HTMLInputElement).value })}
				/>
			</div>
		{/if}

		<div class="space-y-1">
			<label for="client-id-{id}" class="text-[11px] font-medium text-slate-400">Google Client ID (Optional)</label>
			<input
				id="client-id-{id}"
				type="text"
				class="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 font-mono text-[11px] text-slate-200 placeholder-slate-600 focus:border-red-500 focus:outline-none"
				placeholder="Default: from Settings"
				value={googleData.clientId || ''}
				oninput={(e) => updateNodeData(id, { clientId: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<!-- Info Note -->
		<div class="rounded-lg bg-slate-950/80 p-2 text-[10px] text-slate-400 border border-slate-800/80 flex items-center justify-between">
			<span>Injects: <code class="text-red-300 font-mono">state.googleUser</code></span>
			<span class="text-slate-500 font-mono">name, email, sub</span>
		</div>
	</div>
</BaseNode>

<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { ShieldCheck, Trash2, GripVertical, Check, X } from '@lucide/svelte';
	import GoogleIcon from '../icons/GoogleIcon.svelte';
	import type { GoogleAuthData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const googleData = $derived(data as unknown as GoogleAuthData);
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-red-500 ring-2 ring-red-500/30 shadow-red-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-red-500 hover:!bg-red-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white border border-white/10">
				<GoogleIcon class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Google Auth Node title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-red-500 max-w-[130px]"
				value={googleData.title || 'Google Auth'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
				OAuth
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

	<!-- Output Branches -->
	<div class="border-t border-slate-800/80 bg-slate-950/40 px-3 py-2.5 rounded-b-xl flex items-center justify-between">
		<!-- Valid Branch -->
		<div class="flex items-center gap-1.5 relative">
			<div class="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
				<Check class="h-2.5 w-2.5" />
			</div>
			<span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">VALID</span>
			<Handle
				type="source"
				position={Position.Bottom}
				id="valid"
				class="!left-4 !bottom-[-10px] !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
			/>
		</div>

		<!-- Invalid Branch -->
		<div class="flex items-center gap-1.5 relative">
			<span class="text-[10px] font-bold text-rose-400 uppercase tracking-wider">INVALID</span>
			<div class="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
				<X class="h-2.5 w-2.5" />
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				id="invalid"
				class="!right-4 !bottom-[-10px] !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
			/>
		</div>
	</div>
</div>

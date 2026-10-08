<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { ShieldCheck, Trash2, GripVertical, Check, X, KeyRound } from '@lucide/svelte';
	import type { AuthNodeData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

	const authData = $derived(data as unknown as AuthNodeData);
</script>

<div
	class="w-80 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/20 text-rose-400">
				<ShieldCheck class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Auth Node title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-rose-500 max-w-[130px]"
				value={authData.title || 'Auth Gate'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
				Security
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
	<div class="p-3 space-y-2.5">
		<!-- Auth Type & Header Name -->
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-1">
				<label for="auth-type-{id}" class="text-[11px] font-medium text-slate-400">Type</label>
				<select
					id="auth-type-{id}"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
					value={authData.authType || 'apiKey'}
					onchange={(e) => {
						const val = (e.target as HTMLSelectElement).value as 'apiKey' | 'bearer';
						updateNodeData(id, {
							authType: val,
							headerName: val === 'bearer' ? 'authorization' : (authData.headerName || 'x-api-key')
						});
					}}
				>
					<option value="apiKey">API Key</option>
					<option value="bearer">Bearer Token</option>
				</select>
			</div>

			<div class="space-y-1">
				<label for="auth-header-{id}" class="text-[11px] font-medium text-slate-400">Header Name</label>
				<input
					id="auth-header-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
					value={authData.headerName || 'x-api-key'}
					placeholder="x-api-key"
					oninput={(e) => updateNodeData(id, { headerName: (e.target as HTMLInputElement).value })}
				/>
			</div>
		</div>

		<!-- Expected Secret / Key -->
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<label for="auth-secret-{id}" class="text-[11px] font-medium text-slate-400">Expected Secret / Token</label>
				<span class="text-[9px] text-slate-500">Exact match</span>
			</div>
			<div class="relative">
				<KeyRound class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
				<input
					id="auth-secret-{id}"
					type="text"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-2.5 py-1.5 font-mono text-xs text-rose-300 placeholder-slate-600 focus:border-rose-500 focus:outline-none"
					value={authData.expectedValue || 'secret_nodely_key'}
					placeholder="secret_nodely_key"
					oninput={(e) => updateNodeData(id, { expectedValue: (e.target as HTMLInputElement).value })}
				/>
			</div>
		</div>

		<!-- Branch Labels -->
		<div class="flex items-center justify-between pt-1 text-[11px] font-bold">
			<div class="flex items-center gap-1 text-emerald-400">
				<Check class="h-3 w-3" /> VALID (Authorized)
			</div>
			<div class="flex items-center gap-1 text-rose-400">
				<X class="h-3 w-3" /> INVALID (401)
			</div>
		</div>
	</div>

	<!-- Dual Handles at bottom -->
	<div class="relative flex justify-between px-6 pb-2">
		<div class="flex flex-col items-center">
			<Handle
				type="source"
				position={Position.Bottom}
				id="valid"
				class="!static !transform-none !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-emerald-500 hover:!bg-emerald-400 transition"
			/>
			<span class="text-[9px] font-bold text-emerald-500 mt-1">VALID</span>
		</div>

		<div class="flex flex-col items-center">
			<Handle
				type="source"
				position={Position.Bottom}
				id="invalid"
				class="!static !transform-none !h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-rose-500 hover:!bg-rose-400 transition"
			/>
			<span class="text-[9px] font-bold text-rose-500 mt-1">INVALID</span>
		</div>
	</div>
</div>

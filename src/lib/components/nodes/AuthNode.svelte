<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { ShieldCheck, KeyRound, Check, X } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { AuthNodeData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const authData = $derived(data as unknown as AuthNodeData);
</script>

<BaseNode
	{id}
	nodeType="authNode"
	{selected}
	title={authData.title || 'Auth Gate'}
	icon={ShieldCheck}
	badge={authData.authType === 'bearer' ? 'Bearer' : 'API Key'}
	accentColor="rose"
	isExecuting={authData.isExecuting}
	outputs={[
		{ id: 'valid', label: 'VALID (200)', color: 'emerald' },
		{ id: 'invalid', label: 'INVALID (401)', color: 'rose' }
	]}
>
	<div class="space-y-2.5">
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
				<Check class="h-3 w-3" /> Valid branch
			</div>
			<div class="flex items-center gap-1 text-rose-400">
				<X class="h-3 w-3" /> Invalid branch
			</div>
		</div>
	</div>
</BaseNode>

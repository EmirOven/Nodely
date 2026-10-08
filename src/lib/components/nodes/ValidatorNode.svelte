<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { ListChecks, Check, X } from '@lucide/svelte';
	import BaseNode from './BaseNode.svelte';
	import type { ValidatorData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const valData = $derived(data as unknown as ValidatorData);
</script>

<BaseNode
	{id}
	{selected}
	title={valData.title || 'Schema Validator'}
	icon={ListChecks}
	badge="Validation"
	accentColor="teal"
	isExecuting={valData.isExecuting}
	outputs={[
		{ id: 'valid', label: 'VALID', color: 'emerald' },
		{ id: 'invalid', label: 'INVALID (Errors)', color: 'rose' }
	]}
>
	<div class="space-y-2.5">
		<div class="space-y-1">
			<div class="flex items-center justify-between">
				<label for="val-fields-{id}" class="text-[11px] font-medium text-slate-400">
					Required Payload Keys
				</label>
				<span class="text-[9px] text-slate-500">Comma separated</span>
			</div>
			<input
				id="val-fields-{id}"
				type="text"
				class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-teal-200 placeholder-slate-600 focus:border-teal-500 focus:outline-none"
				placeholder="email, name, password"
				value={valData.requiredFields || 'email, name'}
				oninput={(e) => updateNodeData(id, { requiredFields: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<p class="text-[10px] text-slate-400 leading-relaxed">
			Ensures payload contains non-empty values for each specified key.
		</p>

		<!-- Branch Indicators -->
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

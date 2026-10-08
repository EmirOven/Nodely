<script lang="ts">
	import { useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Code2, Terminal } from '@lucide/svelte';
	import type { CodeBlockData } from '../../types';
	import BaseNode from './BaseNode.svelte';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData } = useSvelteFlow();

	const codeData = $derived(data as unknown as CodeBlockData);

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			const target = e.target as HTMLTextAreaElement;
			const start = target.selectionStart;
			const end = target.selectionEnd;
			const value = target.value;
			target.value = value.substring(0, start) + '  ' + value.substring(end);
			target.selectionStart = target.selectionEnd = start + 2;
			updateNodeData(id, { code: target.value });
		}
	}
</script>

<BaseNode
	{id}
	{selected}
	title={codeData.title || 'Code Block'}
	accentColor="indigo"
	icon={Code2}
	badge="JS / TS"
	width="w-96"
	onTitleChange={(title) => updateNodeData(id, { title })}
>
	<!-- Context Helpers Bar -->
	<div class="flex items-center justify-between text-[11px] text-slate-400">
		<span class="flex items-center gap-1 text-slate-400 font-medium">
			<Terminal class="h-3 w-3 text-indigo-400" /> Transform Logic
		</span>
		<div class="flex items-center gap-1 text-[10px] font-mono text-slate-400">
			<span class="rounded bg-slate-800 px-1 py-0.5 text-slate-300">payload</span>
			<span class="rounded bg-slate-800 px-1 py-0.5 text-slate-300">state</span>
			<span class="rounded bg-slate-800 px-1 py-0.5 text-slate-300">log()</span>
		</div>
	</div>

	<!-- Code Editor Textarea -->
	<div class="relative rounded-lg border border-slate-800 bg-slate-950 overflow-hidden group">
		<textarea
			aria-label="JavaScript code editor"
			class="w-full h-32 p-2.5 font-mono text-xs text-indigo-200 bg-transparent resize-y focus:outline-none placeholder-slate-700 selection:bg-indigo-900/60 leading-relaxed nodrag"
			placeholder={'// Process and return data\nreturn { ...payload, processedAt: Date.now() };'}
			value={codeData.code || ''}
			onkeydown={handleKeyDown}
			oninput={(e) => updateNodeData(id, { code: (e.target as HTMLTextAreaElement).value })}
			spellcheck="false"
		></textarea>
	</div>

	<div class="text-[10px] text-slate-400 flex items-center justify-between">
		<span>Return a value or object to forward to the next node.</span>
		<span class="font-mono text-indigo-400/80">return &lt;val&gt;</span>
	</div>
</BaseNode>

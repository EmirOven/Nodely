<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import { Code2, Trash2, GripVertical, Terminal } from '@lucide/svelte';
	import type { CodeBlockData } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements } = useSvelteFlow();

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

<div
	class="w-96 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Top Target Handle -->
	<div class="relative py-0.5">
		<Handle
			type="target"
			position={Position.Top}
			id="input"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-indigo-500 hover:!bg-indigo-400 transition"
		/>
	</div>

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400">
				<Code2 class="h-3.5 w-3.5" />
			</div>
			<input
				type="text"
				aria-label="Code block title"
				class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-indigo-500 max-w-[150px]"
				value={codeData.title || 'Code Block'}
				oninput={(e) => updateNodeData(id, { title: (e.target as HTMLInputElement).value })}
			/>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-mono text-indigo-400">
				JS / TS
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
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative py-0.5">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-indigo-500 hover:!bg-indigo-400 transition"
		/>
	</div>
</div>

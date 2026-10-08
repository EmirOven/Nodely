<script lang="ts">
	import { X, Copy, Check, Download, Code2, Server, FileJson } from '@lucide/svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		svelteKitCode: string;
		expressCode: string;
		flowJson: string;
	}

	let { isOpen, onClose, svelteKitCode, expressCode, flowJson }: Props = $props();

	let activeFormat = $state<'sveltekit' | 'express' | 'json'>('sveltekit');
	let copied = $state(false);

	const activeCode = $derived(
		activeFormat === 'sveltekit'
			? svelteKitCode
			: activeFormat === 'express'
				? expressCode
				: flowJson
	);

	function copyToClipboard() {
		navigator.clipboard.writeText(activeCode);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadFile() {
		const filename =
			activeFormat === 'sveltekit'
				? '+server.ts'
				: activeFormat === 'express'
					? 'server.js'
					: 'nodely-flow.json';
		const blob = new Blob([activeCode], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
		<div
			class="flex flex-col h-[650px] w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-slate-800 px-6 py-4">
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
						<Code2 class="h-4 w-4" />
					</div>
					<div>
						<h3 class="text-sm font-semibold text-slate-100">Export API Code</h3>
						<p class="text-xs text-slate-400">Deploy this workflow directly to production servers</p>
					</div>
				</div>

				<button
					type="button"
					onclick={onClose}
					class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<!-- Format Switcher -->
			<div class="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-2.5">
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => (activeFormat = 'sveltekit')}
						class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition {activeFormat ===
						'sveltekit'
							? 'bg-blue-600 text-white shadow'
							: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
					>
						<Server class="h-3.5 w-3.5" />
						SvelteKit (+server.ts)
					</button>

					<button
						type="button"
						onclick={() => (activeFormat = 'express')}
						class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition {activeFormat ===
						'express'
							? 'bg-blue-600 text-white shadow'
							: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
					>
						<Code2 class="h-3.5 w-3.5" />
						Express / Node.js
					</button>

					<button
						type="button"
						onclick={() => (activeFormat = 'json')}
						class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition {activeFormat ===
						'json'
							? 'bg-blue-600 text-white shadow'
							: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}"
					>
						<FileJson class="h-3.5 w-3.5" />
						Flow JSON Schema
					</button>
				</div>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={copyToClipboard}
						class="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
					>
						{#if copied}
							<Check class="h-3.5 w-3.5 text-emerald-400" />
							<span class="text-emerald-400">Copied!</span>
						{:else}
							<Copy class="h-3.5 w-3.5" />
							<span>Copy</span>
						{/if}
					</button>

					<button
						type="button"
						onclick={downloadFile}
						class="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
					>
						<Download class="h-3.5 w-3.5" />
						<span>Download</span>
					</button>
				</div>
			</div>

			<!-- Code Viewer -->
			<div class="flex-1 overflow-auto bg-slate-950 p-6">
				<pre class="font-mono text-xs text-slate-200 leading-relaxed">{activeCode}</pre>
			</div>
		</div>
	</div>
{/if}

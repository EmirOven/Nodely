<script lang="ts">
	import {
		X,
		Copy,
		Check,
		Braces,
		ArrowDownRight,
		ArrowUpRight,
		Columns2,
		Layers,
		Sparkles,
		Code2,
		Info,
		CornerDownRight
	} from '@lucide/svelte';
	import { structureModal } from '../stores/structureModal.svelte';
	import { getNodeSchema } from '../engine/nodeSchemas';

	let activeTab = $state<'split' | 'input' | 'output'>('split');
	let copiedInput = $state(false);
	let copiedOutput = $state(false);

	const activeNode = $derived(structureModal.activeNode);
	const isOpen = $derived(activeNode !== null);

	const schema = $derived.by(() => {
		if (!activeNode) return null;
		return getNodeSchema(
			activeNode.type,
			activeNode.data,
			activeNode.title,
			activeNode.outputs
		);
	});

	function handleClose() {
		structureModal.close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}

	function copyInputJson() {
		if (!schema) return;
		navigator.clipboard.writeText(JSON.stringify(schema.input.sampleJson, null, 2));
		copiedInput = true;
		setTimeout(() => (copiedInput = false), 2000);
	}

	function copyOutputJson() {
		if (!schema) return;
		navigator.clipboard.writeText(JSON.stringify(schema.output.sampleJson, null, 2));
		copiedOutput = true;
		setTimeout(() => (copiedOutput = false), 2000);
	}

	function getTypeBadgeClass(type: string): string {
		switch (type.toLowerCase()) {
			case 'string':
				return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
			case 'number':
				return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
			case 'boolean':
				return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
			case 'object':
			case 'record<string, any>':
			case 'record<string, string>':
				return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
			case 'string[]':
			case 'array':
				return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
			default:
				return 'bg-slate-800 text-slate-300 border-slate-700';
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen && schema}
	<!-- Backdrop Overlay -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="structure-modal-title"
	>
		<!-- Modal Card -->
		<div
			class="flex flex-col h-[85vh] max-h-[820px] w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60 backdrop-blur-md">
				<div class="flex items-center gap-3 min-w-0">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 text-white shrink-0"
					>
						<Braces class="h-5 w-5" />
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<h2 id="structure-modal-title" class="text-base font-bold tracking-tight text-white truncate">
								{schema.title}
							</h2>
							<span class="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
								{schema.category}
							</span>
							<span class="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
								{schema.nodeType}
							</span>
						</div>
						<p class="text-xs text-slate-400 truncate mt-0.5">
							{schema.summary}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2 shrink-0">
					<!-- View Mode Switcher -->
					<div class="hidden sm:flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 p-1">
						<button
							type="button"
							onclick={() => (activeTab = 'split')}
							class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition {activeTab ===
							'split'
								? 'bg-indigo-600 text-white shadow-sm'
								: 'text-slate-400 hover:text-white'}"
							title="Side-by-side comparison"
						>
							<Columns2 class="h-3.5 w-3.5" />
							<span>Side-by-Side</span>
						</button>
						<button
							type="button"
							onclick={() => (activeTab = 'input')}
							class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition {activeTab ===
							'input'
								? 'bg-blue-600 text-white shadow-sm'
								: 'text-slate-400 hover:text-white'}"
							title="Focus Input Contract"
						>
							<ArrowDownRight class="h-3.5 w-3.5" />
							<span>Input</span>
						</button>
						<button
							type="button"
							onclick={() => (activeTab = 'output')}
							class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition {activeTab ===
							'output'
								? 'bg-emerald-600 text-white shadow-sm'
								: 'text-slate-400 hover:text-white'}"
							title="Focus Output Contract"
						>
							<ArrowUpRight class="h-3.5 w-3.5" />
							<span>Output</span>
						</button>
					</div>

					<!-- Close Button -->
					<button
						type="button"
						onclick={handleClose}
						class="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
						title="Close Modal (Esc)"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			</div>

			<!-- Quick Pipeline Banner -->
			<div class="border-b border-slate-800/80 bg-slate-950/70 px-6 py-2.5 text-xs text-slate-400 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Info class="h-3.5 w-3.5 text-indigo-400 shrink-0" />
					<span>{schema.howItWorks}</span>
				</div>
				<div class="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-500">
					<span>Node ID: <code class="text-slate-400">{activeNode?.id}</code></span>
				</div>
			</div>

			<!-- Modal Body (Scrollable) -->
			<div class="flex-1 overflow-y-auto p-6 space-y-6">
				<!-- Split View (2 Columns) -->
				{#if activeTab === 'split'}
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<!-- INPUT COLUMN -->
						<div class="flex flex-col rounded-xl border border-blue-500/20 bg-blue-950/10 p-5 space-y-4">
							<div class="flex items-center justify-between border-b border-blue-500/20 pb-3">
								<div class="flex items-center gap-2">
									<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
										<ArrowDownRight class="h-4 w-4" />
									</div>
									<div>
										<h3 class="text-sm font-bold text-blue-200">Input Data Structure</h3>
										<p class="text-[11px] text-slate-400">Data ingested by this node</p>
									</div>
								</div>
								<button
									type="button"
									onclick={copyInputJson}
									class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
									title="Copy JSON representation"
								>
									{#if copiedInput}
										<Check class="h-3 w-3 text-emerald-400" />
										<span class="text-emerald-400">Copied</span>
									{:else}
										<Copy class="h-3 w-3 text-slate-400" />
										<span>Copy JSON</span>
									{/if}
								</button>
							</div>

							<!-- Handle information -->
							<div class="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
								<CornerDownRight class="h-3.5 w-3.5 text-blue-400 shrink-0" />
								<span class="text-slate-400">Connection Point:</span>
								<span class="font-semibold text-slate-200">{schema.input.handleType}</span>
							</div>

							<!-- Description -->
							<p class="text-xs text-slate-300 leading-relaxed">
								{schema.input.description}
							</p>

							<!-- Field Specs Table -->
							<div class="space-y-2">
								<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
									Incoming Attributes
								</div>
								<div class="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden text-xs">
									<div class="grid grid-cols-12 border-b border-slate-800/80 bg-slate-900/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
										<div class="col-span-4">Field</div>
										<div class="col-span-3">Type</div>
										<div class="col-span-5">Description</div>
									</div>
									<div class="divide-y divide-slate-800/50">
										{#each schema.input.fields as field}
											<div class="grid grid-cols-12 items-center px-3 py-2">
												<div class="col-span-4 font-mono font-medium text-blue-300 truncate pr-2 flex items-center gap-1">
													<span>{field.name}</span>
													{#if field.required}
														<span class="text-[9px] text-rose-400 font-sans" title="Required">*</span>
													{/if}
												</div>
												<div class="col-span-3">
													<span class="rounded px-1.5 py-0.5 text-[9px] font-mono border {getTypeBadgeClass(field.type)}">
														{field.type}
													</span>
												</div>
												<div class="col-span-5 text-[11px] text-slate-400 leading-tight">
													{field.description}
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>

							<!-- Example JSON Box -->
							<div class="space-y-1.5 flex-1 flex flex-col">
								<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
									Sample Input Payload (JSON)
								</div>
								<div class="relative flex-1 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-blue-200 overflow-x-auto leading-relaxed shadow-inner">
									<pre>{JSON.stringify(schema.input.sampleJson, null, 2)}</pre>
								</div>
							</div>
						</div>

						<!-- OUTPUT COLUMN -->
						<div class="flex flex-col rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5 space-y-4">
							<div class="flex items-center justify-between border-b border-emerald-500/20 pb-3">
								<div class="flex items-center gap-2">
									<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
										<ArrowUpRight class="h-4 w-4" />
									</div>
									<div>
										<h3 class="text-sm font-bold text-emerald-200">Output Data Structure</h3>
										<p class="text-[11px] text-slate-400">Data emitted to downstream nodes</p>
									</div>
								</div>
								<button
									type="button"
									onclick={copyOutputJson}
									class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
									title="Copy JSON representation"
								>
									{#if copiedOutput}
										<Check class="h-3 w-3 text-emerald-400" />
										<span class="text-emerald-400">Copied</span>
									{:else}
										<Copy class="h-3 w-3 text-slate-400" />
										<span>Copy JSON</span>
									{/if}
								</button>
							</div>

							<!-- Output Handles -->
							<div class="space-y-1.5">
								<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
									Outgoing Flow Handles ({schema.output.handles.length})
								</div>
								{#if schema.output.handles.length === 0}
									<div class="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400 italic">
										Terminal Node: Emits response directly over HTTP network; no downstream handles.
									</div>
								{:else}
									<div class="flex flex-wrap gap-2">
										{#each schema.output.handles as h}
											<div class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/90 px-3 py-1.5 text-xs">
												<span class="h-2 w-2 rounded-full {h.color === 'emerald' ? 'bg-emerald-400' : h.color === 'rose' ? 'bg-rose-400' : 'bg-blue-400'}"></span>
												<span class="font-bold text-slate-200">{h.label}</span>
												{#if h.description}
													<span class="text-[10px] text-slate-400">({h.description})</span>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Description -->
							<p class="text-xs text-slate-300 leading-relaxed">
								{schema.output.description}
							</p>

							<!-- Field Specs Table -->
							<div class="space-y-2">
								<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
									Emitted Attributes
								</div>
								<div class="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden text-xs">
									<div class="grid grid-cols-12 border-b border-slate-800/80 bg-slate-900/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
										<div class="col-span-4">Field</div>
										<div class="col-span-3">Type</div>
										<div class="col-span-5">Description</div>
									</div>
									<div class="divide-y divide-slate-800/50">
										{#each schema.output.fields as field}
											<div class="grid grid-cols-12 items-center px-3 py-2">
												<div class="col-span-4 font-mono font-medium text-emerald-300 truncate pr-2">
													{field.name}
												</div>
												<div class="col-span-3">
													<span class="rounded px-1.5 py-0.5 text-[9px] font-mono border {getTypeBadgeClass(field.type)}">
														{field.type}
													</span>
												</div>
												<div class="col-span-5 text-[11px] text-slate-400 leading-tight">
													{field.description}
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>

							<!-- Example JSON Box -->
							<div class="space-y-1.5 flex-1 flex flex-col">
								<div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
									Sample Output Payload (JSON)
								</div>
								<div class="relative flex-1 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-emerald-200 overflow-x-auto leading-relaxed shadow-inner">
									<pre>{JSON.stringify(schema.output.sampleJson, null, 2)}</pre>
								</div>
							</div>
						</div>
					</div>
				{:else if activeTab === 'input'}
					<!-- Focused Input View -->
					<div class="max-w-3xl mx-auto space-y-6">
						<div class="rounded-xl border border-blue-500/20 bg-blue-950/10 p-6 space-y-4">
							<div class="flex items-center justify-between border-b border-blue-500/20 pb-3">
								<div class="flex items-center gap-3">
									<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
										<ArrowDownRight class="h-5 w-5" />
									</div>
									<div>
										<h3 class="text-base font-bold text-white">Full Input Contract</h3>
										<p class="text-xs text-slate-400">{schema.input.description}</p>
									</div>
								</div>
								<button
									type="button"
									onclick={copyInputJson}
									class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
								>
									{#if copiedInput}
										<Check class="h-3.5 w-3.5 text-emerald-400" />
										<span class="text-emerald-400">Copied JSON</span>
									{:else}
										<Copy class="h-3.5 w-3.5 text-slate-400" />
										<span>Copy JSON</span>
									{/if}
								</button>
							</div>

							<!-- Property Table -->
							<div class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
								<div class="grid grid-cols-12 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
									<div class="col-span-4">Property</div>
									<div class="col-span-3">Data Type</div>
									<div class="col-span-5">Specification</div>
								</div>
								<div class="divide-y divide-slate-800/60">
									{#each schema.input.fields as field}
										<div class="grid grid-cols-12 items-center px-4 py-3">
											<div class="col-span-4 font-mono font-bold text-blue-300 flex items-center gap-1.5">
												<span>{field.name}</span>
												{#if field.required}
													<span class="rounded bg-rose-500/10 px-1 py-0.2 text-[9px] font-sans text-rose-400 border border-rose-500/20">required</span>
												{/if}
											</div>
											<div class="col-span-3">
												<span class="rounded px-2 py-0.5 text-[10px] font-mono border {getTypeBadgeClass(field.type)}">
													{field.type}
												</span>
											</div>
											<div class="col-span-5 text-xs text-slate-300">
												{field.description}
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- Code Block with TypeScript -->
							<div class="space-y-2">
								<div class="flex items-center justify-between text-xs font-semibold text-slate-300">
									<span>TypeScript Interface</span>
									<span class="text-slate-500 font-mono text-[10px]">types.ts</span>
								</div>
								<div class="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-blue-200 overflow-x-auto leading-relaxed shadow-inner">
									<pre>{schema.input.typescriptType}</pre>
								</div>
							</div>

							<!-- Example JSON -->
							<div class="space-y-2">
								<div class="flex items-center justify-between text-xs font-semibold text-slate-300">
									<span>Sample Request Payload</span>
									<span class="text-slate-500 font-mono text-[10px]">JSON</span>
								</div>
								<div class="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-blue-200 overflow-x-auto leading-relaxed shadow-inner">
									<pre>{JSON.stringify(schema.input.sampleJson, null, 2)}</pre>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- Focused Output View -->
					<div class="max-w-3xl mx-auto space-y-6">
						<div class="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6 space-y-4">
							<div class="flex items-center justify-between border-b border-emerald-500/20 pb-3">
								<div class="flex items-center gap-3">
									<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
										<ArrowUpRight class="h-5 w-5" />
									</div>
									<div>
										<h3 class="text-base font-bold text-white">Full Output Contract</h3>
										<p class="text-xs text-slate-400">{schema.output.description}</p>
									</div>
								</div>
								<button
									type="button"
									onclick={copyOutputJson}
									class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
								>
									{#if copiedOutput}
										<Check class="h-3.5 w-3.5 text-emerald-400" />
										<span class="text-emerald-400">Copied JSON</span>
									{:else}
										<Copy class="h-3.5 w-3.5 text-slate-400" />
										<span>Copy JSON</span>
									{/if}
								</button>
							</div>

							<!-- Handles List -->
							<div class="space-y-2">
								<div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Output Ports</div>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{#each schema.output.handles as h}
										<div class="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-start gap-3">
											<span class="h-3 w-3 mt-0.5 rounded-full {h.color === 'emerald' ? 'bg-emerald-400' : h.color === 'rose' ? 'bg-rose-400' : 'bg-blue-400'} shrink-0"></span>
											<div>
												<div class="text-xs font-bold text-white">{h.label} ({h.id})</div>
												<div class="text-[11px] text-slate-400 mt-0.5">{h.description || 'Outputs standard forward flow'}</div>
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- Property Table -->
							<div class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
								<div class="grid grid-cols-12 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
									<div class="col-span-4">Emitted Attribute</div>
									<div class="col-span-3">Data Type</div>
									<div class="col-span-5">Specification</div>
								</div>
								<div class="divide-y divide-slate-800/60">
									{#each schema.output.fields as field}
										<div class="grid grid-cols-12 items-center px-4 py-3">
											<div class="col-span-4 font-mono font-bold text-emerald-300">
												{field.name}
											</div>
											<div class="col-span-3">
												<span class="rounded px-2 py-0.5 text-[10px] font-mono border {getTypeBadgeClass(field.type)}">
													{field.type}
												</span>
											</div>
											<div class="col-span-5 text-xs text-slate-300">
												{field.description}
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- Code Block with TypeScript -->
							<div class="space-y-2">
								<div class="flex items-center justify-between text-xs font-semibold text-slate-300">
									<span>TypeScript Interface</span>
									<span class="text-slate-500 font-mono text-[10px]">types.ts</span>
								</div>
								<div class="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed shadow-inner">
									<pre>{schema.output.typescriptType}</pre>
								</div>
							</div>

							<!-- Example JSON -->
							<div class="space-y-2">
								<div class="flex items-center justify-between text-xs font-semibold text-slate-300">
									<span>Sample Output Payload</span>
									<span class="text-slate-500 font-mono text-[10px]">JSON</span>
								</div>
								<div class="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-200 overflow-x-auto leading-relaxed shadow-inner">
									<pre>{JSON.stringify(schema.output.sampleJson, null, 2)}</pre>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between border-t border-slate-800 px-6 py-3.5 bg-slate-900/60">
				<div class="flex items-center gap-2 text-xs text-slate-400">
					<Layers class="h-4 w-4 text-slate-500" />
					<span>Data payloads pass through nodes automatically via topological execution order.</span>
				</div>
				<button
					type="button"
					onclick={handleClose}
					class="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

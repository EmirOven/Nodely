<script lang="ts">
	import { Handle, Position, useSvelteFlow, type NodeProps } from '@xyflow/svelte';
	import {
		Globe,
		Trash2,
		GripVertical,
		Lock,
		ChevronDown,
		Check,
		AlertCircle,
		Info,
		Layers
	} from '@lucide/svelte';
	import type { HttpTriggerData, HttpMethod } from '../../types';

	let { id, data, selected }: NodeProps = $props();
	const { updateNodeData, deleteElements, getNodes, updateNode } = useSvelteFlow();

	const triggerData = $derived(data as unknown as HttpTriggerData);

	let isMethodDropdownOpen = $state(false);
	let nodeRootEl = $state<HTMLElement | null>(null);

	function pullFocusToNode(el?: HTMLElement | null) {
		try {
			updateNode(id, { selected: true });
		} catch {}
		const nodeEl = el ? el.closest<HTMLElement>('.svelte-flow__node') : nodeRootEl?.closest<HTMLElement>('.svelte-flow__node');
		if (nodeEl) {
			nodeEl.focus?.();
			nodeEl.style.zIndex = '1000';
		}
	}

	function toggleMethodDropdown(e: MouseEvent) {
		e.stopPropagation();
		const nextState = !isMethodDropdownOpen;
		isMethodDropdownOpen = nextState;
		if (nextState) {
			pullFocusToNode(e.currentTarget as HTMLElement);
		}
	}

	$effect(() => {
		if (nodeRootEl) {
			const nodeEl = nodeRootEl.closest<HTMLElement>('.svelte-flow__node');
			if (nodeEl) {
				if (isMethodDropdownOpen) {
					nodeEl.style.zIndex = '1000';
				} else if (!selected) {
					nodeEl.style.zIndex = '';
				}
			}
		}
	});

	interface MethodInfo {
		method: HttpMethod;
		title: string;
		desc: string;
		bestFor: string;
		badgeClass: string;
		activeClass: string;
	}

	const methodDetails: Record<HttpMethod, MethodInfo> = {
		GET: {
			method: 'GET',
			title: 'Retrieve Resources',
			desc: 'Safe & idempotent. Fetches data without modifying server state. Standard APIs must not include request bodies.',
			bestFor: 'Queries, reading records, healthchecks',
			badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
			activeClass: 'border-emerald-500/50 bg-emerald-500/10'
		},
		POST: {
			method: 'POST',
			title: 'Create & Action',
			desc: 'Non-idempotent. Submits request payload to create new resources, process payments, or trigger workflows.',
			bestFor: 'Creation, auth signup/login, webhooks',
			badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
			activeClass: 'border-blue-500/50 bg-blue-500/10'
		},
		PUT: {
			method: 'PUT',
			title: 'Replace Entire Resource',
			desc: 'Idempotent. Replaces the target resource representation in its entirety with the provided payload.',
			bestFor: 'Full document overwrites, file uploads',
			badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
			activeClass: 'border-amber-500/50 bg-amber-500/10'
		},
		PATCH: {
			method: 'PATCH',
			title: 'Partial Update',
			desc: 'Applies partial updates (deltas) to specific fields without modifying or overwriting untouched properties.',
			bestFor: 'Status changes, flag updates, editing fields',
			badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
			activeClass: 'border-purple-500/50 bg-purple-500/10'
		},
		DELETE: {
			method: 'DELETE',
			title: 'Remove Resource',
			desc: 'Idempotent. Permanently deletes the designated record or resource from the storage system.',
			bestFor: 'Removing users, clearing items, deletions',
			badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
			activeClass: 'border-rose-500/50 bg-rose-500/10'
		}
	};

	const methodsList: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

	const currentMethod = $derived((triggerData.method || 'GET') as HttpMethod);
	const currentMeta = $derived(methodDetails[currentMethod] || methodDetails.GET);

	// Endpoint route is locked to nodeflow endpoint
	const endpointPath = $derived(
		triggerData.path || (triggerData as any).routePath || '/api/endpoint'
	);

	// Constraint: Find methods already used by OTHER HTTP triggers in this flow
	const usedOtherMethods = $derived.by(() => {
		try {
			const nodes = getNodes();
			const otherTriggers = nodes.filter(
				(n) => n.type === 'httpTrigger' && n.id !== id
			);
			return new Set(
				otherTriggers.map((t) => ((t.data as any)?.method || 'GET') as HttpMethod)
			);
		} catch {
			return new Set<HttpMethod>();
		}
	});

	function selectMethod(m: HttpMethod) {
		if (usedOtherMethods.has(m)) return;
		updateNodeData(id, { method: m });
		isMethodDropdownOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			isMethodDropdownOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	bind:this={nodeRootEl}
	data-dropdown-open={isMethodDropdownOpen}
	class="w-84 rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10'
		: 'border-slate-800 hover:border-slate-700'}"
>
	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing" />
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
				<Globe class="h-3.5 w-3.5" />
			</div>
			<span class="text-xs font-semibold tracking-wide text-slate-200 uppercase">
				{triggerData.title || 'HTTP Trigger'}
			</span>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
				1 per Method
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
		<!-- Method Selection & Endpoint Path -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between text-[11px] font-medium text-slate-400">
				<span>HTTP Method & Route</span>
				<span class="text-[10px] text-slate-500 flex items-center gap-1">
					<Lock class="h-2.5 w-2.5" /> Single-Endpoint
				</span>
			</div>

			<!-- Method Selector & Locked Route Display -->
			<div class="relative flex items-center gap-2">
				<!-- Custom Method Dropdown Trigger -->
				<button
					type="button"
					class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition shadow-sm select-none {currentMeta.badgeClass} hover:brightness-110 active:scale-95"
					onclick={toggleMethodDropdown}
					data-dropdown-trigger="true"
					title="Select HTTP Method with guidelines"
				>
					<span>{currentMethod}</span>
					<ChevronDown class="h-3.5 w-3.5 transition-transform duration-200 {isMethodDropdownOpen ? 'rotate-180' : ''}" />
				</button>

				<!-- Non-editable Endpoint Route Display -->
				<div
					class="flex-1 flex items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 font-mono text-xs text-slate-300 select-none shadow-inner"
					title="This route is fixed to the Nodeflow endpoint route and cannot be changed manually."
				>
					<div class="flex items-center gap-1.5 truncate">
						<Lock class="h-3 w-3 text-slate-500 shrink-0" />
						<span class="truncate font-medium">{endpointPath}</span>
					</div>
					<span class="shrink-0 rounded bg-slate-800/80 px-1.5 py-0.2 text-[9px] font-medium text-slate-400 border border-slate-700/50">
						Fixed
					</span>
				</div>

				<!-- Custom Methods Dropdown Panel -->
				{#if isMethodDropdownOpen}
					<!-- Backdrop to dismiss -->
					<button
						type="button"
						class="fixed inset-0 z-40 cursor-default bg-transparent border-none outline-none"
						aria-label="Close method menu"
						onclick={(e) => {
							e.stopPropagation();
							isMethodDropdownOpen = false;
						}}
					></button>

					<div
						class="absolute left-0 top-full mt-1.5 z-50 w-80 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl backdrop-blur-xl p-2 space-y-1 divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto"
					>
						<div class="pb-1.5 px-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
							<span class="flex items-center gap-1">
								<Info class="h-3 w-3 text-blue-400" /> HTTP Method Guide
							</span>
							<span class="text-[10px] text-slate-500">Max 1 trigger/method</span>
						</div>

						<div class="pt-1.5 space-y-1">
							{#each methodsList as m}
								{@const info = methodDetails[m]}
								{@const isSelected = currentMethod === m}
								{@const isUsed = usedOtherMethods.has(m)}

								<button
									type="button"
									disabled={isUsed}
									class="w-full text-left rounded-lg p-2 transition flex flex-col gap-1 border {isSelected
										? `${info.activeClass} border-blue-500/40 bg-blue-500/10`
										: isUsed
											? 'opacity-40 cursor-not-allowed bg-slate-950/50 border-slate-800/40'
											: 'hover:bg-slate-800/70 border-transparent hover:border-slate-700/60'}"
									onclick={(e) => {
										e.stopPropagation();
										selectMethod(m);
									}}
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<span class="rounded px-1.5 py-0.5 text-[10px] font-bold border {info.badgeClass}">
												{m}
											</span>
											<span class="text-xs font-semibold text-slate-200">
												{info.title}
											</span>
										</div>

										{#if isSelected}
											<div class="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
												<Check class="h-3.5 w-3.5" />
												<span>Active</span>
											</div>
										{:else if isUsed}
											<span class="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-medium text-rose-400 border border-rose-500/20">
												Used in flow
											</span>
										{/if}
									</div>

									<p class="text-[10px] text-slate-400 leading-snug">
										{info.desc}
									</p>

									<div class="text-[9px] text-slate-500 font-mono">
										<span class="text-slate-400">Best for:</span> {info.bestFor}
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Explanation box for current method -->
		<div class="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-[11px] text-slate-400 space-y-1">
			<div class="flex items-center justify-between font-mono text-[10px] text-slate-500">
				<span>INBOUND CONTEXT:</span>
				<span class="text-blue-400 font-mono">req.body, query, headers</span>
			</div>
			<p class="text-slate-400 leading-relaxed text-[10.5px]">
				{currentMeta.desc}
			</p>
		</div>
	</div>

	<!-- Bottom Source Handle -->
	<div class="relative py-1">
		<Handle
			type="source"
			position={Position.Bottom}
			id="output"
			class="!h-3.5 !w-3.5 !border-2 !border-slate-900 !bg-blue-500 hover:!bg-blue-400 transition"
		/>
	</div>
</div>

<script lang="ts">
	import {
		Globe,
		Code2,
		GitFork,
		Send,
		Database,
		CheckCheck,
		Plus,
		GripVertical,
		Layers,
		Search,
		BookOpen,
		ShieldCheck,
		ListChecks,
		Clock
	} from '@lucide/svelte';
	import type { NodelyNodeType } from '../types';

	interface Props {
		onAddNode: (type: NodelyNodeType) => void;
	}

	let { onAddNode }: Props = $props();

	let searchQuery = $state('');

	const nodeItems = [
		{
			type: 'httpTrigger' as NodelyNodeType,
			title: 'HTTP Trigger',
			desc: 'API endpoint route entrypoint (GET, POST, etc.)',
			category: 'Triggers',
			icon: Globe,
			color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60'
		},
		{
			type: 'authNode' as NodelyNodeType,
			title: 'Auth Gate',
			desc: 'Verify API keys or Bearer tokens with Valid/Invalid routes',
			category: 'Security',
			icon: ShieldCheck,
			color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60'
		},
		{
			type: 'validatorNode' as NodelyNodeType,
			title: 'Schema Validator',
			desc: 'Check required payload fields and reject malformed requests',
			category: 'Validation',
			icon: ListChecks,
			color: 'text-teal-400 bg-teal-500/10 border-teal-500/30 hover:border-teal-500/60'
		},
		{
			type: 'codeBlock' as NodelyNodeType,
			title: 'Code Block',
			desc: 'Execute custom JS/TS to transform payload or compute logic',
			category: 'Logic',
			icon: Code2,
			color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60'
		},
		{
			type: 'conditional' as NodelyNodeType,
			title: 'Conditional Branch',
			desc: 'Route execution to TRUE or FALSE paths based on rules',
			category: 'Logic',
			icon: GitFork,
			color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
		},
		{
			type: 'delayNode' as NodelyNodeType,
			title: 'Delay / Sleep',
			desc: 'Pause pipeline execution asynchronously (rate limit / pacing)',
			category: 'Utilities',
			icon: Clock,
			color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/60'
		},
		{
			type: 'fetchNode' as NodelyNodeType,
			title: 'External API Fetch',
			desc: 'Call 3rd-party REST APIs and pass responses downstream',
			category: 'Integrations',
			icon: Send,
			color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/60'
		},
		{
			type: 'dataStore' as NodelyNodeType,
			title: 'Data Store (KV/DB)',
			desc: 'Persist, retrieve, or list items in simulated storage',
			category: 'Storage',
			icon: Database,
			color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
		},
		{
			type: 'httpResponse' as NodelyNodeType,
			title: 'HTTP Response',
			desc: 'Send status code & response payload back to client',
			category: 'Outputs',
			icon: CheckCheck,
			color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60'
		}
	];

	const filteredItems = $derived(
		nodeItems.filter(
			(item) =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.desc.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function onDragStart(event: DragEvent, type: NodelyNodeType) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('application/nodely-node', type);
			event.dataTransfer.effectAllowed = 'move';
		}
	}
</script>

<aside
	class="flex h-full w-80 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl select-none"
>
	<!-- Header -->
	<div class="border-b border-slate-800 p-4">
		<div class="flex items-center gap-2 text-slate-200">
			<Layers class="h-4 w-4 text-blue-400" />
			<span class="text-sm font-semibold tracking-wide">Node Library</span>
		</div>
		<p class="mt-1 text-xs text-slate-400">
			Drag nodes into canvas or click + to add
		</p>

		<!-- Search -->
		<div class="relative mt-3">
			<Search class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
			<input
				type="text"
				placeholder="Search nodes..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Node Cards List -->
	<div class="flex-1 overflow-y-auto p-3 space-y-2.5">
		{#each filteredItems as item}
			{@const IconComponent = item.icon}
			<div
				role="button"
				tabindex="0"
				draggable="true"
				ondragstart={(e) => onDragStart(e, item.type)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onAddNode(item.type);
					}
				}}
				class="drag-handle group relative flex items-start gap-3 rounded-xl border p-3 shadow-sm transition-all duration-150 hover:shadow-md cursor-grab active:cursor-grabbing {item.color} bg-slate-900/40 text-left"
			>
				<div class="flex flex-col items-center pt-0.5 text-slate-500 group-hover:text-slate-300">
					<GripVertical class="h-4 w-4" />
				</div>

				<div class="flex-1">
					<div class="flex items-center gap-2">
						<div class="flex h-5 w-5 items-center justify-center rounded">
							<IconComponent class="h-4 w-4" />
						</div>
						<span class="text-xs font-semibold text-slate-100">{item.title}</span>
					</div>
					<p class="mt-1 text-[11px] leading-relaxed text-slate-400">{item.desc}</p>
				</div>

				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						onAddNode(item.type);
					}}
					class="opacity-0 group-hover:opacity-100 rounded-md p-1 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition shadow"
					title="Click to add node to canvas"
				>
					<Plus class="h-3.5 w-3.5" />
				</button>
			</div>
		{/each}

		{#if filteredItems.length === 0}
			<div class="py-8 text-center text-xs text-slate-500">
				No nodes matching "{searchQuery}"
			</div>
		{/if}
	</div>

	<!-- Tips Footer -->
	<div class="border-t border-slate-800 p-3 bg-slate-900/30">
		<div class="flex items-center gap-2 text-[11px] text-slate-400">
			<BookOpen class="h-3.5 w-3.5 text-blue-400" />
			<span>Connect handles to form your API pipeline</span>
		</div>
	</div>
</aside>

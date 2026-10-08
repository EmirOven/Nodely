<script lang="ts">
	import { Handle, Position, useSvelteFlow } from '@xyflow/svelte';
	import { GripVertical, Trash2 } from '@lucide/svelte';
	import type { Component, Snippet } from 'svelte';

	export interface OutputHandleConfig {
		id: string;
		label?: string;
		color?: 'emerald' | 'rose' | 'blue' | 'amber' | 'purple' | 'cyan' | 'teal' | 'indigo' | 'yellow' | string;
		position?: Position;
		class?: string;
	}

	export type AccentColor =
		| 'blue'
		| 'emerald'
		| 'indigo'
		| 'purple'
		| 'amber'
		| 'rose'
		| 'teal'
		| 'cyan'
		| 'yellow'
		| 'slate';

	interface Props {
		id: string;
		selected?: boolean;
		title?: string;
		editableTitle?: boolean;
		onTitleChange?: (title: string) => void;
		subtitle?: string;
		badge?: string;
		badgeClass?: string;
		accentColor?: AccentColor;
		icon?: Component<any> | any;
		iconClass?: string;
		width?: string;
		deletable?: boolean;
		onDelete?: () => void;
		isExecuting?: boolean;
		error?: string | null;
		dataDropdownOpen?: boolean;

		// Input handle
		hasInputHandle?: boolean;
		inputHandleId?: string;
		inputHandlePosition?: Position;
		inputHandleClass?: string;

		// Output handle(s)
		hasOutputHandle?: boolean;
		outputHandleId?: string;
		outputHandlePosition?: Position;
		outputHandleClass?: string;
		outputs?: OutputHandleConfig[];

		// Snippets
		children?: Snippet;
		headerActions?: Snippet;
		headerBadge?: Snippet;
		customHandles?: Snippet;
		footer?: Snippet;
	}

	let {
		id,
		selected = false,
		title = 'Node',
		editableTitle = true,
		onTitleChange,
		subtitle = '',
		badge,
		badgeClass,
		accentColor = 'blue',
		icon: IconComponent,
		iconClass = '',
		width = 'w-80',
		deletable = true,
		onDelete,
		isExecuting = false,
		error = null,
		dataDropdownOpen = false,

		hasInputHandle = true,
		inputHandleId = 'input',
		inputHandlePosition = Position.Top,
		inputHandleClass = '',

		hasOutputHandle = true,
		outputHandleId = 'output',
		outputHandlePosition = Position.Bottom,
		outputHandleClass = '',
		outputs,

		children,
		headerActions,
		headerBadge,
		customHandles,
		footer
	}: Props = $props();

	const { deleteElements, updateNodeData, updateNode } = useSvelteFlow();

	const accentThemes: Record<
		AccentColor,
		{
			border: string;
			selectedBorder: string;
			iconBg: string;
			iconColor: string;
			handleBg: string;
			badgeBg: string;
		}
	> = {
		blue: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-blue-500 ring-2 ring-blue-500/30 shadow-blue-500/10',
			iconBg: 'bg-blue-500/20',
			iconColor: 'text-blue-400',
			handleBg: '!bg-blue-500 hover:!bg-blue-400',
			badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
		},
		emerald: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-emerald-500/10',
			iconBg: 'bg-emerald-500/20',
			iconColor: 'text-emerald-400',
			handleBg: '!bg-emerald-500 hover:!bg-emerald-400',
			badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
		},
		indigo: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-500/10',
			iconBg: 'bg-indigo-500/20',
			iconColor: 'text-indigo-400',
			handleBg: '!bg-indigo-500 hover:!bg-indigo-400',
			badgeBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
		},
		purple: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-purple-500 ring-2 ring-purple-500/30 shadow-purple-500/10',
			iconBg: 'bg-purple-500/20',
			iconColor: 'text-purple-400',
			handleBg: '!bg-purple-500 hover:!bg-purple-400',
			badgeBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
		},
		amber: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10',
			iconBg: 'bg-amber-500/20',
			iconColor: 'text-amber-400',
			handleBg: '!bg-amber-500 hover:!bg-amber-400',
			badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
		},
		rose: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/10',
			iconBg: 'bg-rose-500/20',
			iconColor: 'text-rose-400',
			handleBg: '!bg-rose-500 hover:!bg-rose-400',
			badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
		},
		teal: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-teal-500 ring-2 ring-teal-500/30 shadow-teal-500/10',
			iconBg: 'bg-teal-500/20',
			iconColor: 'text-teal-400',
			handleBg: '!bg-teal-500 hover:!bg-teal-400',
			badgeBg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
		},
		cyan: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-cyan-500/10',
			iconBg: 'bg-cyan-500/20',
			iconColor: 'text-cyan-400',
			handleBg: '!bg-cyan-500 hover:!bg-cyan-400',
			badgeBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
		},
		yellow: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-yellow-400 ring-2 ring-yellow-400/30 shadow-yellow-400/10',
			iconBg: 'bg-yellow-400/20',
			iconColor: 'text-yellow-400',
			handleBg: '!bg-yellow-400 hover:!bg-yellow-300',
			badgeBg: 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
		},
		slate: {
			border: 'border-slate-800 hover:border-slate-700',
			selectedBorder: 'border-slate-400 ring-2 ring-slate-400/30 shadow-slate-400/10',
			iconBg: 'bg-slate-700/40',
			iconColor: 'text-slate-300',
			handleBg: '!bg-slate-400 hover:!bg-slate-300',
			badgeBg: 'bg-slate-800 text-slate-300 border border-slate-700'
		}
	};

	const theme = $derived(accentThemes[accentColor] || accentThemes.blue);

	function getHandleColorClass(color?: string): string {
		switch (color) {
			case 'emerald':
				return '!bg-emerald-500 hover:!bg-emerald-400';
			case 'rose':
				return '!bg-rose-500 hover:!bg-rose-400';
			case 'blue':
				return '!bg-blue-500 hover:!bg-blue-400';
			case 'amber':
				return '!bg-amber-500 hover:!bg-amber-400';
			case 'purple':
				return '!bg-purple-500 hover:!bg-purple-400';
			case 'teal':
				return '!bg-teal-500 hover:!bg-teal-400';
			case 'cyan':
				return '!bg-cyan-500 hover:!bg-cyan-400';
			case 'yellow':
				return '!bg-yellow-400 hover:!bg-yellow-300';
			case 'indigo':
				return '!bg-indigo-500 hover:!bg-indigo-400';
			default:
				return theme.handleBg;
		}
	}

	function handleDelete() {
		if (onDelete) {
			onDelete();
		} else {
			deleteElements({ nodes: [{ id }] });
		}
	}

	function handleTitleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (onTitleChange) {
			onTitleChange(target.value);
		} else {
			updateNodeData(id, { title: target.value });
		}
	}

	let nodeRootEl = $state<HTMLElement | null>(null);

	export function pullFocus() {
		try {
			updateNode(id, { selected: true });
		} catch {}
		const nodeEl = nodeRootEl?.closest<HTMLElement>('.svelte-flow__node');
		if (nodeEl) {
			nodeEl.focus?.();
			nodeEl.style.zIndex = '1000';
		}
	}

	$effect(() => {
		if (nodeRootEl) {
			const nodeEl = nodeRootEl.closest<HTMLElement>('.svelte-flow__node');
			if (nodeEl) {
				if (dataDropdownOpen) {
					nodeEl.style.zIndex = '1000';
				} else if (!selected) {
					nodeEl.style.zIndex = '';
				}
			}
		}
	});
</script>

<div
	bind:this={nodeRootEl}
	data-dropdown-open={dataDropdownOpen}
	class="{width} rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-all duration-200 {selected
		? theme.selectedBorder
		: theme.border} {isExecuting ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20' : ''}"
	onpointerdown={pullFocus}
	onfocusin={pullFocus}
	role="group"
	aria-label="{title} node"
>
	<!-- Top Target Handle -->
	{#if hasInputHandle}
		<div class="relative py-0.5">
			<Handle
				type="target"
				position={inputHandlePosition}
				id={inputHandleId}
				class="!h-3.5 !w-3.5 !border-2 !border-slate-900 {inputHandleClass || theme.handleBg} transition"
			/>
		</div>
	{/if}

	<!-- Header / Drag Handle -->
	<div
		class="drag-handle flex items-center justify-between border-b border-slate-800/80 bg-slate-800/50 px-3 py-2.5 rounded-t-xl"
	>
		<div class="flex items-center gap-2 flex-1 min-w-0 mr-2">
			<GripVertical class="h-4 w-4 text-slate-500 cursor-grab active:cursor-grabbing shrink-0" />
			{#if IconComponent}
				<div class="flex h-6 w-6 items-center justify-center rounded-md {theme.iconBg} {theme.iconColor} shrink-0 {iconClass}">
					<IconComponent class="h-3.5 w-3.5" />
				</div>
			{/if}
			{#if editableTitle}
				<input
					type="text"
					aria-label="Node title"
					class="bg-transparent text-xs font-semibold tracking-wide text-slate-200 uppercase outline-none focus:border-b focus:border-blue-400 truncate flex-1 min-w-0"
					value={title}
					oninput={handleTitleInput}
				/>
			{:else}
				<span class="text-xs font-semibold tracking-wide text-slate-200 uppercase truncate">
					{title}
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-1.5 shrink-0">
			{#if headerBadge}
				{@render headerBadge()}
			{:else if badge}
				<span class="rounded px-1.5 py-0.5 text-[10px] font-medium {badgeClass || theme.badgeBg}">
					{badge}
				</span>
			{/if}

			{#if headerActions}
				{@render headerActions()}
			{/if}

			{#if deletable}
				<button
					type="button"
					class="rounded p-1 text-slate-400 hover:bg-slate-700/60 hover:text-rose-400 transition"
					onclick={handleDelete}
					title="Delete Node"
				>
					<Trash2 class="h-3.5 w-3.5" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Error Alert Banner (if node has error) -->
	{#if error}
		<div class="mx-3 mt-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[11px] font-mono text-rose-300">
			{error}
		</div>
	{/if}

	<!-- Node Body Content -->
	<div class="p-3 space-y-2.5">
		{@render children?.()}
	</div>

	<!-- Footer Snippet (if provided) -->
	{#if footer}
		{@render footer()}
	{/if}

	<!-- Handles Section -->
	{#if customHandles}
		{@render customHandles()}
	{:else if outputs && outputs.length > 0}
		<!-- Multi-Output Handles Container -->
		<div class="relative flex justify-between px-6 pb-2.5 border-t border-slate-800/60 pt-2 bg-slate-950/40 rounded-b-xl">
			{#each outputs as out}
				<div class="flex flex-col items-center">
					<Handle
						type="source"
						position={out.position || Position.Bottom}
						id={out.id}
						class="!static !transform-none !h-3.5 !w-3.5 !border-2 !border-slate-900 {out.class || getHandleColorClass(out.color)} transition"
					/>
					{#if out.label}
						<span class="text-[9px] font-bold mt-1 {out.color === 'rose' ? 'text-rose-400' : out.color === 'emerald' ? 'text-emerald-400' : 'text-slate-400'}">
							{out.label}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	{:else if hasOutputHandle}
		<!-- Default Bottom Single Handle -->
		<div class="relative pb-2">
			<Handle
				type="source"
				position={outputHandlePosition}
				id={outputHandleId}
				class="!h-3.5 !w-3.5 !border-2 !border-slate-900 {outputHandleClass || theme.handleBg} transition"
			/>
		</div>
	{/if}
</div>

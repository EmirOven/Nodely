<script lang="ts">
	import {
		Play,
		Code2,
		FolderOpen,
		RotateCcw,
		Radio,
		ChevronDown,
		FileText,
		Globe,
		ArrowLeft,
		Save,
		CheckCircle2,
		Users,
		Settings,
		Blocks
	} from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	interface Props {
		onOpenTest: () => void;
		onOpenExport: () => void;
		onOpenPublish: () => void;
		onSelectTemplate: (templateName: string) => void;
		onResetFlow: () => void;
		onSave?: () => void;
		isPublishing?: boolean;
		isSaving?: boolean;
		isAutosave?: boolean;
		onToggleAutosave?: (val: boolean) => void;
		routeId?: string;
		routeTitle?: string;
		routeMethod?: string;
		routePath?: string;
		isRoutePublished?: boolean;
	}

	let {
		onOpenTest,
		onOpenExport,
		onOpenPublish,
		onSelectTemplate,
		onResetFlow,
		onSave,
		isPublishing = false,
		isSaving = false,
		isAutosave = false,
		onToggleAutosave,
		routeId,
		routeTitle,
		routeMethod = 'GET',
		routePath = '/api/endpoint',
		isRoutePublished = false
	}: Props = $props();

	let showTemplatesMenu = $state(false);

	const templates = [
		{ id: 'user-auth', name: 'User Registration & Validation', desc: 'POST endpoint with condition checks & DB persist' },
		{ id: 'telegram-bot', name: 'AI Telegram Bot Pipeline', desc: 'Telegram Webhook -> AI LLM Brain -> Telegram Reply' },
		{ id: 'weather-api', name: 'Weather Data Aggregator', desc: 'GET endpoint with external fetch & data transform' },
		{ id: 'note-crud', name: 'Note Storage & List', desc: 'CRUD operations on collections' },
		{ id: 'empty', name: 'Simple Hello API (Starter)', desc: 'Clean single Trigger -> Response pipeline' },
		{ id: 'blank', name: 'Completely Blank Canvas', desc: 'Empty workspace with 0 nodes' }
	];

	function getMethodBadgeClass(m: string): string {
		switch (m.toUpperCase()) {
			case 'GET':
				return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
			case 'POST':
				return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
			case 'PUT':
				return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
			case 'DELETE':
				return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
			default:
				return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
		}
	}
</script>

<header
	class="flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-xl z-20 select-none"
>
	<!-- Left: Brand & Route Navigation -->
	<div class="flex items-center gap-3">
		<div class="flex items-center gap-1 border-r border-slate-800 pr-2.5">
			<a
				href="/"
				class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition group"
				title="Back to All Nodeflows"
			>
				<ArrowLeft class="h-3.5 w-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
				<span>Nodeflows</span>
			</a>
			<a
				href="/users"
				class="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 px-2 py-1 text-xs font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition"
				title="Project Users Directory"
			>
				<Users class="h-3.5 w-3.5 text-slate-400" />
				<span class="hidden sm:inline">Users</span>
			</a>
			<a
				href="/extensions"
				class="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 px-2 py-1 text-xs font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition"
				title="Nodeflow Extensions & Plugins"
			>
				<Blocks class="h-3.5 w-3.5 text-slate-400" />
				<span class="hidden sm:inline">Extensions</span>
			</a>
			<a
				href="/settings"
				class="flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 px-2 py-1 text-xs font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition"
				title="Nodeflow Settings & Secrets"
			>
				<Settings class="h-3.5 w-3.5 text-slate-400" />
				<span class="hidden sm:inline">Settings</span>
			</a>
		</div>

		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-sm font-bold tracking-tight text-white">{routeTitle || 'Nodeflow'}</h1>
				<span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
					v0.5.4
				</span>
			</div>
			<div class="flex items-center gap-1.5 text-[11px] text-slate-400">
				<span class="rounded px-1.5 py-0.2 font-mono text-[9px] font-bold border {getMethodBadgeClass(routeMethod)}">
					{routeMethod}
				</span>
				<span class="font-mono text-slate-300">{routePath}</span>
				{#if isRoutePublished}
					<span class="flex items-center gap-1 text-[10px] text-emerald-400">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
						Live
					</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Center / Actions -->
	<div class="flex items-center gap-2">
		<!-- Templates Dropdown -->
		<div class="relative">
			<button
				type="button"
				onclick={() => (showTemplatesMenu = !showTemplatesMenu)}
				class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
			>
				<FolderOpen class="h-3.5 w-3.5 text-blue-400" />
				<span>Templates</span>
				<ChevronDown class="h-3 w-3 text-slate-500" />
			</button>

			{#if showTemplatesMenu}
				<!-- Backdrop to close -->
				<div
					class="fixed inset-0 z-40"
					onclick={() => (showTemplatesMenu = false)}
					role="presentation"
				></div>

				<div
					class="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl z-50 p-1.5 space-y-1"
				>
					<div class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
						Starter Templates
					</div>
					{#each templates as t}
						<button
							type="button"
							onclick={() => {
								onSelectTemplate(t.id);
								showTemplatesMenu = false;
							}}
							class="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-900 transition flex flex-col gap-0.5"
						>
							<div class="flex items-center justify-between">
								<span class="font-semibold text-slate-200">{t.name}</span>
								{#if t.id === 'empty' || t.id === 'blank'}
									<span class="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-400">Empty</span>
								{/if}
							</div>
							<span class="text-[10px] text-slate-500">{t.desc}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Reset Canvas -->
		<button
			type="button"
			onclick={onResetFlow}
			class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
			title="Reset canvas"
		>
			<RotateCcw class="h-3.5 w-3.5" />
			<span>Reset</span>
		</button>
	</div>

	<!-- Right Actions -->
	<div class="flex items-center gap-2.5">
		<!-- Autosave Option & Save Route -->
		{#if onSave}
			<div class="flex items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/60 p-0.5 shadow-inner">
				<!-- Autosave Toggle Button -->
				<button
					type="button"
					onclick={() => onToggleAutosave?.(!isAutosave)}
					class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition select-none {isAutosave
						? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
						: 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800/60'}"
					title={isAutosave ? 'Autosave is active. Changes are automatically saved.' : 'Enable Autosave to save changes automatically.'}
				>
					<!-- Mini switch track -->
					<div class="relative h-3.5 w-6 rounded-full transition-colors duration-200 {isAutosave ? 'bg-blue-600' : 'bg-slate-700'}">
						<div
							class="absolute top-0.5 left-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform duration-200 {isAutosave
								? 'translate-x-2.5'
								: 'translate-x-0'}"
						></div>
					</div>
					<span class="text-[11px] font-semibold">Autosave</span>
					{#if isAutosave}
						{#if isSaving}
							<span class="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" title="Saving changes..."></span>
						{:else}
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-400" title="All changes saved"></span>
						{/if}
					{/if}
				</button>

				<!-- Save Button: hides with horizontal slide animation when Autosave is active, and vice versa -->
				{#if !isAutosave}
					<div
						transition:slide={{ axis: 'x', duration: 250 }}
						class="overflow-hidden flex items-center"
					>
						<button
							type="button"
							onclick={onSave}
							disabled={isSaving}
							class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-sm"
							title="Save current Nodeflow project"
						>
							{#if isSaving}
								<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"></span>
								<span>Saving...</span>
							{:else}
								<Save class="h-3.5 w-3.5 text-blue-400" />
								<span>Save</span>
							{/if}
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Export Code -->
		<button
			type="button"
			onclick={onOpenExport}
			class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
		>
			<Code2 class="h-3.5 w-3.5 text-indigo-400" />
			<span>Export Code</span>
		</button>

		<!-- Test API (Simulator) -->
		<button
			type="button"
			onclick={onOpenTest}
			class="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition active:scale-95"
		>
			<Play class="h-3.5 w-3.5 fill-current" />
			<span>Test API</span>
		</button>

		<!-- Publish Live API -->
		<button
			type="button"
			onclick={onOpenPublish}
			disabled={isPublishing}
			class="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
		>
			{#if isPublishing}
				<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
				<span>Publishing...</span>
			{:else}
				<Radio class="h-3.5 w-3.5 animate-pulse" />
				<span>Publish API</span>
			{/if}
		</button>
	</div>
</header>

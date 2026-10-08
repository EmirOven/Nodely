<script lang="ts">
	import {
		Network,
		Play,
		Code2,
		FolderOpen,
		RotateCcw,
		Sparkles,
		ChevronDown
	} from '@lucide/svelte';

	interface Props {
		onOpenTest: () => void;
		onOpenExport: () => void;
		onSelectTemplate: (templateName: string) => void;
		onResetFlow: () => void;
	}

	let { onOpenTest, onOpenExport, onSelectTemplate, onResetFlow }: Props = $props();

	let showTemplatesMenu = $state(false);

	const templates = [
		{ id: 'user-auth', name: 'User Registration & Validation', desc: 'POST endpoint with condition checks & DB persist' },
		{ id: 'weather-api', name: 'Weather Data Aggregator', desc: 'GET endpoint with external fetch & data transform' },
		{ id: 'note-crud', name: 'Note Storage & List', desc: 'CRUD operations on collections' }
	];
</script>

<header
	class="flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-xl z-20 select-none"
>
	<!-- Left: Brand -->
	<div class="flex items-center gap-3">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 text-white"
		>
			<Network class="h-5 w-5" />
		</div>

		<div>
			<div class="flex items-center gap-2">
				<h1 class="text-base font-bold tracking-tight text-white">Nodely</h1>
				<span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
					v0.1 Svelte 5
				</span>
			</div>
			<p class="text-[11px] text-slate-400">Drag & Drop API Visual Builder</p>
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
							<span class="font-semibold text-slate-200">{t.name}</span>
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
		<!-- Export Code -->
		<button
			type="button"
			onclick={onOpenExport}
			class="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
		>
			<Code2 class="h-3.5 w-3.5 text-indigo-400" />
			<span>Export Code</span>
		</button>

		<!-- Test API -->
		<button
			type="button"
			onclick={onOpenTest}
			class="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 transition active:scale-95"
		>
			<Play class="h-3.5 w-3.5 fill-current" />
			<span>Test API</span>
		</button>
	</div>
</header>

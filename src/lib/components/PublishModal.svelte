<script lang="ts">
	import {
		X,
		Globe,
		Copy,
		Check,
		ExternalLink,
		Terminal,
		Trash2,
		Radio,
		Layers,
		CheckCircle2
	} from '@lucide/svelte';

	interface PublishedInfo {
		id: string;
		title: string;
		method: string;
		path: string;
		publishedAt: string;
		nodeCount: number;
	}

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		currentEndpoint: {
			method: string;
			path: string;
			title: string;
		};
		onRefreshList?: () => void;
	}

	let { isOpen, onClose, currentEndpoint }: Props = $props();

	let fullUrl = $state('');
	let copiedUrl = $state(false);
	let copiedCurl = $state(false);
	let publishedList = $state<PublishedInfo[]>([]);
	let isLoadingList = $state(false);

	$effect(() => {
		if (typeof window !== 'undefined' && isOpen) {
			const cleanPath = currentEndpoint.path.startsWith('/')
				? currentEndpoint.path
				: '/' + currentEndpoint.path;
			fullUrl = `${window.location.origin}${cleanPath}`;
			fetchPublishedList();
		}
	});

	async function fetchPublishedList() {
		isLoadingList = true;
		try {
			const res = await fetch('/api/publish');
			if (res.ok) {
				const data = await res.json();
				publishedList = data.endpoints || [];
			}
		} catch {
			// ignore
		} finally {
			isLoadingList = false;
		}
	}

	async function unpublish(method: string, path: string) {
		try {
			await fetch('/api/publish', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ method, path })
			});
			await fetchPublishedList();
		} catch {
			// ignore
		}
	}

	function copyUrl() {
		navigator.clipboard.writeText(fullUrl);
		copiedUrl = true;
		setTimeout(() => (copiedUrl = false), 2000);
	}

	function copyCurl() {
		const curlCmd = `curl -X ${currentEndpoint.method} "${fullUrl}"`;
		navigator.clipboard.writeText(curlCmd);
		copiedCurl = true;
		setTimeout(() => (copiedCurl = false), 2000);
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
		<div
			class="flex flex-col w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/40">
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
						<Radio class="h-5 w-5 animate-pulse" />
					</div>
					<div>
						<h3 class="text-sm font-semibold text-slate-100">API Published & Live</h3>
						<p class="text-xs text-slate-400">Endpoint is actively hosted on this server</p>
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

			<!-- Main Content -->
			<div class="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
				<!-- Live URL Box -->
				<div class="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span
								class="rounded px-2 py-0.5 text-xs font-bold font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
							>
								{currentEndpoint.method}
							</span>
							<span class="text-xs font-semibold text-emerald-300">Live Production Endpoint</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="relative flex h-2 w-2">
								<span
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
								></span>
								<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							<span class="text-[11px] font-mono text-emerald-400">Online</span>
						</div>
					</div>

					<div class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2 font-mono text-xs text-slate-200">
						<Globe class="h-4 w-4 text-emerald-400 shrink-0 ml-1" />
						<span class="flex-1 overflow-x-auto whitespace-nowrap text-emerald-300 select-all">
							{fullUrl}
						</span>
						<button
							type="button"
							onclick={copyUrl}
							class="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition"
						>
							{#if copiedUrl}
								<Check class="h-3 w-3 text-emerald-400" />
								<span class="text-emerald-400">Copied</span>
							{:else}
								<Copy class="h-3 w-3" />
								<span>Copy</span>
							{/if}
						</button>

						<a
							href={fullUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-500 transition"
							title="Open endpoint in new tab"
						>
							<ExternalLink class="h-3 w-3" />
							<span>Open</span>
						</a>
					</div>
				</div>

				<!-- Quick Test with cURL -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-xs text-slate-400">
						<span class="flex items-center gap-1.5">
							<Terminal class="h-3.5 w-3.5 text-blue-400" /> Test via Terminal
						</span>
						<button
							type="button"
							onclick={copyCurl}
							class="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
						>
							{#if copiedCurl}
								<Check class="h-3 w-3 text-emerald-400" />
								<span class="text-emerald-400">Copied cURL</span>
							{:else}
								<Copy class="h-3 w-3" />
								<span>Copy cURL Command</span>
							{/if}
						</button>
					</div>

					<pre
						class="rounded-xl border border-slate-800 bg-slate-900/80 p-3 font-mono text-xs text-slate-300 overflow-x-auto select-all"
					>curl -X {currentEndpoint.method} "{fullUrl}"</pre>
				</div>

				<!-- Other Active Endpoints Section -->
				<div class="space-y-2.5 pt-2 border-t border-slate-800/80">
					<div class="flex items-center justify-between text-xs text-slate-400">
						<span class="flex items-center gap-1.5">
							<Layers class="h-3.5 w-3.5 text-indigo-400" /> All Active Published Endpoints
						</span>
						<span class="text-[11px] text-slate-500 font-mono">{publishedList.length} total</span>
					</div>

					<div class="space-y-1.5 max-h-40 overflow-y-auto">
						{#each publishedList as item}
							<div
								class="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2 text-xs"
							>
								<div class="flex items-center gap-2">
									<span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-300">
										{item.method}
									</span>
									<span class="font-mono text-slate-200">{item.path}</span>
									<span class="text-[10px] text-slate-500">({item.title})</span>
								</div>

								<div class="flex items-center gap-2">
									<a
										href={item.path}
										target="_blank"
										class="text-slate-400 hover:text-emerald-400 transition"
										title="Open"
									>
										<ExternalLink class="h-3.5 w-3.5" />
									</a>
									<button
										type="button"
										onclick={() => unpublish(item.method, item.path)}
										class="text-slate-500 hover:text-rose-400 transition"
										title="Unpublish"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</button>
								</div>
							</div>
						{/each}

						{#if publishedList.length === 0}
							<div class="text-center py-2 text-xs text-slate-600">
								No other published endpoints
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex justify-end border-t border-slate-800 bg-slate-900/40 px-6 py-3">
				<button
					type="button"
					onclick={onClose}
					class="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

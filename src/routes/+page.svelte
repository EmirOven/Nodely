<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		Network,
		Plus,
		Search,
		Radio,
		Layers,
		Globe,
		Play,
		Copy,
		Check,
		Trash2,
		ExternalLink,
		RefreshCw,
		Terminal,
		ArrowRight,
		SlidersHorizontal,
		Code2,
		X,
		FileCode
	} from '@lucide/svelte';
	import { templatesData } from '../lib/templates';
	import type { ManagedRoute } from '../lib/server/routeStore';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let routes = $state<ManagedRoute[]>(data?.routes && data.routes.length > 0 ? [...data.routes] : []);
	// svelte-ignore state_referenced_locally
	let isLoading = $state(!data?.routes || data.routes.length === 0);
	let updatingRouteId = $state<string | null>(null);
	let updatingAction = $state<'publishing' | 'unpublishing' | null>(null);
	let searchQuery = $state('');
	let selectedMethod = $state<string>('ALL');
	let selectedStatus = $state<'ALL' | 'LIVE' | 'DRAFT'>('ALL');

	// Create Route Modal state
	let isCreateOpen = $state(false);
	let newTitle = $state('My Custom API');
	let newMethod = $state<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
	let newPath = $state('/api/v1/custom');
	let newDescription = $state('');
	let newTemplate = $state<string>('empty');
	let isCreating = $state(false);

	// Quick Test Modal state
	let isTestModalOpen = $state(false);
	let testRoute = $state<ManagedRoute | null>(null);
	let testRunning = $state(false);
	let testResult = $state<any>(null);
	let testStatusCode = $state<number | null>(null);

	// Delete confirmation modal state
	let isDeleteModalOpen = $state(false);
	let routeToDelete = $state<ManagedRoute | null>(null);

	// Copy feedback
	let copiedPath = $state<string | null>(null);

	async function loadRoutes() {
		isLoading = true;
		try {
			const res = await fetch('/api/routes');
			if (res.ok) {
				const resData = await res.json();
				routes = resData.routes || [];
			}
		} catch (e) {
			console.error('Failed to load routes:', e);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadRoutes();
	});

	const methodsList = ['ALL', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

	const filteredRoutes = $derived(
		routes.filter((r) => {
			const matchesSearch =
				r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(r.description || '').toLowerCase().includes(searchQuery.toLowerCase());

			const matchesMethod = selectedMethod === 'ALL' || r.method.toUpperCase() === selectedMethod;

			const matchesStatus =
				selectedStatus === 'ALL' ||
				(selectedStatus === 'LIVE' && r.isPublished) ||
				(selectedStatus === 'DRAFT' && !r.isPublished);

			return matchesSearch && matchesMethod && matchesStatus;
		})
	);

	const stats = $derived({
		total: routes.length,
		live: routes.filter((r) => r.isPublished).length,
		drafts: routes.filter((r) => !r.isPublished).length
	});

	function copyToClipboard(text: string, id: string) {
		const full = `${window.location.origin}${text}`;
		navigator.clipboard.writeText(full);
		copiedPath = id;
		setTimeout(() => {
			if (copiedPath === id) copiedPath = null;
		}, 2000);
	}

	async function togglePublish(route: ManagedRoute, event: MouseEvent) {
		event.stopPropagation();
		if (updatingRouteId) return;

		updatingRouteId = route.id;
		updatingAction = route.isPublished ? 'unpublishing' : 'publishing';

		try {
			const res = await fetch(`/api/routes/${route.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isPublished: !route.isPublished })
			});
			if (res.ok) {
				const resData = await res.json();
				routes = routes.map((r) => (r.id === route.id ? resData.route : r));
			} else {
				console.error('Failed to toggle publish status:', await res.text());
			}
		} catch (e) {
			console.error('Failed to toggle publish:', e);
		} finally {
			updatingRouteId = null;
			updatingAction = null;
		}
	}

	function confirmDelete(route: ManagedRoute, event: MouseEvent) {
		event.stopPropagation();
		routeToDelete = route;
		isDeleteModalOpen = true;
	}

	async function handleDelete() {
		if (!routeToDelete) return;
		try {
			const res = await fetch(`/api/routes/${routeToDelete.id}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				routes = routes.filter((r) => r.id !== routeToDelete?.id);
				isDeleteModalOpen = false;
				routeToDelete = null;
			}
		} catch (e) {
			console.error('Failed to delete route:', e);
		}
	}

	async function handleCreateRoute() {
		if (!newPath.trim()) return;
		isCreating = true;
		let formattedPath = newPath.trim();
		if (!formattedPath.startsWith('/')) formattedPath = '/' + formattedPath;

		let initialNodes: any[] = [];
		let initialEdges: any[] = [];

		if (newTemplate === 'blank') {
			initialNodes = [
				{
					id: 'trigger-1',
					type: 'httpTrigger',
					position: { x: 300, y: 100 },
					data: {
						title: newTitle,
						method: newMethod,
						path: formattedPath
					}
				}
			];
		} else {
			const tpl = templatesData[newTemplate] || templatesData['empty'];
			initialNodes = JSON.parse(JSON.stringify(tpl.nodes));
			initialEdges = JSON.parse(JSON.stringify(tpl.edges));

			// Update trigger node data with user's method and path
			const trigger = initialNodes.find((n) => n.type === 'httpTrigger');
			if (trigger && trigger.data) {
				trigger.data.title = newTitle;
				trigger.data.method = newMethod;
				trigger.data.path = formattedPath;
			}
		}

		const routeId = `route_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

		try {
			const res = await fetch('/api/routes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: routeId,
					title: newTitle,
					description: newDescription,
					method: newMethod,
					path: formattedPath,
					nodes: initialNodes,
					edges: initialEdges,
					isPublished: false
				})
			});

			if (res.ok) {
				isCreateOpen = false;
				goto(`/editor/${routeId}`);
			}
		} catch (e) {
			console.error('Failed to create route:', e);
		} finally {
			isCreating = false;
		}
	}

	function openTestModal(route: ManagedRoute, event: MouseEvent) {
		event.stopPropagation();
		testRoute = route;
		testResult = null;
		testStatusCode = null;
		isTestModalOpen = true;
	}

	async function runQuickTest() {
		if (!testRoute) return;
		testRunning = true;
		testResult = null;
		testStatusCode = null;

		try {
			const fullUrl = `${window.location.origin}${testRoute.path}`;
			const res = await fetch(fullUrl, {
				method: testRoute.method,
				headers: { 'Content-Type': 'application/json' },
				body: testRoute.method !== 'GET' ? JSON.stringify({ test: true }) : undefined
			});
			testStatusCode = res.status;
			const json = await res.json().catch(() => ({ text: res.statusText }));
			testResult = json;
		} catch (e: any) {
			testStatusCode = 500;
			testResult = { error: e.message || 'Request failed' };
		} finally {
			testRunning = false;
		}
	}

	function getMethodBadgeClass(m: string): string {
		switch (m.toUpperCase()) {
			case 'GET':
				return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
			case 'POST':
				return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
			case 'PUT':
				return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
			case 'DELETE':
				return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
			default:
				return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
		}
	}

	function getNodeSummary(nodes: any[]): string[] {
		const types: string[] = [];
		for (const n of nodes) {
			const label =
				n.type === 'httpTrigger'
					? 'Trigger'
					: n.type === 'codeBlock'
						? 'Code'
						: n.type === 'conditional'
							? 'Condition'
							: n.type === 'fetchNode'
								? 'Fetch'
								: n.type === 'dataStore'
									? 'DB'
									: n.type === 'authNode'
										? 'Auth'
										: n.type === 'validatorNode'
											? 'Validator'
											: n.type === 'delayNode'
												? 'Delay'
												: n.type === 'httpResponse'
													? 'Response'
													: 'Node';
			if (!types.includes(label)) types.push(label);
		}
		return types;
	}
</script>

<svelte:head>
	<title>Nodeflow — Visual Nodeflow Builder & Engine</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
	<!-- Top Navigation -->
	<header
		class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-xl"
	>
		<!-- Left: Brand -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 text-white"
			>
				<Network class="h-5 w-5" />
			</div>

			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-lg font-bold tracking-tight text-white">Nodeflow</h1>
					<span
						class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20"
					>
						v0.5.3
					</span>
				</div>
				<p class="text-xs text-slate-400">Visual Nodeflow Builder & Engine</p>
			</div>
		</div>

		<!-- Center: Navigation Tabs -->
		<div class="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
			<a href="/" class="px-3 py-1 text-xs font-semibold text-white bg-slate-800 rounded-lg shadow-sm">
				Nodeflows
			</a>
			<a href="/users" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Project Users
			</a>
			<a href="/extensions" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Extensions
			</a>
			<a href="/settings" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Settings
			</a>
		</div>

		<!-- Right: Action Buttons -->
		<div class="flex items-center gap-3">
			{#if isLoading && routes.length > 0}
				<div class="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400 border border-blue-500/20 animate-pulse">
					<RefreshCw class="h-3 w-3 animate-spin" />
					<span>Syncing...</span>
				</div>
			{/if}

			<button
				type="button"
				onclick={loadRoutes}
				class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
				title="Refresh Nodeflows list"
			>
				<RefreshCw class="h-3.5 w-3.5 {isLoading ? 'animate-spin' : ''}" />
				<span>Refresh</span>
			</button>

			<button
				type="button"
				onclick={() => {
					newTitle = 'New Nodeflow';
					newMethod = 'GET';
					newPath = `/api/v1/flow-${Date.now().toString(36).substring(2, 6)}`;
					newDescription = '';
					newTemplate = 'empty';
					isCreateOpen = true;
				}}
				class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
			>
				<Plus class="h-4 w-4" />
				<span>Create New Nodeflow</span>
			</button>
		</div>
	</header>

	<!-- Main Content Container -->
	<main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
		<!-- Hero / Stats Bar -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-slate-400 text-xs font-medium">
					<span>Total Nodeflows</span>
					<Layers class="h-4 w-4 text-blue-400" />
				</div>
				<div class="mt-2 text-2xl font-bold text-white">{stats.total}</div>
				<p class="mt-1 text-[11px] text-slate-500">Visual node-based pipelines</p>
			</div>

			<div class="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-emerald-400 text-xs font-medium">
					<span>Live Nodeflows</span>
					<Radio class="h-4 w-4 text-emerald-400 animate-pulse" />
				</div>
				<div class="mt-2 text-2xl font-bold text-emerald-400">{stats.live}</div>
				<p class="mt-1 text-[11px] text-emerald-500/80">Publicly accessible via /api/...</p>
			</div>

			<div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-slate-400 text-xs font-medium">
					<span>Draft Nodeflows</span>
					<FileCode class="h-4 w-4 text-amber-400" />
				</div>
				<div class="mt-2 text-2xl font-bold text-amber-400">{stats.drafts}</div>
				<p class="mt-1 text-[11px] text-slate-500">Unpublished or starter blueprints</p>
			</div>

			<div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur">
				<div class="flex items-center justify-between text-slate-400 text-xs font-medium">
					<span>Self-Hosted Gateway</span>
					<Globe class="h-4 w-4 text-purple-400" />
				</div>
				<div class="mt-2 text-xs font-mono font-semibold text-purple-300 truncate">
					localhost:5173/api/...
				</div>
				<p class="mt-1 text-[11px] text-slate-500">Direct HTTP JSON execution</p>
			</div>
		</div>

		<!-- Filter & Search Controls -->
		<div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
			<!-- Search input -->
			<div class="relative flex-1 max-w-md">
				<Search class="absolute left-3 top-3 h-4 w-4 text-slate-500" />
				<input
					type="text"
					placeholder="Search Nodeflows by path, title, or description..."
					bind:value={searchQuery}
					class="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none transition"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-3 text-slate-500 hover:text-white"
					>
						<X class="h-3.5 w-3.5" />
					</button>
				{/if}
			</div>

			<!-- Method Filter Pills -->
			<div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900/60">
				{#each methodsList as m}
					<button
						type="button"
						onclick={() => (selectedMethod = m)}
						class="px-2.5 py-1 text-xs font-semibold rounded-lg transition {selectedMethod === m
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-400 hover:text-slate-200'}"
					>
						{m}
					</button>
				{/each}
			</div>

			<!-- Status Filter Pills -->
			<div class="flex items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900/60">
				<button
					type="button"
					onclick={() => (selectedStatus = 'ALL')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedStatus === 'ALL'
						? 'bg-slate-700 text-white'
						: 'text-slate-400 hover:text-slate-200'}"
				>
					All
				</button>
				<button
					type="button"
					onclick={() => (selectedStatus = 'LIVE')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedStatus === 'LIVE'
						? 'bg-emerald-600 text-white'
						: 'text-slate-400 hover:text-emerald-400'}"
				>
					Live Only
				</button>
				<button
					type="button"
					onclick={() => (selectedStatus = 'DRAFT')}
					class="px-2.5 py-1 text-xs font-medium rounded-lg transition {selectedStatus === 'DRAFT'
						? 'bg-amber-600 text-white'
						: 'text-slate-400 hover:text-amber-400'}"
				>
					Drafts
				</button>
			</div>
		</div>

		<!-- Routes Grid -->
		{#if filteredRoutes.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each filteredRoutes as route (route.id)}
					{@const isUpdatingThisCard = updatingRouteId === route.id}
					{@const nodeTypes = getNodeSummary(route.nodes || [])}
					<div
						class="group relative flex flex-col justify-between rounded-2xl border bg-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all duration-200 overflow-hidden {isUpdatingThisCard
							? 'border-blue-500/50 ring-2 ring-blue-500/30'
							: 'border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-2xl'}"
					>
						{#if isUpdatingThisCard}
							<!-- Isolated Per-Card Loading Overlay -->
							<div
								class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center backdrop-blur-md animate-in fade-in duration-150"
							>
								<div class="relative flex items-center justify-center mb-3">
									<span
										class="absolute inline-flex h-10 w-10 rounded-full {updatingAction === 'publishing'
											? 'bg-emerald-500/20'
											: 'bg-amber-500/20'} animate-ping opacity-75"
									></span>
									<span
										class="inline-block h-8 w-8 animate-spin rounded-full border-2 {updatingAction === 'publishing'
											? 'border-emerald-400'
											: 'border-amber-400'} border-t-transparent shadow-lg"
									></span>
								</div>

								<div class="text-sm font-bold text-white">
									{updatingAction === 'publishing' ? 'Hosting Nodeflow Live...' : 'Taking Nodeflow Down...'}
								</div>

								<div class="mt-2 inline-block max-w-[90%] truncate rounded-md bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-slate-300 border border-slate-800 shadow-inner">
									{route.path}
								</div>

								<p class="mt-2 text-[10px] text-slate-400 max-w-[85%] leading-relaxed">
									{updatingAction === 'publishing'
										? 'Registering Nodeflow on gateway & syncing state...'
										: 'De-registering Nodeflow and revoking gateway access...'}
								</p>
							</div>
						{/if}

						<!-- Top: Badges & Status -->
						<div>
							<div class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<span
										class="rounded-lg px-2.5 py-0.5 text-[11px] font-bold font-mono border {getMethodBadgeClass(
											route.method
										)}"
									>
										{route.method}
									</span>

									{#if route.isPublished}
										<span
											class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
											LIVE
										</span>
									{:else}
										<span
											class="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700"
										>
											DRAFT
										</span>
									{/if}
								</div>

								<!-- Action Menu / Copy -->
								<button
									type="button"
									onclick={() => copyToClipboard(route.path, route.id)}
									disabled={isUpdatingThisCard}
									class="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-400 hover:bg-slate-800 hover:text-white transition disabled:opacity-40"
									title="Copy full endpoint URL"
								>
									{#if copiedPath === route.id}
										<Check class="h-3 w-3 text-emerald-400" />
										<span class="text-emerald-400 text-[10px]">Copied!</span>
									{:else}
										<Copy class="h-3 w-3 text-slate-400" />
										<span class="text-[10px]">Copy URL</span>
									{/if}
								</button>
							</div>

							<!-- Title & Description -->
							<div class="mt-3.5">
								<h2 class="text-base font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
									{route.title}
								</h2>
								<p class="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
									{route.description || 'Custom visual Nodeflow created in Nodeflow.'}
								</p>
							</div>

							<!-- Endpoint Path display -->
							<div class="mt-3.5 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
								<span class="font-mono text-xs text-slate-300 truncate">
									{route.path}
								</span>
							</div>

							<!-- Pipeline summary -->
							<div class="mt-4 flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
								<span class="font-semibold text-slate-300">{route.nodes?.length || 0} nodes:</span>
								{#each nodeTypes as t, idx}
									<span class="rounded bg-slate-800/80 px-1.5 py-0.5 text-slate-300 font-mono">
										{t}
									</span>
									{#if idx < nodeTypes.length - 1}
										<span class="text-slate-600">→</span>
									{/if}
								{/each}
							</div>
						</div>

						<!-- Card Bottom Actions -->
						<div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
							<div class="flex items-center gap-1.5">
								<!-- Quick Test / cURL -->
								<button
									type="button"
									onclick={(e) => openTestModal(route, e)}
									disabled={isUpdatingThisCard}
									class="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-40"
									title="Test API or view cURL"
								>
									<Terminal class="h-3.5 w-3.5 text-indigo-400" />
									<span>cURL</span>
								</button>

								<!-- Publish Toggle -->
								<button
									type="button"
									onclick={(e) => togglePublish(route, e)}
									disabled={isUpdatingThisCard}
									class="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-40 {route.isPublished
										? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/40'
										: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-emerald-400'}"
									title={route.isPublished ? 'Unpublish Nodeflow' : 'Host Nodeflow live'}
								>
									<Radio class="h-3.5 w-3.5" />
									<span>{route.isPublished ? 'Live' : 'Publish'}</span>
								</button>

								<!-- Delete button -->
								<button
									type="button"
									onclick={(e) => confirmDelete(route, e)}
									disabled={isUpdatingThisCard}
									class="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition disabled:opacity-40"
									title="Delete Nodeflow"
								>
									<Trash2 class="h-3.5 w-3.5" />
								</button>
							</div>

							<!-- Open in Visual Builder -->
							<a
								href="/editor/{route.id}"
								class="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-900/30 transition active:scale-95 {isUpdatingThisCard
									? 'pointer-events-none opacity-40'
									: ''}"
							>
								<span>Edit</span>
								<ArrowRight class="h-3.5 w-3.5" />
							</a>
						</div>
					</div>
				{/each}
			</div>
		{:else if isLoading}
			<!-- Initial Skeleton Loading Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{#each [1, 2, 3] as _}
					<div class="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 space-y-4 animate-pulse">
						<div class="flex items-center justify-between">
							<div class="h-5 w-14 bg-slate-800 rounded-lg"></div>
							<div class="h-5 w-16 bg-slate-800 rounded-full"></div>
						</div>
						<div class="space-y-2 pt-2">
							<div class="h-5 w-3/4 bg-slate-800 rounded"></div>
							<div class="h-3 w-5/6 bg-slate-800/70 rounded"></div>
						</div>
						<div class="h-8 bg-slate-950/80 rounded-xl"></div>
						<div class="pt-4 border-t border-slate-800/60 flex justify-between items-center">
							<div class="h-7 w-20 bg-slate-800 rounded-lg"></div>
							<div class="h-7 w-16 bg-slate-800 rounded-xl"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if !isLoading}
			<!-- Empty State -->
			<div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/20">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
					<Network class="h-6 w-6" />
				</div>
				<h3 class="mt-4 text-base font-bold text-slate-200">No matching Nodeflows</h3>
				<p class="mt-1 text-xs text-slate-500 max-w-sm">
					{#if searchQuery || selectedMethod !== 'ALL' || selectedStatus !== 'ALL'}
						Try clearing your filters or search keywords to view all Nodeflows.
					{:else}
						You haven't created any Nodeflows yet. Build your first pipeline visually with nodes.
					{/if}
				</p>
				<button
					type="button"
					onclick={() => {
						newTitle = 'My First Nodeflow';
						newMethod = 'GET';
						newPath = '/api/v1/hello';
						newDescription = 'Simple starter Nodeflow';
						newTemplate = 'empty';
						isCreateOpen = true;
					}}
					class="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/40"
				>
					<Plus class="h-4 w-4" />
					<span>Create Your First Nodeflow</span>
				</button>
			</div>
		{/if}
	</main>

	<!-- Create Route Modal -->
	{#if isCreateOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-100"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-100"
			>
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-2.5">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
							<Plus class="h-4 w-4" />
						</div>
						<div>
							<h3 class="text-sm font-bold text-white">Create New Nodeflow</h3>
							<p class="text-[11px] text-slate-400">Define your endpoint and pick a starter blueprint</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (isCreateOpen = false)}
						class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
					>
						<X class="h-4 w-4" />
					</button>
				</div>

				<div class="space-y-4">
					<!-- Route Title -->
					<div class="space-y-1">
						<label for="route-title" class="text-xs font-medium text-slate-300">Nodeflow Name</label>
						<input
							id="route-title"
							type="text"
							bind:value={newTitle}
							placeholder="e.g. User Profile or Stripe Webhook"
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
						/>
					</div>

					<!-- Method & Path -->
					<div class="grid grid-cols-3 gap-3">
						<div class="space-y-1">
							<label for="route-method" class="text-xs font-medium text-slate-300">HTTP Method</label>
							<select
								id="route-method"
								bind:value={newMethod}
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
							>
								<option value="GET">GET</option>
								<option value="POST">POST</option>
								<option value="PUT">PUT</option>
								<option value="DELETE">DELETE</option>
								<option value="PATCH">PATCH</option>
							</select>
						</div>

						<div class="col-span-2 space-y-1">
							<label for="route-path" class="text-xs font-medium text-slate-300">Endpoint Path</label>
							<input
								id="route-path"
								type="text"
								bind:value={newPath}
								placeholder="/api/v1/resource"
								class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
							/>
						</div>
					</div>

					<!-- Description -->
					<div class="space-y-1">
						<label for="route-desc" class="text-xs font-medium text-slate-300">Description (Optional)</label>
						<input
							id="route-desc"
							type="text"
							bind:value={newDescription}
							placeholder="Brief description of what this Nodeflow does..."
							class="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
						/>
					</div>

					<!-- Starter Blueprint -->
					<div class="space-y-1.5">
						<span class="text-xs font-medium text-slate-300 block">Starter Blueprint</span>
						<div class="grid grid-cols-2 gap-2 text-left">
							<button
								type="button"
								onclick={() => (newTemplate = 'empty')}
								class="rounded-xl border p-2.5 transition text-left {newTemplate === 'empty'
									? 'border-emerald-500 bg-emerald-500/10'
									: 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}"
							>
								<div class="text-xs font-semibold text-slate-200">Simple Starter</div>
								<div class="text-[10px] text-slate-400 mt-0.5">Trigger → JSON Response</div>
							</button>

							<button
								type="button"
								onclick={() => (newTemplate = 'user-auth')}
								class="rounded-xl border p-2.5 transition text-left {newTemplate === 'user-auth'
									? 'border-emerald-500 bg-emerald-500/10'
									: 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}"
							>
								<div class="text-xs font-semibold text-slate-200">Auth & Validation</div>
								<div class="text-[10px] text-slate-400 mt-0.5">Validation, Logic, Database</div>
							</button>

							<button
								type="button"
								onclick={() => (newTemplate = 'weather-api')}
								class="rounded-xl border p-2.5 transition text-left {newTemplate === 'weather-api'
									? 'border-emerald-500 bg-emerald-500/10'
									: 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}"
							>
								<div class="text-xs font-semibold text-slate-200">API Aggregator</div>
								<div class="text-[10px] text-slate-400 mt-0.5">Fetch External API & Map</div>
							</button>

							<button
								type="button"
								onclick={() => (newTemplate = 'blank')}
								class="rounded-xl border p-2.5 transition text-left {newTemplate === 'blank'
									? 'border-emerald-500 bg-emerald-500/10'
									: 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}"
							>
								<div class="text-xs font-semibold text-slate-200">Blank Canvas</div>
								<div class="text-[10px] text-slate-400 mt-0.5">Start completely from scratch</div>
							</button>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (isCreateOpen = false)}
						class="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleCreateRoute}
						disabled={isCreating}
						class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50"
					>
						{#if isCreating}
							<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
							<span>Creating...</span>
						{:else}
							<span>Create & Open Canvas</span>
							<ArrowRight class="h-3.5 w-3.5" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Quick Test & cURL Modal -->
	{#if isTestModalOpen && testRoute}
		{@const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}${testRoute.path}`}
		{@const curlCommand = `curl -X ${testRoute.method} "${fullUrl}"${testRoute.method !== 'GET' ? ' -H "Content-Type: application/json" -d \'{}\'' : ''}`}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-100"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-100"
			>
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-2.5">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
							<Terminal class="h-4 w-4" />
						</div>
						<div>
							<h3 class="text-sm font-bold text-white">{testRoute.title}</h3>
							<p class="text-[11px] text-slate-400">Live cURL Command & Request Tester</p>
						</div>
					</div>
					<button
						type="button"
						onclick={() => (isTestModalOpen = false)}
						class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
					>
						<X class="h-4 w-4" />
					</button>
				</div>

				<!-- cURL Command Box -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between text-xs font-medium text-slate-400">
						<span>cURL Terminal Snippet</span>
						<button
							type="button"
							onclick={() => copyToClipboard(curlCommand, 'curl')}
							class="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
						>
							{#if copiedPath === 'curl'}
								<Check class="h-3 w-3 text-emerald-400" />
								<span class="text-emerald-400">Copied!</span>
							{:else}
								<Copy class="h-3 w-3" />
								<span>Copy cURL</span>
							{/if}
						</button>
					</div>
					<div class="rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-slate-200 overflow-x-auto select-all">
						{curlCommand}
					</div>
				</div>

				<!-- Live Test Button & Output -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-slate-300">Test Live Response</span>
						<button
							type="button"
							onclick={runQuickTest}
							disabled={testRunning}
							class="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition active:scale-95 disabled:opacity-50"
						>
							{#if testRunning}
								<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								<span>Sending...</span>
							{:else}
								<Play class="h-3 w-3 fill-current" />
								<span>Send Request</span>
							{/if}
						</button>
					</div>

					{#if testStatusCode !== null}
						<div class="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
							<div class="flex items-center gap-2">
								<span class="text-xs font-mono font-bold {testStatusCode < 300 ? 'text-emerald-400' : 'text-rose-400'}">
									HTTP {testStatusCode}
								</span>
								<span class="text-[10px] text-slate-500 font-mono">
									{testStatusCode < 300 ? 'Success' : 'Error'}
								</span>
							</div>
							<pre class="max-h-48 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">{JSON.stringify(testResult, null, 2)}</pre>
						</div>
					{/if}
				</div>

				<div class="flex items-center justify-end pt-3 border-t border-slate-800">
					<button
						type="button"
						onclick={() => (isTestModalOpen = false)}
						class="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Delete Confirmation Modal -->
	{#if isDeleteModalOpen && routeToDelete}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-100"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-100"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
						<Trash2 class="h-5 w-5" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-white">Delete Nodeflow?</h3>
						<p class="text-xs text-slate-400">This will remove "{routeToDelete.title}".</p>
					</div>
				</div>

				<p class="text-xs text-slate-400 leading-relaxed">
					Are you sure you want to delete <span class="font-mono text-rose-300">{routeToDelete.path}</span>? This action cannot be undone.
				</p>

				<div class="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						onclick={() => {
							isDeleteModalOpen = false;
							routeToDelete = null;
						}}
						class="rounded-xl border border-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900 transition"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleDelete}
						class="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition active:scale-95"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

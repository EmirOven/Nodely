<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Network,
		Settings,
		Key,
		Sparkles,
		ShieldCheck,
		Globe,
		Save,
		Check,
		ArrowLeft,
		Eye,
		EyeOff,
		RefreshCw,
		Sliders,
		Users,
		SlidersHorizontal
	} from '@lucide/svelte';
	import GoogleIcon from '../../lib/components/icons/GoogleIcon.svelte';
	import type { NodelySettings } from '../../lib/server/settingsStore';

	let settings = $state<NodelySettings>({
		openaiApiKey: '',
		openaiDefaultModel: 'gpt-4o-mini',
		openaiDefaultTemperature: 0.7,
		googleClientId: '',
		googleClientSecret: '',
		jwtSecret: '',
		jwtExpiresIn: '7d',
		corsOrigins: '*',
		updatedAt: ''
	});

	let isLoading = $state(true);
	let isSaving = $state(false);
	let savedSuccess = $state(false);
	let showApiKey = $state(false);
	let showJwtSecret = $state(false);
	let testingAi = $state(false);
	let testAiResult = $state<{ success: boolean; message: string } | null>(null);

	async function loadSettings() {
		isLoading = true;
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				if (data.settings) {
					settings = data.settings;
				}
			}
		} catch (e) {
			console.error('Failed to load settings:', e);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadSettings();
	});

	async function saveSettings() {
		isSaving = true;
		savedSuccess = false;
		try {
			const res = await fetch('/api/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(settings)
			});
			if (res.ok) {
				const data = await res.json();
				settings = data.settings;
				savedSuccess = true;
				setTimeout(() => (savedSuccess = false), 2500);
			}
		} catch (e) {
			console.error('Failed to save settings:', e);
		} finally {
			isSaving = false;
		}
	}

	function generateRandomJwtSecret() {
		const rand = 'nodely_jwt_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
		settings.jwtSecret = rand;
	}

	async function testOpenAiKey() {
		if (!settings.openaiApiKey.trim()) {
			testAiResult = { success: false, message: 'Please enter an OpenAI API key first.' };
			return;
		}

		testingAi = true;
		testAiResult = null;

		try {
			const res = await fetch('https://api.openai.com/v1/models', {
				headers: {
					Authorization: `Bearer ${settings.openaiApiKey.trim()}`
				}
			});

			if (res.ok) {
				testAiResult = { success: true, message: 'Valid API Key! Successfully connected to OpenAI.' };
			} else {
				const err = await res.json().catch(() => ({}));
				testAiResult = {
					success: false,
					message: err?.error?.message || `Failed to authenticate (HTTP ${res.status})`
				};
			}
		} catch (e: any) {
			testAiResult = { success: false, message: e.message || 'Network request failed' };
		} finally {
			testingAi = false;
		}
	}
</script>

<svelte:head>
	<title>Project Settings & Secrets — Nodely</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
	<!-- Top Navigation -->
	<header
		class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-xl"
	>
		<!-- Left: Brand & Links -->
		<div class="flex items-center gap-4">
			<a
				href="/"
				class="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition group"
				title="Back to All Routes"
			>
				<ArrowLeft class="h-3.5 w-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
				<span>Routes</span>
			</a>

			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 text-white"
				>
					<Network class="h-5 w-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-base font-bold tracking-tight text-white">Project Settings</h1>
						<span
							class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20"
						>
							v0.3.0
						</span>
					</div>
					<p class="text-xs text-slate-400">API Secrets, OAuth Keys & Gateway Defaults</p>
				</div>
			</div>
		</div>

		<!-- Center: Navigation Tabs -->
		<div class="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
			<a href="/" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				API Routes
			</a>
			<a href="/users" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Project Users
			</a>
			<a href="/settings" class="px-3 py-1 text-xs font-semibold text-white bg-slate-800 rounded-lg shadow-sm">
				Settings
			</a>
		</div>

		<!-- Right: Save Button -->
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={saveSettings}
				disabled={isSaving}
				class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-950/60 hover:from-blue-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50"
			>
				{#if isSaving}
					<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
					<span>Saving...</span>
				{:else if savedSuccess}
					<Check class="h-4 w-4 text-emerald-300" />
					<span>Saved!</span>
				{:else}
					<Save class="h-4 w-4" />
					<span>Save Settings</span>
				{/if}
			</button>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
		{#if isLoading}
			<div class="space-y-4 animate-pulse">
				<div class="h-40 rounded-2xl bg-slate-900/40 border border-slate-800"></div>
				<div class="h-40 rounded-2xl bg-slate-900/40 border border-slate-800"></div>
			</div>
		{:else}
			<!-- OpenAI Section -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
							<Sparkles class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">OpenAI Integration</h2>
							<p class="text-xs text-slate-400">Used by OpenAI LLM completion nodes across all workflows</p>
						</div>
					</div>
					<span class="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
						AI Engine
					</span>
				</div>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label for="openai-api-key" class="text-xs font-medium text-slate-300">OpenAI API Key</label>
							<button
								type="button"
								onclick={testOpenAiKey}
								disabled={testingAi}
								class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 disabled:opacity-50"
							>
								{#if testingAi}
									<RefreshCw class="h-3 w-3 animate-spin" />
									<span>Verifying...</span>
								{:else}
									<span>Verify Key</span>
								{/if}
							</button>
						</div>

						<div class="relative">
							<input
								id="openai-api-key"
								type={showApiKey ? 'text' : 'password'}
								placeholder="sk-proj-..."
								bind:value={settings.openaiApiKey}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
							/>
							<button
								type="button"
								onclick={() => (showApiKey = !showApiKey)}
								class="absolute right-3 top-3 text-slate-500 hover:text-white"
								title="Toggle visibility"
							>
								{#if showApiKey}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>

						{#if testAiResult}
							<div
								class="rounded-lg p-2.5 text-xs font-medium flex items-center gap-2 {testAiResult.success
									? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
									: 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}"
							>
								{#if testAiResult.success}
									<Check class="h-3.5 w-3.5 text-emerald-400" />
								{:else}
									<Key class="h-3.5 w-3.5 text-rose-400" />
								{/if}
								<span>{testAiResult.message}</span>
							</div>
						{/if}
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
						<div class="space-y-1.5">
							<label for="default-model" class="text-xs font-medium text-slate-300">Default Model</label>
							<select
								id="default-model"
								bind:value={settings.openaiDefaultModel}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none transition"
							>
								<option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost-effective)</option>
								<option value="gpt-4o">gpt-4o (High Intelligence)</option>
								<option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
								<option value="o1-mini">o1-mini (Reasoning)</option>
							</select>
						</div>

						<div class="space-y-1.5">
							<div class="flex justify-between text-xs font-medium text-slate-300">
								<label for="default-temp">Default Temperature</label>
								<span class="font-mono text-emerald-400">{settings.openaiDefaultTemperature}</span>
							</div>
							<input
								id="default-temp"
								type="range"
								min="0"
								max="2"
								step="0.1"
								bind:value={settings.openaiDefaultTemperature}
								class="w-full mt-2 accent-emerald-500"
							/>
						</div>
					</div>
				</div>
			</section>

			<!-- Google OAuth Section -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-slate-700">
							<GoogleIcon class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">Google OAuth 2.0 Credentials</h2>
							<p class="text-xs text-slate-400">Used by Google Auth nodes for validating ID tokens & sign-ins</p>
						</div>
					</div>
					<span class="rounded bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-400">
						OAuth
					</span>
				</div>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<label for="google-client-id" class="text-xs font-medium text-slate-300">Google Client ID</label>
						<input
							id="google-client-id"
							type="text"
							placeholder="e.g. 1234567890-abc.apps.googleusercontent.com"
							bind:value={settings.googleClientId}
							class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-red-500 focus:outline-none transition"
						/>
					</div>

					<div class="space-y-1.5">
						<label for="google-client-secret" class="text-xs font-medium text-slate-300">Google Client Secret (Optional)</label>
						<input
							id="google-client-secret"
							type="password"
							placeholder="GOCSPX-..."
							bind:value={settings.googleClientSecret}
							class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-red-500 focus:outline-none transition"
						/>
					</div>

					<div class="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-xs text-slate-400 space-y-1">
						<div class="font-semibold text-slate-300">Authorized Redirect URIs (Google Cloud Console):</div>
						<code class="text-red-300 font-mono text-[11px] block select-all">http://localhost:5173/api/v1/auth/google/callback</code>
					</div>
				</div>
			</section>

			<!-- Project Auth & JWT Secret Section -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
							<ShieldCheck class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">Project Auth & JWT Signing</h2>
							<p class="text-xs text-slate-400">Used by User Management nodes to sign and verify user sessions</p>
						</div>
					</div>
					<span class="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-400">
						Security
					</span>
				</div>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label for="jwt-secret" class="text-xs font-medium text-slate-300">JWT Secret</label>
							<button
								type="button"
								onclick={generateRandomJwtSecret}
								class="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
							>
								Generate Random
							</button>
						</div>
						<div class="relative">
							<input
								id="jwt-secret"
								type={showJwtSecret ? 'text' : 'password'}
								bind:value={settings.jwtSecret}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 pr-10 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition"
							/>
							<button
								type="button"
								onclick={() => (showJwtSecret = !showJwtSecret)}
								class="absolute right-3 top-2.5 text-slate-500 hover:text-white"
								title="Toggle visibility"
							>
								{#if showJwtSecret}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="space-y-1.5">
							<label for="jwt-expires" class="text-xs font-medium text-slate-300">Session Token Lifetime</label>
							<select
								id="jwt-expires"
								bind:value={settings.jwtExpiresIn}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none transition"
							>
								<option value="1h">1 Hour</option>
								<option value="24h">24 Hours (1 Day)</option>
								<option value="7d">7 Days (Default)</option>
								<option value="30d">30 Days</option>
							</select>
						</div>

						<div class="space-y-1.5">
							<label for="cors-origins" class="text-xs font-medium text-slate-300">CORS Allowed Origins</label>
							<input
								id="cors-origins"
								type="text"
								placeholder="*"
								bind:value={settings.corsOrigins}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition"
							/>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>

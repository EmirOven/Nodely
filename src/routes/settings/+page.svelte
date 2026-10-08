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
		SlidersHorizontal,
		Cpu,
		Terminal,
		AlertTriangle
	} from '@lucide/svelte';
	import GoogleIcon from '../../lib/components/icons/GoogleIcon.svelte';
	import TelegramIcon from '../../lib/components/icons/TelegramIcon.svelte';
	import type { NodelySettings } from '../../lib/server/settingsStore';

	let settings = $state<NodelySettings>({
		aiProvider: 'openai',
		openaiApiKey: '',
		anthropicApiKey: '',
		geminiApiKey: '',
		groqApiKey: '',
		customAiBaseUrl: 'http://localhost:11434/v1',
		customAiApiKey: '',
		aiDefaultModel: 'gpt-4o-mini',
		aiDefaultTemperature: 0.7,
		openaiDefaultModel: 'gpt-4o-mini',
		openaiDefaultTemperature: 0.7,
		googleClientId: '',
		googleClientSecret: '',
		telegramBotToken: '',
		jwtSecret: '',
		jwtExpiresIn: '7d',
		corsOrigins: '*',
		updatedAt: ''
	});

	let activeAiTab = $state<'openai' | 'anthropic' | 'google' | 'groq' | 'custom'>('openai');

	let isLoading = $state(true);
	let isSaving = $state(false);
	let savedSuccess = $state(false);
	let showApiKey = $state(false);
	let showJwtSecret = $state(false);
	let showTelegramToken = $state(false);
	let testingAi = $state(false);
	let testAiResult = $state<{ success: boolean; message: string } | null>(null);
	let testingTelegram = $state(false);
	let testTelegramResult = $state<{ success: boolean; bot?: any; error?: string } | null>(null);

	const aiProvidersList = [
		{ id: 'openai' as const, name: 'OpenAI', badge: 'GPT-4o' },
		{ id: 'anthropic' as const, name: 'Anthropic', badge: 'Claude 3.5' },
		{ id: 'google' as const, name: 'Google Gemini', badge: 'Gemini 2.0' },
		{ id: 'groq' as const, name: 'Groq', badge: 'Ultra-Fast' },
		{ id: 'custom' as const, name: 'Ollama / Custom', badge: 'Local / API' }
	];

	const defaultModelsForProvider: Record<string, string[]> = {
		openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'o1-mini', 'o3-mini'],
		anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
		google: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
		groq: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
		custom: ['llama3.2', 'deepseek-r1', 'mistral', 'qwen2.5']
	};

	async function loadSettings() {
		isLoading = true;
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				if (data.settings) {
					settings = { ...settings, ...data.settings };
					if (settings.aiProvider) {
						activeAiTab = settings.aiProvider;
					}
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
				settings = { ...settings, ...data.settings };
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
		const rand = 'nodeflow_jwt_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
		settings.jwtSecret = rand;
	}

	async function testTelegramConnection() {
		if (!settings.telegramBotToken?.trim()) {
			testTelegramResult = { success: false, error: 'Please enter a Telegram Bot Token first.' };
			return;
		}
		testingTelegram = true;
		testTelegramResult = null;
		try {
			const res = await fetch('/api/settings/test-telegram', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: settings.telegramBotToken.trim() })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				testTelegramResult = { success: true, bot: data.bot };
			} else {
				testTelegramResult = { success: false, error: data.error || 'Failed to authenticate Telegram Bot' };
			}
		} catch (e: any) {
			testTelegramResult = { success: false, error: e.message || 'Network request failed' };
		} finally {
			testingTelegram = false;
		}
	}

	async function testAiKey(prov: 'openai' | 'anthropic' | 'google' | 'groq' | 'custom') {
		testingAi = true;
		testAiResult = null;

		try {
			if (prov === 'openai') {
				if (!settings.openaiApiKey?.trim()) {
					testAiResult = { success: false, message: 'Please enter an OpenAI API key first.' };
					return;
				}
				const res = await fetch('https://api.openai.com/v1/models', {
					headers: { Authorization: `Bearer ${settings.openaiApiKey.trim()}` }
				});
				if (res.ok) {
					testAiResult = { success: true, message: 'OpenAI connected successfully!' };
				} else {
					const err = await res.json().catch(() => ({}));
					testAiResult = { success: false, message: err?.error?.message || `HTTP ${res.status}` };
				}
			} else if (prov === 'anthropic') {
				if (!settings.anthropicApiKey?.trim()) {
					testAiResult = { success: false, message: 'Please enter an Anthropic API key first.' };
					return;
				}
				testAiResult = { success: true, message: 'Anthropic API key configured!' };
			} else if (prov === 'google') {
				if (!settings.geminiApiKey?.trim()) {
					testAiResult = { success: false, message: 'Please enter a Gemini API key first.' };
					return;
				}
				const res = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models?key=${settings.geminiApiKey.trim()}`
				);
				if (res.ok) {
					testAiResult = { success: true, message: 'Google Gemini connected successfully!' };
				} else {
					const err = await res.json().catch(() => ({}));
					testAiResult = { success: false, message: err?.error?.message || `HTTP ${res.status}` };
				}
			} else if (prov === 'groq') {
				if (!settings.groqApiKey?.trim()) {
					testAiResult = { success: false, message: 'Please enter a Groq API key first.' };
					return;
				}
				const res = await fetch('https://api.groq.com/openai/v1/models', {
					headers: { Authorization: `Bearer ${settings.groqApiKey.trim()}` }
				});
				if (res.ok) {
					testAiResult = { success: true, message: 'Groq connected successfully!' };
				} else {
					const err = await res.json().catch(() => ({}));
					testAiResult = { success: false, message: err?.error?.message || `HTTP ${res.status}` };
				}
			} else if (prov === 'custom') {
				const base = settings.customAiBaseUrl || 'http://localhost:11434/v1';
				testAiResult = { success: true, message: `Custom LLM endpoint ready at ${base}` };
			}
		} catch (e: any) {
			testAiResult = { success: false, message: e.message || 'Connection test failed' };
		} finally {
			testingAi = false;
		}
	}
</script>

<svelte:head>
	<title>Nodeflow Settings & Secrets — Nodeflow</title>
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
				title="Back to All Nodeflows"
			>
				<ArrowLeft class="h-3.5 w-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
				<span>Nodeflows</span>
			</a>

			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 text-white"
				>
					<Network class="h-5 w-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-base font-bold tracking-tight text-white">Nodeflow Settings</h1>
						<span
							class="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20"
						>
							v0.5.0
						</span>
					</div>
					<p class="text-xs text-slate-400">AI Engine, OAuth Keys & Gateway Defaults</p>
				</div>
			</div>
		</div>

		<!-- Center: Navigation Tabs -->
		<div class="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
			<a href="/" class="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition">
				Nodeflows
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
			<!-- Universal AI Engine Section -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
							<Sparkles class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">Universal AI Engine (AI SDK Compatible)</h2>
							<p class="text-xs text-slate-400">Configure credentials for OpenAI, Anthropic Claude, Google Gemini, Groq, or Local Ollama</p>
						</div>
					</div>
					<span class="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
						AI Engine
					</span>
				</div>

				<!-- AI Provider Selector Tabs -->
				<div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-950/60">
					{#each aiProvidersList as p}
						<button
							type="button"
							onclick={() => {
								activeAiTab = p.id;
								settings.aiProvider = p.id;
							}}
							class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition {activeAiTab === p.id
								? 'bg-emerald-600 text-white shadow-sm'
								: 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}"
						>
							<span>{p.name}</span>
							<span class="text-[9px] opacity-75 font-mono">({p.badge})</span>
						</button>
					{/each}
				</div>

				<!-- Provider-specific configuration -->
				<div class="space-y-4 pt-1">
					{#if activeAiTab === 'openai'}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label for="openai-api-key" class="text-xs font-medium text-slate-300">OpenAI API Key</label>
								<button
									type="button"
									onclick={() => testAiKey('openai')}
									disabled={testingAi}
									class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 disabled:opacity-50"
								>
									{#if testingAi}
										<RefreshCw class="h-3 w-3 animate-spin" />
										<span>Verifying...</span>
									{:else}
										<span>Verify OpenAI Key</span>
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
						</div>
					{:else if activeAiTab === 'anthropic'}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label for="anthropic-api-key" class="text-xs font-medium text-slate-300">Anthropic Claude API Key</label>
								<button
									type="button"
									onclick={() => testAiKey('anthropic')}
									disabled={testingAi}
									class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 disabled:opacity-50"
								>
									{#if testingAi}
										<RefreshCw class="h-3 w-3 animate-spin" />
										<span>Verifying...</span>
									{:else}
										<span>Verify Anthropic Key</span>
									{/if}
								</button>
							</div>

							<input
								id="anthropic-api-key"
								type="password"
								placeholder="sk-ant-api..."
								bind:value={settings.anthropicApiKey}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
							/>
						</div>
					{:else if activeAiTab === 'google'}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label for="gemini-api-key" class="text-xs font-medium text-slate-300">Google Gemini API Key</label>
								<button
									type="button"
									onclick={() => testAiKey('google')}
									disabled={testingAi}
									class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 disabled:opacity-50"
								>
									{#if testingAi}
										<RefreshCw class="h-3 w-3 animate-spin" />
										<span>Verifying...</span>
									{:else}
										<span>Verify Gemini Key</span>
									{/if}
								</button>
							</div>

							<input
								id="gemini-api-key"
								type="password"
								placeholder="AIzaSy..."
								bind:value={settings.geminiApiKey}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
							/>
						</div>
					{:else if activeAiTab === 'groq'}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between">
								<label for="groq-api-key" class="text-xs font-medium text-slate-300">Groq API Key</label>
								<button
									type="button"
									onclick={() => testAiKey('groq')}
									disabled={testingAi}
									class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 disabled:opacity-50"
								>
									{#if testingAi}
										<RefreshCw class="h-3 w-3 animate-spin" />
										<span>Verifying...</span>
									{:else}
										<span>Verify Groq Key</span>
									{/if}
								</button>
							</div>

							<input
								id="groq-api-key"
								type="password"
								placeholder="gsk_..."
								bind:value={settings.groqApiKey}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
							/>
						</div>
					{:else if activeAiTab === 'custom'}
						<div class="space-y-3">
							<div class="space-y-1.5">
								<label for="custom-base-url" class="text-xs font-medium text-slate-300">Ollama / Custom API Base URL</label>
								<input
									id="custom-base-url"
									type="text"
									placeholder="http://localhost:11434/v1"
									bind:value={settings.customAiBaseUrl}
									class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
								/>
							</div>

							<div class="space-y-1.5">
								<label for="custom-api-key" class="text-xs font-medium text-slate-300">API Key (Optional for Local Ollama)</label>
								<input
									id="custom-api-key"
									type="password"
									placeholder="Bearer token or leave empty"
									bind:value={settings.customAiApiKey}
									class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
								/>
							</div>
						</div>
					{/if}

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

					<!-- Default Model and Temperature Settings -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
						<div class="space-y-1.5">
							<label for="default-model" class="text-xs font-medium text-slate-300">Default Model ({activeAiTab})</label>
							<select
								id="default-model"
								bind:value={settings.aiDefaultModel}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none transition"
							>
								{#each defaultModelsForProvider[activeAiTab] || ['gpt-4o-mini'] as m}
									<option value={m}>{m}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-1.5">
							<div class="flex justify-between text-xs font-medium text-slate-300">
								<label for="default-temp">Default Temperature</label>
								<span class="font-mono text-emerald-400">{settings.aiDefaultTemperature ?? 0.7}</span>
							</div>
							<input
								id="default-temp"
								type="range"
								min="0"
								max="2"
								step="0.1"
								bind:value={settings.aiDefaultTemperature}
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
						<span class="font-semibold text-slate-300">Setup Note:</span>
						<p>
							Configure your Authorized JavaScript Origins in Google Cloud Console to match your Nodeflow domain (e.g. <code class="font-mono text-slate-300">http://localhost:5173</code>).
						</p>
					</div>
				</div>
			</section>

			<!-- Telegram Bot API Settings -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
							<TelegramIcon class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">Telegram Bot API</h2>
							<p class="text-xs text-slate-400">Default bot token for Telegram Webhooks and Send Message nodes</p>
						</div>
					</div>
					<span class="rounded bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-400">
						Bot Platform
					</span>
				</div>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label for="telegram-token" class="text-xs font-medium text-slate-300">Default Telegram Bot Token</label>
							<button
								type="button"
								onclick={testTelegramConnection}
								disabled={testingTelegram}
								class="text-[11px] font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50 transition flex items-center gap-1"
							>
								{#if testingTelegram}
									<RefreshCw class="h-3 w-3 animate-spin" />
									<span>Verifying...</span>
								{:else}
									<Check class="h-3 w-3" />
									<span>Test Connection</span>
								{/if}
							</button>
						</div>

						<div class="relative">
							<input
								id="telegram-token"
								type={showTelegramToken ? 'text' : 'password'}
								placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
								bind:value={settings.telegramBotToken}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 font-mono text-xs text-slate-200 focus:border-sky-500 focus:outline-none transition"
							/>
							<button
								type="button"
								onclick={() => (showTelegramToken = !showTelegramToken)}
								class="absolute right-3 top-3 text-slate-500 hover:text-white"
								title="Toggle visibility"
							>
								{#if showTelegramToken}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>

						{#if testTelegramResult}
							<div
								class="rounded-xl border p-3 text-xs flex items-center justify-between {testTelegramResult.success
									? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
									: 'border-rose-500/30 bg-rose-500/10 text-rose-300'}"
							>
								{#if testTelegramResult.success}
									<div class="flex items-center gap-2">
										<Check class="h-4 w-4 text-emerald-400" />
										<span>Connected: <strong>@{testTelegramResult.bot?.username}</strong> ({testTelegramResult.bot?.firstName})</span>
									</div>
									<span class="font-mono text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
										ID: {testTelegramResult.bot?.id}
									</span>
								{:else}
									<div class="flex items-center gap-2">
										<AlertTriangle class="h-4 w-4 text-rose-400" />
										<span>{testTelegramResult.error}</span>
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<div class="rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-xs text-slate-400 space-y-1">
						<span class="font-semibold text-slate-300">How to get a Bot Token:</span>
						<p>
							Open Telegram and chat with <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" class="text-sky-400 hover:underline font-mono">@BotFather</a>. Send <code class="font-mono text-slate-300">/newbot</code> to obtain an HTTP API token. Once saved here, all Telegram nodes in your flows can use it automatically.
						</p>
					</div>
				</div>
			</section>

			<!-- JWT Authentication Secrets -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
							<ShieldCheck class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">JSON Web Token (JWT) Config</h2>
							<p class="text-xs text-slate-400">Used for signing session tokens in User Management nodes</p>
						</div>
					</div>
					<span class="rounded bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-purple-400">
						Security
					</span>
				</div>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label for="jwt-secret" class="text-xs font-medium text-slate-300">JWT Signing Secret</label>
							<button
								type="button"
								onclick={generateRandomJwtSecret}
								class="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
							>
								<RefreshCw class="h-3 w-3" />
								<span>Regenerate Key</span>
							</button>
						</div>

						<div class="relative">
							<input
								id="jwt-secret"
								type={showJwtSecret ? 'text' : 'password'}
								bind:value={settings.jwtSecret}
								class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 font-mono text-xs text-slate-200 focus:border-purple-500 focus:outline-none transition"
							/>
							<button
								type="button"
								onclick={() => (showJwtSecret = !showJwtSecret)}
								class="absolute right-3 top-3 text-slate-500 hover:text-white"
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

					<div class="space-y-1.5">
						<label for="jwt-exp" class="text-xs font-medium text-slate-300">Default Session Expiration</label>
						<select
							id="jwt-exp"
							bind:value={settings.jwtExpiresIn}
							class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none transition"
						>
							<option value="1h">1 Hour</option>
							<option value="24h">24 Hours (1 Day)</option>
							<option value="7d">7 Days (Default)</option>
							<option value="30d">30 Days</option>
						</select>
					</div>
				</div>
			</section>

			<!-- Gateway & CORS Settings -->
			<section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-5">
				<div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
							<Globe class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-sm font-bold text-white">Gateway CORS & Network Defaults</h2>
							<p class="text-xs text-slate-400">Configure cross-origin resource sharing for published API endpoints</p>
						</div>
					</div>
					<span class="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-400">
						Gateway
					</span>
				</div>

				<div class="space-y-4">
					<div class="space-y-1.5">
						<label for="cors-origins" class="text-xs font-medium text-slate-300">Allowed Origins</label>
						<input
							id="cors-origins"
							type="text"
							placeholder="* or https://app.mydomain.com"
							bind:value={settings.corsOrigins}
							class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none transition"
						/>
						<p class="text-[11px] text-slate-500">Comma-separated list of origins or wildcard * for open access.</p>
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>

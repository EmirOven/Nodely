<script lang="ts">
	import { onMount } from 'svelte';
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
		Clock,
		Users,
		Sparkles,
		Blocks
	} from '@lucide/svelte';
	import GoogleIcon from './icons/GoogleIcon.svelte';
	import TelegramIcon from './icons/TelegramIcon.svelte';
	import DynamicIcon from './DynamicIcon.svelte';
	import type { NodelyNodeType, ExtensionPackage } from '../types';

	interface Props {
		onAddNode: (type: NodelyNodeType) => void;
	}

	let { onAddNode }: Props = $props();

	let searchQuery = $state('');
	let customExtensions = $state<ExtensionPackage[]>([]);

	async function loadCustomExtensions() {
		try {
			const res = await fetch('/api/extensions');
			if (res.ok) {
				const json = await res.json();
				const list: ExtensionPackage[] = json.extensions || [];
				customExtensions = list.filter((e) => !e.isBuiltIn && e.enabled);
			}
		} catch {}
	}

	onMount(() => {
		loadCustomExtensions();
	});

	function getExtensionColorClass(color: string): string {
		switch (color) {
			case 'emerald':
				return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60';
			case 'indigo':
				return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60';
			case 'purple':
				return 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60';
			case 'amber':
				return 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60';
			case 'rose':
				return 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60';
			case 'teal':
				return 'text-teal-400 bg-teal-500/10 border-teal-500/30 hover:border-teal-500/60';
			case 'cyan':
				return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/60';
			default:
				return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60';
		}
	}

	interface SidebarItem {
		type: NodelyNodeType;
		title: string;
		desc: string;
		category: string;
		icon?: any;
		iconName?: string;
		isCustom: boolean;
		color: string;
	}

	const baseNodeItems: SidebarItem[] = [
		{
			type: 'httpTrigger' as NodelyNodeType,
			title: 'HTTP Trigger',
			desc: 'API endpoint route entrypoint (GET, POST, etc.)',
			category: 'Triggers',
			icon: Globe,
			isCustom: false,
			color: 'text-blue-400 bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60'
		},
		{
			type: 'authNode' as NodelyNodeType,
			title: 'Auth Gate',
			desc: 'Verify API keys or Bearer tokens with Valid/Invalid routes',
			category: 'Security',
			icon: ShieldCheck,
			isCustom: false,
			color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60'
		},
		{
			type: 'validatorNode' as NodelyNodeType,
			title: 'Schema Validator',
			desc: 'Check required payload fields and reject malformed requests',
			category: 'Validation',
			icon: ListChecks,
			isCustom: false,
			color: 'text-teal-400 bg-teal-500/10 border-teal-500/30 hover:border-teal-500/60'
		},
		{
			type: 'codeBlock' as NodelyNodeType,
			title: 'Code Block',
			desc: 'Execute custom JS/TS to transform payload or compute logic',
			category: 'Logic',
			icon: Code2,
			isCustom: false,
			color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60'
		},
		{
			type: 'conditional' as NodelyNodeType,
			title: 'Conditional Branch',
			desc: 'Route execution to TRUE or FALSE paths based on rules',
			category: 'Logic',
			icon: GitFork,
			isCustom: false,
			color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
		},
		{
			type: 'delayNode' as NodelyNodeType,
			title: 'Delay / Sleep',
			desc: 'Pause pipeline execution asynchronously (rate limit / pacing)',
			category: 'Utilities',
			icon: Clock,
			isCustom: false,
			color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/60'
		},
		{
			type: 'fetchNode' as NodelyNodeType,
			title: 'External API Fetch',
			desc: 'Call 3rd-party REST APIs and pass responses downstream',
			category: 'Integrations',
			icon: Send,
			isCustom: false,
			color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/60'
		},
		{
			type: 'dataStore' as NodelyNodeType,
			title: 'Data Store (KV/DB)',
			desc: 'Persist, retrieve, or list items in simulated storage',
			category: 'Storage',
			icon: Database,
			isCustom: false,
			color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
		},
		{
			type: 'httpResponse' as NodelyNodeType,
			title: 'HTTP Response',
			desc: 'Send status code & response payload back to client',
			category: 'Outputs',
			icon: CheckCheck,
			isCustom: false,
			color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60'
		},
		{
			type: 'googleAuthNode' as NodelyNodeType,
			title: 'Google OAuth',
			desc: 'Verify Google ID tokens and extract authenticated user details',
			category: 'Security',
			icon: GoogleIcon,
			isCustom: false,
			color: 'text-red-400 bg-red-500/10 border-red-500/30 hover:border-red-500/60'
		},
		{
			type: 'userManagementNode' as NodelyNodeType,
			title: 'User Management',
			desc: 'Built-in authentication: Sign up, login, delete & manage users',
			category: 'Auth & Users',
			icon: Users,
			isCustom: false,
			color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60'
		},
		{
			type: 'aiNode' as NodelyNodeType,
			title: 'AI Completion',
			desc: 'Universal LLM node (OpenAI, Anthropic, Gemini, Groq, Ollama) via AI SDK',
			category: 'AI & LLM',
			icon: Sparkles,
			isCustom: false,
			color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
		},
		{
			type: 'telegramTrigger' as NodelyNodeType,
			title: 'Telegram Bot Trigger',
			desc: 'Receive inbound Telegram webhook updates (messages, commands, callbacks)',
			category: 'Telegram Bots',
			icon: TelegramIcon,
			isCustom: false,
			color: 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60'
		},
		{
			type: 'telegramSendMessage' as NodelyNodeType,
			title: 'Telegram Send Message',
			desc: 'Dispatch messages, photos, and replies to Telegram chats via Bot API',
			category: 'Telegram Bots',
			icon: TelegramIcon,
			isCustom: false,
			color: 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60'
		}
	];

	const nodeItems = $derived.by<SidebarItem[]>(() => {
		const customItems: SidebarItem[] = customExtensions.map((ext) => ({
			type: ext.nodeType as NodelyNodeType,
			title: ext.name,
			desc: ext.description,
			category: ext.category || 'Extensions',
			icon: null,
			iconName: ext.icon,
			isCustom: true,
			color: getExtensionColorClass(ext.accentColor)
		}));
		return [...baseNodeItems, ...customItems];
	});

	const filteredItems = $derived(
		nodeItems.filter(
			(item) =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
		<div class="flex items-center justify-between text-slate-200">
			<div class="flex items-center gap-2">
				<Layers class="h-4 w-4 text-blue-400" />
				<span class="text-sm font-semibold tracking-wide">Node Library</span>
			</div>
			<a
				href="/extensions"
				class="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 border border-indigo-500/30 bg-indigo-500/10 rounded px-1.5 py-0.5"
				title="Manage extensions and plugins"
			>
				<Blocks class="h-3 w-3" />
				<span>Extensions</span>
			</a>
		</div>
		<p class="mt-1 text-xs text-slate-400">
			Drag nodes into canvas or click + to add
		</p>

		<!-- Search -->
		<div class="relative mt-3">
			<Search class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
			<input
				type="text"
				placeholder="Search nodes or extensions..."
				bind:value={searchQuery}
				class="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Node Cards List -->
	<div class="flex-1 overflow-y-auto p-3 space-y-2.5">
		{#each filteredItems as item}
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
							{#if item.isCustom}
								<DynamicIcon name={item.iconName} class="h-4 w-4" />
							{:else if item.icon}
								{@const IconComponent = item.icon}
								<IconComponent class="h-4 w-4" />
							{/if}
						</div>
						<span class="text-xs font-semibold text-slate-100">{item.title}</span>
						{#if item.isCustom}
							<span class="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-mono text-indigo-300 border border-indigo-500/30">
								Ext
							</span>
						{/if}
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
	<div class="border-t border-slate-800 p-3 bg-slate-900/30 flex items-center justify-between text-[11px]">
		<div class="flex items-center gap-1.5 text-slate-400">
			<BookOpen class="h-3.5 w-3.5 text-blue-400" />
			<span>Connect handles</span>
		</div>
		<a
			href="/extensions"
			class="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-indigo-300 hover:bg-slate-800 hover:text-white transition font-medium"
		>
			<Blocks class="h-3 w-3" />
			<span>Manage Extensions</span>
		</a>
	</div>
</aside>

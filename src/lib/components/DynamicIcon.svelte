<script lang="ts">
	import {
		Globe,
		Users,
		Sparkles,
		Send,
		ShieldCheck,
		Database,
		Code2,
		MessageSquare,
		CreditCard,
		Mail,
		Cpu,
		Clock,
		ListChecks,
		GitFork,
		Layers,
		CheckCircle2,
		Radio,
		Lock,
		Terminal,
		SlidersHorizontal,
		Search,
		Blocks,
		Folder,
		Settings,
		Boxes,
		Share2,
		Zap,
		Workflow
	} from '@lucide/svelte';

	interface Props {
		name?: string;
		class?: string;
	}

	let { name = 'Blocks', class: className = 'h-4 w-4' }: Props = $props();

	// Custom icon component selection
	const iconMap: Record<string, any> = {
		globe: Globe,
		users: Users,
		sparkles: Sparkles,
		send: Send,
		shieldcheck: ShieldCheck,
		shield: ShieldCheck,
		database: Database,
		code2: Code2,
		code: Code2,
		messagesquare: MessageSquare,
		message: MessageSquare,
		creditcard: CreditCard,
		mail: Mail,
		cpu: Cpu,
		clock: Clock,
		listchecks: ListChecks,
		gitfork: GitFork,
		layers: Layers,
		checkcircle2: CheckCircle2,
		radio: Radio,
		lock: Lock,
		terminal: Terminal,
		sliders: SlidersHorizontal,
		search: Search,
		blocks: Blocks,
		boxes: Boxes,
		share2: Share2,
		zap: Zap,
		workflow: Workflow,
		settings: Settings,
		folder: Folder
	};

	const normalized = $derived(name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'blocks');
	const SelectedIcon = $derived(iconMap[normalized] || Blocks);
</script>

<SelectedIcon class={className} />

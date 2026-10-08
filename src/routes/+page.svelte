<script lang="ts">
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import FlowCanvas from '../lib/components/FlowCanvas.svelte';
</script>

<svelte:head>
	<title>Nodely — Visual Drag & Drop API Builder</title>
	<meta name="description" content="Build and test backend APIs visually with drag-and-drop nodes and code blocks." />
</svelte:head>

<SvelteFlowProvider>
	<FlowCanvas />
</SvelteFlowProvider>

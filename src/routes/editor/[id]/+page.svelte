<script lang="ts">
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import FlowCanvas from '../../../lib/components/FlowCanvas.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.route ? `${data.route.title} — Nodely API Builder` : 'Nodely API Builder'}</title>
</svelte:head>

<SvelteFlowProvider>
	{#if data.route}
		<FlowCanvas
			routeId={data.route.id}
			routeTitle={data.route.title}
			routeMethod={data.route.method}
			routePath={data.route.path}
			routeDescription={data.route.description}
			initialNodes={data.route.nodes}
			initialEdges={data.route.edges}
			isRoutePublished={data.route.isPublished}
		/>
	{:else}
		<FlowCanvas
			routeId={data.id || 'custom-route'}
			routeTitle="New Workflow"
			routeMethod="GET"
			routePath="/api/v1/custom"
		/>
	{/if}
</SvelteFlowProvider>

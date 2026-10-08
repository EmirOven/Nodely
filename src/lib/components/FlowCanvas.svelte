<script lang="ts">
	import {
		SvelteFlow,
		Background,
		Controls,
		useSvelteFlow,
		type Node,
		type Edge,
		type Connection,
		addEdge
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import TriggerNode from './nodes/TriggerNode.svelte';
	import CodeBlockNode from './nodes/CodeBlockNode.svelte';
	import ConditionalNode from './nodes/ConditionalNode.svelte';
	import FetchNode from './nodes/FetchNode.svelte';
	import DataStoreNode from './nodes/DataStoreNode.svelte';
	import ResponseNode from './nodes/ResponseNode.svelte';

	import Navbar from './Navbar.svelte';
	import Sidebar from './Sidebar.svelte';
	import TestPanel from './TestPanel.svelte';
	import ExportModal from './ExportModal.svelte';

	import { templatesData, type TemplateDefinition } from '../templates';
	import { executeFlow } from '../engine/executor';
	import { generateSvelteKitCode, generateExpressCode } from '../engine/generator';
	import type { NodelyNodeType, TestRequestPayload, ExecutionResult } from '../types';

	const nodeTypes: any = {
		httpTrigger: TriggerNode,
		codeBlock: CodeBlockNode,
		conditional: ConditionalNode,
		fetchNode: FetchNode,
		dataStore: DataStoreNode,
		httpResponse: ResponseNode
	};

	let currentTemplateId = $state('user-auth');
	const initialTemplate = templatesData['user-auth'];

	let nodes = $state<Node[]>(JSON.parse(JSON.stringify(initialTemplate.nodes)));
	let edges = $state<Edge[]>(JSON.parse(JSON.stringify(initialTemplate.edges)));

	let isTestOpen = $state(false);
	let isExportOpen = $state(false);

	let currentRequestDefaults = $state({
		method: initialTemplate.defaultRequest.method,
		path: initialTemplate.defaultRequest.path,
		body: initialTemplate.defaultRequest.body
	});

	const { screenToFlowPosition, fitView } = useSvelteFlow();

	function handleConnect(connection: Connection) {
		const newEdge: Edge = {
			...connection,
			id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
			animated: true,
			style:
				connection.sourceHandle === 'false'
					? 'stroke: #ef4444; stroke-width: 2.5px;'
					: connection.sourceHandle === 'true'
						? 'stroke: #10b981; stroke-width: 2.5px;'
						: 'stroke: #6366f1; stroke-width: 2px;'
		};
		edges = addEdge(newEdge, edges);
	}

	function createNodeInstance(type: NodelyNodeType, position: { x: number; y: number }): Node {
		const id = `${type}_${Date.now()}`;
		let data: Record<string, any> = { title: type };

		switch (type) {
			case 'httpTrigger':
				data = {
					title: 'API Endpoint',
					method: 'POST',
					path: '/api/v1/action'
				};
				break;
			case 'codeBlock':
				data = {
					title: 'Custom Logic',
					code: '// Access: payload, query, state, log\nreturn { processed: true, ...payload, timestamp: Date.now() };'
				};
				break;
			case 'conditional':
				data = {
					title: 'Validate Rule',
					expression: 'payload.active === true'
				};
				break;
			case 'fetchNode':
				data = {
					title: 'Fetch API',
					method: 'GET',
					url: 'https://api.github.com/zen'
				};
				break;
			case 'dataStore':
				data = {
					title: 'Cache Store',
					operation: 'set',
					collection: 'items',
					keyExpr: 'payload.id || "item_1"',
					valueExpr: 'payload'
				};
				break;
			case 'httpResponse':
				data = {
					title: 'Send Response',
					statusCode: 200,
					bodyExpression: 'state.lastResult || payload'
				};
				break;
		}

		return {
			id,
			type,
			position,
			data
		};
	}

	function handleAddNode(type: NodelyNodeType) {
		const offset = nodes.length * 30;
		const position = { x: 300 + (offset % 200), y: 150 + (offset % 300) };
		const newNode = createNodeInstance(type, position);
		nodes = [...nodes, newNode];
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const type = event.dataTransfer?.getData('application/nodely-node') as NodelyNodeType;
		if (!type) return;

		const position = screenToFlowPosition({
			x: event.clientX,
			y: event.clientY
		});

		const newNode = createNodeInstance(type, position);
		nodes = [...nodes, newNode];
	}

	async function runExecution(req: TestRequestPayload): Promise<ExecutionResult> {
		const res = await executeFlow(nodes, edges, req);
		return res;
	}

	function loadTemplate(templateId: string) {
		const tpl = templatesData[templateId];
		if (!tpl) return;
		currentTemplateId = templateId;
		nodes = JSON.parse(JSON.stringify(tpl.nodes));
		edges = JSON.parse(JSON.stringify(tpl.edges));
		currentRequestDefaults = {
			method: tpl.defaultRequest.method,
			path: tpl.defaultRequest.path,
			body: tpl.defaultRequest.body
		};
		setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
	}

	function resetFlow() {
		loadTemplate(currentTemplateId);
	}

	const svelteKitCode = $derived(generateSvelteKitCode(nodes, edges));
	const expressCode = $derived(generateExpressCode(nodes, edges));
	const flowJson = $derived(JSON.stringify({ nodes, edges }, null, 2));

	const triggerNode = $derived(nodes.find((n) => n.type === 'httpTrigger'));
	$effect(() => {
		if (triggerNode?.data) {
			const data = triggerNode.data as any;
			if (data.method) currentRequestDefaults.method = data.method;
			if (data.path) currentRequestDefaults.path = data.path;
		}
	});
</script>

<div class="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
	<!-- Top Navigation Bar -->
	<Navbar
		onOpenTest={() => (isTestOpen = true)}
		onOpenExport={() => (isExportOpen = true)}
		onSelectTemplate={loadTemplate}
		onResetFlow={resetFlow}
	/>

	<!-- Main Workspace -->
	<div class="flex flex-1 overflow-hidden relative">
		<!-- Left Sidebar with Draggable Palette -->
		<Sidebar onAddNode={handleAddNode} />

		<!-- Flow Canvas Area -->
		<div
			class="flex-1 h-full w-full relative bg-slate-950"
			ondragover={handleDragOver}
			ondrop={handleDrop}
			role="region"
			aria-label="API Flow Canvas"
		>
			<SvelteFlow
				bind:nodes
				bind:edges
				{nodeTypes}
				onconnect={handleConnect}
				fitView
				minZoom={0.2}
				maxZoom={2}
				class="bg-slate-950"
			>
				<Background bgColor="#020617" patternColor="#1e293b" gap={24} size={1.5} />
				<Controls class="!bg-slate-900/90 !border-slate-800 !text-slate-200 !shadow-xl !rounded-xl" />
			</SvelteFlow>
		</div>

		<!-- Test Runner Drawer -->
		<TestPanel
			isOpen={isTestOpen}
			onClose={() => (isTestOpen = false)}
			onExecute={runExecution}
			defaultMethod={currentRequestDefaults.method}
			defaultPath={currentRequestDefaults.path}
			defaultBody={currentRequestDefaults.body}
		/>

		<!-- Export Code Dialog -->
		<ExportModal
			isOpen={isExportOpen}
			onClose={() => (isExportOpen = false)}
			{svelteKitCode}
			{expressCode}
			{flowJson}
		/>
	</div>
</div>

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
	import { Trash2, Copy, Layers } from '@lucide/svelte';

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
	import PublishModal from './PublishModal.svelte';

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
	let isPublishOpen = $state(false);
	let isPublishing = $state(false);

	let publishedEndpointInfo = $state({
		method: 'GET',
		path: '/api/v1/weather',
		title: 'Nodely API'
	});

	// Context Menu states
	interface EdgeContextMenuData {
		x: number;
		y: number;
		edgeId: string;
		source: string;
		target: string;
		sourceHandle?: string | null;
	}

	interface NodeContextMenuData {
		x: number;
		y: number;
		nodeId: string;
		title: string;
	}

	let edgeContextMenu = $state<EdgeContextMenuData | null>(null);
	let nodeContextMenu = $state<NodeContextMenuData | null>(null);

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
			selectable: true,
			interactionWidth: 30,
			style:
				connection.sourceHandle === 'false'
					? 'stroke: #ef4444; stroke-width: 2.5px;'
					: connection.sourceHandle === 'true'
						? 'stroke: #10b981; stroke-width: 2.5px;'
						: 'stroke: #6366f1; stroke-width: 2px;'
		};
		edges = addEdge(newEdge, edges);
	}

	function handleEdgeContextMenu(params: { edge: Edge; event: MouseEvent }) {
		params.event.preventDefault();
		params.event.stopPropagation();
		nodeContextMenu = null;
		edgeContextMenu = {
			x: params.event.clientX,
			y: params.event.clientY,
			edgeId: params.edge.id,
			source: params.edge.source,
			target: params.edge.target,
			sourceHandle: params.edge.sourceHandle
		};
	}

	function handleNodeContextMenu(params: { node: Node; event: MouseEvent }) {
		params.event.preventDefault();
		params.event.stopPropagation();
		edgeContextMenu = null;
		const nodeData = (params.node.data || {}) as any;
		nodeContextMenu = {
			x: params.event.clientX,
			y: params.event.clientY,
			nodeId: params.node.id,
			title: nodeData.title || params.node.type || 'Node'
		};
	}

	function deleteEdge(id: string) {
		edges = edges.filter((e) => e.id !== id);
		edgeContextMenu = null;
	}

	function deleteNode(id: string) {
		nodes = nodes.filter((n) => n.id !== id);
		edges = edges.filter((e) => e.source !== id && e.target !== id);
		nodeContextMenu = null;
	}

	function duplicateNode(id: string) {
		const target = nodes.find((n) => n.id === id);
		if (!target) return;
		const newNode: Node = {
			...JSON.parse(JSON.stringify(target)),
			id: `${target.type}_${Date.now()}`,
			position: {
				x: target.position.x + 40,
				y: target.position.y + 40
			}
		};
		nodes = [...nodes, newNode];
		nodeContextMenu = null;
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

	async function handlePublish() {
		const trigger = nodes.find((n) => n.type === 'httpTrigger');
		const triggerData = (trigger?.data || {}) as any;
		const method = (triggerData.method || 'GET') as string;
		const path = (triggerData.path || '/api/v1/endpoint') as string;
		const title = (triggerData.title || 'Nodely API') as string;

		isPublishing = true;
		try {
			const res = await fetch('/api/publish', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: currentTemplateId,
					title,
					method,
					path,
					nodes,
					edges
				})
			});

			if (res.ok) {
				const data = await res.json();
				publishedEndpointInfo = {
					method,
					path: data.relativeUrl || path,
					title
				};
				isPublishOpen = true;
			} else {
				const err = await res.json().catch(() => ({ error: 'Publish failed' }));
				alert(`Failed to publish: ${err.error || 'Server error'}`);
			}
		} catch (err: any) {
			alert(`Error publishing API: ${err.message}`);
		} finally {
			isPublishing = false;
		}
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

	function closeContextMenus() {
		edgeContextMenu = null;
		nodeContextMenu = null;
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

<div
	class="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden select-none"
	onclick={closeContextMenus}
	role="presentation"
>
	<!-- Top Navigation Bar -->
	<Navbar
		onOpenTest={() => (isTestOpen = true)}
		onOpenExport={() => (isExportOpen = true)}
		onOpenPublish={handlePublish}
		onSelectTemplate={loadTemplate}
		onResetFlow={resetFlow}
		{isPublishing}
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
				onedgecontextmenu={handleEdgeContextMenu}
				onnodecontextmenu={handleNodeContextMenu}
				deleteKey={['Backspace', 'Delete']}
				elementsSelectable={true}
				fitView
				minZoom={0.2}
				maxZoom={2}
				class="bg-slate-950"
			>
				<Background bgColor="#020617" patternColor="#1e293b" gap={24} size={1.5} />
				<Controls class="!bg-slate-900/90 !border-slate-800 !text-slate-200 !shadow-xl !rounded-xl" />
			</SvelteFlow>

			<!-- Right-Click Context Menu for Connections / Edges -->
			{#if edgeContextMenu}
				<div
					class="fixed z-50 min-w-52 rounded-xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
					style="left: {edgeContextMenu.x}px; top: {edgeContextMenu.y}px;"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => {
						if (e.key === 'Escape') closeContextMenus();
					}}
					role="menu"
					tabindex="0"
				>
					<div
						class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between"
					>
						<span>Connection</span>
						{#if edgeContextMenu.sourceHandle}
							<span class="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] text-indigo-300 font-mono">
								{edgeContextMenu.sourceHandle}
							</span>
						{/if}
					</div>

					<button
						type="button"
						onclick={() => edgeContextMenu && deleteEdge(edgeContextMenu.edgeId)}
						class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left"
					>
						<Trash2 class="h-3.5 w-3.5" />
						<span>Delete Connection</span>
					</button>
				</div>
			{/if}

			<!-- Right-Click Context Menu for Nodes -->
			{#if nodeContextMenu}
				<div
					class="fixed z-50 min-w-48 rounded-xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
					style="left: {nodeContextMenu.x}px; top: {nodeContextMenu.y}px;"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => {
						if (e.key === 'Escape') closeContextMenus();
					}}
					role="menu"
					tabindex="0"
				>
					<div
						class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 truncate"
					>
						{nodeContextMenu.title}
					</div>

					<button
						type="button"
						onclick={() => nodeContextMenu && duplicateNode(nodeContextMenu.nodeId)}
						class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
					>
						<Copy class="h-3.5 w-3.5 text-blue-400" />
						<span>Duplicate Node</span>
					</button>

					<button
						type="button"
						onclick={() => nodeContextMenu && deleteNode(nodeContextMenu.nodeId)}
						class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left"
					>
						<Trash2 class="h-3.5 w-3.5" />
						<span>Delete Node</span>
					</button>
				</div>
			{/if}
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

		<!-- Publish Live API Dialog -->
		<PublishModal
			isOpen={isPublishOpen}
			onClose={() => (isPublishOpen = false)}
			currentEndpoint={publishedEndpointInfo}
		/>
	</div>
</div>

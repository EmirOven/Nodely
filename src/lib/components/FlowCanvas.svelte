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
	import AuthNode from './nodes/AuthNode.svelte';
	import ValidatorNode from './nodes/ValidatorNode.svelte';
	import DelayNode from './nodes/DelayNode.svelte';
	import GoogleAuthNode from './nodes/GoogleAuthNode.svelte';
	import UserManagementNode from './nodes/UserManagementNode.svelte';
	import OpenAiNode from './nodes/OpenAiNode.svelte';
	import AiNode from './nodes/AiNode.svelte';
	import TelegramTriggerNode from './nodes/TelegramTriggerNode.svelte';
	import TelegramSendMessageNode from './nodes/TelegramSendMessageNode.svelte';

	import Navbar from './Navbar.svelte';
	import Sidebar from './Sidebar.svelte';
	import TestPanel from './TestPanel.svelte';
	import ExportModal from './ExportModal.svelte';
	import PublishModal from './PublishModal.svelte';

	import { templatesData, type TemplateDefinition } from '../templates';
	import DynamicExtensionNode from './nodes/DynamicExtensionNode.svelte';
	import { executeFlow } from '../engine/executor';
	import { generateSvelteKitCode, generateExpressCode } from '../engine/generator';
	import type { NodelyNodeType, ExtensionPackage, TestRequestPayload, ExecutionResult, HttpMethod } from '../types';

	let loadedExtensions = $state<ExtensionPackage[]>([]);

	async function loadRegisteredExtensions() {
		try {
			const res = await fetch('/api/extensions');
			if (res.ok) {
				const json = await res.json();
				loadedExtensions = json.extensions || [];
			}
		} catch {}
	}

	const baseNodeTypes: any = {
		httpTrigger: TriggerNode,
		codeBlock: CodeBlockNode,
		conditional: ConditionalNode,
		fetchNode: FetchNode,
		dataStore: DataStoreNode,
		httpResponse: ResponseNode,
		authNode: AuthNode,
		validatorNode: ValidatorNode,
		delayNode: DelayNode,
		googleAuthNode: GoogleAuthNode,
		userManagementNode: UserManagementNode,
		aiNode: AiNode,
		openAiNode: AiNode,
		telegramTrigger: TelegramTriggerNode,
		telegramSendMessage: TelegramSendMessageNode
	};

	const nodeTypes = $derived.by(() => {
		const types: Record<string, any> = { ...baseNodeTypes };
		for (const ext of loadedExtensions) {
			if (!types[ext.nodeType]) {
				types[ext.nodeType] = DynamicExtensionNode;
			}
		}
		types['dynamicExtensionNode'] = DynamicExtensionNode;
		return types;
	});

	interface Props {
		routeId?: string;
		routeTitle?: string;
		routeMethod?: string;
		routePath?: string;
		routeDescription?: string;
		initialNodes?: Node[];
		initialEdges?: Edge[];
		isRoutePublished?: boolean;
	}

	let {
		routeId = 'user-auth',
		routeTitle = 'User Registration & Auth',
		routeMethod = 'POST',
		routePath = '/api/v1/auth/register',
		routeDescription = '',
		initialNodes,
		initialEdges,
		isRoutePublished = false
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let currentRouteId = $state(routeId);
	// svelte-ignore state_referenced_locally
	let currentRouteTitle = $state(routeTitle);
	// svelte-ignore state_referenced_locally
	let currentRouteMethod = $state(routeMethod);
	// svelte-ignore state_referenced_locally
	let currentRoutePath = $state(routePath);
	// svelte-ignore state_referenced_locally
	let currentIsPublished = $state(isRoutePublished);
	// svelte-ignore state_referenced_locally
	let currentTemplateId = $state(routeId || 'user-auth');
	let isSaving = $state(false);
	let isAutosave = $state(false);
	let lastSavedSnapshot = $state<string>('');
	let isAutosaveInitialized = false;
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

	// Load autosave preference from localStorage on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			loadRegisteredExtensions();
			const savedPref = localStorage.getItem('nodeflow_autosave');
			if (savedPref !== null) {
				isAutosave = savedPref === 'true';
			}
			lastSavedSnapshot = JSON.stringify({ nodes, edges, routeTitle: currentRouteTitle, routeMethod: currentRouteMethod, routePath: currentRoutePath });
			setTimeout(() => {
				isAutosaveInitialized = true;
			}, 600);
		}
	});

	function handleToggleAutosave(val: boolean) {
		isAutosave = val;
		if (typeof window !== 'undefined') {
			localStorage.setItem('nodeflow_autosave', String(val));
		}
		if (val) {
			lastSavedSnapshot = JSON.stringify({ nodes, edges, routeTitle: currentRouteTitle, routeMethod: currentRouteMethod, routePath: currentRoutePath });
		}
	}

	// Debounced autosave effect
	$effect(() => {
		const snapshot = JSON.stringify({ nodes, edges, routeTitle: currentRouteTitle, routeMethod: currentRouteMethod, routePath: currentRoutePath });
		if (isAutosaveInitialized && isAutosave && currentRouteId && lastSavedSnapshot && snapshot !== lastSavedSnapshot) {
			if (autosaveTimer) clearTimeout(autosaveTimer);
			autosaveTimer = setTimeout(async () => {
				await handleSaveRoute(true);
				lastSavedSnapshot = JSON.stringify({ nodes, edges, routeTitle: currentRouteTitle, routeMethod: currentRouteMethod, routePath: currentRoutePath });
			}, 1000);
		}
		return () => {
			if (autosaveTimer) clearTimeout(autosaveTimer);
		};
	});

	const initialTemplate = templatesData['user-auth'];

	// svelte-ignore state_referenced_locally
	let nodes = $state<Node[]>(
		initialNodes && initialNodes.length > 0
			? JSON.parse(JSON.stringify(initialNodes))
			: JSON.parse(JSON.stringify(initialTemplate.nodes))
	);
	// svelte-ignore state_referenced_locally
	let edges = $state<Edge[]>(
		initialEdges
			? JSON.parse(JSON.stringify(initialEdges))
			: JSON.parse(JSON.stringify(initialTemplate.edges))
	);

	let isTestOpen = $state(false);
	let isExportOpen = $state(false);
	let isPublishOpen = $state(false);
	let isPublishing = $state(false);

	// svelte-ignore state_referenced_locally
	let publishedEndpointInfo = $state({
		method: currentRouteMethod,
		path: currentRoutePath,
		title: currentRouteTitle
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

	function getEdgeStyleForHandle(handleId?: string | null): string {
		if (handleId === 'false' || handleId === 'invalid' || handleId === 'error') {
			return 'stroke: #ef4444; stroke-width: 2.5px;';
		}
		if (handleId === 'true' || handleId === 'valid' || handleId === 'success') {
			return 'stroke: #10b981; stroke-width: 2.5px;';
		}
		return 'stroke: #6366f1; stroke-width: 2px;';
	}

	function handleBeforeConnect(connection: Connection): Edge {
		const style = getEdgeStyleForHandle(connection.sourceHandle);
		const newEdge: Edge = {
			...connection,
			id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
			animated: true,
			selectable: true,
			interactionWidth: 30,
			style
		};
		return newEdge;
	}

	function handleConnect(connection: Connection) {
		const expectedStyle = getEdgeStyleForHandle(connection.sourceHandle);
		const existingIdx = edges.findIndex(
			(e) => e.source === connection.source && e.target === connection.target
		);

		if (existingIdx !== -1) {
			const existing = edges[existingIdx];
			if (!existing.style || !existing.animated) {
				edges = edges.map((e, idx) =>
					idx === existingIdx
						? {
								...e,
								animated: true,
								selectable: true,
								interactionWidth: 30,
								style: e.style || expectedStyle
							}
						: e
				);
			}
		} else {
			const newEdge: Edge = {
				...connection,
				id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
				animated: true,
				selectable: true,
				interactionWidth: 30,
				style: expectedStyle
			};
			edges = addEdge(newEdge, edges);
		}
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

		if (target.type === 'httpTrigger') {
			const existingTriggers = nodes.filter((n) => n.type === 'httpTrigger');
			const usedMethods = new Set(
				existingTriggers.map((n) => ((n.data as any)?.method || 'GET') as HttpMethod)
			);
			const allMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
			const availableMethod = allMethods.find((m) => !usedMethods.has(m));
			if (!availableMethod) {
				alert(
					'Every Nodeflow project is a single endpoint with at most one HTTP trigger per method (GET, POST, PUT, PATCH, DELETE). All methods are already in use.'
				);
				nodeContextMenu = null;
				return;
			}
			const newNode: Node = {
				...JSON.parse(JSON.stringify(target)),
				id: `${target.type}_${Date.now()}`,
				position: {
					x: target.position.x + 40,
					y: target.position.y + 40
				},
				data: {
					...JSON.parse(JSON.stringify(target.data || {})),
					method: availableMethod,
					path: currentRoutePath,
					routePath: currentRoutePath
				}
			};
			nodes = [...nodes, newNode];
			nodeContextMenu = null;
			return;
		}

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
			case 'httpTrigger': {
				const existingTriggers = nodes.filter((n) => n.type === 'httpTrigger');
				const usedMethods = new Set(
					existingTriggers.map((n) => ((n.data as any)?.method || 'GET') as HttpMethod)
				);
				const allMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
				const assignedMethod = allMethods.find((m) => !usedMethods.has(m)) || 'GET';
				data = {
					title: 'API Endpoint',
					method: assignedMethod,
					path: currentRoutePath || '/api/endpoint',
					routePath: currentRoutePath || '/api/endpoint'
				};
				break;
			}
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
			case 'authNode':
				data = {
					title: 'Auth Gate',
					authType: 'apiKey',
					headerName: 'x-api-key',
					expectedValue: 'secret_nodeflow_key'
				};
				break;
			case 'validatorNode':
				data = {
					title: 'Schema Validator',
					requiredFields: 'email, password'
				};
				break;
			case 'delayNode':
				data = {
					title: 'Delay / Sleep',
					delayMs: 500
				};
				break;
			case 'googleAuthNode':
				data = {
					title: 'Google OAuth',
					tokenSource: 'header',
					tokenField: 'credential',
					clientId: ''
				};
				break;
			case 'userManagementNode':
				data = {
					title: 'User Management',
					action: 'signup',
					emailExpr: 'payload.email',
					passwordExpr: 'payload.password',
					nameExpr: 'payload.name',
					role: 'user'
				};
				break;
			case 'aiNode':
			case 'openAiNode':
				data = {
					title: 'AI Completion',
					provider: 'openai',
					model: 'gpt-4o-mini',
					systemPrompt: 'You are an AI assistant helping with API processing.',
					userPrompt: 'Process this request: {{payload.prompt || payload.text}}',
					temperature: 0.7,
					maxTokens: 1000,
					responseFormat: 'text'
				};
				break;
			case 'telegramTrigger':
				data = {
					title: 'Telegram Bot Trigger',
					filterCommand: ''
				};
				break;
			case 'telegramSendMessage':
				data = {
					title: 'Telegram Send Message',
					action: 'sendMessage',
					chatId: '{{telegram.chatId}}',
					text: "Hello {{telegram.sender?.firstName || 'there'}}! Your message has been processed.",
					parseMode: 'HTML',
					botToken: ''
				};
				break;
		}

		// Support custom / imported extension node defaults
		const customExt = loadedExtensions.find((e) => e.nodeType === type || e.id === type);
		if (customExt) {
			data = {
				title: customExt.nodeDefinition.title || customExt.name,
				category: customExt.category,
				accentColor: customExt.accentColor,
				icon: customExt.icon,
				properties: customExt.nodeDefinition.properties,
				outputs: customExt.nodeDefinition.outputs,
				width: customExt.nodeDefinition.width || 'w-80',
				...customExt.nodeDefinition.defaultData
			};
		}

		return {
			id,
			type,
			position,
			data
		};
	}

	function handleAddNode(type: NodelyNodeType) {
		if (type === 'httpTrigger') {
			const existingTriggers = nodes.filter((n) => n.type === 'httpTrigger');
			const usedMethods = new Set(
				existingTriggers.map((n) => ((n.data as any)?.method || 'GET') as HttpMethod)
			);
			const allMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
			const available = allMethods.find((m) => !usedMethods.has(m));
			if (!available) {
				alert(
					'Every Nodeflow project is a single endpoint with at most one HTTP trigger per method (GET, POST, PUT, PATCH, DELETE). All methods are already in use.'
				);
				return;
			}
		}

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

		if (type === 'httpTrigger') {
			const existingTriggers = nodes.filter((n) => n.type === 'httpTrigger');
			const usedMethods = new Set(
				existingTriggers.map((n) => ((n.data as any)?.method || 'GET') as HttpMethod)
			);
			const allMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
			const available = allMethods.find((m) => !usedMethods.has(m));
			if (!available) {
				alert(
					'Every Nodeflow project is a single endpoint with at most one HTTP trigger per method (GET, POST, PUT, PATCH, DELETE). All methods are already in use.'
				);
				return;
			}
		}

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

	async function handleSaveRoute(silent = false) {
		const trigger = nodes.find((n) => n.type === 'httpTrigger');
		const triggerData = (trigger?.data || {}) as any;
		const method = (triggerData.method || currentRouteMethod || 'GET') as string;
		const path = (triggerData.path || currentRoutePath || '/api/v1/endpoint') as string;
		const title = (triggerData.title || currentRouteTitle || 'Nodeflow API') as string;

		isSaving = true;
		try {
			const res = await fetch(`/api/routes/${currentRouteId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					method,
					path,
					nodes,
					edges,
					isPublished: currentIsPublished
				})
			});
			if (res.ok) {
				currentRouteTitle = title;
				currentRouteMethod = method;
				currentRoutePath = path;
				lastSavedSnapshot = JSON.stringify({ nodes, edges, routeTitle: title, routeMethod: method, routePath: path });
			} else if (!silent) {
				const err = await res.json().catch(() => ({ error: 'Save failed' }));
				alert(`Failed to save: ${err.error || 'Server error'}`);
			}
		} catch (err: any) {
			if (!silent) {
				console.error('Failed to save route:', err);
			}
		} finally {
			isSaving = false;
		}
	}

	function handleCanvasPointerDown(e: MouseEvent | TouchEvent) {
		const target = e.target as HTMLElement | null;
		if (!target) return;
		const interactive = target.closest('select, button, [data-dropdown-trigger], [data-dropdown-open]');
		const nodeEl = target.closest<HTMLElement>('.svelte-flow__node');
		if (interactive && nodeEl) {
			const nodeId = nodeEl.getAttribute('data-id');
			if (nodeId) {
				nodeEl.style.zIndex = '1000';
				nodes = nodes.map((n) =>
					n.id === nodeId ? { ...n, selected: true } : (e.shiftKey ? n : { ...n, selected: false })
				);
			}
		}
	}

	function handleCanvasFocusIn(e: FocusEvent) {
		const target = e.target as HTMLElement | null;
		if (!target) return;
		const nodeEl = target.closest<HTMLElement>('.svelte-flow__node');
		if (nodeEl) {
			const nodeId = nodeEl.getAttribute('data-id');
			if (nodeId) {
				nodeEl.style.zIndex = '1000';
				nodes = nodes.map((n) =>
					n.id === nodeId ? { ...n, selected: true } : { ...n, selected: false }
				);
			}
		}
	}

	async function handlePublish() {
		const trigger = nodes.find((n) => n.type === 'httpTrigger');
		const triggerData = (trigger?.data || {}) as any;
		const method = (triggerData.method || currentRouteMethod || 'GET') as string;
		const path = (triggerData.path || currentRoutePath || '/api/v1/endpoint') as string;
		const title = (triggerData.title || currentRouteTitle || 'Nodely API') as string;

		isPublishing = true;
		try {
			const res = await fetch('/api/publish', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: currentRouteId,
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
				currentIsPublished = true;
				currentRouteTitle = title;
				currentRouteMethod = method;
				currentRoutePath = path;

				// Sync with routeStore
				await fetch(`/api/routes/${currentRouteId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title,
						method,
						path,
						nodes,
						edges,
						isPublished: true
					})
				}).catch(() => {});

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
		onSave={handleSaveRoute}
		{isPublishing}
		{isSaving}
		{isAutosave}
		onToggleAutosave={handleToggleAutosave}
		routeId={currentRouteId}
		routeTitle={currentRouteTitle}
		routeMethod={currentRouteMethod}
		routePath={currentRoutePath}
		isRoutePublished={currentIsPublished}
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
			onpointerdown={handleCanvasPointerDown}
			onfocusin={handleCanvasFocusIn}
			role="region"
			aria-label="API Flow Canvas"
		>
			<SvelteFlow
				bind:nodes
				bind:edges
				{nodeTypes}
				colorMode="dark"
				elevateNodesOnSelect={true}
				onbeforeconnect={handleBeforeConnect}
				onconnect={handleConnect}
				onedgecontextmenu={handleEdgeContextMenu}
				onnodecontextmenu={handleNodeContextMenu}
				defaultEdgeOptions={{
					animated: true,
					selectable: true,
					interactionWidth: 30,
					style: 'stroke: #6366f1; stroke-width: 2px;'
				}}
				connectionLineStyle="stroke: #6366f1; stroke-width: 2px; stroke-dasharray: 5 5;"
				deleteKey={['Backspace', 'Delete']}
				elementsSelectable={true}
				fitView
				minZoom={0.2}
				maxZoom={2}
				class="bg-slate-950 dark"
			>
				<Background bgColor="#020617" patternColor="#1e293b" gap={24} size={1.5} />
				<Controls class="!bg-slate-900 !border-slate-800 !text-slate-200 !shadow-xl !rounded-xl" />
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

<style>
	:global(.svelte-flow__controls) {
		background-color: #0f172a !important;
		border: 1px solid #334155 !important;
		border-radius: 0.75rem !important;
		overflow: hidden !important;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
	}

	:global(.svelte-flow__controls-button) {
		background-color: #0f172a !important;
		border-bottom: 1px solid #1e293b !important;
		border-top: none !important;
		border-left: none !important;
		border-right: none !important;
		color: #cbd5e1 !important;
		width: 32px !important;
		height: 32px !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		transition: all 0.15s ease-in-out !important;
	}

	:global(.svelte-flow__controls-button:last-child) {
		border-bottom: none !important;
	}

	:global(.svelte-flow__controls-button:hover) {
		background-color: #1e293b !important;
		color: #ffffff !important;
	}

	:global(.svelte-flow__controls-button svg) {
		fill: currentColor !important;
		max-width: 14px !important;
		max-height: 14px !important;
	}

	:global(.svelte-flow__attribution) {
		background: rgba(15, 23, 42, 0.85) !important;
		border: 1px solid rgba(51, 65, 85, 0.6) !important;
		border-radius: 0.5rem !important;
		padding: 3px 8px !important;
		backdrop-filter: blur(8px) !important;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
	}

	:global(.svelte-flow__attribution a) {
		color: #94a3b8 !important;
		font-size: 10px !important;
		font-weight: 500 !important;
		text-decoration: none !important;
		transition: color 0.15s ease-in-out !important;
	}

	:global(.svelte-flow__attribution a:hover) {
		color: #38bdf8 !important;
		text-decoration: underline !important;
	}

	:global(.svelte-flow__node:focus-within),
	:global(.svelte-flow__node.selected),
	:global(.svelte-flow__node[data-dropdown-open="true"]),
	:global(.svelte-flow__node:has([data-dropdown-open="true"])) {
		z-index: 1000 !important;
	}
</style>

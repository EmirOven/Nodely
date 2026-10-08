import type { Component } from 'svelte';
import type { NodeProps } from '@xyflow/svelte';
import type { HttpMethod } from '../types';

export type NodeCategory =
	| 'Triggers'
	| 'Security'
	| 'Validation'
	| 'Logic'
	| 'Storage'
	| 'Integrations'
	| 'Utilities'
	| 'Telegram Bots'
	| 'AI'
	| string;

export interface NodeExtensionDefinition<TData = any> {
	/** Unique node type identifier (e.g. 'discordWebhook', 'stripeCharge') */
	type: string;
	/** Human-readable node title displayed in the palette and canvas */
	title: string;
	/** Short description of what this node does */
	desc: string;
	/** Category grouping in the sidebar palette */
	category: NodeCategory;
	/** Icon component (Lucide icon or custom Svelte component) */
	icon: any;
	/** Accent color theme */
	accentColor?:
		| 'blue'
		| 'emerald'
		| 'indigo'
		| 'purple'
		| 'amber'
		| 'rose'
		| 'teal'
		| 'cyan'
		| 'yellow'
		| 'slate';
	/** Svelte Component rendering the node in the canvas (built with BaseNode) */
	component: Component<NodeProps>;
	/** Factory function producing default node state when dragged onto the canvas */
	createDefaultData: (context?: { routePath?: string; method?: HttpMethod }) => TData;
	/** Optional runtime execution handler for the simulator / test runner */
	execute?: (node: any, state: any, context: any) => Promise<any> | any;
	/** Optional SvelteKit code generation snippet */
	generateSvelteKit?: (node: any) => string;
	/** Optional Express code generation snippet */
	generateExpress?: (node: any) => string;
}

/** In-memory registry of custom extensions and nodes */
const extensionRegistry = new Map<string, NodeExtensionDefinition>();

/**
 * Type-safe helper to define a custom node extension.
 * Other developers can import this helper and BaseNode to create custom node packages.
 */
export function defineNodeExtension<TData = any>(
	definition: NodeExtensionDefinition<TData>
): NodeExtensionDefinition<TData> {
	return definition;
}

/** Register a custom node extension into the active runtime */
export function registerNodeExtension(definition: NodeExtensionDefinition) {
	extensionRegistry.set(definition.type, definition);
}

/** Retrieve an extension definition by type */
export function getNodeExtension(type: string): NodeExtensionDefinition | undefined {
	return extensionRegistry.get(type);
}

/** Retrieve all registered node extensions */
export function getAllNodeExtensions(): NodeExtensionDefinition[] {
	return Array.from(extensionRegistry.values());
}

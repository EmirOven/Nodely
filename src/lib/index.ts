// Re-export node architecture and extension SDK for custom node authors
export {
	BaseNode,
	DynamicExtensionNode,
	type OutputHandleConfig,
	type AccentColor
} from './components/nodes/index';

export { default as DynamicIcon } from './components/DynamicIcon.svelte';

export {
	defineNodeExtension,
	registerNodeExtension,
	getNodeExtension,
	getAllNodeExtensions,
	type NodeExtensionDefinition,
	type NodeCategory
} from './extensions/index';

export {
	extensions,
	isExtensionsLoading,
	extensionError,
	fetchExtensions,
	toggleExtensionEnabled,
	importExtension,
	deleteExtensionPackage,
	resetAllExtensions
} from './stores/extensionStore';

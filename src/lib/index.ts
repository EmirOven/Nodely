// Re-export node architecture and extension SDK for custom node authors
export {
	BaseNode,
	type OutputHandleConfig,
	type AccentColor
} from './components/nodes/index';

export {
	defineNodeExtension,
	registerNodeExtension,
	getNodeExtension,
	getAllNodeExtensions,
	type NodeExtensionDefinition,
	type NodeCategory
} from './extensions/index';

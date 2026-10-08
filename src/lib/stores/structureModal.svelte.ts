export interface NodeStructureInfo {
	id: string;
	type?: string;
	title: string;
	data?: Record<string, any>;
	accentColor?: string;
	badge?: string;
	hasInputHandle?: boolean;
	hasOutputHandle?: boolean;
	outputs?: Array<{
		id: string;
		label?: string;
		color?: string;
	}>;
}

class StructureModalStore {
	activeNode = $state<NodeStructureInfo | null>(null);

	open(node: NodeStructureInfo) {
		this.activeNode = node;
	}

	close() {
		this.activeNode = null;
	}
}

export const structureModal = new StructureModalStore();

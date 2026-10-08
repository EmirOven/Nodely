import { json, type RequestHandler } from '@sveltejs/kit';
import {
	getAllExtensions,
	getExtensionById,
	saveExtension,
	toggleExtension,
	deleteExtension,
	importExtensionFromManifest,
	resetExtensionsToDefault
} from '../../../lib/server/extensionStore';
import type { ExtensionPackage } from '../../../lib/types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const category = url.searchParams.get('category');
		const status = url.searchParams.get('status');
		const search = url.searchParams.get('search')?.toLowerCase();

		let list: ExtensionPackage[] = getAllExtensions();

		if (category && category !== 'ALL') {
			list = list.filter((e: ExtensionPackage) => e.category.toLowerCase() === category.toLowerCase());
		}

		if (status === 'ENABLED') {
			list = list.filter((e: ExtensionPackage) => e.enabled);
		} else if (status === 'DISABLED') {
			list = list.filter((e: ExtensionPackage) => !e.enabled);
		} else if (status === 'BUILTIN') {
			list = list.filter((e: ExtensionPackage) => e.isBuiltIn);
		} else if (status === 'IMPORTED') {
			list = list.filter((e: ExtensionPackage) => !e.isBuiltIn);
		}

		if (search) {
			list = list.filter(
				(e: ExtensionPackage) =>
					e.name.toLowerCase().includes(search) ||
					e.description.toLowerCase().includes(search) ||
					e.category.toLowerCase().includes(search) ||
					e.author.toLowerCase().includes(search) ||
					e.tags.some((t: string) => t.toLowerCase().includes(search))
			);
		}

		return json({
			success: true,
			extensions: list,
			total: list.length
		});
	} catch (err: any) {
		return json({ success: false, error: err.message || 'Failed to fetch extensions' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Case A: Import from URL
		if (body.url) {
			const res = await fetch(body.url);
			if (!res.ok) {
				return json({ success: false, error: `Failed to fetch manifest from URL: HTTP ${res.status}` }, { status: 400 });
			}
			const manifest = await res.json();
			const extension = importExtensionFromManifest(manifest);
			return json({ success: true, extension, message: `Successfully imported extension "${extension.name}"` });
		}

		// Case B: Reset to default
		if (body.reset === true) {
			const defaults = resetExtensionsToDefault();
			return json({ success: true, extensions: defaults, message: 'Extensions reset to defaults' });
		}

		// Case C: Direct manifest object
		const manifest = body.manifest || body;
		const extension = importExtensionFromManifest(manifest);
		return json({ success: true, extension, message: `Successfully imported extension "${extension.name}"` });
	} catch (err: any) {
		return json({ success: false, error: err.message || 'Failed to import extension' }, { status: 400 });
	}
};

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { id, enabled } = body;

		if (!id) {
			return json({ success: false, error: 'Extension ID is required' }, { status: 400 });
		}

		if (typeof enabled === 'boolean') {
			const updated = toggleExtension(id, enabled);
			if (!updated) {
				return json({ success: false, error: `Extension with ID "${id}" not found` }, { status: 404 });
			}
			return json({ success: true, extension: updated });
		}

		// Full update if provided
		const existing = getExtensionById(id);
		if (!existing) {
			return json({ success: false, error: `Extension with ID "${id}" not found` }, { status: 404 });
		}

		const merged = { ...existing, ...body, updatedAt: new Date().toISOString() };
		const saved = saveExtension(merged);
		return json({ success: true, extension: saved });
	} catch (err: any) {
		return json({ success: false, error: err.message || 'Failed to update extension' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, request }) => {
	try {
		let id = url.searchParams.get('id');
		if (!id) {
			try {
				const body = await request.json();
				id = body.id;
			} catch {}
		}

		if (!id) {
			return json({ success: false, error: 'Extension ID is required' }, { status: 400 });
		}

		const success = deleteExtension(id);
		if (!success) {
			return json({ success: false, error: `Extension "${id}" not found or could not be removed` }, { status: 404 });
		}

		return json({ success: true, message: `Extension "${id}" deleted successfully` });
	} catch (err: any) {
		return json({ success: false, error: err.message || 'Failed to delete extension' }, { status: 400 });
	}
};

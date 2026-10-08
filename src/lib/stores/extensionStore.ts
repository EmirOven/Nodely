import { writable, derived, get } from 'svelte/store';
import type { ExtensionPackage } from '../types';

export const extensions = writable<ExtensionPackage[]>([]);
export const isExtensionsLoading = writable<boolean>(false);
export const extensionError = writable<string | null>(null);

let hasInitialized = false;

export async function fetchExtensions(): Promise<ExtensionPackage[]> {
	isExtensionsLoading.set(true);
	extensionError.set(null);
	try {
		const res = await fetch('/api/extensions');
		if (!res.ok) {
			throw new Error(`HTTP ${res.status}: Failed to load extensions`);
		}
		const data = await res.json();
		const list: ExtensionPackage[] = data.extensions || [];
		extensions.set(list);
		hasInitialized = true;
		return list;
	} catch (err: any) {
		extensionError.set(err.message || 'Error loading extensions');
		return [];
	} finally {
		isExtensionsLoading.set(false);
	}
}

export async function toggleExtensionEnabled(id: string, enabled: boolean): Promise<boolean> {
	try {
		// Optimistic update
		extensions.update((list) =>
			list.map((ext) => (ext.id === id ? { ...ext, enabled } : ext))
		);

		const res = await fetch('/api/extensions', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, enabled })
		});

		if (!res.ok) {
			// Revert on failure
			await fetchExtensions();
			return false;
		}

		const data = await res.json();
		if (data.extension) {
			extensions.update((list) =>
				list.map((ext) => (ext.id === id ? data.extension : ext))
			);
		}
		return true;
	} catch (err) {
		console.error('Failed to toggle extension:', err);
		await fetchExtensions();
		return false;
	}
}

export async function importExtension(
	manifestOrUrl: any
): Promise<{ success: boolean; extension?: ExtensionPackage; error?: string }> {
	isExtensionsLoading.set(true);
	try {
		const payload = typeof manifestOrUrl === 'string' ? { url: manifestOrUrl } : { manifest: manifestOrUrl };
		const res = await fetch('/api/extensions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		const data = await res.json();
		if (!res.ok || !data.success) {
			return { success: false, error: data.error || 'Import failed' };
		}

		await fetchExtensions();
		return { success: true, extension: data.extension };
	} catch (err: any) {
		return { success: false, error: err.message || 'Network error during import' };
	} finally {
		isExtensionsLoading.set(false);
	}
}

export async function deleteExtensionPackage(id: string): Promise<boolean> {
	isExtensionsLoading.set(true);
	try {
		const res = await fetch(`/api/extensions?id=${encodeURIComponent(id)}`, {
			method: 'DELETE'
		});
		if (!res.ok) return false;
		extensions.update((list) => list.filter((ext) => ext.id !== id));
		return true;
	} catch (err) {
		console.error('Failed to delete extension:', err);
		return false;
	} finally {
		isExtensionsLoading.set(false);
	}
}

export async function resetAllExtensions(): Promise<boolean> {
	isExtensionsLoading.set(true);
	try {
		const res = await fetch('/api/extensions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ reset: true })
		});
		if (!res.ok) return false;
		const data = await res.json();
		extensions.set(data.extensions || []);
		return true;
	} catch (err) {
		console.error('Failed to reset extensions:', err);
		return false;
	} finally {
		isExtensionsLoading.set(false);
	}
}

// Derived store of custom/imported enabled extensions
export const enabledCustomExtensions = derived(extensions, ($exts) =>
	$exts.filter((e) => !e.isBuiltIn && e.enabled)
);

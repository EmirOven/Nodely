import type { Node, Edge } from '@xyflow/svelte';
import fs from 'node:fs';
import path from 'node:path';

export interface PublishedFlow {
	id: string;
	title: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	path: string; // e.g. "/api/v1/weather"
	nodes: Node[];
	edges: Edge[];
	publishedAt: string;
}

const STORAGE_FILE = path.resolve(process.cwd(), '.nodely-published.json');

// In-memory cache
const publishedFlows = new Map<string, PublishedFlow>();

function normalizeRouteKey(method: string, routePath: string): string {
	let cleanPath = routePath.trim();
	if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
	// Remove trailing slash if longer than 1 char
	if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
		cleanPath = cleanPath.slice(0, -1);
	}
	return `${method.toUpperCase()}:${cleanPath}`;
}

// Load saved endpoints on startup
function loadFromDisk() {
	try {
		if (fs.existsSync(STORAGE_FILE)) {
			const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
			const list: PublishedFlow[] = JSON.parse(data);
			for (const flow of list) {
				const key = normalizeRouteKey(flow.method, flow.path);
				publishedFlows.set(key, flow);
			}
		}
	} catch (e) {
		console.error('Failed to load published flows from disk:', e);
	}
}

function saveToDisk() {
	try {
		const list = Array.from(publishedFlows.values());
		fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8');
	} catch (e) {
		console.error('Failed to save published flows to disk:', e);
	}
}

// Initial load
loadFromDisk();

export function publishFlow(flow: PublishedFlow): { key: string; flow: PublishedFlow } {
	const key = normalizeRouteKey(flow.method, flow.path);
	publishedFlows.set(key, flow);
	saveToDisk();
	return { key, flow };
}

export function unpublishFlow(method: string, routePath: string): boolean {
	const key = normalizeRouteKey(method, routePath);
	const deleted = publishedFlows.delete(key);
	if (deleted) saveToDisk();
	return deleted;
}

export function getPublishedFlow(method: string, routePath: string): PublishedFlow | undefined {
	const key = normalizeRouteKey(method, routePath);
	return publishedFlows.get(key);
}

export function getAllPublishedFlows(): PublishedFlow[] {
	return Array.from(publishedFlows.values());
}

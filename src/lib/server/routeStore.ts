import type { Node, Edge } from '@xyflow/svelte';
import fs from 'node:fs';
import path from 'node:path';
import { publishFlow, unpublishFlow } from './publishedStore';
import { templatesData } from '../templates';

export interface ManagedRoute {
	id: string;
	title: string;
	description?: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	path: string;
	nodes: Node[];
	edges: Edge[];
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
}

const ROUTES_FILE = path.resolve(process.cwd(), '.nodely-routes.json');
const routesMap = new Map<string, ManagedRoute>();

function seedDefaults() {
	const now = new Date().toISOString();

	const defaults: ManagedRoute[] = [
		{
			id: 'weather-api',
			title: 'Weather Data Aggregator',
			description: 'Fetches live Berlin forecast from OpenMeteo and returns formatted conditions.',
			method: 'GET',
			path: '/api/v1/weather',
			nodes: JSON.parse(JSON.stringify(templatesData['weather-api'].nodes)),
			edges: JSON.parse(JSON.stringify(templatesData['weather-api'].edges)),
			isPublished: true,
			createdAt: now,
			updatedAt: now,
			publishedAt: now
		},
		{
			id: 'user-auth',
			title: 'User Registration & Auth',
			description: 'Validates user payload, hashes password mock, and persists to users collection.',
			method: 'POST',
			path: '/api/v1/auth/register',
			nodes: JSON.parse(JSON.stringify(templatesData['user-auth'].nodes)),
			edges: JSON.parse(JSON.stringify(templatesData['user-auth'].edges)),
			isPublished: true,
			createdAt: now,
			updatedAt: now,
			publishedAt: now
		},
		{
			id: 'note-crud',
			title: 'Note Storage & List',
			description: 'Stores categorized notes with timestamps in KV data store.',
			method: 'POST',
			path: '/api/v1/notes',
			nodes: JSON.parse(JSON.stringify(templatesData['note-crud'].nodes)),
			edges: JSON.parse(JSON.stringify(templatesData['note-crud'].edges)),
			isPublished: false,
			createdAt: now,
			updatedAt: now
		},
		{
			id: 'hello-starter',
			title: 'Simple Hello API',
			description: 'Minimal starter workflow with an HTTP Trigger and instant JSON response.',
			method: 'GET',
			path: '/api/v1/hello',
			nodes: JSON.parse(JSON.stringify(templatesData['empty'].nodes)),
			edges: JSON.parse(JSON.stringify(templatesData['empty'].edges)),
			isPublished: false,
			createdAt: now,
			updatedAt: now
		}
	];

	for (const route of defaults) {
		routesMap.set(route.id, route);
		if (route.isPublished) {
			publishFlow({
				id: route.id,
				title: route.title,
				method: route.method,
				path: route.path,
				nodes: route.nodes,
				edges: route.edges,
				publishedAt: route.publishedAt || now
			});
		}
	}
	saveToDisk();
}

function loadFromDisk() {
	try {
		if (fs.existsSync(ROUTES_FILE)) {
			const data = fs.readFileSync(ROUTES_FILE, 'utf-8');
			const list: ManagedRoute[] = JSON.parse(data);
			for (const r of list) {
				routesMap.set(r.id, r);
				if (r.isPublished) {
					publishFlow({
						id: r.id,
						title: r.title,
						method: r.method,
						path: r.path,
						nodes: r.nodes,
						edges: r.edges,
						publishedAt: r.publishedAt || r.updatedAt
					});
				}
			}
		} else {
			seedDefaults();
		}
	} catch (e) {
		console.error('Failed to load routes from disk:', e);
		seedDefaults();
	}
}

function saveToDisk() {
	try {
		const list = Array.from(routesMap.values());
		fs.writeFileSync(ROUTES_FILE, JSON.stringify(list, null, 2), 'utf-8');
	} catch (e) {
		console.error('Failed to save routes to disk:', e);
	}
}

// Initial load
loadFromDisk();

export function getAllRoutes(): ManagedRoute[] {
	return Array.from(routesMap.values()).sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);
}

export function getRoute(id: string): ManagedRoute | undefined {
	return routesMap.get(id);
}

export function saveRoute(route: Partial<ManagedRoute> & { id: string }): ManagedRoute {
	const now = new Date().toISOString();
	const existing = routesMap.get(route.id);

	let formattedPath = (route.path || existing?.path || '/api/v1/custom').trim();
	if (!formattedPath.startsWith('/')) formattedPath = '/' + formattedPath;

	const updated: ManagedRoute = {
		id: route.id,
		title: route.title || existing?.title || 'Untitled Route',
		description: route.description ?? existing?.description ?? '',
		method: (route.method || existing?.method || 'GET').toUpperCase() as any,
		path: formattedPath,
		nodes: route.nodes || existing?.nodes || [],
		edges: route.edges || existing?.edges || [],
		isPublished: route.isPublished ?? existing?.isPublished ?? false,
		createdAt: existing?.createdAt || now,
		updatedAt: now,
		publishedAt: route.isPublished ? now : existing?.publishedAt
	};

	routesMap.set(updated.id, updated);
	saveToDisk();

	if (updated.isPublished) {
		publishFlow({
			id: updated.id,
			title: updated.title,
			method: updated.method,
			path: updated.path,
			nodes: updated.nodes,
			edges: updated.edges,
			publishedAt: updated.publishedAt || now
		});
	} else if (existing?.isPublished) {
		unpublishFlow(existing.method, existing.path);
	}

	return updated;
}

export function deleteRoute(id: string): boolean {
	const target = routesMap.get(id);
	if (!target) return false;

	if (target.isPublished) {
		unpublishFlow(target.method, target.path);
	}

	const deleted = routesMap.delete(id);
	if (deleted) saveToDisk();
	return deleted;
}

export function setRoutePublishStatus(id: string, isPublished: boolean): ManagedRoute | undefined {
	const route = routesMap.get(id);
	if (!route) return undefined;

	route.isPublished = isPublished;
	route.updatedAt = new Date().toISOString();
	if (isPublished) {
		route.publishedAt = route.updatedAt;
		publishFlow({
			id: route.id,
			title: route.title,
			method: route.method,
			path: route.path,
			nodes: route.nodes,
			edges: route.edges,
			publishedAt: route.publishedAt
		});
	} else {
		unpublishFlow(route.method, route.path);
	}

	saveToDisk();
	return route;
}

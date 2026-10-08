import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/routes');
		if (res.ok) {
			const data = await res.json();
			return {
				routes: data.routes || []
			};
		}
	} catch (e) {
		console.error('Failed to pre-load routes:', e);
	}
	return {
		routes: []
	};
};

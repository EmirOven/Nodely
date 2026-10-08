import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/api/extensions');
		if (res.ok) {
			const data = await res.json();
			return {
				extensions: data.extensions || []
			};
		}
	} catch (e) {
		console.error('Failed to pre-load extensions:', e);
	}
	return {
		extensions: []
	};
};

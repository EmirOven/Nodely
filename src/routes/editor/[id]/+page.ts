import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/routes/${params.id}`);
	if (res.ok) {
		const data = await res.json();
		return {
			route: data.route
		};
	}
	return {
		route: null,
		id: params.id
	};
};

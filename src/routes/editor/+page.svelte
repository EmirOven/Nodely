<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/');
	});
</script>

<div class="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400 text-sm">
	Redirecting to route browser...
</div>

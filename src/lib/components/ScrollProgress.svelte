<script lang="ts">
	import { browser } from '$app/environment';

	let scrollY = $state(0);
	let innerHeight = $state(0);

	// La hauteur du document change (images, reveals) : on la relit à chaque variation de scroll/viewport.
	const scrollHeight = $derived.by(() => {
		void scrollY;
		void innerHeight;
		return browser ? document.documentElement.scrollHeight : 0;
	});

	const progress = $derived(
		scrollHeight > innerHeight ? (scrollY / (scrollHeight - innerHeight)) * 100 : 0
	);
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div
	class="pointer-events-none fixed top-0 left-0 z-200 h-0.5 bg-linear-to-r from-amber to-coral"
	style="width: {progress}%"
	aria-hidden="true"
></div>

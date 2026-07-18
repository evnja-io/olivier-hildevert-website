<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Header />
<ScrollProgress />

<!-- Full-bleed : chaque page gère son wrapper et son padding sous le header fixe. -->
<main class="min-h-dvh">
	{@render children()}
</main>

<Footer />

<noscript>
	<!-- Sans JavaScript, les sections .reveal doivent rester visibles. -->
	<style>
		.reveal {
			opacity: 1 !important;
			transform: none !important;
		}
	</style>
</noscript>

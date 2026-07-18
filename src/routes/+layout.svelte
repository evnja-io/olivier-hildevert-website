<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';
	import BookingModal from '$lib/components/BookingModal.svelte';
	import NewsletterModal from '$lib/components/NewsletterModal.svelte';

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
<BookingModal />
<NewsletterModal />

<noscript>
	<!-- Sans JavaScript, les sections .reveal doivent rester visibles. -->
	<style>
		.reveal {
			opacity: 1 !important;
			transform: none !important;
		}
	</style>
</noscript>

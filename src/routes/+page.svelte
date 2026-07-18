<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
</script>

<svelte:head>
	<title>{site.name} — Accueil</title>
	<meta name="description" content={site.description} />
	<link rel="canonical" href={site.url} />
</svelte:head>

<section class="wrap pt-36 pb-24">
	<h1 class="text-5xl text-ink">{site.name}</h1>
	<p class="mt-4 max-w-2xl text-lg text-ink-soft">
		{site.description}
	</p>
	<a
		href={resolve('/contact')}
		class="mt-8 inline-block rounded-lg bg-coral px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ember"
	>
		Me contacter
	</a>
</section>

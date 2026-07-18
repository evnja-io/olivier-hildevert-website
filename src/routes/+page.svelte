<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
</script>

<svelte:head>
	<title>{site.name} — Accueil</title>
	<meta name="description" content={site.description} />
	<link rel="canonical" href={site.url} />
</svelte:head>

<section class="py-12">
	<h1 class="text-4xl font-bold tracking-tight text-gray-900">{site.name}</h1>
	<p class="mt-4 max-w-2xl text-lg text-gray-600">
		{site.description}
	</p>
	<a
		href={resolve('/contact')}
		class="mt-8 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
	>
		Me contacter
	</a>
</section>

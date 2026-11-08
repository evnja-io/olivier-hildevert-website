<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import CarteAvis from '$lib/components/catalogue/CarteAvis.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Avis — {site.name}</title>
	<meta name="description" content="Avis et témoignages laissés à {site.name}." />
	<link rel="canonical" href="{site.url}/avis" />
</svelte:head>

<section class="wrap pt-36 pb-24">
	<span class="eyebrow">{data.section.eyebrow}</span>
	<h1 class="mt-5 text-4xl text-ink sm:text-5xl">{data.section.titre}</h1>
	{#if data.section.paragraphe}
		<p class="mt-4 max-w-2xl text-ink-soft">{data.section.paragraphe}</p>
	{/if}

	{#if data.avis.length}
		<div class="mt-14 grid gap-5.5 md:grid-cols-2 xl:grid-cols-3">
			{#each data.avis as avis, i (`${i}-${avis.nom}`)}
				<div class="flex"><CarteAvis {avis} /></div>
			{/each}
		</div>
	{:else}
		<p class="mt-14 text-ink-soft">Bientôt disponible.</p>
		<a class="mt-6 btn btn-line" href={resolve('/')}>Retour à l’accueil</a>
	{/if}
</section>

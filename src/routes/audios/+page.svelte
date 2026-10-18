<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import CarteAudio from '$lib/components/catalogue/CarteAudio.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Audios — {site.name}</title>
	<meta
		name="description"
		content="Audios offerts par {site.name} : méditations et enregistrements à écouter librement."
	/>
	<link rel="canonical" href="{site.url}/audios" />
</svelte:head>

<section class="wrap pt-36 pb-24">
	<span class="eyebrow">{data.section.eyebrow}</span>
	<h1 class="mt-5 text-4xl text-ink sm:text-5xl">{data.section.titre}</h1>
	{#if data.section.paragraphe}
		<p class="mt-4 max-w-2xl text-ink-soft">{data.section.paragraphe}</p>
	{/if}

	{#if data.audios.length}
		<div class="mt-14 grid gap-5.5 md:grid-cols-2 xl:grid-cols-4">
			{#each data.audios as audio, i (`${i}-${audio.titre}`)}
				<CarteAudio {audio} />
			{/each}
		</div>
	{:else}
		<p class="mt-14 text-ink-soft">Bientôt disponible.</p>
		<a class="mt-6 btn btn-line" href={resolve('/')}>Retour à l’accueil</a>
	{/if}
</section>

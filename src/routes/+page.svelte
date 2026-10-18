<script lang="ts">
	import { site } from '$lib/config';
	import CatalogueAccueil from '$lib/components/catalogue/CatalogueAccueil.svelte';
	import CarteAudio from '$lib/components/catalogue/CarteAudio.svelte';
	import CarteFascicule from '$lib/components/catalogue/CarteFascicule.svelte';
	import Hero from '$lib/components/home/Hero.svelte';
	import ImmersiveBand from '$lib/components/home/ImmersiveBand.svelte';
	import Mantra from '$lib/components/home/Mantra.svelte';
	import Approche from '$lib/components/home/Approche.svelte';
	import EspritAme from '$lib/components/home/EspritAme.svelte';
	import APropos from '$lib/components/home/APropos.svelte';
	import Prestations from '$lib/components/home/Prestations.svelte';
	import PourQui from '$lib/components/home/PourQui.svelte';
	import Boutique from '$lib/components/home/Boutique.svelte';
	import References from '$lib/components/home/References.svelte';
	import Tarifs from '$lib/components/home/Tarifs.svelte';
	import ContactCta from '$lib/components/home/ContactCta.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{site.name} — {data.reglages.tagline}</title>
	<meta name="description" content={data.reglages.descriptionSeo} />
	<link rel="canonical" href={site.url} />
</svelte:head>

<Hero content={data.accueil.hero} />

<ImmersiveBand tight soft>
	{#snippet image()}
		<enhanced:img
			src="$lib/assets/mantra-esprit.jpg"
			alt="Plage à l'aube — brume lumineuse ondoyant au-dessus du sable humide, reflet du ciel doré reliant l'esprit et l'âme"
			loading="lazy"
			sizes="100vw"
			style="object-position: center 42%"
		/>
	{/snippet}
	<Mantra content={data.accueil.mantra} />
</ImmersiveBand>

<Approche content={data.accueil.approche} />

<EspritAme content={data.accueil.espritAme} />

<APropos content={data.accueil.aPropos} />

<Prestations intro={data.accueil.prestationsIntro} prestations={data.prestations} />

<ImmersiveBand soft>
	{#snippet image()}
		<enhanced:img
			src="$lib/assets/zen.jpg"
			alt="Jardin zen, papillon posé sur une pierre"
			loading="lazy"
			sizes="100vw"
		/>
	{/snippet}
	<PourQui content={data.accueil.pourQui} />
</ImmersiveBand>

<Boutique content={data.accueil.boutique} />

{#if data.audios.length + data.fascicules.length > 0}
	<div id="ressources" class="scroll-mt-24">
		<CatalogueAccueil
			id="audios"
			content={data.accueil.audios}
			page="/audios"
			nombre={data.audios.length}
		>
			{#snippet carte(i)}<CarteAudio audio={data.audios[i]} />{/snippet}
		</CatalogueAccueil>

		<CatalogueAccueil
			id="fascicules"
			content={data.accueil.fascicules}
			page="/fascicules"
			nombre={data.fascicules.length}
		>
			{#snippet carte(i)}<CarteFascicule fascicule={data.fascicules[i]} />{/snippet}
		</CatalogueAccueil>
	</div>
{/if}

<Tarifs content={data.accueil.tarifs} />

<ImmersiveBand id="contact" onWarm>
	{#snippet image()}
		<enhanced:img
			src="$lib/assets/dune-lumineuse.jpg"
			alt="Dunes et oyats baignés de lumière face à l'océan"
			loading="lazy"
			sizes="100vw"
		/>
	{/snippet}
	<ContactCta content={data.accueil.contactCta} />
</ImmersiveBand>

<References content={data.accueil.references} />

<script lang="ts">
	import { site } from '$lib/config';
	import Hero from '$lib/components/home/Hero.svelte';
	import ImmersiveBand from '$lib/components/home/ImmersiveBand.svelte';
	import Mantra from '$lib/components/home/Mantra.svelte';
	import Approche from '$lib/components/home/Approche.svelte';
	import EspritAme from '$lib/components/home/EspritAme.svelte';
	import APropos from '$lib/components/home/APropos.svelte';
	import Prestations from '$lib/components/home/Prestations.svelte';
	import PourQui from '$lib/components/home/PourQui.svelte';
	import Boutique from '$lib/components/home/Boutique.svelte';
	import Tarifs from '$lib/components/home/Tarifs.svelte';
	import ContactCta from '$lib/components/home/ContactCta.svelte';
</script>

<svelte:head>
	<title>{site.name} — {site.tagline}</title>
	<meta name="description" content={site.description} />
	<link rel="canonical" href={site.url} />
</svelte:head>

<Hero />

<ImmersiveBand tight>
	{#snippet image()}
		<enhanced:img
			src="$lib/assets/mantra-esprit.jpg"
			alt="Plage à l'aube — brume lumineuse ondoyant au-dessus du sable humide, reflet du ciel doré reliant l'esprit et l'âme"
			loading="lazy"
			sizes="100vw"
			style="object-position: center 42%"
		/>
	{/snippet}
	<Mantra />
</ImmersiveBand>

<Approche />

<EspritAme />

<APropos />

<Prestations />

<ImmersiveBand>
	{#snippet image()}
		<enhanced:img
			src="$lib/assets/zen.jpg"
			alt="Jardin zen, papillon posé sur une pierre"
			loading="lazy"
			sizes="100vw"
		/>
	{/snippet}
	<PourQui />
</ImmersiveBand>

<Boutique />

<Tarifs />

<ImmersiveBand id="contact" onWarm>
	{#snippet image()}
		<enhanced:img
			src="$lib/assets/dune-lumineuse.jpg"
			alt="Dunes et oyats baignés de lumière face à l'océan"
			loading="lazy"
			sizes="100vw"
		/>
	{/snippet}
	<ContactCta />
</ImmersiveBand>

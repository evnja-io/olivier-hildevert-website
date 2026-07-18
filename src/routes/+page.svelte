<script lang="ts">
	import { site } from '$lib/config';
	import Hero from '$lib/components/home/Hero.svelte';
	import ImmersiveBand from '$lib/components/home/ImmersiveBand.svelte';
	import Mantra from '$lib/components/home/Mantra.svelte';
	import Approche from '$lib/components/home/Approche.svelte';
	import EspritAme from '$lib/components/home/EspritAme.svelte';
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

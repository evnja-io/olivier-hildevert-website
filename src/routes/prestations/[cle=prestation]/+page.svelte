<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { IMAGES_PRESTATIONS } from '$lib/booking/images';

	let { data } = $props();

	const prestation = $derived(data.prestation);
	const photo = $derived(IMAGES_PRESTATIONS[prestation.cle]);
	const reservation = resolve('/reservation');
</script>

<svelte:head>
	<title>{prestation.titre} — {site.name}</title>
	<meta name="description" content={prestation.descCarte} />
	<link rel="canonical" href="{site.url}/prestations/{prestation.cle}" />
</svelte:head>

<article class="wrap pt-36 pb-[clamp(64px,8vw,112px)]">
	<div class="max-w-[760px]">
		<a class="eyebrow" href="{resolve('/')}#prestations">Prestations</a>
		<h1 class="mt-5 mb-5 text-4xl tracking-[0.005em] sm:text-5xl">{prestation.titre}</h1>
		<p class="text-lg leading-[1.62] text-ink-soft">{prestation.descCarte}</p>
		{#if prestation.infosPratiques}
			<p class="mt-5 font-mono text-xs leading-[1.6] tracking-[0.16em] text-coral-ink uppercase">
				{prestation.infosPratiques}
			</p>
		{/if}
	</div>

	<div class="my-[clamp(36px,5vw,64px)] aspect-[16/9] overflow-hidden rounded-card">
		<enhanced:img
			src={photo.image}
			alt={photo.alt}
			fetchpriority="high"
			loading="eager"
			sizes="(min-width: 1280px) 1200px, 100vw"
			class="h-full w-full object-cover"
		/>
	</div>

	<div class="max-w-[760px]">
		<!-- HTML produit par renderMarkdown (src/lib/server/markdown.ts) : HTML brut
		     échappé, liens dangereux neutralisés. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="texte-riche">{@html data.descLongueHtml}</div>

		<a
			class="mt-10 btn btn-sun"
			href="{reservation}?prestation={prestation.cle}"
			onclick={(e) => {
				e.preventDefault();
				openBooking(prestation.cle);
			}}
		>
			{prestation.actionCarte}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</a>
	</div>
</article>

<section aria-labelledby="autres-titre" class="bg-sky-2 py-[clamp(64px,8vw,112px)]">
	<div class="wrap">
		<h2 id="autres-titre" class="mb-10 text-3xl">Voir les autres accompagnements</h2>
		<div class="grid gap-5.5 sm:grid-cols-3">
			{#each data.autres as autre (autre.cle)}
				<a
					href={resolve('/prestations/[cle=prestation]', { cle: autre.cle })}
					class="group overflow-hidden rounded-card border border-line bg-white transition-all duration-400 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--color-coral)_45%,transparent)]"
				>
					<div class="aspect-[4/3] overflow-hidden">
						<enhanced:img
							src={IMAGES_PRESTATIONS[autre.cle].image}
							alt=""
							loading="lazy"
							sizes="(min-width: 640px) 33vw, 100vw"
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-106"
						/>
					</div>
					<span class="block p-5 font-display text-xl">{autre.titre}</span>
				</a>
			{/each}
		</div>
	</div>
</section>

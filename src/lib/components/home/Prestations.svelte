<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { PrestationId } from '$lib/booking/prestations';
	import type { IntroSection, PrestationContent } from '$lib/content/types';
	import { defaultAccueil, defaultPrestations } from '$lib/content/defaults';

	import cardIndividuelle from '$lib/assets/card-individuelle.jpg?enhanced';
	import cardProgramme from '$lib/assets/card-programme.jpg?enhanced';
	import cardEntreprise from '$lib/assets/card-entreprise.jpg?enhanced';
	import cardStages from '$lib/assets/card-stages.jpg?enhanced';

	let {
		intro = defaultAccueil.prestationsIntro,
		prestations = defaultPrestations
	}: { intro?: IntroSection; prestations?: PrestationContent[] } = $props();

	const reservation = resolve('/reservation');

	type EnhancedSrc = typeof cardIndividuelle;

	// Les images restent locales, appariées par clé stable.
	const IMAGES_PRESTATIONS: Record<PrestationId, { image: EnhancedSrc; alt: string }> = {
		individuelle: {
			image: cardIndividuelle,
			alt: "Personne assise en méditation au bord d'une falaise, face à la mer au soleil levant"
		},
		programme: {
			image: cardProgramme,
			alt: 'Sentier de crête serpentant vers le soleil levant au-dessus des montagnes'
		},
		entreprise: {
			image: cardEntreprise,
			alt: 'Petit groupe de professionnels en échange sur une passerelle en forêt, lumière dorée'
		},
		stage: {
			image: cardStages,
			alt: "Cercle de participants réunis autour d'un feu de camp et de lanternes au crépuscule"
		}
	};

	const cartes = $derived(prestations.map((p) => ({ ...p, ...IMAGES_PRESTATIONS[p.cle] })));
</script>

<section id="prestations" class="relative z-1 scroll-mt-24 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
			<span class="eyebrow">{intro.eyebrow}</span>
			<h2 class="mt-5 mb-4.5 text-4xl tracking-[0.005em]">
				{intro.titre}
			</h2>
			<p class="text-base leading-[1.66] text-ink-soft">
				{intro.paragraphe}
			</p>
		</div>
		<div class="grid gap-5.5 sm:grid-cols-2 xl:grid-cols-4">
			{#each cartes as carte, i (carte.cle)}
				<!-- La carte n'est plus un lien englobant : l'action vit sur son
				     bouton (retours client du 2026-09-25), et « En savoir plus »
				     viendra s'y ajouter à côté. -->
				<article
					class="reveal group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition-all duration-400 hover:-translate-y-1.5 hover:border-[color-mix(in_oklab,var(--color-coral)_45%,transparent)] hover:shadow-[0_40px_74px_-44px_color-mix(in_oklab,var(--color-ember)_58%,transparent)]"
					{@attach reveal(i * 85)}
				>
					<div class="relative aspect-square overflow-hidden">
						<enhanced:img
							src={carte.image}
							alt={carte.alt}
							loading="lazy"
							sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, calc(100vw - 2.75rem)"
							class="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-106"
						/>
					</div>
					<div class="flex flex-1 flex-col gap-3 p-[22px_24px]">
						<h3 class="text-2xl tracking-[0.01em] xl:text-xl">{carte.titre}</h3>
						<p class="flex-1 text-sm leading-[1.62] text-ink-soft">{carte.descCarte}</p>
						<div class="flex flex-wrap items-center gap-3 border-t border-line pt-4">
							<a
								class="btn btn-sun"
								href="{reservation}?prestation={carte.cle}"
								onclick={(e) => {
									e.preventDefault();
									openBooking(carte.cle);
								}}
							>
								{carte.actionCarte}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

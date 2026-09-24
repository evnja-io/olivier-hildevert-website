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
	const IMAGES_PRESTATIONS: Record<PrestationId, { num: string; image: EnhancedSrc; alt: string }> =
		{
			individuelle: {
				num: '01',
				image: cardIndividuelle,
				alt: "Personne assise en méditation au bord d'une falaise, face à la mer au soleil levant"
			},
			programme: {
				num: '02',
				image: cardProgramme,
				alt: 'Sentier de crête serpentant vers le soleil levant au-dessus des montagnes'
			},
			entreprise: {
				num: '03',
				image: cardEntreprise,
				alt: 'Petit groupe de professionnels en échange sur une passerelle en forêt, lumière dorée'
			},
			stage: {
				num: '04',
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
				<a
					href="{reservation}?prestation={carte.cle}"
					class="reveal group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition-all duration-400 hover:-translate-y-1.5 hover:border-[color-mix(in_oklab,var(--color-coral)_45%,transparent)] hover:shadow-[0_40px_74px_-44px_color-mix(in_oklab,var(--color-ember)_58%,transparent)]"
					{@attach reveal(i * 85)}
					onclick={(e) => {
						e.preventDefault();
						openBooking(carte.cle);
					}}
				>
					<div class="relative aspect-square overflow-hidden">
						<span
							class="absolute top-3.5 left-4 z-2 rounded-full bg-[color-mix(in_oklab,var(--color-ember)_52%,transparent)] px-2.5 py-[5px] font-mono text-xs tracking-[0.14em] text-white backdrop-blur-[3px]"
						>
							{carte.num}
						</span>
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
						<div
							class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-line pt-4"
						>
							<b class="font-display text-lg font-normal text-ink">{carte.prixCarte}</b>
							<span
								class="font-mono text-xs tracking-[0.1em] text-coral-ink uppercase transition-transform duration-250 group-hover:translate-x-[5px]"
							>
								{carte.actionCarte}
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

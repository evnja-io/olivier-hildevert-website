<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import type { HeroContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.hero }: { content?: HeroContent } = $props();

	let ready = $state(false);
	$effect(() => {
		requestAnimationFrame(() => (ready = true));
	});
</script>

<section class="on-warm relative overflow-hidden pt-28 pb-21 max-sm:pt-[138px]">
	<enhanced:img
		src="$lib/assets/hero-mer.jpg?quality=80"
		alt=""
		fetchpriority="high"
		loading="eager"
		sizes="100vw"
		class="absolute inset-0 h-full w-full object-cover object-[68%_center]"
	/>
	<div class="hero-wash absolute inset-0 z-1" aria-hidden="true"></div>

	<div class="relative z-3 wrap">
		<div class="hero-copy max-w-[min(1000px,100%)]" class:ready>
			<span class="eyebrow text-amber-soft!">{content.eyebrow}</span>
			<h1
				class="hero-titre mt-6.5 mb-7 font-merriweather text-4xl font-bold tracking-[0.006em] text-[#A9CBF5]"
			>
				<span>{content.titreLigne1}</span>
				<em class="not-italic">{content.titreLigne2}</em>
			</h1>
			<p class="mb-3.5 max-w-[34em] text-base text-on-dusk">{content.paragraphe}</p>
			<p class="mb-9 font-mono text-xs leading-[1.6] tracking-[0.16em] text-on-dusk uppercase">
				{content.ligneMono}
			</p>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-[13px]">
				<a
					class="btn btn-sun justify-center sm:justify-start"
					href={resolve('/reservation')}
					onclick={(e) => {
						e.preventDefault();
						openBooking();
					}}
				>
					{content.boutonPrincipal}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</a>
				<a class="btn btn-line justify-center sm:justify-start" href="{resolve('/')}#approche"
					>{content.boutonSecondaire}</a
				>
			</div>
			<div
				class="mt-10.5 grid border-t border-[color-mix(in_oklab,#fff_34%,transparent)] pt-5.5 md:flex"
			>
				<!-- La rangée passe à `md` (768 px) et non `sm` : à 640 px les trois
				     colonnes ne réclamaient que 634 px pour 596 px disponibles, et
				     « + de 10 000 » se cassait en deux. En dessous, les repères
				     s'empilent sur toute la largeur.
				     `max-w-[22ch]` borne la légende et elle seule : posée sur la colonne,
				     elle se calculait sur la police héritée (~220 px) et cassait les
				     nombres en deux (« Depuis / 1992 »). Sur la légende, les `ch` se
				     calculent bien sur la police du texte qu'ils doivent contenir. -->
				{#each content.stats as stat (stat.valeur)}
					<div
						class="border-b border-[color-mix(in_oklab,#fff_22%,transparent)] py-4 last:border-b-0 md:mr-[clamp(24px,2.4vw,40px)] md:border-r md:border-b-0 md:py-0 md:pr-[clamp(24px,2.4vw,40px)] md:last:mr-0 md:last:border-r-0 md:last:pr-0"
					>
						<strong
							class="mb-1.5 block font-display text-[clamp(30px,2.6vw,42px)] leading-none font-normal text-amber-soft"
						>
							{stat.valeur}
						</strong>
						<span
							class="block max-w-[22ch] font-mono text-xs leading-[1.5] font-medium tracking-[0.1em] text-on-dusk uppercase"
						>
							{stat.legende}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* voile crépuscule uniforme sur toute la photo : le texte passe en clair
	   (crème, ambre, bleu ciel) et reste lisible sans ombre portée. Un peu plus
	   dense en haut, où se trouvent l'en-tête et le titre. */
	.hero-wash {
		pointer-events: none;
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--color-dusk) 66%, transparent) 0%,
			color-mix(in oklab, var(--color-dusk) 56%, transparent) 100%
		);
	}

	/* « Décoder le visible, grâce à l'invisible » tient sur une ligne à partir
	   de 900 px : 38 caractères ≈ 763 px pour 856 px de colonne utile au seuil,
	   et ≈ 909 px pour 1000 px de bloc à 2560 px. En dessous, il se répartit
	   sur deux lignes. */
	.hero-titre {
		line-height: 1.14;
	}
	.hero-titre > :global(span) {
		display: block;
	}
	@media (min-width: 900px) {
		.hero-titre {
			white-space: nowrap;
		}
		.hero-titre > :global(span) {
			display: inline;
		}
	}

	/* entrée en cascade du bloc texte */
	.hero-copy > :global(*) {
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.9s ease,
			transform 1s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.hero-copy.ready > :global(*) {
		opacity: 1;
		transform: none;
	}
	.hero-copy.ready > :global(:nth-child(1)) {
		transition-delay: 0.05s;
	}
	.hero-copy.ready > :global(:nth-child(2)) {
		transition-delay: 0.13s;
	}
	.hero-copy.ready > :global(:nth-child(3)) {
		transition-delay: 0.22s;
	}
	.hero-copy.ready > :global(:nth-child(4)) {
		transition-delay: 0.31s;
	}
	.hero-copy.ready > :global(:nth-child(5)) {
		transition-delay: 0.4s;
	}
	.hero-copy.ready > :global(:nth-child(6)) {
		transition-delay: 0.49s;
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-copy > :global(*) {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}
	}
</style>

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

<section class="relative overflow-hidden pt-28 pb-21 max-sm:pt-[138px]">
	<enhanced:img
		src="$lib/assets/hero-mer.jpg"
		alt=""
		fetchpriority="high"
		loading="eager"
		sizes="100vw"
		class="absolute inset-0 h-full w-full object-cover object-[center_58%]"
	/>
	<div class="hero-wash absolute inset-0 z-1" aria-hidden="true"></div>

	<div class="relative z-3 wrap">
		<div
			class="hero-copy max-w-[min(1000px,100%)] [text-shadow:0_1px_10px_rgba(255,246,236,0.55)]"
			class:ready
		>
			<span class="eyebrow text-[#A55A43]!">{content.eyebrow}</span>
			<h1 class="hero-titre mt-6.5 mb-7 text-4xl tracking-[0.006em]">
				<span class="font-rubik text-[#396CB2]">{content.titreLigne1}</span>
				<em class="font-merriweather font-bold text-coral not-italic">{content.titreLigne2}</em>
			</h1>
			<p class="mb-3.5 max-w-[34em] text-base text-ink">{content.paragraphe}</p>
			<p class="mb-9 font-mono text-xs leading-[1.6] tracking-[0.16em] text-[#5E4108] uppercase">
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
				class="mt-10.5 grid border-t border-[color-mix(in_oklab,var(--color-ink)_26%,transparent)] pt-5.5 sm:flex"
			>
				{#each content.stats as stat (stat.valeur)}
					<div
						class="border-b border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] py-4 last:border-b-0 sm:mr-[clamp(24px,2.4vw,40px)] sm:max-w-[22ch] sm:border-r sm:border-b-0 sm:py-0 sm:pr-[clamp(24px,2.4vw,40px)] sm:last:mr-0 sm:last:border-r-0 sm:last:pr-0"
					>
						<strong
							class="mb-1.5 block font-display text-[clamp(30px,2.6vw,42px)] leading-none font-normal text-coral-ink"
						>
							{stat.valeur}
						</strong>
						<span
							class="block font-mono text-xs leading-[1.5] font-medium tracking-[0.1em] text-ink-soft uppercase"
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
	/* dégradé crème : le texte reste lisible sur la photo d'aube.
	   Horizontal sur grand écran (texte à gauche, mer à droite) ; vertical en
	   dessous de 900 px, où le texte occupe toute la largeur. */
	.hero-wash {
		pointer-events: none;
		background: linear-gradient(
			178deg,
			rgba(255, 246, 236, 0.92) 0%,
			rgba(255, 246, 236, 0.86) 46%,
			rgba(255, 246, 236, 0.66) 74%,
			rgba(255, 246, 236, 0.4) 100%
		);
	}
	@media (min-width: 900px) {
		.hero-wash {
			background: linear-gradient(
				90deg,
				rgba(255, 246, 236, 0.88) 0%,
				rgba(255, 246, 236, 0.82) 34%,
				rgba(255, 246, 236, 0.66) 52%,
				rgba(255, 246, 236, 0.44) 68%,
				rgba(255, 246, 236, 0.2) 84%,
				rgba(255, 246, 236, 0) 98%
			);
		}
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

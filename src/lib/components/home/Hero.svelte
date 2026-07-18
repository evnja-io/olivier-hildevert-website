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
		src="$lib/assets/hero-bg.jpg"
		alt=""
		fetchpriority="high"
		loading="eager"
		sizes="100vw"
		class="absolute inset-0 h-full w-full object-cover object-right"
	/>
	<div class="hero-wash absolute inset-0 z-1" aria-hidden="true"></div>

	<div class="relative z-3 wrap">
		<div
			class="hero-copy max-w-[600px] [text-shadow:0_1px_10px_rgba(255,246,236,0.55)]"
			class:ready
		>
			<span class="eyebrow text-[#A55A43]!">{content.eyebrow}</span>
			<h1
				class="mt-6.5 mb-7 font-rubik text-[34px] leading-[1.3] tracking-[0.006em] text-[#396CB2]"
			>
				{content.titreLigne1}<br />
				<em
					class="mt-[0.06em] inline-block font-merriweather text-[32px] leading-[0.9] font-bold text-coral not-italic"
				>
					{content.titreLigne2}
				</em>
			</h1>
			<p class="mb-3.5 max-w-[25em] text-[18.5px] leading-[1.7] text-ink">
				{content.paragraphe}
			</p>
			<p class="mb-9 font-mono text-[11px] tracking-[0.16em] text-[#5E4108] uppercase">
				{content.ligneMono}
			</p>
			<div class="flex items-center gap-[13px]">
				<a
					class="btn btn-sun"
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
				<a class="btn btn-line" href="{resolve('/')}#approche">{content.boutonSecondaire}</a>
			</div>
			<div
				class="mt-10.5 flex max-w-[560px] border-t border-[color-mix(in_oklab,var(--color-ink)_26%,transparent)] pt-5.5 max-sm:flex-wrap max-sm:gap-y-3.5"
			>
				{#each content.stats as stat (stat.valeur)}
					<div
						class="mr-6.5 border-r border-[color-mix(in_oklab,var(--color-ink)_22%,transparent)] pr-6.5 last:mr-0 last:border-r-0 last:pr-0 max-sm:mr-5 max-sm:pr-5"
					>
						<strong
							class="mb-1.5 block font-display text-[27px] leading-none font-normal text-coral"
						>
							{stat.valeur}
						</strong>
						<span
							class="font-mono text-[9.5px] font-medium tracking-[0.12em] whitespace-nowrap text-ink-soft uppercase"
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
	/* dégradé crème : le texte reste lisible sur la photo d'aube */
	.hero-wash {
		pointer-events: none;
		background: linear-gradient(
			90deg,
			rgba(255, 246, 236, 0.85) 0%,
			rgba(255, 246, 236, 0.78) 28%,
			rgba(255, 246, 236, 0.62) 45%,
			rgba(255, 246, 236, 0.42) 60%,
			rgba(255, 246, 236, 0.24) 73%,
			rgba(255, 246, 236, 0.08) 86%,
			rgba(255, 246, 236, 0) 96%
		);
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

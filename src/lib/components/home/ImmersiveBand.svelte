<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		image,
		children,
		onWarm = false,
		tight = false,
		soft = false
	}: {
		id?: string;
		/** Image de fond plein-bleed (enhanced:img rendue par le parent). */
		image: Snippet;
		children: Snippet;
		/** Inverse les boutons btn-line pour les fonds chauds (section contact). */
		onWarm?: boolean;
		/** Variante basse (bande mantra). */
		tight?: boolean;
		/** Voile sombre allégé (bandes mantra et « Pour qui ? »). */
		soft?: boolean;
	} = $props();
</script>

<section
	{id}
	class="band relative z-1 flex scroll-mt-24 items-center overflow-hidden text-white {onWarm
		? 'on-warm'
		: ''} {tight ? 'min-h-[380px]' : 'min-h-[clamp(460px,70vh,660px)]'}"
	class:soft
>
	<div class="band-bg absolute inset-0 z-0">
		{@render image()}
	</div>
	<div class="relative z-2 w-full {tight ? 'py-12' : 'py-[78px]'}">
		{@render children()}
	</div>
</section>

<style>
	/* lumière chaude : voile radial corail → vermillon en multiply, puis
	   vignette crépuscule. Renforcé : le blanc et l'ambre se noyaient dans les
	   zones claires des photos (sable, feuillage). */
	.band-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			120% 120% at 50% 50%,
			color-mix(in oklab, var(--color-coral) 46%, transparent),
			color-mix(in oklab, var(--color-ember) 96%, transparent)
		);
		mix-blend-mode: multiply;
	}
	.band::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background: radial-gradient(
			125% 125% at 50% 45%,
			color-mix(in oklab, var(--color-dusk) 18%, transparent) 0%,
			color-mix(in oklab, var(--color-dusk) 66%, transparent) 100%
		);
	}
	/* variante allégée : le voile reste assez dense pour le texte blanc */
	.soft .band-bg::after {
		background: radial-gradient(
			120% 120% at 50% 50%,
			color-mix(in oklab, var(--color-coral) 34%, transparent),
			color-mix(in oklab, var(--color-ember) 76%, transparent)
		);
	}
	.soft::after {
		background: radial-gradient(
			125% 125% at 50% 45%,
			color-mix(in oklab, var(--color-dusk) 8%, transparent) 0%,
			color-mix(in oklab, var(--color-dusk) 40%, transparent) 100%
		);
	}
	.band-bg :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(1.08) brightness(0.86);
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		image,
		children,
		onWarm = false,
		tight = false
	}: {
		id?: string;
		/** Image de fond plein-bleed (enhanced:img rendue par le parent). */
		image: Snippet;
		children: Snippet;
		/** Inverse les boutons btn-line pour les fonds chauds (section contact). */
		onWarm?: boolean;
		/** Variante basse (bande mantra). */
		tight?: boolean;
	} = $props();
</script>

<section
	{id}
	class="band relative z-1 flex scroll-mt-24 items-center overflow-hidden text-white {onWarm
		? 'on-warm'
		: ''} {tight ? 'min-h-[380px]' : 'min-h-[clamp(460px,70vh,660px)]'}"
>
	<div class="band-bg absolute inset-0 z-0">
		{@render image()}
	</div>
	<div class="relative z-2 w-full {tight ? 'py-12' : 'py-[78px]'}">
		{@render children()}
	</div>
</section>

<style>
	/* lumière chaude : voile radial corail → vermillon en multiply, puis vignette crépuscule */
	.band-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			120% 120% at 50% 50%,
			color-mix(in oklab, var(--color-coral) 30%, transparent),
			color-mix(in oklab, var(--color-ember) 80%, transparent)
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
			120% 120% at 50% 50%,
			transparent 30%,
			color-mix(in oklab, var(--color-dusk) 42%, transparent)
		);
	}
	.band-bg :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(1.05) contrast(1.02);
	}
</style>

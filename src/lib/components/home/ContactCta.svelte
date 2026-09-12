<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { ContactCtaContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.contactCta }: { content?: ContactCtaContent } = $props();
</script>

<div class="wrap">
	<div class="reveal relative mx-auto max-w-[760px] text-center text-white" {@attach reveal()}>
		<span class="eyebrow eyebrow-center text-amber-soft!">{content.eyebrow}</span>
		<h2 class="mt-4.5 mb-4.5 text-5xl tracking-[0.005em]">
			{content.titre}
		</h2>
		<p class="mx-auto mb-8 max-w-[36em] text-base leading-[1.66] text-white/90">
			{content.paragraphe}
		</p>
		<a
			class="btn inline-flex bg-white text-ember shadow-none hover:bg-amber-soft hover:text-dusk"
			href={resolve('/reservation')}
			onclick={(e) => {
				e.preventDefault();
				openBooking();
			}}
		>
			{content.boutonLabel}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</a>
		<div class="mt-7.5 flex flex-wrap justify-center gap-6.5">
			{#each content.modes as mode (mode)}
				<span
					class="flex items-center gap-2 font-mono text-xs tracking-[0.13em] text-white/84 uppercase"
				>
					<span class="h-[5px] w-[5px] rounded-full bg-amber-soft" aria-hidden="true"></span>
					{mode}
				</span>
			{/each}
		</div>
	</div>
</div>

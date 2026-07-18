<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { PrestationId } from '$lib/booking/prestations';
	import type { TarifsContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.tarifs }: { content?: TarifsContent } = $props();

	const reservation = resolve('/reservation');

	function ouvrir(e: MouseEvent, id: PrestationId) {
		e.preventDefault();
		openBooking(id);
	}
</script>

<section id="tarifs" class="relative z-1 scroll-mt-24 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="reveal mx-auto mb-16 max-w-[640px] text-center" {@attach reveal()}>
			<span class="eyebrow eyebrow-center">{content.eyebrow}</span>
			<h2 class="mt-5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">{content.titre}</h2>
		</div>
		<div class="grid items-stretch gap-4.5 lg:grid-cols-3">
			{#each content.cartes as carte, i (carte.label)}
				{#if carte.misEnAvant}
					<div
						class="reveal flex flex-col items-center gap-2 rounded-card bg-linear-165 from-coral to-ember px-7.5 py-11 text-center text-white shadow-[0_34px_70px_-38px_color-mix(in_oklab,var(--color-ember)_80%,transparent)] lg:-translate-y-2.5"
						{@attach reveal(i * 90)}
					>
						<span class="font-mono text-[10.5px] tracking-[0.2em] text-amber-soft uppercase">
							{carte.label}
						</span>
						<div class="my-1.5 font-display text-[56px] leading-none">
							{carte.montant}{#if carte.suffixe}<small class="text-xl text-white/82">
									{carte.suffixe}</small
								>{/if}
						</div>
						<p class="mb-3 text-[13.5px] leading-[1.55] text-white/88">{carte.sousTexte}</p>
						<a
							class="btn bg-white text-ember shadow-none hover:bg-amber-soft hover:text-dusk"
							href="{reservation}?prestation={carte.prestationCle}"
							onclick={(e) => ouvrir(e, carte.prestationCle)}
						>
							{carte.boutonLabel}
						</a>
					</div>
				{:else}
					<div
						class="reveal flex flex-col items-center gap-2 rounded-card border border-line bg-white px-7.5 py-11 text-center shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_36%,transparent)]"
						{@attach reveal(i * 90)}
					>
						<span class="font-mono text-[10.5px] tracking-[0.2em] text-coral uppercase">
							{carte.label}
						</span>
						<div class="my-1.5 font-display text-[56px] leading-none text-ink">
							{carte.montant}{#if carte.suffixe}<small class="text-xl"> {carte.suffixe}</small>{/if}
						</div>
						<p class="mb-3 text-[13.5px] leading-[1.55] text-ink-soft">{carte.sousTexte}</p>
						<a
							class="btn btn-line"
							href="{reservation}?prestation={carte.prestationCle}"
							onclick={(e) => ouvrir(e, carte.prestationCle)}
						>
							{carte.boutonLabel}
						</a>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

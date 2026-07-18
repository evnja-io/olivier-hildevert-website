<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { BoutiqueContent, CleImageBoutique } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	import bookCover from '$lib/assets/book-cover.jpeg?enhanced';
	import luminame from '$lib/assets/luminame.jpg?enhanced';

	let { content = defaultAccueil.boutique }: { content?: BoutiqueContent } = $props();

	const reservation = resolve('/reservation');

	type EnhancedSrc = typeof bookCover;

	// Les images restent locales, appariées au contenu par cleImage.
	const IMAGES_BOUTIQUE: Record<
		CleImageBoutique,
		{ image: EnhancedSrc; alt: string; ratio: string; style?: string }
	> = {
		livre: {
			image: bookCover,
			alt: "Couverture du roman Angela, l'ange est là !",
			ratio: 'aspect-3/4'
		},
		veilleuses: {
			image: luminame,
			alt: 'Veilleuse LUMINÂME gravée de motifs sacrés, allumée sur un socle en bois',
			ratio: 'aspect-square',
			style: 'object-position: 38% center'
		}
	};
</script>

<section
	id="boutique"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap">
		<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
			<span class="eyebrow">{content.eyebrow}</span>
			<h2 class="mt-5 mb-4.5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">
				{content.titre}
			</h2>
			<p class="text-[17.5px] leading-[1.66] text-ink-soft">
				{content.paragraphe}
			</p>
		</div>
		<div class="grid gap-5.5 lg:grid-cols-2">
			{#each content.produits as produit (produit.cleImage)}
				{@const img = IMAGES_BOUTIQUE[produit.cleImage]}
				<div
					class="reveal grid items-center gap-6 rounded-card border border-line bg-white p-6 shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition hover:-translate-y-[5px] hover:shadow-[0_38px_76px_-46px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] sm:grid-cols-[0.82fr_1.18fr]"
					{@attach reveal()}
				>
					<div
						class="{img.ratio} overflow-hidden rounded-btn shadow-[0_16px_38px_-22px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] max-sm:mx-auto max-sm:max-w-[200px]"
					>
						<enhanced:img
							src={img.image}
							alt={img.alt}
							loading="lazy"
							sizes="(min-width: 640px) 240px, 200px"
							class="h-full w-full object-cover"
							style={img.style}
						/>
					</div>
					<div>
						<span class="font-mono text-[10px] tracking-[0.18em] text-coral uppercase">
							{produit.tag}
						</span>
						<h3 class="mt-2 mb-2.5 text-[26px] tracking-[0.01em]">{produit.titre}</h3>
						<p class="mb-4.5 text-[13.5px] leading-[1.6] text-ink-soft">
							{produit.desc}
						</p>
						<div class="flex flex-wrap items-center gap-3.5">
							<b class="font-mono text-[11px] tracking-[0.08em] text-mute uppercase">
								{produit.prixTexte}
							</b>
							<a
								class="btn btn-line"
								href={reservation}
								onclick={(e) => {
									e.preventDefault();
									openBooking();
								}}
							>
								{produit.boutonLabel}
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

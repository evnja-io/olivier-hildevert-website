<script lang="ts">
	import { resolve } from '$app/paths';
	import { reveal } from '$lib/attachments/reveal';
	import { openCommande } from '$lib/commande/commande.svelte';
	import type { BoutiqueContent, CleImageBoutique } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	import bookCover from '$lib/assets/book-cover.jpeg?enhanced';
	import luminame from '$lib/assets/luminame.jpg?enhanced';

	let { content = defaultAccueil.boutique }: { content?: BoutiqueContent } = $props();

	type EnhancedSrc = typeof bookCover;

	// Images locales des produits d'origine, appariées par cleImage. Un visuel
	// envoyé dans Strapi (`produit.image`) les remplace.
	const IMAGES_BOUTIQUE: Record<
		CleImageBoutique,
		{ image: EnhancedSrc; alt: string; position: string }
	> = {
		livre: {
			image: bookCover,
			alt: "Couverture du roman Angela, l'ange est là !",
			position: 'center 30%'
		},
		veilleuses: {
			image: luminame,
			alt: 'Veilleuse LUMINÂME gravée de motifs sacrés, allumée sur un socle en bois',
			position: '38% center'
		}
	};

	const commande = resolve('/commande');
	const SIZES = '(min-width: 1280px) 380px, (min-width: 768px) 45vw, calc(100vw - 2.75rem)';
</script>

<section
	id="boutique"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap">
		<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
			<span class="eyebrow">{content.eyebrow}</span>
			<h2 class="mt-5 mb-4.5 text-4xl tracking-[0.005em]">
				{content.titre}
			</h2>
			<p class="text-base leading-[1.66] text-ink-soft">
				{content.paragraphe}
			</p>
		</div>
		<!-- Cartes verticales : le nombre de produits est libre (géré dans Strapi). -->
		<div class="grid gap-5.5 md:grid-cols-2 xl:grid-cols-3">
			{#each content.produits as produit, i (`${i}-${produit.titre}`)}
				{@const locale = produit.cleImage ? IMAGES_BOUTIQUE[produit.cleImage] : undefined}
				<article
					class="reveal flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition hover:-translate-y-[5px] hover:shadow-[0_38px_76px_-46px_color-mix(in_oklab,var(--color-ember)_50%,transparent)]"
					{@attach reveal(i * 85)}
				>
					<!-- Visuel Strapi en object-contain : un visuel Canva (A4, carré,
					     paysage) s'affiche en entier, quel que soit son format — le carré
					     le remplit exactement. Les images locales, recadrées à la main,
					     restent en object-cover. `absolute` : <enhanced:img> enveloppe
					     l'image dans un <picture> où `h-full` ne prendrait pas. -->
					{#if produit.image}
						<div class="relative aspect-square bg-surface-2">
							<img
								src={produit.image.src}
								srcset={produit.image.srcset}
								sizes={SIZES}
								width={produit.image.largeur}
								height={produit.image.hauteur}
								alt={produit.image.alt}
								loading="lazy"
								class="absolute inset-0 h-full w-full object-contain"
							/>
						</div>
					{:else if locale}
						<div class="relative aspect-square overflow-hidden">
							<enhanced:img
								src={locale.image}
								alt={locale.alt}
								loading="lazy"
								sizes={SIZES}
								class="absolute inset-0 h-full w-full object-cover"
								style="object-position: {locale.position}"
							/>
						</div>
					{/if}
					<div class="flex flex-1 flex-col p-[22px_24px]">
						<span class="font-mono text-xs tracking-[0.18em] text-coral-ink uppercase">
							{produit.tag}
						</span>
						<h3 class="mt-2 mb-2.5 text-2xl tracking-[0.01em]">{produit.titre}</h3>
						<p class="mb-4.5 flex-1 text-sm leading-[1.6] text-ink-soft">
							{produit.desc}
						</p>
						<b class="mb-4 font-mono text-xs tracking-[0.08em] text-mute uppercase">
							{produit.prixTexte}
						</b>
						<div class="flex flex-col gap-3 border-t border-line pt-4">
							<!-- On se renseigne avant de s'engager : « En savoir plus » d'abord. -->
							{#if produit.info}
								<a
									class="btn btn-line justify-center"
									href={produit.info}
									target="_blank"
									rel="external noopener noreferrer"
								>
									En savoir plus<span class="sr-only">&nbsp;: {produit.titre}</span>
								</a>
							{/if}
							{#if produit.lien}
								<a
									class="btn btn-sun justify-center"
									href={produit.lien}
									target="_blank"
									rel="external noopener noreferrer"
								>
									{produit.boutonLabel}<span class="sr-only">&nbsp;: {produit.titre}</span>
								</a>
							{:else}
								<a
									class="btn btn-sun justify-center"
									href="{commande}?produit={encodeURIComponent(
										produit.titre
									)}{produit.typeDemande === 'inscription' ? '&type=inscription' : ''}"
									onclick={(e) => {
										e.preventDefault();
										openCommande(produit.titre, produit.typeDemande);
									}}
								>
									{produit.boutonLabel}<span class="sr-only">&nbsp;: {produit.titre}</span>
								</a>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

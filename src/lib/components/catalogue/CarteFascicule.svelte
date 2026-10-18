<script lang="ts">
	import { resolve } from '$app/paths';
	import { openCommande } from '$lib/commande/commande.svelte';
	import { TEXTES_DEMANDE } from '$lib/commande/textes';
	import type { FasciculeContent } from '$lib/content/types';

	let { fascicule }: { fascicule: FasciculeContent } = $props();

	const commande = resolve('/commande');
	const SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, calc(100vw - 2.75rem)';
</script>

<article
	class="flex w-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)]"
>
	{#if fascicule.couverture}
		<div class="relative aspect-square bg-surface-2">
			<img
				src={fascicule.couverture.src}
				srcset={fascicule.couverture.srcset}
				sizes={SIZES}
				width={fascicule.couverture.largeur}
				height={fascicule.couverture.hauteur}
				alt={fascicule.couverture.alt}
				loading="lazy"
				class="absolute inset-0 h-full w-full object-contain"
			/>
		</div>
	{/if}
	<div class="flex flex-1 flex-col p-[22px_24px]">
		<h3 class="mb-2.5 text-2xl tracking-[0.01em]">{fascicule.titre}</h3>
		{#if fascicule.description}
			<p class="mb-4.5 flex-1 text-sm leading-[1.6] text-ink-soft">{fascicule.description}</p>
		{/if}
		<b class="mb-4 font-mono text-xs tracking-[0.08em] text-mute uppercase">
			{fascicule.prixTexte ?? 'Gratuit'}
		</b>
		{#if fascicule.action.kind !== 'aucune'}
			<div class="mt-auto flex flex-col gap-3 border-t border-line pt-4">
				{#if fascicule.action.kind === 'telecharger'}
					<a
						class="btn btn-sun justify-center"
						href={fascicule.action.url}
						target="_blank"
						rel="external noopener noreferrer"
					>
						Télécharger<span class="sr-only">&nbsp;: {fascicule.titre}</span>
					</a>
				{:else if fascicule.action.kind === 'lien'}
					<a
						class="btn btn-sun justify-center"
						href={fascicule.action.url}
						target="_blank"
						rel="external noopener noreferrer"
					>
						Commander<span class="sr-only">&nbsp;: {fascicule.titre}</span>
					</a>
				{:else}
					{@const type = fascicule.action.type}
					<a
						class="btn btn-sun justify-center"
						href="{commande}?produit={encodeURIComponent(fascicule.titre)}{type === 'inscription'
							? '&type=inscription'
							: ''}"
						onclick={(e) => {
							e.preventDefault();
							openCommande(fascicule.titre, type);
						}}
					>
						{TEXTES_DEMANDE[type].titre}<span class="sr-only">&nbsp;: {fascicule.titre}</span>
					</a>
				{/if}
			</div>
		{/if}
	</div>
</article>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { reveal } from '$lib/attachments/reveal';
	import type { SectionCatalogue } from '$lib/content/types';

	let {
		id,
		content,
		page,
		nombre,
		carte
	}: {
		id: string;
		content: SectionCatalogue;
		/** Page complète du catalogue. */
		page: '/audios' | '/fascicules';
		nombre: number;
		carte: Snippet<[number]>;
	} = $props();

	const href = $derived(resolve(page));
</script>

<!-- Catalogue vide : la section n'existe pas (ni ancre, ni titre orphelin). -->
{#if nombre > 0}
	<section {id} class="relative z-1 scroll-mt-24 bg-surface py-[clamp(86px,11vw,148px)]">
		<div class="wrap">
			<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
				<span class="eyebrow">{content.eyebrow}</span>
				<h2 class="mt-5 mb-4.5 text-4xl tracking-[0.005em]">{content.titre}</h2>
				{#if content.paragraphe}
					<p class="text-base leading-[1.66] text-ink-soft">{content.paragraphe}</p>
				{/if}
			</div>
			<div class="grid gap-5.5 md:grid-cols-2 xl:grid-cols-4">
				{#each { length: nombre }, i (i)}
					<div class="reveal flex" {@attach reveal(i * 85)}>
						{@render carte(i)}
					</div>
				{/each}
			</div>
			<div class="mt-12 flex justify-center">
				<a class="btn btn-line" {href}>
					Voir tout<span class="sr-only">&nbsp;: {content.eyebrow}</span>
				</a>
			</div>
		</div>
	</section>
{/if}

<script lang="ts">
	import type { AvisContent } from '$lib/content/types';

	let { avis }: { avis: AvisContent } = $props();
</script>

<figure
	class="flex w-full flex-col rounded-card border border-line bg-white p-[22px_24px] shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)]"
>
	<span aria-hidden="true" class="font-display text-5xl leading-[0.6] text-coral">“</span>
	<blockquote class="mt-3 flex-1 text-sm leading-[1.6] whitespace-pre-line text-ink-soft">
		{avis.texte}
	</blockquote>
	<figcaption class="mt-4.5 border-t border-line pt-4 text-sm font-bold text-ink">
		{avis.nom}
		{#if avis.contexte}
			<span class="block text-xs font-normal text-mute">{avis.contexte}</span>
		{/if}
	</figcaption>
</figure>

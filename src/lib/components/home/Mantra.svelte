<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';
	import type { MantraContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.mantra }: { content?: MantraContent } = $props();

	// segments impairs (entre *…*) mis en valeur
	const segments = $derived(content.citation.split('*'));
</script>

<div class="wrap">
	<div class="reveal mx-auto max-w-[900px] text-center" {@attach reveal()}>
		<p
			class="font-display text-[clamp(28px,4.3vw,52px)] leading-[1.22] tracking-[0.004em] [text-shadow:0_2px_30px_rgba(74,27,18,0.4)]"
		>
			{#each segments as segment, i (i)}
				{#if i % 2 === 1}<b class="font-normal text-amber-soft italic">{segment}</b
					>{:else}{segment}{/if}
			{/each}
		</p>
		<div class="rule mx-auto mt-7.5 max-w-[200px] text-white [&>b]:bg-amber-soft">
			<i></i><b></b><i></i>
		</div>
		<cite
			class="mt-4.5 block font-mono text-[11px] tracking-[0.26em] text-white/80 uppercase not-italic"
		>
			{content.auteur}
		</cite>
	</div>
</div>

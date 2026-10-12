<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';
	import type { PourQuiContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.pourQui }: { content?: PourQuiContent } = $props();
</script>

<!-- ombre douce, comme la citation du mantra : le voile allégé laisse le
     sable clair de la photo sous le texte blanc. Les publics, eux, sont des
     pastilles blanches pleines à texte orange (retours du 2026-10-12) : elles
     ne dépendent plus de la photo pour être lisibles. -->
<div class="wrap [text-shadow:0_2px_24px_rgba(74,27,18,0.45)]">
	<div class="reveal mx-auto mb-10.5 max-w-[640px] text-center" {@attach reveal()}>
		<span class="eyebrow eyebrow-center text-amber-soft!">{content.eyebrow}</span>
		<h2 class="mt-5 text-4xl tracking-[0.005em]">
			{content.titre}
		</h2>
	</div>
	<div
		class="reveal mx-auto flex max-w-[880px] flex-wrap justify-center gap-[11px]"
		{@attach reveal()}
	>
		{#each content.publics as public_ (public_)}
			<span
				class="rounded-full border border-white bg-white px-5 py-[11px] font-mono text-xs font-medium tracking-[0.08em] text-coral-ink shadow-[0_12px_30px_-18px_rgba(74,27,18,0.55)] transition [text-shadow:none] hover:-translate-y-[3px] hover:bg-sky"
			>
				{public_}
			</span>
		{/each}
	</div>
</div>

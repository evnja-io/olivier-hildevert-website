<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';
	import type { AProposContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.aPropos }: { content?: AProposContent } = $props();
</script>

<section
	id="apropos"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap grid items-center gap-16 lg:grid-cols-[0.84fr_1.16fr]">
		<div
			class="reveal relative aspect-4/5 w-full max-lg:mx-auto max-lg:max-w-[380px]"
			{@attach reveal()}
		>
			<div
				class="absolute -inset-y-4 -right-4 left-4 -z-1 rounded-card border border-coral opacity-55"
				aria-hidden="true"
			></div>
			<div
				class="absolute inset-0 overflow-hidden rounded-card shadow-[0_40px_90px_-44px_color-mix(in_oklab,var(--color-ember)_45%,transparent)]"
			>
				<enhanced:img
					src="$lib/assets/portrait-cabinet.jpg"
					alt="Olivier Hildevert souriant, assis à son bureau dans son cabinet"
					loading="lazy"
					sizes="(min-width: 1024px) 560px, calc(100vw - 2.75rem)"
					class="h-full w-full object-cover object-[center_40%]"
				/>
			</div>
			<span
				class="absolute -bottom-7.5 left-0 font-mono text-xs tracking-[0.16em] text-mute uppercase"
			>
				{content.legendePortrait}
			</span>
		</div>
		<div class="reveal" {@attach reveal()}>
			<span class="eyebrow">{content.eyebrow}</span>
			<h2 class="mt-3.5 mb-2 text-4xl">{content.titre}</h2>
			<p class="mb-6 font-mono text-xs tracking-[0.2em] text-coral uppercase">
				{content.sousTitre}
			</p>
			<p class="mb-4 text-base leading-[1.7] text-ink-soft">
				{content.paragraphe1}
			</p>
			<p class="mb-4 text-base leading-[1.7] text-ink-soft">
				{content.paragraphe2}
			</p>
			<blockquote
				class="my-6.5 border-l border-coral pl-6.5 font-display text-2xl leading-[1.38] text-plum italic"
			>
				{content.citation}
			</blockquote>
			<p class="mb-4 text-base leading-[1.7] text-ink-soft">
				{content.paragraphe3}
			</p>
			<div class="mt-6.5 flex flex-wrap gap-2.5">
				{#each content.qualifications as cred (cred)}
					<span
						class="rounded-full border border-line bg-[color-mix(in_oklab,var(--color-coral)_10%,#fff)] px-3.5 py-2 font-mono text-xs tracking-[0.08em] text-ink-soft"
					>
						{cred}
					</span>
				{/each}
			</div>
		</div>
	</div>
</section>

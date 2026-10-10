<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';
	import type { ReferencesContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.references }: { content?: ReferencesContent } = $props();
</script>

{#if content.entreprises.length > 0}
	<section
		id="references"
		aria-labelledby="references-titre"
		class="relative z-1 bg-sky py-[clamp(56px,7vw,96px)]"
	>
		<div class="reveal wrap text-center" {@attach reveal()}>
			<span class="eyebrow eyebrow-center">{content.eyebrow}</span>
			<h2 id="references-titre" class="mx-auto mt-4.5 max-w-[28em] text-3xl tracking-[0.005em]">
				{content.titre}
			</h2>
			<!-- Un logo n'apparaît que s'il a été envoyé dans Strapi (avec l'accord de
			     l'entreprise) ; sinon, le nom seul. -->
			<ul
				class="mx-auto mt-10 flex max-w-[1000px] flex-wrap items-center justify-center gap-x-10 gap-y-6"
			>
				{#each content.entreprises as entreprise, i (`${i}-${entreprise.nom}`)}
					<li class="flex items-center">
						{#if entreprise.logo}
							<img
								src={entreprise.logo.src}
								srcset={entreprise.logo.srcset}
								sizes="160px"
								width={entreprise.logo.largeur}
								height={entreprise.logo.hauteur}
								alt={entreprise.nom}
								loading="lazy"
								class="h-10 w-auto max-w-[160px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
							/>
						{:else}
							<span class="font-display text-xl tracking-[0.01em] text-ink-soft">
								{entreprise.nom}
							</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

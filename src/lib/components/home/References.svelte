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
			     l'entreprise) ; sinon, le nom seul. Cadres identiques : les logos sont
			     préparés au même format (docs/logos-references/), monochromes et à
			     poids optique égal — l'homogénéité vient des fichiers, pas d'un filtre. -->
			<ul
				class="mx-auto mt-10 flex max-w-[1120px] flex-wrap items-center justify-center gap-x-8 gap-y-6"
			>
				{#each content.entreprises as entreprise, i (`${i}-${entreprise.nom}`)}
					<li class="flex h-14 w-[calc(50%-1rem)] items-center justify-center sm:h-16 sm:w-40">
						{#if entreprise.logo}
							<img
								src={entreprise.logo.src}
								srcset={entreprise.logo.srcset}
								sizes="160px"
								width={entreprise.logo.largeur}
								height={entreprise.logo.hauteur}
								alt={entreprise.nom}
								loading="lazy"
								class="h-full w-full object-contain opacity-85 transition-opacity hover:opacity-100"
							/>
						{:else}
							<span
								class="font-display text-lg leading-tight tracking-[0.01em] text-balance text-ink-soft"
							>
								{entreprise.nom}
							</span>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

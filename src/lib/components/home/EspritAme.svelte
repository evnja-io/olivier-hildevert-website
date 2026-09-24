<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';
	import type { EspritAmeContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.espritAme }: { content?: EspritAmeContent } = $props();

	const colonnes = $derived([
		{ variante: 'mind' as const, ...content.colonneEsprit },
		{ variante: 'soul' as const, ...content.colonneAme }
	]);
</script>

<section class="relative z-1 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="reveal mx-auto mb-16 max-w-[820px] text-center" {@attach reveal()}>
			<span class="eyebrow eyebrow-center">{content.eyebrow}</span>
			<h2 class="mt-5 mb-4.5 text-4xl tracking-[0.005em] sm:whitespace-nowrap">
				{content.titre}
			</h2>
		</div>
		<div class="grid gap-5.5 lg:grid-cols-2">
			{#each colonnes as col, i (col.variante)}
				<div
					class="reveal relative overflow-hidden rounded-card border border-line p-[46px_clamp(28px,3.6vw,46px)] shadow-[0_30px_60px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] {col.variante ===
					'soul'
						? 'bg-linear-165 from-halo to-white'
						: 'bg-white'}"
					{@attach reveal(i * 130)}
				>
					{#if col.variante === 'mind'}
						<svg
							class="pointer-events-none absolute -top-7.5 -right-7.5 h-[170px] w-[170px] text-coral-ink opacity-70"
							viewBox="0 0 100 100"
							fill="none"
							stroke="currentColor"
							stroke-width="1.1"
							aria-hidden="true"
						>
							<circle cx="50" cy="50" r="30" />
							<path d="M50 20v60M20 50h60" />
							<circle cx="50" cy="50" r="12" />
						</svg>
					{:else}
						<svg
							class="pointer-events-none absolute -top-7.5 -right-7.5 h-[170px] w-[170px] text-ember opacity-70"
							viewBox="0 0 100 100"
							fill="none"
							stroke="currentColor"
							stroke-width="1.1"
							aria-hidden="true"
						>
							<circle cx="50" cy="50" r="30" />
							<path d="M62 28a26 26 0 100 44 32 32 0 010-44z" />
						</svg>
					{/if}
					<span
						class="relative font-mono text-xs font-medium tracking-[0.22em] uppercase {col.variante ===
						'soul'
							? 'text-amber'
							: 'text-coral'}"
					>
						{col.tag}
					</span>
					<h3 class="relative mt-3.5 mb-4 text-2xl tracking-[0.01em]">{col.titre}</h3>
					<p class="relative text-sm leading-[1.66] text-ink-soft">{col.desc}</p>
					<div class="relative mt-6.5 flex flex-col">
						{#each col.points as point, i (point)}
							<span
								class="flex items-center gap-[13px] py-[11px] text-sm text-ink-soft {i > 0
									? 'border-t border-line'
									: ''}"
							>
								<span
									class="h-[5px] w-[5px] flex-none rounded-full {col.variante === 'soul'
										? 'bg-amber'
										: 'bg-coral'}"
								></span>
								{point}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

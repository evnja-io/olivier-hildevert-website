<script lang="ts">
	const colonnes = [
		{
			variante: 'mind' as const,
			tag: "États d'esprit",
			titre: 'La logique humaine',
			desc: 'Le terrain du mental : raison, analyse, synthèse. Ce que l’on peut nommer, structurer et comprendre par le raisonnement.',
			points: [
				'Rationalité & clarté',
				'Analyse des situations',
				'Synthèse & mise en sens',
				'Lecture comportementale'
			]
		},
		{
			variante: 'soul' as const,
			tag: "États d'âme",
			titre: 'La logique subtile',
			desc: 'Le terrain de l’invisible : intuition, énergie, extra-sensorialité. Ce qui se perçoit au-delà du mental et oriente nos profondeurs.',
			points: [
				'Intuition & clair-connaissance',
				'Dimension vibratoire',
				'Mondes subtils & fréquentiels',
				'Sens spirituel de l’expérience'
			]
		}
	];
</script>

<section class="relative z-1 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="mx-auto mb-16 max-w-[640px] text-center">
			<span class="eyebrow eyebrow-center">Deux logiques, une même personne</span>
			<h2 class="mt-5 mb-4.5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">
				États d'esprit &amp; états d'âme
			</h2>
		</div>
		<div class="grid gap-5.5 lg:grid-cols-2">
			{#each colonnes as col (col.variante)}
				<div
					class="relative overflow-hidden rounded-card border border-line p-[46px_clamp(28px,3.6vw,46px)] shadow-[0_30px_60px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] {col.variante ===
					'soul'
						? 'bg-linear-165 from-halo to-white'
						: 'bg-white'}"
				>
					{#if col.variante === 'mind'}
						<svg
							class="pointer-events-none absolute -top-7.5 -right-7.5 h-[170px] w-[170px] text-coral opacity-18"
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
							class="pointer-events-none absolute -top-7.5 -right-7.5 h-[170px] w-[170px] text-amber opacity-18"
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
						class="relative font-mono text-[10.5px] font-medium tracking-[0.22em] uppercase {col.variante ===
						'soul'
							? 'text-amber'
							: 'text-coral'}"
					>
						{col.tag}
					</span>
					<h3 class="relative mt-3.5 mb-4 text-[32px] tracking-[0.01em]">{col.titre}</h3>
					<p class="relative text-[15px] leading-[1.66] text-ink-soft">{col.desc}</p>
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

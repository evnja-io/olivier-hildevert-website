<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';

	const strates = [
		{
			num: 'I',
			titre: 'Psychologique',
			desc: 'Les mécanismes de pensée, les schémas et les histoires intérieures.',
			profondeur: 'Surface · mental'
		},
		{
			num: 'II',
			titre: 'Émotionnel',
			desc: 'Ce qui se ressent, se retient ou cherche à se libérer.',
			profondeur: 'Ressenti'
		},
		{
			num: 'III',
			titre: 'Relationnel',
			desc: 'Les liens, les loyautés et les dynamiques qui nous traversent.',
			profondeur: 'Liens'
		},
		{
			num: 'IV',
			titre: 'Philosophique',
			desc: 'Le sens, les valeurs et les questionnements existentiels.',
			profondeur: 'Sens · valeurs'
		},
		{
			num: 'V',
			titre: 'Énergétique',
			desc: "Les équilibres subtils, vibratoires et fréquentiels de l'être.",
			profondeur: 'Subtil · vibratoire'
		},
		{
			num: 'VI',
			titre: 'Spirituel',
			desc: "La dimension de l'âme, sans dogme ni appartenance religieuse.",
			profondeur: 'Âme'
		},
		{
			num: 'VII',
			titre: 'Symbolique',
			desc: "Le langage des images, métaphores et signes de l'expérience.",
			profondeur: 'Profondeur · sens'
		}
	];
</script>

<section
	id="approche"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap grid items-start gap-16 lg:grid-cols-[0.82fr_1.18fr]">
		<div class="reveal" {@attach reveal()}>
			<span class="eyebrow">L'approche</span>
			<h2 class="mt-5 mb-5.5 text-[clamp(34px,4.6vw,56px)]">Sept niveaux de lecture de l'être</h2>
			<p class="mb-4 text-[16.5px] leading-[1.66] text-ink-soft">
				Comprendre ne suffit pas. Chaque situation de vie se lit à plusieurs profondeurs de la
				surface du mental jusqu'au sens symbolique de l'expérience.
			</p>
			<p class="mb-4 text-[16.5px] leading-[1.66] text-ink-soft">
				L'accompagnement parcourt cette échelle pour révéler ce qui se joue vraiment, et favoriser
				la réparation, la transformation et l'évolution.
			</p>
			<svg
				class="mt-7.5 h-21 w-21 text-coral opacity-90"
				viewBox="0 0 100 100"
				fill="none"
				stroke="currentColor"
				stroke-width="1.1"
				aria-hidden="true"
			>
				<circle cx="50" cy="50" r="18" /><circle cx="50" cy="32" r="18" /><circle
					cx="50"
					cy="68"
					r="18"
				/>
				<circle cx="34.4" cy="41" r="18" /><circle cx="65.6" cy="41" r="18" /><circle
					cx="34.4"
					cy="59"
					r="18"
				/><circle cx="65.6" cy="59" r="18" />
			</svg>
		</div>
		<div class="echelle relative mt-2">
			{#each strates as strate, i (strate.num)}
				<div
					class="reveal group relative z-1 grid grid-cols-[48px_1fr] items-center gap-4 border-b border-[color-mix(in_oklab,var(--color-ink)_12%,transparent)] px-2 py-5.5 transition-colors last-of-type:border-b-0 hover:bg-[color-mix(in_oklab,#fff_45%,transparent)] sm:grid-cols-[64px_1fr_auto] sm:gap-6.5"
					{@attach reveal(i * 60)}
				>
					<span
						class="relative z-1 grid h-10 w-10 place-items-center rounded-full border border-coral bg-sky font-mono text-xs font-medium tracking-[0.04em] text-coral transition group-hover:scale-108 group-hover:bg-coral group-hover:text-white"
					>
						{strate.num}
					</span>
					<div>
						<h3 class="text-[25px] tracking-[0.01em]">{strate.titre}</h3>
						<p class="mt-0.5 max-w-[46em] text-[14.5px] leading-[1.55] text-ink-soft">
							{strate.desc}
						</p>
					</div>
					<span
						class="hidden text-right font-mono text-[10px] tracking-[0.16em] whitespace-nowrap text-mute uppercase sm:block"
					>
						{strate.profondeur}
					</span>
				</div>
			{/each}
			<div
				class="reveal mt-8.5 flex flex-wrap justify-between gap-5 font-mono text-[10.5px] tracking-[0.16em] text-mute uppercase"
				{@attach reveal()}
			>
				<span>De la surface à la profondeur</span>
				<span>Sept portes — une même lumière</span>
			</div>
		</div>
	</div>
</section>

<style>
	/* colonne vertébrale de l'échelle : fil vertical corail → or */
	.echelle::before {
		content: '';
		position: absolute;
		left: 23px;
		top: 18px;
		bottom: 18px;
		width: 1px;
		background: linear-gradient(
			var(--color-coral),
			color-mix(in oklab, var(--color-amber) 40%, transparent)
		);
		z-index: 0;
	}
	@media (min-width: 40rem) {
		.echelle::before {
			left: 31px;
		}
	}
</style>

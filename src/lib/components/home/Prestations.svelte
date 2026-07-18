<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { PrestationId } from '$lib/booking/prestations';

	import cardIndividuelle from '$lib/assets/card-individuelle.jpg?enhanced';
	import cardProgramme from '$lib/assets/card-programme.jpg?enhanced';
	import cardEntreprise from '$lib/assets/card-entreprise.jpg?enhanced';
	import cardStages from '$lib/assets/card-stages.jpg?enhanced';

	const reservation = resolve('/reservation');

	type EnhancedSrc = typeof cardIndividuelle;

	const cartes: {
		num: string;
		id: PrestationId;
		image: EnhancedSrc;
		position: string;
		alt: string;
		titre: string;
		desc: string;
		prix: string;
		action: string;
	}[] = [
		{
			num: '01',
			id: 'individuelle',
			image: cardIndividuelle,
			position: 'center 60%',
			alt: "Silhouette en méditation, énergie lumineuse reliant l'esprit et le cœur",
			titre: 'Séance individuelle',
			desc: 'Décodage des situations de vie : relationnel, affectif, burn-out, transitions, traumatismes, recherche de sens et préparation de projets.',
			prix: '140 € · 1 h 30',
			action: 'Réserver →'
		},
		{
			num: '02',
			id: 'programme',
			image: cardProgramme,
			position: 'center 42%',
			alt: 'Chemin de lumière serpentant vers un soleil levant à travers les nuées',
			titre: 'Programme personnalisé',
			desc: "Parcours d'éveil et de transformation : éveil de conscience, réorientation de vie, développement intuitif et rééquilibrage psycho-énergétique.",
			prix: 'Sur mesure',
			action: 'En savoir plus →'
		},
		{
			num: '03',
			id: 'entreprise',
			image: cardEntreprise,
			position: 'center 58%',
			alt: 'Groupe de silhouettes reliées par des fils de lumière devant un soleil levant',
			titre: 'Entreprises & dirigeants',
			desc: "Psycho-recrutement, analyse comportementale, préparation mentale, cohésion d'équipe et optimisation des ressources humaines.",
			prix: 'Sur devis',
			action: 'Demander un devis →'
		},
		{
			num: '04',
			id: 'stage',
			image: cardStages,
			position: 'center 48%',
			alt: "Cercle de sphères lumineuses gravitant autour d'un soleil central",
			titre: 'Stages & ateliers',
			desc: 'Conférences et ateliers : sophrologie, intelligence émotionnelle, conscience de soi, éveil énergétique et spiritualité appliquée.',
			prix: 'Sur devis · groupe',
			action: 'Organiser →'
		}
	];
</script>

<section id="prestations" class="relative z-1 scroll-mt-24 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
			<span class="eyebrow">Prestations</span>
			<h2 class="mt-5 mb-4.5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">
				Des accompagnements pour chaque chemin
			</h2>
			<p class="text-[17.5px] leading-[1.66] text-ink-soft">
				Pour les particuliers, les groupes et les entreprises en présentiel, en visioconférence ou
				par téléphone.
			</p>
		</div>
		<div class="grid gap-5.5 lg:grid-cols-2">
			{#each cartes as carte, i (carte.id)}
				<a
					href="{reservation}?prestation={carte.id}"
					class="reveal group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition-all duration-400 hover:-translate-y-1.5 hover:border-[color-mix(in_oklab,var(--color-coral)_45%,transparent)] hover:shadow-[0_40px_74px_-44px_color-mix(in_oklab,var(--color-ember)_58%,transparent)]"
					{@attach reveal(i * 85)}
					onclick={(e) => {
						e.preventDefault();
						openBooking(carte.id);
					}}
				>
					<div class="prest-media relative h-[250px] overflow-hidden">
						<span
							class="absolute top-3.5 left-4 z-2 rounded-full bg-[color-mix(in_oklab,var(--color-ember)_52%,transparent)] px-2.5 py-[5px] font-mono text-[10.5px] tracking-[0.14em] text-white backdrop-blur-[3px]"
						>
							{carte.num}
						</span>
						<enhanced:img
							src={carte.image}
							alt={carte.alt}
							loading="lazy"
							sizes="(min-width: 1024px) 570px, 90vw"
							class="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-106"
							style="object-position: {carte.position}"
						/>
					</div>
					<div class="flex flex-1 flex-col gap-3 p-[26px_30px]">
						<h3 class="text-[25px] tracking-[0.01em]">{carte.titre}</h3>
						<p class="flex-1 text-sm leading-[1.62] text-ink-soft">{carte.desc}</p>
						<div class="flex items-center justify-between border-t border-line pt-4">
							<b class="font-display text-[21px] font-normal text-ink">{carte.prix}</b>
							<span
								class="font-mono text-[11px] tracking-[0.1em] text-coral uppercase transition-transform duration-250 group-hover:translate-x-[5px]"
							>
								{carte.action}
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<style>
	/* voile pêche remontant du bas de l'image */
	.prest-media::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			transparent 40%,
			color-mix(in oklab, var(--color-blush) 55%, transparent) 100%
		);
	}
</style>

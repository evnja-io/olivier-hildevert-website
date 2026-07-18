<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';
	import type { PrestationId } from '$lib/booking/prestations';

	const home = resolve('/');
	const reservation = resolve('/reservation');

	const siteLinks = [
		{ label: "L'approche", anchor: 'approche' },
		{ label: 'À propos', anchor: 'apropos' },
		{ label: 'Prestations', anchor: 'prestations' },
		{ label: 'Boutique', anchor: 'boutique' },
		{ label: 'Tarifs', anchor: 'tarifs' }
	];

	const rdvLinks: { label: string; prestation?: PrestationId }[] = [
		{ label: 'Séance individuelle', prestation: 'individuelle' },
		{ label: 'Entreprises', prestation: 'entreprise' },
		{ label: 'Stages & ateliers', prestation: 'stage' },
		{ label: 'olivierhildevert.com' }
	];
</script>

<footer class="relative z-1 bg-dusk pt-21 pb-10 text-on-dusk">
	<div class="wrap">
		<div class="mb-13 grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
			<div>
				<span class="font-display text-2xl leading-none tracking-[0.04em]">
					{site.name}
					<small
						class="mt-1.5 block font-mono text-[8.5px] font-medium tracking-[0.36em] text-on-dusk-soft uppercase"
					>
						Consultant
					</small>
				</span>
				<p class="mt-4.5 max-w-[30em] text-sm leading-[1.66] text-on-dusk-soft">
					{site.tagline}. Accompagnement psycho-spirituel et psycho énergétique pour particuliers,
					groupes et entreprises.
				</p>
			</div>
			<nav aria-label="Plan du site">
				<h4
					class="mb-4.5 font-mono text-[10.5px] font-medium tracking-[0.2em] text-amber-soft uppercase"
				>
					Le site
				</h4>
				{#each siteLinks as link (link.anchor)}
					<a
						href="{home}#{link.anchor}"
						class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<nav aria-label="Prendre rendez-vous">
				<h4
					class="mb-4.5 font-mono text-[10.5px] font-medium tracking-[0.2em] text-amber-soft uppercase"
				>
					Rendez-vous
				</h4>
				{#each rdvLinks as link (link.label)}
					<a
						href="{reservation}{link.prestation ? '?prestation=' + link.prestation : ''}"
						class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
						onclick={(e) => {
							e.preventDefault();
							openBooking(link.prestation);
						}}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
		<div
			class="flex flex-wrap justify-between gap-6 border-t border-[color-mix(in_oklab,#fff_14%,transparent)] pt-6.5 font-mono text-[10.5px] leading-[1.7] tracking-[0.04em] text-[color-mix(in_oklab,var(--color-on-dusk-soft)_80%,transparent)] max-sm:flex-col"
		>
			<span>
				Les accompagnements proposés ne relèvent pas de la médecine et ne se substituent en aucun
				cas à un avis, un diagnostic ou un traitement médical.
			</span>
			<span>© {new Date().getFullYear()} {site.name} Consultant</span>
		</div>
	</div>
</footer>

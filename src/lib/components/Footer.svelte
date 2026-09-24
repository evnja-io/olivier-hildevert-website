<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';
	import type { PrestationId } from '$lib/booking/prestations';
	import type { ReglagesSite } from '$lib/content/types';
	import { defaultReglages } from '$lib/content/defaults';

	let { reglages = defaultReglages }: { reglages?: ReglagesSite } = $props();

	// Champ texte multiligne Strapi : un paragraphe par ligne non vide.
	const paragraphesMention = $derived(
		reglages.mentionLegale
			.split(/\n+/)
			.map((l) => l.trim())
			.filter(Boolean)
	);

	const home = resolve('/');
	const reservation = resolve('/reservation');

	const siteLinks = [
		{ label: "L'approche", anchor: 'approche' },
		{ label: 'À propos', anchor: 'apropos' },
		{ label: 'Prestations', anchor: 'prestations' },
		{ label: 'Boutique', anchor: 'boutique' },
		{ label: 'Tarifs', anchor: 'tarifs' }
	];

	/* Une entrée porte soit une prestation (ouvre la modale), soit une URL externe :
	   l'union rend inécrivable la forme « ni l'une ni l'autre », qui produisait un
	   `openBooking(undefined)` sur un lien sans destination. */
	type LienRdv = { label: string } & ({ prestation: PrestationId } | { href: string });

	const rdvLinks: LienRdv[] = [
		{ label: 'Séance individuelle', prestation: 'individuelle' },
		{ label: 'Entreprises', prestation: 'entreprise' },
		{ label: 'Stages & ateliers', prestation: 'stage' },
		{ label: 'olivierhildevert.com', href: 'https://olivierhildevert.com/' }
	];
</script>

<footer class="relative z-1 bg-dusk pt-21 pb-10 text-on-dusk">
	<div class="wrap">
		<div class="mb-13 grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
			<div>
				<span class="font-display text-2xl leading-none tracking-[0.04em]">
					{site.name}
					<small
						class="mt-1.5 block font-mono text-xs font-medium tracking-[0.28em] text-on-dusk-soft uppercase"
					>
						{reglages.sousTitreLogo}
					</small>
				</span>
				<p class="mt-4.5 max-w-[30em] text-sm leading-[1.66] text-on-dusk-soft">
					{reglages.footerIntro}
				</p>
			</div>
			<nav aria-label="Plan du site">
				<h4 class="mb-4.5 font-mono text-xs font-medium tracking-[0.2em] text-amber-soft uppercase">
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
				<h4 class="mb-4.5 font-mono text-xs font-medium tracking-[0.2em] text-amber-soft uppercase">
					Rendez-vous
				</h4>
				{#each rdvLinks as link (link.label)}
					{#if 'href' in link}
						<a
							href={link.href}
							target="_blank"
							rel="external noopener noreferrer"
							class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
						>
							{link.label}
						</a>
					{:else}
						<a
							href="{reservation}?prestation={link.prestation}"
							class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
							onclick={(e) => {
								e.preventDefault();
								openBooking(link.prestation);
							}}
						>
							{link.label}
						</a>
					{/if}
				{/each}
			</nav>
		</div>
		<div
			class="border-t border-[color-mix(in_oklab,#fff_14%,transparent)] pt-6.5 font-mono text-xs leading-[1.7] tracking-[0.04em] text-[color-mix(in_oklab,var(--color-on-dusk-soft)_80%,transparent)]"
		>
			<section aria-labelledby="avertissement-titre" class="mb-6 max-w-[80em]">
				<h4
					id="avertissement-titre"
					class="mb-2.5 font-medium tracking-[0.12em] text-on-dusk-soft uppercase"
				>
					Avertissement – Nature et limites des accompagnements
				</h4>
				{#each paragraphesMention as paragraphe, i (i)}
					<p class="mt-2 first-of-type:mt-0">{paragraphe}</p>
				{/each}
			</section>
			<span>© {new Date().getFullYear()} {site.name} {reglages.sousTitreLogo}</span>
		</div>
	</div>
</footer>

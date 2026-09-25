import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultPrestations } from '$lib/content/defaults';
import Prestations from './Prestations.svelte';

describe('Prestations', () => {
	it('affiche le contenu par défaut sans props', async () => {
		const screen = render(Prestations);
		await expect
			.element(screen.getByRole('heading', { name: 'Des accompagnements pour chaque chemin' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('heading', { name: 'Séance individuelle' }))
			.toBeInTheDocument();
	});

	it('porte l’action sur un bouton dédié, pas sur toute la carte', async () => {
		const screen = render(Prestations);
		const actions = [
			['Réserver', 'individuelle'],
			['Découvrir', 'programme'],
			['Contacter', 'entreprise'],
			['Participer', 'stage']
		];
		for (const [label, cle] of actions) {
			await expect
				.element(screen.getByRole('link', { name: label, exact: true }))
				.toHaveAttribute('href', expect.stringContaining(`?prestation=${cle}`));
		}
		// la carte n'est plus un lien englobant : seuls les 4 boutons sont des liens
		expect(screen.container.querySelectorAll('a')).toHaveLength(4);
	});

	it('n’affiche plus ni numéro ni prix sur les cartes', async () => {
		const screen = render(Prestations);
		const texte = screen.container.textContent ?? '';
		for (const retire of ['01', '04', '140 €', 'Sur mesure', 'Sur devis']) {
			expect(texte).not.toContain(retire);
		}
	});

	it('affiche le contenu passé en props (CMS)', async () => {
		const screen = render(Prestations, {
			props: {
				intro: { eyebrow: 'Offre', titre: 'Titre venu du CMS', paragraphe: 'Intro CMS.' },
				prestations: [{ ...defaultPrestations[0], titre: 'Titre de prestation revu' }]
			}
		});
		await expect
			.element(screen.getByRole('heading', { name: 'Titre venu du CMS' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('heading', { name: 'Titre de prestation revu' }))
			.toBeInTheDocument();
	});
});

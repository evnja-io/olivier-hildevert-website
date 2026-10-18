import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultAccueil } from '$lib/content/defaults';
import { commande, closeCommande } from '$lib/commande/commande.svelte';
import type { BoutiqueContent } from '$lib/content/types';
import Boutique from './Boutique.svelte';

const avecCreation: BoutiqueContent = {
	...defaultAccueil.boutique,
	produits: [
		...defaultAccueil.boutique.produits,
		{
			image: {
				src: 'https://cms.test/uploads/cartes.jpg',
				srcset:
					'https://cms.test/uploads/small_cartes.jpg 500w, https://cms.test/uploads/cartes.jpg 1200w',
				largeur: 1200,
				hauteur: 1600,
				alt: 'Jeu de cartes de méditation'
			},
			tag: 'Création',
			titre: 'Cartes de méditation',
			desc: 'Un jeu de cartes illustrées.',
			prixTexte: '25 €',
			boutonLabel: 'Commander',
			info: 'https://cms.test/uploads/catalogue.pdf'
		}
	]
};

describe('Boutique', () => {
	it('garde le lien externe des produits d’origine, sans bouton Infos', async () => {
		const screen = render(Boutique);
		await expect
			.element(screen.getByRole('link', { name: /^Commander/ }))
			.toHaveAttribute('href', 'https://www.bod.fr/');
		expect(screen.container.querySelectorAll('article')).toHaveLength(2);
		expect(screen.getByRole('link', { name: /^En savoir plus/ }).elements()).toHaveLength(0);
	});

	it('affiche le visuel envoyé dans Strapi', async () => {
		const screen = render(Boutique, { content: avecCreation });
		const img = screen.getByRole('img', { name: 'Jeu de cartes de méditation' });
		await expect.element(img).toHaveAttribute('src', 'https://cms.test/uploads/cartes.jpg');
		await expect.element(img).toHaveAttribute('srcset', expect.stringContaining('500w'));
	});

	it('ouvre le document dans un nouvel onglet par « En savoir plus », placé avant le bouton principal', async () => {
		const screen = render(Boutique, { content: avecCreation });
		const enSavoirPlus = screen.getByRole('link', {
			name: 'En savoir plus : Cartes de méditation'
		});
		await expect
			.element(enSavoirPlus)
			.toHaveAttribute('href', 'https://cms.test/uploads/catalogue.pdf');
		await expect.element(enSavoirPlus).toHaveAttribute('target', '_blank');

		const actions = [...screen.container.querySelectorAll('article')].at(-1)!;
		const libelles = [...actions.querySelectorAll('a')].map((a) => a.textContent?.trim());
		expect(libelles[0]).toMatch(/^En savoir plus/);
		expect(libelles[1]).toMatch(/^Commander/);
	});

	it('ouvre le formulaire de commande quand le produit n’a pas de lien', async () => {
		const screen = render(Boutique, { content: avecCreation });
		const lien = screen.getByRole('link', { name: 'Commander : Cartes de méditation' });
		await expect
			.element(lien)
			.toHaveAttribute('href', '/commande?produit=Cartes%20de%20m%C3%A9ditation');

		await lien.click();
		expect(commande.open).toBe(true);
		expect(commande.produit).toBe('Cartes de méditation');
		expect(commande.type).toBe('commande');
		closeCommande();
	});

	it('ouvre le formulaire en mode inscription pour un produit d’adhésion', async () => {
		const adhesion: BoutiqueContent = {
			...defaultAccueil.boutique,
			produits: [
				{
					tag: 'Association',
					titre: 'Adhésion annuelle',
					desc: 'Adhérer à l’association.',
					prixTexte: '30 €',
					boutonLabel: 'Adhérer',
					typeDemande: 'inscription'
				}
			]
		};
		const screen = render(Boutique, { content: adhesion });
		const lien = screen.getByRole('link', { name: 'Adhérer : Adhésion annuelle' });
		await expect
			.element(lien)
			.toHaveAttribute('href', '/commande?produit=Adh%C3%A9sion%20annuelle&type=inscription');

		await lien.click();
		expect(commande.open).toBe(true);
		expect(commande.type).toBe('inscription');
		closeCommande();
	});
});

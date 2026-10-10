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
		expect(screen.getByRole('link', { name: /^Infos/ }).elements()).toHaveLength(0);
	});

	it('affiche le visuel envoyé dans Strapi', async () => {
		const screen = render(Boutique, { content: avecCreation });
		const img = screen.getByRole('img', { name: 'Jeu de cartes de méditation' });
		await expect.element(img).toHaveAttribute('src', 'https://cms.test/uploads/cartes.jpg');
		await expect.element(img).toHaveAttribute('srcset', expect.stringContaining('500w'));
	});

	it('ouvre le document dans un nouvel onglet par « Infos »', async () => {
		const screen = render(Boutique, { content: avecCreation });
		const infos = screen.getByRole('link', { name: 'Infos : Cartes de méditation' });
		await expect.element(infos).toHaveAttribute('href', 'https://cms.test/uploads/catalogue.pdf');
		await expect.element(infos).toHaveAttribute('target', '_blank');
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
		closeCommande();
	});
});

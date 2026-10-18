import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { commande, closeCommande } from '$lib/commande/commande.svelte';
import type { FasciculeContent } from '$lib/content/types';
import CarteFascicule from './CarteFascicule.svelte';

const base = { titre: 'Les chakras', description: 'Un fascicule.' };

describe('CarteFascicule', () => {
	it('gratuit : « Gratuit » et « Télécharger » dans un nouvel onglet', async () => {
		const fascicule: FasciculeContent = {
			...base,
			action: { kind: 'telecharger', url: 'https://cms.test/chakras.pdf' }
		};
		const screen = render(CarteFascicule, { fascicule });
		await expect.element(screen.getByText('Gratuit')).toBeVisible();
		const lien = screen.getByRole('link', { name: 'Télécharger : Les chakras' });
		await expect.element(lien).toHaveAttribute('href', 'https://cms.test/chakras.pdf');
		await expect.element(lien).toHaveAttribute('target', '_blank');
	});

	it('payant avec lien : prix affiché, « Commander » vers le lien externe', async () => {
		const screen = render(CarteFascicule, {
			fascicule: {
				...base,
				prixTexte: '12 €',
				action: { kind: 'lien', url: 'https://boutique.test/c' }
			}
		});
		await expect.element(screen.getByText('12 €')).toBeVisible();
		const lien = screen.getByRole('link', { name: 'Commander : Les chakras' });
		await expect.element(lien).toHaveAttribute('href', 'https://boutique.test/c');
		await expect.element(lien).toHaveAttribute('rel', expect.stringContaining('noopener'));
	});

	it('payant sans lien : ouvre la modale, titre spécial correctement encodé', async () => {
		const screen = render(CarteFascicule, {
			fascicule: {
				titre: 'Cœur & âme ?',
				prixTexte: '40 €',
				action: { kind: 'demande', type: 'inscription' }
			}
		});
		const lien = screen.getByRole('link', { name: 'Adhérer : Cœur & âme ?' });
		await expect
			.element(lien)
			.toHaveAttribute(
				'href',
				'/commande?produit=C%C5%93ur%20%26%20%C3%A2me%20%3F&type=inscription'
			);
		await lien.click();
		expect(commande.open).toBe(true);
		expect(commande.produit).toBe('Cœur & âme ?');
		expect(commande.type).toBe('inscription');
		closeCommande();
	});

	it('gratuit sans document : aucun bouton', () => {
		const screen = render(CarteFascicule, { fascicule: { ...base, action: { kind: 'aucune' } } });
		expect(screen.container.querySelectorAll('a')).toHaveLength(0);
	});
});

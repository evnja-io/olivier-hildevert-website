import { describe, expect, it } from 'vitest';
import { commandeSchema } from './schema';

const valide = {
	produit: 'Cartes de méditation',
	name: 'Jeanne Dupont',
	email: 'jeanne@example.com',
	phone: '06 12 34 56 78'
};

describe('commandeSchema', () => {
	it('accepte une commande valide, message facultatif', () => {
		const res = commandeSchema.safeParse(valide);
		expect(res.success).toBe(true);
		if (res.success) expect(res.data.message).toBe('');
	});

	it('exige le produit, même réduit à des espaces', () => {
		const res = commandeSchema.safeParse({ ...valide, produit: '   ' });
		expect(res.success).toBe(false);
		if (!res.success)
			expect(res.error.issues.map((i) => i.message)).toContain(
				'Veuillez indiquer le produit souhaité.'
			);
	});

	it('rejette une adresse e-mail invalide', () => {
		expect(commandeSchema.safeParse({ ...valide, email: 'pas-un-email' }).success).toBe(false);
	});
});

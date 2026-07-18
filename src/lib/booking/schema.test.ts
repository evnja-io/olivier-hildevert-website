import { describe, expect, it } from 'vitest';
import { bookingSchema } from './schema';

const valide = {
	prestation: 'individuelle',
	name: 'Jeanne Dupont',
	email: 'jeanne@example.com',
	phone: '06 12 34 56 78',
	message: 'Disponible en soirée.'
};

describe('bookingSchema', () => {
	it('accepte une demande valide', () => {
		const res = bookingSchema.safeParse(valide);
		expect(res.success).toBe(true);
	});

	it('accepte une demande sans message (optionnel, défaut vide)', () => {
		const { message: _message, ...sans } = valide;
		const res = bookingSchema.safeParse(sans);
		expect(res.success).toBe(true);
		if (res.success) expect(res.data.message).toBe('');
	});

	it('rejette une demande vide (tous les champs requis en erreur)', () => {
		const res = bookingSchema.safeParse({});
		expect(res.success).toBe(false);
		if (!res.success) {
			const champs = res.error.issues.map((i) => i.path[0]);
			expect(champs).toEqual(expect.arrayContaining(['prestation', 'name', 'email', 'phone']));
			expect(res.error.issues.map((i) => i.message)).toContain(
				'Veuillez choisir un accompagnement.'
			);
		}
	});

	it('affiche des messages en français sur des valeurs trop courtes', () => {
		const res = bookingSchema.safeParse({ ...valide, name: 'J', phone: '12' });
		expect(res.success).toBe(false);
		if (!res.success) {
			const messages = res.error.issues.map((i) => i.message);
			expect(messages).toContain('Veuillez indiquer votre nom (2 caractères minimum).');
			expect(messages).toContain('Veuillez indiquer un numéro de téléphone valide.');
		}
	});

	it('rejette une prestation inconnue', () => {
		const res = bookingSchema.safeParse({ ...valide, prestation: 'astrologie' });
		expect(res.success).toBe(false);
	});

	it('rejette une adresse e-mail invalide', () => {
		const res = bookingSchema.safeParse({ ...valide, email: 'pas-un-email' });
		expect(res.success).toBe(false);
	});

	it('rejette un message de plus de 2000 caractères', () => {
		const res = bookingSchema.safeParse({ ...valide, message: 'a'.repeat(2001) });
		expect(res.success).toBe(false);
	});
});

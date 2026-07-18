import { describe, expect, it } from 'vitest';
import { contactSchema } from './schema';

describe('contactSchema', () => {
	it('accepte un message de contact valide', () => {
		const result = contactSchema.safeParse({
			name: 'Olivier',
			email: 'olivier@example.com',
			message: 'Bonjour, je souhaite discuter d’un projet avec vous.'
		});

		expect(result.success).toBe(true);
	});

	it('rejette un payload vide avec les messages en français', () => {
		const result = contactSchema.safeParse({ name: '', email: '', message: '' });

		expect(result.success).toBe(false);
		const messages = result.error?.issues.map((issue) => issue.message);
		expect(messages).toContain('Veuillez indiquer votre nom (2 caractères minimum).');
		expect(messages).toContain('Veuillez indiquer une adresse e-mail valide.');
		expect(messages).toContain('Votre message doit contenir au moins 10 caractères.');
	});

	it('rejette une adresse e-mail invalide', () => {
		const result = contactSchema.safeParse({
			name: 'Olivier',
			email: 'pas-un-email',
			message: 'Un message suffisamment long pour être valide.'
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe('Veuillez indiquer une adresse e-mail valide.');
	});

	it('rejette un message trop long', () => {
		const result = contactSchema.safeParse({
			name: 'Olivier',
			email: 'olivier@example.com',
			message: 'a'.repeat(2001)
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			'Votre message ne peut pas dépasser 2000 caractères.'
		);
	});
});

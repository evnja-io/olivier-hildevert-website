import { describe, expect, it } from 'vitest';
import { newsletterSchema } from './schema';

describe('newsletterSchema', () => {
	it('accepte une adresse e-mail valide', () => {
		const res = newsletterSchema.safeParse({ email: 'jeanne@example.com' });
		expect(res.success).toBe(true);
	});

	it('rejette une adresse e-mail invalide avec un message en français', () => {
		const res = newsletterSchema.safeParse({ email: 'pas-un-email' });
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.map((i) => i.message)).toContain(
				'Veuillez indiquer une adresse e-mail valide.'
			);
		}
	});

	it('rejette un envoi vide (e-mail requis)', () => {
		const res = newsletterSchema.safeParse({});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.issues.map((i) => i.path[0])).toContain('email');
		}
	});
});

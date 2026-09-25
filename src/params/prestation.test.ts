import { describe, expect, it } from 'vitest';
import { match } from './prestation';

describe('matcher de la route /prestations/[cle]', () => {
	it('accepte les 4 clés de prestation', () => {
		for (const cle of ['individuelle', 'programme', 'entreprise', 'stage']) {
			expect(match(cle)).toBe(true);
		}
	});

	it('refuse toute autre valeur, casse comprise', () => {
		for (const valeur of ['inconnue', 'Stage', '', 'stage/', 'constructor']) {
			expect(match(valeur)).toBe(false);
		}
	});
});

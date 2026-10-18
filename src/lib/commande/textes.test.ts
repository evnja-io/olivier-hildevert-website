import { describe, expect, it } from 'vitest';
import { TEXTES_DEMANDE, typeDemande } from './textes';

describe('textes du parcours de commande', () => {
	it('parle d’adhésion pour une inscription', () => {
		expect(TEXTES_DEMANDE.inscription).toEqual({
			titre: 'Adhérer',
			accroche: 'Je vous recontacte pour finaliser votre inscription.',
			confirmation:
				'Demande d’inscription transmise. Je vous recontacte rapidement pour la finaliser.'
		});
	});

	it('garde les textes d’origine pour une commande', () => {
		expect(TEXTES_DEMANDE.commande.titre).toBe('Commander');
		expect(TEXTES_DEMANDE.commande.accroche).toBe(
			'Je vous recontacte pour finaliser votre commande.'
		);
		expect(TEXTES_DEMANDE.commande.confirmation).toBe(
			'Demande de commande transmise. Je vous recontacte rapidement pour la finaliser.'
		);
	});

	it('ramène toute valeur inconnue ou absente à « commande »', () => {
		expect(typeDemande('inscription')).toBe('inscription');
		expect(typeDemande('commande')).toBe('commande');
		expect(typeDemande('n-importe-quoi')).toBe('commande');
		expect(typeDemande('INSCRIPTION')).toBe('commande');
		expect(typeDemande(null)).toBe('commande');
		expect(typeDemande(undefined)).toBe('commande');
	});
});

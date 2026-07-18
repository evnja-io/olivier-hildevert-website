import { describe, expect, it } from 'vitest';
import { PRESTATION_IDS } from '../booking/prestations';
import { defaultAccueil, defaultPrestations, defaultReglages } from './defaults';

describe('contenu par défaut', () => {
	it('fournit les 4 prestations dans l’ordre canonique des clés', () => {
		expect(defaultPrestations.map((p) => p.cle)).toEqual([...PRESTATION_IDS]);
	});

	it('a une page d’accueil structurée (7 strates, 3 stats, 2 colonnes de 4 points)', () => {
		expect(defaultAccueil.approche.strates).toHaveLength(7);
		expect(defaultAccueil.hero.stats).toHaveLength(3);
		expect(defaultAccueil.espritAme.colonneEsprit.points).toHaveLength(4);
		expect(defaultAccueil.espritAme.colonneAme.points).toHaveLength(4);
		expect(defaultAccueil.tarifs.cartes).toHaveLength(3);
		expect(defaultAccueil.boutique.produits.map((p) => p.cleImage)).toEqual([
			'livre',
			'veilleuses'
		]);
	});

	it('met en valeur des segments du mantra (nombre impair de segments *…*)', () => {
		expect(defaultAccueil.mantra.citation.split('*').length % 2).toBe(1);
	});

	it('porte les réglages du site (mention légale, tagline)', () => {
		expect(defaultReglages.mentionLegale).toContain('ne relèvent pas de la médecine');
		expect(defaultReglages.tagline).toBe("Décoder le visible grâce à l'invisible");
	});
});

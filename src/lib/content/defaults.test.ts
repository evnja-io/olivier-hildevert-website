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
		expect(defaultReglages.mentionLegale).toContain('accompagnement non médical');
		expect(defaultReglages.tagline).toBe("Décoder le visible grâce à l'invisible");
	});

	it('n’attribue plus le mantra à une formule signature', () => {
		expect(defaultAccueil.mantra).not.toHaveProperty('auteur');
	});
});

describe('corrections éditoriales validées le 2026-09-12', () => {
	it('annonce la dimension transpersonnelle dans le surtitre du hero', () => {
		expect(defaultAccueil.hero.eyebrow).toBe(
			'Sophrologie · Thérapie psycho énergétique et transpersonnelle'
		);
	});

	it('affiche les trois repères d’expérience corrigés', () => {
		expect(defaultAccueil.hero.stats).toEqual([
			{ valeur: 'Depuis 1992', legende: "Praticien en relation d'aide" },
			{ valeur: '+ de 10 000', legende: 'Séances animées' },
			{ valeur: '34 ans', legende: "D'accompagnements individuels et collectifs" }
		]);
	});

	it('ne mentionne plus la durée de séance dans le hero', () => {
		expect(JSON.stringify(defaultAccueil.hero)).not.toContain('1 h 30');
	});

	it('conserve la durée de séance là où elle a un sens', () => {
		expect(defaultAccueil.tarifs.cartes[1].sousTexte).toContain('1 h 30');
		expect(defaultPrestations[0].prixCarte).toContain('1 h 30');
	});

	it('nuance le surtitre des deux logiques', () => {
		expect(defaultAccueil.espritAme.eyebrow).toBe('Deux logiques, pour une même personne');
	});

	it('prolonge le chemin de l’éveil dans la boutique', () => {
		expect(defaultAccueil.boutique.titre).toBe("Prolonger le chemin de l'éveil");
		expect(defaultAccueil.boutique.paragraphe).toBe(
			'Un roman thérapeutique pour se réaligner et des veilleuses énergétiques pour réharmoniser les lieux et les êtres.'
		);
	});

	it('annonce le roman comme disponible à l’achat', () => {
		expect(defaultAccueil.boutique.produits[0].prixTexte).toBe("Disponible à l'achat");
	});

	it('donne à chaque produit un lien externe éditable', () => {
		for (const produit of defaultAccueil.boutique.produits) {
			expect(produit.lien).toMatch(/^https:\/\//);
		}
	});
});

describe('corrections éditoriales validées le 2026-09-25', () => {
	it('renomme les quatre prestations', () => {
		expect(defaultPrestations.map((p) => p.titre)).toEqual([
			'Séance individuelle',
			"Programmes d'éveil",
			'Entreprises',
			'Stages & ateliers'
		]);
	});

	it('reprend les descriptions de cartes fournies par le client', () => {
		expect(defaultPrestations.map((p) => p.descCarte)).toEqual([
			'Décodage et solution des situations de vie dans les domaines : physique, psychique, émotionnel, comportemental, amoureux, sexuel, traumatique, transitionnel, contractuel, matériel et préparatoires de projets.',
			"Parcours de rééducation et de transformation pour l'ouverture de conscience, la réappropriation de vie, le développement intuitif, la reconnexion spirituelle et le rééquilibrage psycho-énergétique.",
			"Actions d'expertises et d'accompagnements personnalisés dédiés au psycho-recrutement, analyse comportementale, préparation mentale, cohésion d'équipe et optimisation des ressources et des talents. Organisation et animation de séances de Sophrologie de groupe.",
			"Catalogue d'activités, séjours, conférences, rencontres dédiés aux outils de transformation psycho-énergétique et de spiritualité appliquée pour aider aux réalisations personnelles et collectives."
		]);
	});

	it('donne à chaque carte son verbe d’action', () => {
		expect(defaultPrestations.map((p) => p.actionCarte)).toEqual([
			'Réserver',
			'Découvrir',
			'Contacter',
			'Participer'
		]);
	});

	it('ne promet plus des séances uniquement par téléphone', () => {
		expect(defaultAccueil.prestationsIntro.paragraphe).not.toContain('téléphone');
		expect(defaultAccueil.contactCta.paragraphe).not.toContain('téléphone');
	});

	it('présente le consultant dans le pied de page', () => {
		expect(defaultReglages.sousTitreLogo).toBe('Consultant');
		expect(defaultReglages.footerIntro).toBe(
			'Accompagnement sophrologique psycho énergétique et spirituel pour particuliers, groupes et entreprises.'
		);
	});
});

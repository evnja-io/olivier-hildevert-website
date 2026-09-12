/**
 * Types du contenu éditorial — source de vérité côté front, découplés de la
 * forme Strapi (le mapping vit dans $lib/server/content.ts). Les images, alt
 * et positions restent dans les composants, appariés par clé stable.
 */
import type { PrestationId } from '../booking/prestations';

export interface StatHero {
	valeur: string;
	legende: string;
}

export interface HeroContent {
	eyebrow: string;
	titreLigne1: string;
	titreLigne2: string;
	paragraphe: string;
	ligneMono: string;
	boutonPrincipal: string;
	boutonSecondaire: string;
	stats: StatHero[];
}

export interface Strate {
	num: string;
	titre: string;
	desc: string;
	profondeur: string;
}

export interface ApprocheContent {
	eyebrow: string;
	titre: string;
	paragraphe1: string;
	paragraphe2: string;
	strates: Strate[];
	legendeGauche: string;
	legendeDroite: string;
}

export interface ColonneEspritAme {
	tag: string;
	titre: string;
	desc: string;
	points: string[];
}

export interface EspritAmeContent {
	eyebrow: string;
	titre: string;
	colonneEsprit: ColonneEspritAme;
	colonneAme: ColonneEspritAme;
}

export interface AProposContent {
	eyebrow: string;
	titre: string;
	sousTitre: string;
	paragraphe1: string;
	paragraphe2: string;
	paragraphe3: string;
	citation: string;
	qualifications: string[];
	legendePortrait: string;
}

export interface IntroSection {
	eyebrow: string;
	titre: string;
	paragraphe: string;
}

export interface PourQuiContent {
	eyebrow: string;
	titre: string;
	publics: string[];
}

export type CleImageBoutique = 'livre' | 'veilleuses';

export interface ProduitBoutique {
	cleImage: CleImageBoutique;
	tag: string;
	titre: string;
	desc: string;
	prixTexte: string;
	boutonLabel: string;
	/** URL externe de la boutique — éditable dans Strapi, ouverte dans un nouvel onglet. */
	lien: string;
}

export interface BoutiqueContent {
	eyebrow: string;
	titre: string;
	paragraphe: string;
	produits: ProduitBoutique[];
}

export interface CarteTarif {
	label: string;
	montant: string;
	suffixe?: string;
	sousTexte: string;
	boutonLabel: string;
	prestationCle: PrestationId;
	misEnAvant: boolean;
}

export interface TarifsContent {
	eyebrow: string;
	titre: string;
	cartes: CarteTarif[];
}

/** `citation` : les segments entre astérisques (`*…*`) sont mis en valeur. */
export interface MantraContent {
	citation: string;
}

export interface ContactCtaContent {
	eyebrow: string;
	titre: string;
	paragraphe: string;
	boutonLabel: string;
	modes: string[];
}

export interface PageAccueilContent {
	hero: HeroContent;
	approche: ApprocheContent;
	espritAme: EspritAmeContent;
	aPropos: AProposContent;
	prestationsIntro: IntroSection;
	pourQui: PourQuiContent;
	boutique: BoutiqueContent;
	tarifs: TarifsContent;
	mantra: MantraContent;
	contactCta: ContactCtaContent;
}

/**
 * Une prestation = UNE entrée avec des rédactions distinctes par contexte
 * (modale/réservation vs carte home) — unifie les 3 sources divergentes.
 */
export interface PrestationContent {
	cle: PrestationId;
	titre: string;
	metaReservation: string;
	descReservation: string;
	descCarte: string;
	prixCarte: string;
	actionCarte: string;
}

export interface ReglagesSite {
	tagline: string;
	descriptionSeo: string;
	mentionLegale: string;
	footerIntro: string;
	sousTitreLogo: string;
	email?: string;
	telephone?: string;
	adresse?: string;
	siteExterne?: string;
}

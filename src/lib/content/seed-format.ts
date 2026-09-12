/**
 * Conversion du contenu front vers le format d’écriture de l’API Strapi :
 * les listes `string[]` deviennent des composants répétables `{ texte }`.
 * Utilisé par scripts/export-defaults.ts (seed) et par les tests de mapping
 * (round-trip : versStrapi → getPageAccueil ≡ identité).
 */
import type { PageAccueilContent, PrestationContent, ReglagesSite } from './types';

const items = (liste: string[]) => liste.map((texte) => ({ texte }));

export function accueilVersStrapi(c: PageAccueilContent) {
	return {
		...c,
		espritAme: {
			...c.espritAme,
			colonneEsprit: {
				...c.espritAme.colonneEsprit,
				points: items(c.espritAme.colonneEsprit.points)
			},
			colonneAme: { ...c.espritAme.colonneAme, points: items(c.espritAme.colonneAme.points) }
		},
		aPropos: { ...c.aPropos, qualifications: items(c.aPropos.qualifications) },
		pourQui: { ...c.pourQui, publics: items(c.pourQui.publics) },
		contactCta: { ...c.contactCta, modes: items(c.contactCta.modes) }
	};
}

export function prestationsVersStrapi(prestations: PrestationContent[]) {
	return prestations.map((p, i) => ({ ...p, ordre: i + 1 }));
}

export function reglagesVersStrapi(r: ReglagesSite) {
	return { ...r };
}

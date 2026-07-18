/**
 * Clés structurelles des prestations — statiques par design : elles apparient
 * les images locales, le paramètre ?prestation= et le z.enum du formulaire.
 * Les TEXTES des prestations vivent dans $lib/content (défauts + Strapi) ;
 * ajouter ou retirer une prestation reste une modification de code.
 */
export const PRESTATION_IDS = ['individuelle', 'programme', 'entreprise', 'stage'] as const;

export type PrestationId = (typeof PRESTATION_IDS)[number];

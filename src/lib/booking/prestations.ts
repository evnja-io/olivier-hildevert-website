/** Prestations proposées — source unique pour la modale, la page /reservation et les cartes. */
export const PRESTATIONS = [
	{
		id: 'individuelle',
		titre: 'Séance individuelle',
		meta: '1 h 30 · 140 €',
		desc: 'Décodage et accompagnement d’une situation de vie.'
	},
	{
		id: 'programme',
		titre: 'Programme personnalisé',
		meta: 'Sur mesure · plusieurs séances',
		desc: 'Parcours d’éveil, de réorientation et de transformation.'
	},
	{
		id: 'entreprise',
		titre: 'Entreprise & dirigeants',
		meta: 'Sur devis',
		desc: 'Psycho-recrutement, préparation mentale, cohésion.'
	},
	{
		id: 'stage',
		titre: 'Stage ou atelier',
		meta: 'Sur devis · groupe',
		desc: 'Conférences et ateliers pratiques d’éveil énergétique.'
	}
] as const;

export type PrestationId = (typeof PRESTATIONS)[number]['id'];

export const PRESTATION_IDS = PRESTATIONS.map((p) => p.id) as [PrestationId, ...PrestationId[]];

/**
 * Textes du parcours de commande selon le type de demande : le même formulaire
 * sert aux achats (« Commander ») et aux adhésions (« Adhérer »). Source unique
 * pour la modale, la page de repli /commande et l'action serveur.
 * Imports relatifs uniquement : importé par src/lib/content/types.ts (seed via tsx).
 */
export const TYPES_DEMANDE = ['commande', 'inscription'] as const;
export type TypeDemande = (typeof TYPES_DEMANDE)[number];

export const TEXTES_DEMANDE: Record<
	TypeDemande,
	{ titre: string; accroche: string; confirmation: string }
> = {
	commande: {
		titre: 'Commander',
		accroche: 'Je vous recontacte pour finaliser votre commande.',
		confirmation: 'Demande de commande transmise. Je vous recontacte rapidement pour la finaliser.'
	},
	inscription: {
		titre: 'Adhérer',
		accroche: 'Je vous recontacte pour finaliser votre inscription.',
		confirmation:
			'Demande d’inscription transmise. Je vous recontacte rapidement pour la finaliser.'
	}
};

/** Valeur libre (`?type=`, champ de formulaire) → type connu, « commande » par défaut. */
export function typeDemande(valeur: string | null | undefined): TypeDemande {
	return valeur === 'inscription' ? 'inscription' : 'commande';
}

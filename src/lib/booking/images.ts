/**
 * Photos des prestations, appariées par clé stable — partagées par les cartes
 * de l'accueil et les pages /prestations/<cle>. Changer une image reste une
 * modification de code (les images sont optimisées au build par enhanced-img).
 */
import type { PrestationId } from './prestations';

import cardIndividuelle from '$lib/assets/card-individuelle.jpg?enhanced';
import cardProgramme from '$lib/assets/card-programme.jpg?enhanced';
import cardEntreprise from '$lib/assets/card-entreprise.jpg?enhanced';
import cardStages from '$lib/assets/card-stages.jpg?enhanced';

export type EnhancedSrc = typeof cardIndividuelle;

export const IMAGES_PRESTATIONS: Record<PrestationId, { image: EnhancedSrc; alt: string }> = {
	individuelle: {
		image: cardIndividuelle,
		alt: "Personne assise en méditation au bord d'une falaise, face à la mer au soleil levant"
	},
	programme: {
		image: cardProgramme,
		alt: 'Sentier de crête serpentant vers le soleil levant au-dessus des montagnes'
	},
	entreprise: {
		image: cardEntreprise,
		alt: 'Petit groupe de professionnels en échange sur une passerelle en forêt, lumière dorée'
	},
	stage: {
		image: cardStages,
		alt: "Cercle de participants réunis autour d'un feu de camp et de lanternes au crépuscule"
	}
};

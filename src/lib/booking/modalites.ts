import type { PrestationId } from './prestations';

// Seule la séance individuelle se déroule forcément par téléphone : les
// autres accompagnements s'organisent lors d'un entretien. Les stages, eux,
// alimentent la liste de diffusion (case à cocher, jamais pré-cochée — RGPD).
export const RAPPEL =
	"Je vous recontacte pour convenir ensemble d'une date et d'un horaire d'entretien.";

export const MODALITES: Record<PrestationId, { annonce: string; format: string }> = {
	individuelle: {
		annonce: `Les séances se déroulent par téléphone. ${RAPPEL}`,
		format: 'Par téléphone'
	},
	programme: { annonce: RAPPEL, format: 'Par téléphone' },
	entreprise: { annonce: RAPPEL, format: 'À définir ensemble' },
	stage: {
		annonce:
			'Cochez la case ci-dessous : je vous ajoute à la liste de diffusion pour recevoir les informations sur les prochains stages, ateliers et séjours résidentiels.',
		format: 'En présentiel'
	}
};

export const LIBELLE_INFOS_STAGES =
	'Je souhaite recevoir les informations sur les prochains stages, ateliers et séjours résidentiels.';

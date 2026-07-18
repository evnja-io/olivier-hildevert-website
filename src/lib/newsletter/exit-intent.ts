/**
 * Détection d'intention de sortie pour la modale newsletter.
 * Desktop uniquement (pointer: fine) : le curseur quitte le viewport par le
 * haut (barre d'adresse, onglets). Une seule apparition par chargement de
 * page ; fermée sans inscription → snooze 30 jours ; inscrit·e → plus jamais.
 */

const CLE_INSCRIT = 'newsletter:subscribed';
const CLE_SNOOZE = 'newsletter:snooze-until';
const ARMEMENT_MS = 15_000;

// localStorage peut lever (mode privé strict, stockage désactivé) : on dégrade
// en silence — la modale s'affichera simplement à nouveau une autre fois.
function lire(cle: string): string | null {
	try {
		return localStorage.getItem(cle);
	} catch {
		return null;
	}
}

function ecrire(cle: string, valeur: string) {
	try {
		localStorage.setItem(cle, valeur);
	} catch {
		// stockage indisponible : rien à persister
	}
}

export function marquerInscrit() {
	ecrire(CLE_INSCRIT, new Date().toISOString());
}

export function snoozer(jours = 30) {
	ecrire(CLE_SNOOZE, String(Date.now() + jours * 24 * 60 * 60 * 1000));
}

function eligible(): boolean {
	if (lire(CLE_INSCRIT)) return false;
	const snooze = Number(lire(CLE_SNOOZE));
	return !(snooze && Date.now() < snooze);
}

/**
 * Arme la détection après un délai (pas de modale dans les premières secondes)
 * et appelle `ouvrir` au plus une fois. Retourne un cleanup pour le démontage.
 */
export function attacherExitIntent(ouvrir: () => void): () => void {
	if (!window.matchMedia('(pointer: fine)').matches || !eligible()) {
		return () => {};
	}

	let arme = false;
	const timer = setTimeout(() => (arme = true), ARMEMENT_MS);

	function surSortie(e: MouseEvent) {
		if (!arme || e.clientY > 0) return;
		// ne jamais interrompre une modale déjà ouverte (réservation…)
		if (document.querySelector('dialog[open]')) return;
		if (!eligible()) return;
		detacher();
		ouvrir();
	}

	function detacher() {
		clearTimeout(timer);
		document.documentElement.removeEventListener('mouseleave', surSortie);
	}

	document.documentElement.addEventListener('mouseleave', surSortie);
	return detacher;
}

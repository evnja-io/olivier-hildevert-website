/**
 * État global de la modale de commande (runes en portée module).
 * Mutations uniquement côté client (interactions utilisateur) — sûr en SSR.
 */
import type { TypeDemande } from './textes';

export const commande = $state<{ open: boolean; produit: string; type: TypeDemande }>({
	open: false,
	produit: '',
	type: 'commande'
});

export function openCommande(produit: string, type: TypeDemande = 'commande') {
	commande.produit = produit;
	commande.type = type;
	commande.open = true;
}

export function closeCommande() {
	commande.open = false;
}

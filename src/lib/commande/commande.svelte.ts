/**
 * État global de la modale de commande (runes en portée module).
 * Mutations uniquement côté client (interactions utilisateur) — sûr en SSR.
 */
export const commande = $state({
	open: false,
	produit: ''
});

export function openCommande(produit: string) {
	commande.produit = produit;
	commande.open = true;
}

export function closeCommande() {
	commande.open = false;
}

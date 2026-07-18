/**
 * État global de la modale newsletter (runes en portée module).
 * Mutations uniquement côté client (exit-intent, interactions) — sûr en SSR.
 */
export const newsletter = $state({ open: false });

export function openNewsletter() {
	newsletter.open = true;
}

export function closeNewsletter() {
	newsletter.open = false;
}

import type { PrestationId } from './prestations';

/**
 * État global de la modale de réservation (runes en portée module).
 * Mutations uniquement côté client (interactions utilisateur) — sûr en SSR.
 */
export const booking = $state({
	open: false,
	prestation: null as PrestationId | null
});

export function openBooking(id?: PrestationId) {
	booking.prestation = id ?? null;
	booking.open = true;
}

export function closeBooking() {
	booking.open = false;
}

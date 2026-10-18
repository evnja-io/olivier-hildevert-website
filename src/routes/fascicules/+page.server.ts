import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getFascicules, getPageAccueil, sansMiseEnAvant } from '$lib/server/content';

export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, items] = await Promise.all([getPageAccueil(fetch), getFascicules(fetch)]);
	return { section: accueil.fascicules, fascicules: sansMiseEnAvant(items) };
};

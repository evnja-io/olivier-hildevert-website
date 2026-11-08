import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getAvis, getPageAccueil, sansMiseEnAvant } from '$lib/server/content';

export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, avis] = await Promise.all([getPageAccueil(fetch), getAvis(fetch)]);
	return { section: accueil.avis, avis: sansMiseEnAvant(avis) };
};

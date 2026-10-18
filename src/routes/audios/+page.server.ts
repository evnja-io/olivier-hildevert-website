import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getAudios, getPageAccueil, sansMiseEnAvant } from '$lib/server/content';

export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, items] = await Promise.all([getPageAccueil(fetch), getAudios(fetch)]);
	return { section: accueil.audios, audios: sansMiseEnAvant(items) };
};

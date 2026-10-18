import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getAudios, getFascicules, getPageAccueil, vitrine } from '$lib/server/content';

// ISR : la home est régénérée au plus toutes les 5 minutes sur Vercel.
// (Config par route — jamais sur les routes à form actions.)
export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, audios, fascicules] = await Promise.all([
		getPageAccueil(fetch),
		getAudios(fetch),
		getFascicules(fetch)
	]);
	return { accueil, audios: vitrine(audios), fascicules: vitrine(fascicules) };
};

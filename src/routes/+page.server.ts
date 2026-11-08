import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getPageAccueil } from '$lib/server/content';

// ISR : la home est régénérée au plus toutes les 5 minutes sur Vercel.
// (Config par route — jamais sur les routes à form actions.)
export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	return { accueil: await getPageAccueil(fetch) };
};

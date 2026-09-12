import type { LayoutServerLoad } from './$types';
import { getPrestations, getReglages } from '$lib/server/content';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const [reglages, prestations] = await Promise.all([getReglages(fetch), getPrestations(fetch)]);
	return { reglages, prestations };
};

import type { Config } from '@sveltejs/adapter-vercel';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { renderMarkdown } from '$lib/server/markdown';

// ISR comme l'accueil : régénérée au plus toutes les 5 minutes sur Vercel.
export const config: Config = { isr: { expiration: 300 } };

// Les prestations sont déjà chargées par +layout.server.ts : aucun appel
// Strapi supplémentaire ici.
export const load: PageServerLoad = async ({ params, parent }) => {
	const { prestations } = await parent();
	const prestation = prestations.find((p) => p.cle === params.cle);
	if (!prestation) error(404, 'Prestation introuvable');
	return {
		prestation,
		descLongueHtml: renderMarkdown(prestation.descLongue),
		autres: prestations.filter((p) => p.cle !== prestation.cle)
	};
};

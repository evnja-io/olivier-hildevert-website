import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { commandeSchema } from '$lib/commande/schema';
import { enregistrerCommande } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

// Portée module : permet à Superforms de mettre l'adapter en cache.
const adapter = zod4(commandeSchema);

export const load: PageServerLoad = async ({ url }) => {
	const produit = url.searchParams.get('produit')?.slice(0, 200) ?? '';
	return {
		form: await superValidate({ produit }, adapter, { errors: false })
	};
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await enregistrerCommande(form.data, fetch);
		} catch (err) {
			console.error('Échec de l’enregistrement de la demande de commande :', err);
			return message(
				form,
				{
					type: 'erreur',
					texte: 'Votre demande n’a pas pu être enregistrée. Réessayez dans un instant.'
				},
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'succes',
			texte: 'Demande de commande transmise. Je vous recontacte rapidement pour la finaliser.'
		});
	}
};

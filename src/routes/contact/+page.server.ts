import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { contactSchema } from './schema';
import { enregistrerContact } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

// Portée module : permet à Superforms de mettre l'adapter en cache.
const adapter = zod4(contactSchema);

export const load: PageServerLoad = async () => {
	return { form: await superValidate(adapter) };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await enregistrerContact(form.data, fetch);
		} catch (err) {
			console.error('Échec de l’enregistrement du message de contact :', err);
			return message(
				form,
				{
					type: 'erreur',
					texte: 'Votre message n’a pas pu être envoyé. Réessayez dans un instant.'
				},
				{ status: 500 }
			);
		}

		return message(form, { type: 'succes', texte: 'Merci ! Votre message a bien été envoyé.' });
	}
};

import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { newsletterSchema } from '$lib/newsletter/schema';
import { inscrireNewsletter } from '$lib/server/forms';
import type { Actions, PageServerLoad } from './$types';

// Portée module : permet à Superforms de mettre l'adapter en cache.
const adapter = zod4(newsletterSchema);

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
			await inscrireNewsletter(form.data, fetch);
		} catch (err) {
			console.error('Échec de l’enregistrement de l’inscription newsletter :', err);
			return message(
				form,
				{
					type: 'erreur',
					texte: 'Votre inscription n’a pas pu être enregistrée. Réessayez dans un instant.'
				},
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'succes',
			texte: 'Inscription confirmée. À très bientôt dans votre boîte mail.'
		});
	}
};

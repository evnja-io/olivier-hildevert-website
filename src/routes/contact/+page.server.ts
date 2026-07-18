import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { contactSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';

// Portée module : permet à Superforms de mettre l'adapter en cache.
const adapter = zod4(contactSchema);

export const load: PageServerLoad = async () => {
	return { form: await superValidate(adapter) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO : brancher l'envoi réel — e-mail (Resend, …) ou POST vers une
		// collection Strapi « messages » via $lib/server/strapi.
		console.log('Message de contact reçu :', form.data);

		return message(form, 'Merci ! Votre message a bien été envoyé.');
	}
};

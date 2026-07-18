import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { newsletterSchema } from '$lib/newsletter/schema';
import type { Actions, PageServerLoad } from './$types';

// Portée module : permet à Superforms de mettre l'adapter en cache.
const adapter = zod4(newsletterSchema);

export const load: PageServerLoad = async () => {
	return { form: await superValidate(adapter) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO : brancher l'inscription réelle — provider newsletter (Brevo,
		// Resend Audiences, …) ou collection Strapi via $lib/server/strapi.
		console.log('Inscription newsletter reçue :', form.data);

		return message(form, 'Inscription confirmée. À très bientôt dans votre boîte mail.');
	}
};

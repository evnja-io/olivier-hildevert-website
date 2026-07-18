import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { bookingSchema } from '$lib/booking/schema';
import { PRESTATION_IDS, type PrestationId } from '$lib/booking/prestations';
import type { Actions, PageServerLoad } from './$types';

// Portée module : permet à Superforms de mettre l'adapter en cache.
const adapter = zod4(bookingSchema);

export const load: PageServerLoad = async ({ url }) => {
	const param = url.searchParams.get('prestation');
	const prestation = PRESTATION_IDS.includes(param as PrestationId)
		? (param as PrestationId)
		: undefined;

	return {
		form: await superValidate({ prestation }, adapter, { errors: false })
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		// TODO : brancher l'envoi réel — e-mail (Resend, …) ou POST vers une
		// collection Strapi « demandes de rendez-vous » via $lib/server/strapi.
		console.log('Demande de rendez-vous reçue :', form.data);

		return message(form, 'Demande transmise. Vous recevrez une confirmation personnelle sous peu.');
	}
};

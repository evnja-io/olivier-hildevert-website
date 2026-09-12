import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { bookingSchema } from '$lib/booking/schema';
import { PRESTATION_IDS, type PrestationId } from '$lib/booking/prestations';
import { enregistrerReservation } from '$lib/server/forms';
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
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await enregistrerReservation(form.data, fetch);
		} catch (err) {
			console.error('Échec de l’enregistrement de la demande de rendez-vous :', err);
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
			texte: 'Demande transmise. Vous recevrez une confirmation personnelle sous peu.'
		});
	}
};

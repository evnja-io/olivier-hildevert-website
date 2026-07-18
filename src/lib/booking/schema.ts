import { z } from 'zod';
import { PRESTATION_IDS } from './prestations';

export const bookingSchema = z.object({
	prestation: z.enum(PRESTATION_IDS, {
		error: 'Veuillez choisir un accompagnement.'
	}),
	name: z.string().min(2, 'Veuillez indiquer votre nom (2 caractères minimum).'),
	email: z.email('Veuillez indiquer une adresse e-mail valide.'),
	phone: z
		.string()
		.min(6, 'Veuillez indiquer un numéro de téléphone valide.')
		.max(20, 'Veuillez indiquer un numéro de téléphone valide.'),
	message: z
		.string()
		.max(2000, 'Votre message ne peut pas dépasser 2000 caractères.')
		.optional()
		.default('')
});

export type BookingSchema = typeof bookingSchema;

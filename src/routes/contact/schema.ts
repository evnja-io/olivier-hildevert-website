import { z } from 'zod';

export const contactSchema = z.object({
	name: z.string().min(2, 'Veuillez indiquer votre nom (2 caractères minimum).'),
	email: z.email('Veuillez indiquer une adresse e-mail valide.'),
	message: z
		.string()
		.min(10, 'Votre message doit contenir au moins 10 caractères.')
		.max(2000, 'Votre message ne peut pas dépasser 2000 caractères.')
});

export type ContactSchema = typeof contactSchema;

import { z } from 'zod';

export const newsletterSchema = z.object({
	email: z.email('Veuillez indiquer une adresse e-mail valide.')
});

export type NewsletterSchema = typeof newsletterSchema;

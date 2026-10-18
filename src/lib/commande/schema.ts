import { z } from 'zod';
import { TYPES_DEMANDE } from './textes';

// Le produit est un texte libre : la liste des produits vit dans Strapi et
// change sans relecture technique, il n'y a donc pas d'énumération possible.
export const commandeSchema = z.object({
	produit: z
		.string()
		.trim()
		.min(1, 'Veuillez indiquer le produit souhaité.')
		.max(200, 'Le nom du produit ne peut pas dépasser 200 caractères.'),
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
		.default(''),
	type: z.enum(TYPES_DEMANDE).catch('commande')
});

export type CommandeSchema = typeof commandeSchema;

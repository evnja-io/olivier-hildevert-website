/**
 * Enregistrement des soumissions de formulaires dans Strapi.
 * Mode dégradé assumé : sans STRAPI_URL, on trace en console et on confirme
 * (le site — et les e2e — doivent rester fonctionnels sans CMS).
 */
import { createEntry, isStrapiConfigured, StrapiError } from './strapi';

export async function enregistrerContact(
	data: { name: string; email: string; message: string },
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Message de contact reçu (Strapi non configuré) :', data);
		return;
	}
	await createEntry(
		'messages-contact',
		{ nom: data.name, email: data.email, message: data.message },
		fetcher
	);
}

export async function enregistrerReservation(
	data: { prestation: string; name: string; email: string; phone: string; message: string },
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Demande de rendez-vous reçue (Strapi non configuré) :', data);
		return;
	}
	await createEntry(
		'demandes-reservation',
		{
			prestation: data.prestation,
			nom: data.name,
			email: data.email,
			telephone: data.phone,
			message: data.message
		},
		fetcher
	);
}

export async function inscrireNewsletter(
	data: { email: string },
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Inscription newsletter reçue (Strapi non configuré) :', data);
		return;
	}
	try {
		await createEntry('inscrits-newsletter', { email: data.email }, fetcher);
	} catch (err) {
		if (err instanceof StrapiError && err.status === 400) {
			// Cas nominal attendu : contrainte d'unicité (`unique: true` côté CMS) sur un
			// email déjà inscrit — succès idempotent. On trace quand même le corps de la
			// réponse pour qu'un 400 inattendu (schéma invalide, etc.) reste détectable
			// dans les logs Vercel plutôt que d'échouer silencieusement.
			console.warn('Réponse 400 de Strapi sur inscrits-newsletter (traitée comme idempotente) :', {
				status: err.status,
				body: err.body
			});
			return;
		}
		throw err;
	}
}

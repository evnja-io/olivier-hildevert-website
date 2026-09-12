/**
 * Couche contenu : lit Strapi quand il est configuré, sinon (erreur réseau,
 * contenu dépublié, réponse invalide) sert le contenu par défaut du code.
 * Fallback TOUT-OU-RIEN par domaine — jamais de page mi-CMS mi-code.
 * Le populate profond est le point fragile de Strapi v5 : il est figé ici
 * et couvert par les tests round-trip de content.test.ts.
 */
import { z } from 'zod';
import { fetchEntries, fetchSingle, isStrapiConfigured } from './strapi';
import { PRESTATION_IDS } from '$lib/booking/prestations';
import { defaultAccueil, defaultPrestations, defaultReglages } from '$lib/content/defaults';
import type { PageAccueilContent, PrestationContent, ReglagesSite } from '$lib/content/types';

// ————— Schémas de validation de la réponse Strapi (attributs à plat, v5) —————

const itemsTexte = z
	.array(z.object({ texte: z.string() }))
	.nonempty()
	.transform((items) => items.map((i) => i.texte));

const optionnel = z
	.string()
	.nullish()
	.transform((v) => v ?? undefined);

const colonneSchema = z.object({
	tag: z.string(),
	titre: z.string(),
	desc: z.string(),
	points: itemsTexte
});

const accueilSchema = z.object({
	hero: z.object({
		eyebrow: z.string(),
		titreLigne1: z.string(),
		titreLigne2: z.string(),
		paragraphe: z.string(),
		ligneMono: z.string(),
		boutonPrincipal: z.string(),
		boutonSecondaire: z.string(),
		stats: z.array(z.object({ valeur: z.string(), legende: z.string() })).nonempty()
	}),
	approche: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe1: z.string(),
		paragraphe2: z.string(),
		strates: z
			.array(
				z.object({
					num: z.string(),
					titre: z.string(),
					desc: z.string(),
					profondeur: z.string()
				})
			)
			.nonempty(),
		legendeGauche: z.string(),
		legendeDroite: z.string()
	}),
	espritAme: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		colonneEsprit: colonneSchema,
		colonneAme: colonneSchema
	}),
	aPropos: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		sousTitre: z.string(),
		paragraphe1: z.string(),
		paragraphe2: z.string(),
		paragraphe3: z.string(),
		citation: z.string(),
		qualifications: itemsTexte,
		legendePortrait: z.string()
	}),
	prestationsIntro: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe: z.string()
	}),
	pourQui: z.object({ eyebrow: z.string(), titre: z.string(), publics: itemsTexte }),
	boutique: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe: z.string(),
		produits: z
			.array(
				z.object({
					cleImage: z.enum(['livre', 'veilleuses']),
					tag: z.string(),
					titre: z.string(),
					desc: z.string(),
					prixTexte: z.string(),
					boutonLabel: z.string(),
					lien: z.string()
				})
			)
			.nonempty()
	}),
	tarifs: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		cartes: z
			.array(
				z.object({
					label: z.string(),
					montant: z.string(),
					suffixe: optionnel,
					sousTexte: z.string(),
					boutonLabel: z.string(),
					prestationCle: z.enum(PRESTATION_IDS),
					misEnAvant: z.boolean()
				})
			)
			.nonempty()
	}),
	mantra: z.object({ citation: z.string() }),
	contactCta: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe: z.string(),
		boutonLabel: z.string(),
		modes: itemsTexte
	})
});

const prestationSchema = z.object({
	cle: z.enum(PRESTATION_IDS),
	titre: z.string(),
	metaReservation: z.string(),
	descReservation: z.string(),
	descCarte: z.string(),
	prixCarte: z.string(),
	actionCarte: z.string()
});

const reglagesSchema = z.object({
	tagline: z.string(),
	descriptionSeo: z.string(),
	mentionLegale: z.string(),
	footerIntro: z.string(),
	sousTitreLogo: z.string(),
	email: optionnel,
	telephone: optionnel,
	adresse: optionnel,
	siteExterne: optionnel
});

// Populate explicite des composants imbriqués (Strapi v5 ne populate rien par défaut).
const POPULATE_ACCUEIL = {
	'populate[hero][populate]': '*',
	'populate[approche][populate]': '*',
	'populate[espritAme][populate][colonneEsprit][populate]': '*',
	'populate[espritAme][populate][colonneAme][populate]': '*',
	'populate[aPropos][populate]': '*',
	'populate[prestationsIntro][populate]': '*',
	'populate[pourQui][populate]': '*',
	'populate[boutique][populate]': '*',
	'populate[tarifs][populate]': '*',
	'populate[mantra][populate]': '*',
	'populate[contactCta][populate]': '*'
};

export async function getPageAccueil(fetcher: typeof fetch): Promise<PageAccueilContent> {
	if (!isStrapiConfigured()) return defaultAccueil;
	try {
		const data = await fetchSingle<Record<string, unknown>>(
			'page-accueil',
			POPULATE_ACCUEIL,
			fetcher
		);
		if (!data) throw new Error('page-accueil non publiée');
		const contenu: PageAccueilContent = accueilSchema.parse(data);
		return contenu;
	} catch (err) {
		console.warn('Contenu Strapi « page-accueil » indisponible — défauts servis.', err);
		return defaultAccueil;
	}
}

export async function getPrestations(fetcher: typeof fetch): Promise<PrestationContent[]> {
	if (!isStrapiConfigured()) return defaultPrestations;
	try {
		const { items } = await fetchEntries<Record<string, unknown>>(
			'prestations',
			{ sort: 'ordre' },
			fetcher
		);
		const valides = new Map<string, PrestationContent>();
		for (const item of items) {
			const res = prestationSchema.safeParse(item);
			if (!res.success) {
				console.warn('Prestation Strapi ignorée (invalide ou clé inconnue).', res.error.issues);
				continue;
			}
			if (!valides.has(res.data.cle)) valides.set(res.data.cle, res.data);
		}
		// Toujours 4 entrées, dans l’ordre canonique — les manquantes viennent des défauts.
		return PRESTATION_IDS.map(
			(cle) => valides.get(cle) ?? defaultPrestations.find((p) => p.cle === cle)!
		);
	} catch (err) {
		console.warn('Prestations Strapi indisponibles — défauts servis.', err);
		return defaultPrestations;
	}
}

export async function getReglages(fetcher: typeof fetch): Promise<ReglagesSite> {
	if (!isStrapiConfigured()) return defaultReglages;
	try {
		const data = await fetchSingle<Record<string, unknown>>('reglages-site', undefined, fetcher);
		if (!data) throw new Error('reglages-site non publiés');
		const reglages: ReglagesSite = reglagesSchema.parse(data);
		return reglages;
	} catch (err) {
		console.warn('Réglages Strapi indisponibles — défauts servis.', err);
		return defaultReglages;
	}
}

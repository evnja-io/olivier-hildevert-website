/**
 * Client Strapi v5 minimal et typé (côté serveur uniquement — SvelteKit interdit
 * l'import de `$lib/server` depuis le client).
 *
 * Configuration via `.env` (voir `.env.example`) : STRAPI_URL, STRAPI_API_TOKEN.
 * La config est vérifiée paresseusement : le build passe sans `.env`, l'erreur
 * n'apparaît qu'à l'appel d'un helper.
 *
 * NB : si des pages consommant Strapi sont prerendered un jour, `$env/dynamic/private`
 * n'est pas disponible au prerendering — passer alors à `$env/static/private`.
 *
 * Exemple d'usage dans une load function :
 * ```ts
 * // src/routes/projets/+page.server.ts
 * import { fetchEntries } from '$lib/server/strapi';
 *
 * interface Projet { title: string; slug: string; description: string; }
 *
 * export const load = async ({ fetch }) => {
 *   const { items } = await fetchEntries<Projet>('projets', { sort: 'title' }, fetch);
 *   return { projets: items };
 * };
 * ```
 */
import { env } from '$env/dynamic/private';

/** Champs système présents sur toute entrée Strapi v5 (attributs à plat). */
export interface StrapiEntry {
	id: number;
	documentId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string | null;
}

export interface StrapiPagination {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
}

interface StrapiListResponse<T> {
	data: (T & StrapiEntry)[];
	meta: { pagination: StrapiPagination };
}

interface StrapiSingleResponse<T> {
	data: (T & StrapiEntry) | null;
}

export class StrapiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'StrapiError';
	}
}

type Query = Record<string, string>;

function config() {
	if (!env.STRAPI_URL) {
		throw new Error(
			'STRAPI_URL manquant : copiez .env.example vers .env et renseignez les valeurs.'
		);
	}
	return { url: env.STRAPI_URL.replace(/\/$/, ''), token: env.STRAPI_API_TOKEN };
}

/** Vrai si STRAPI_URL est renseigné — sinon le site vit sur son contenu par défaut. */
export function isStrapiConfigured(): boolean {
	return Boolean(env.STRAPI_URL);
}

async function strapiFetch<T>(
	path: string,
	query?: Query,
	fetcher: typeof fetch = fetch
): Promise<T> {
	const { url, token } = config();
	const params = new URLSearchParams(query);
	const search = params.size > 0 ? `?${params}` : '';

	const res = await fetcher(`${url}/api${path}${search}`, {
		headers: {
			Accept: 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	});

	if (!res.ok) {
		throw new StrapiError(res.status, `Strapi a répondu ${res.status} pour ${path}`);
	}

	return res.json() as Promise<T>;
}

/** Liste les entrées d'une collection (ex. `fetchEntries('articles')`). */
export async function fetchEntries<T>(collection: string, query?: Query, fetcher?: typeof fetch) {
	const { data, meta } = await strapiFetch<StrapiListResponse<T>>(`/${collection}`, query, fetcher);
	return { items: data, pagination: meta.pagination };
}

/** Récupère une entrée par son `documentId`. Retourne `null` si introuvable. */
export async function fetchEntry<T>(
	collection: string,
	documentId: string,
	query?: Query,
	fetcher?: typeof fetch
) {
	try {
		const { data } = await strapiFetch<StrapiSingleResponse<T>>(
			`/${collection}/${documentId}`,
			query,
			fetcher
		);
		return data;
	} catch (err) {
		if (err instanceof StrapiError && err.status === 404) return null;
		throw err;
	}
}

/** Récupère un single type (ex. `fetchSingle('homepage')`). */
export async function fetchSingle<T>(singleType: string, query?: Query, fetcher?: typeof fetch) {
	const { data } = await strapiFetch<StrapiSingleResponse<T>>(`/${singleType}`, query, fetcher);
	return data;
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({ env: process.env }));

import { defaultAccueil, defaultPrestations, defaultReglages } from '$lib/content/defaults';
import {
	accueilVersStrapi,
	prestationsVersStrapi,
	reglagesVersStrapi
} from '$lib/content/seed-format';
import { getPageAccueil, getPrestations, getReglages } from './content';

const reponse = (body: unknown) =>
	vi.fn(async () => new Response(JSON.stringify(body))) as unknown as typeof fetch;

const enEchec = vi.fn(async () => new Response('boom', { status: 500 })) as unknown as typeof fetch;

beforeEach(() => {
	vi.stubEnv('STRAPI_URL', 'http://cms.test');
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

describe('getPageAccueil', () => {
	it('mappe la réponse Strapi (round-trip avec le format de seed)', async () => {
		const fetcher = reponse({ data: accueilVersStrapi(defaultAccueil) });
		await expect(getPageAccueil(fetcher)).resolves.toEqual(defaultAccueil);
	});

	it('retombe sur le défaut si le contenu est dépublié (data: null)', async () => {
		await expect(getPageAccueil(reponse({ data: null }))).resolves.toEqual(defaultAccueil);
	});

	it('retombe sur le défaut si la réponse est invalide', async () => {
		await expect(getPageAccueil(reponse({ data: { hero: {} } }))).resolves.toEqual(defaultAccueil);
	});

	it('remet les strates dans l’ordre de leur numéro, quel que soit l’ordre renvoyé', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const { strates } = brut.approche;
		const melange = [
			strates[6],
			strates[2],
			strates[0],
			strates[5],
			strates[1],
			strates[4],
			strates[3]
		];
		const accueil = await getPageAccueil(
			reponse({ data: { ...brut, approche: { ...brut.approche, strates: melange } } })
		);
		expect(accueil.approche.strates.map((s) => s.num)).toEqual([
			'I',
			'II',
			'III',
			'IV',
			'V',
			'VI',
			'VII'
		]);
	});

	it('trie aussi les numéros arabes, et laisse en fin ceux qui ne sont pas des numéros', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const [a, b, c] = brut.approche.strates;
		const strates = [
			{ ...a, num: '10' },
			{ ...b, num: '?' },
			{ ...c, num: '2' }
		];
		const accueil = await getPageAccueil(
			reponse({ data: { ...brut, approche: { ...brut.approche, strates } } })
		);
		expect(accueil.approche.strates.map((s) => s.num)).toEqual(['2', '10', '?']);
	});

	it('retombe sur le défaut si Strapi est en erreur', async () => {
		await expect(getPageAccueil(enEchec)).resolves.toEqual(defaultAccueil);
	});

	it('sert le défaut sans appel réseau quand Strapi n’est pas configuré', async () => {
		vi.stubEnv('STRAPI_URL', '');
		const fetcher = vi.fn() as unknown as typeof fetch;
		await expect(getPageAccueil(fetcher)).resolves.toEqual(defaultAccueil);
		expect(fetcher).not.toHaveBeenCalled();
	});
});

describe('getPrestations', () => {
	it('mappe les 4 prestations (round-trip avec le format de seed)', async () => {
		const fetcher = reponse({
			data: prestationsVersStrapi(defaultPrestations),
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
		});
		await expect(getPrestations(fetcher)).resolves.toEqual(defaultPrestations);
	});

	it('ignore les entrées invalides et complète les manquantes par les défauts', async () => {
		const fetcher = reponse({
			data: [
				{ ...defaultPrestations[0], titre: 'Séance revue' },
				{ cle: 'inconnue', titre: 'X' }
			],
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 2 } }
		});
		const prestations = await getPrestations(fetcher);
		expect(prestations).toHaveLength(4);
		expect(prestations[0].titre).toBe('Séance revue');
		expect(prestations.slice(1)).toEqual(defaultPrestations.slice(1));
	});

	it('retombe sur les défauts si Strapi est en erreur', async () => {
		await expect(getPrestations(enEchec)).resolves.toEqual(defaultPrestations);
	});

	it('sert le texte long par défaut quand Strapi ne le fournit pas, sans déclasser le domaine', async () => {
		const fetcher = reponse({
			data: [
				{ ...defaultPrestations[0], titre: 'Séance revue', descLongue: null },
				{ ...defaultPrestations[1], titre: 'Programmes revus', descLongue: '' },
				{ ...defaultPrestations[2], titre: 'Entreprises revues', descLongue: undefined },
				{ ...defaultPrestations[3], descLongue: '## Déroulé\n\nTexte **client**.' }
			],
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
		});
		const prestations = await getPrestations(fetcher);
		expect(prestations.map((p) => p.titre)).toEqual([
			'Séance revue',
			'Programmes revus',
			'Entreprises revues',
			defaultPrestations[3].titre
		]);
		expect(prestations.slice(0, 3).map((p) => p.descLongue)).toEqual([
			'Présentation détaillée à venir.',
			'Présentation détaillée à venir.',
			'Présentation détaillée à venir.'
		]);
		expect(prestations[3].descLongue).toBe('## Déroulé\n\nTexte **client**.');
	});

	it('ignore des infos pratiques vides ou faites d’espaces, garde les autres', async () => {
		const fetcher = reponse({
			data: [
				{ ...defaultPrestations[0], infosPratiques: '140 € · 1 h 30 · par téléphone' },
				{ ...defaultPrestations[1], infosPratiques: '   ' },
				{ ...defaultPrestations[2], infosPratiques: null },
				{ ...defaultPrestations[3], prixCarte: 'Sur devis · groupe' }
			],
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
		});
		const prestations = await getPrestations(fetcher);
		expect(prestations[0].infosPratiques).toBe('140 € · 1 h 30 · par téléphone');
		expect(prestations[1].infosPratiques).toBeUndefined();
		expect(prestations[2].infosPratiques).toBeUndefined();
		// l'ancien champ prixCarte, encore présent en production, ne gêne pas et n'est pas repris
		expect(prestations[3]).not.toHaveProperty('prixCarte');
		expect(prestations[3].titre).toBe(defaultPrestations[3].titre);
	});
});

describe('getReglages', () => {
	it('mappe les réglages (round-trip) et normalise null → undefined', async () => {
		const fetcher = reponse({ data: { ...reglagesVersStrapi(defaultReglages), email: null } });
		await expect(getReglages(fetcher)).resolves.toEqual(defaultReglages);
	});

	it('retombe sur les défauts si dépublié', async () => {
		await expect(getReglages(reponse({ data: null }))).resolves.toEqual(defaultReglages);
	});
});

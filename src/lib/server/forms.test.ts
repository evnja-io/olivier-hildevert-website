import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enregistrerContact, enregistrerReservation, inscrireNewsletter } from './forms';
import { StrapiError } from './strapi';

vi.mock('$env/dynamic/private', () => ({ env: process.env }));

const ok = () => vi.fn(async () => new Response('{"data":{}}', { status: 201 }));
const statut = (status: number) => vi.fn(async () => new Response('{}', { status }));

beforeEach(() => {
	vi.stubEnv('STRAPI_URL', 'http://cms.test');
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

describe('mode dégradé (Strapi non configuré)', () => {
	it('trace en console sans appel réseau', async () => {
		vi.stubEnv('STRAPI_URL', '');
		const fetcher = vi.fn();
		await enregistrerContact(
			{ name: 'Jeanne', email: 'j@ex.fr', message: 'Bonjour, message assez long.' },
			fetcher as unknown as typeof fetch
		);
		expect(fetcher).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalled();
	});
});

describe('enregistrerReservation', () => {
	it('poste la demande sur demandes-reservation avec les champs traduits', async () => {
		const fetcher = ok();
		await enregistrerReservation(
			{
				prestation: 'individuelle',
				name: 'Jeanne Dupont',
				email: 'jeanne@example.com',
				phone: '06 12 34 56 78',
				message: 'Disponible le soir.'
			},
			fetcher as unknown as typeof fetch
		);
		const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('http://cms.test/api/demandes-reservation');
		expect(JSON.parse(init.body as string)).toEqual({
			data: {
				prestation: 'individuelle',
				nom: 'Jeanne Dupont',
				email: 'jeanne@example.com',
				telephone: '06 12 34 56 78',
				message: 'Disponible le soir.'
			}
		});
	});

	it('propage l’erreur Strapi', async () => {
		await expect(
			enregistrerReservation(
				{ prestation: 'stage', name: 'J', email: 'j@ex.fr', phone: '0600000000', message: '' },
				statut(500) as unknown as typeof fetch
			)
		).rejects.toBeInstanceOf(StrapiError);
	});
});

describe('inscrireNewsletter', () => {
	it('traite une adresse déjà inscrite (400 unicité) comme un succès', async () => {
		await expect(
			inscrireNewsletter({ email: 'deja@ex.fr' }, statut(400) as unknown as typeof fetch)
		).resolves.toBeUndefined();
		expect(console.warn).toHaveBeenCalledOnce();
	});

	it('propage les autres erreurs', async () => {
		await expect(
			inscrireNewsletter({ email: 'x@ex.fr' }, statut(503) as unknown as typeof fetch)
		).rejects.toBeInstanceOf(StrapiError);
	});
});

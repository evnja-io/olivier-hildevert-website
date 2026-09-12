import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({ env: process.env }));

import { createEntry, isStrapiConfigured, StrapiError } from './strapi';

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('isStrapiConfigured', () => {
	it('est faux sans STRAPI_URL', () => {
		vi.stubEnv('STRAPI_URL', '');
		expect(isStrapiConfigured()).toBe(false);
	});

	it('est vrai avec STRAPI_URL', () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		expect(isStrapiConfigured()).toBe(true);
	});
});

describe('createEntry', () => {
	it('poste { data } sur la collection avec le token', async () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		vi.stubEnv('STRAPI_API_TOKEN', 'jeton');
		const fetcher = vi.fn(
			async () =>
				new Response(JSON.stringify({ data: { id: 1, documentId: 'abc' } }), { status: 201 })
		) as unknown as typeof fetch;

		await createEntry('messages-contact', { nom: 'Jeanne' }, fetcher);

		const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(url).toBe('http://cms.test/api/messages-contact');
		expect(init.method).toBe('POST');
		expect(init.headers.Authorization).toBe('Bearer jeton');
		expect(init.headers['Content-Type']).toBe('application/json');
		expect(JSON.parse(init.body)).toEqual({ data: { nom: 'Jeanne' } });
	});

	it('lève StrapiError sur une réponse en échec', async () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		const fetcher = vi.fn(
			async () => new Response('nope', { status: 500 })
		) as unknown as typeof fetch;
		await expect(createEntry('messages-contact', {}, fetcher)).rejects.toBeInstanceOf(StrapiError);
	});

	it('StrapiError porte le corps de la réponse en échec', async () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		const fetcher = vi.fn(
			async () => new Response('nope', { status: 500 })
		) as unknown as typeof fetch;
		try {
			await createEntry('messages-contact', {}, fetcher);
			expect.unreachable();
		} catch (err) {
			expect(err).toBeInstanceOf(StrapiError);
			expect((err as StrapiError).body).toBe('nope');
		}
	});
});

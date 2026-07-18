import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({ env: process.env }));

import { isStrapiConfigured } from './strapi';

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

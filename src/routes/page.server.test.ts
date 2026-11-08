import { describe, expect, it, vi } from 'vitest';

const avis = Array.from({ length: 8 }, (_, i) => ({
	texte: `Avis ${i + 1}`,
	nom: `Personne ${i + 1}`,
	misEnAvant: i === 7
}));

vi.mock('$lib/server/content', async (original) => ({
	...(await original<typeof import('$lib/server/content')>()),
	getPageAccueil: vi.fn(async () => ({})),
	getAvis: vi.fn(async () => avis)
}));

const { load } = await import('./+page.server');

describe('chargement de l’accueil', () => {
	it('montre 6 avis, le mis en avant d’abord', async () => {
		const data = (await load({ fetch } as never)) as { avis: { nom: string }[] };
		expect(data.avis).toHaveLength(6);
		expect(data.avis[0].nom).toBe('Personne 8');
	});
});

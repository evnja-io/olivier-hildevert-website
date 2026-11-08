import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CarteAvis from './CarteAvis.svelte';

describe('CarteAvis', () => {
	it('cite le texte dans un blockquote et signe avec le nom et le contexte', async () => {
		const screen = render(CarteAvis, {
			avis: { texte: 'Une écoute rare.', nom: 'Claire M.', contexte: 'Stage en entreprise' }
		});
		const figure = screen.container.querySelector('figure')!;
		expect(figure).not.toBeNull();
		expect(figure.querySelector('blockquote')?.textContent).toContain('Une écoute rare.');
		const signature = figure.querySelector('figcaption')!;
		expect(signature.textContent).toContain('Claire M.');
		expect(signature.textContent).toContain('Stage en entreprise');
		await expect.element(screen.getByText('Une écoute rare.')).toBeVisible();
	});

	it('ne rend aucun élément vide sans contexte', () => {
		const screen = render(CarteAvis, { avis: { texte: 'Merci.', nom: 'Inès B.' } });
		const signature = screen.container.querySelector('figcaption')!;
		expect(signature.children).toHaveLength(0);
		expect(signature.textContent?.trim()).toBe('Inès B.');
	});
});

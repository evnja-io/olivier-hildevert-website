import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultAccueil } from '$lib/content/defaults';
import References from './References.svelte';

describe('References', () => {
	it('cite les entreprises par leur nom, sans logo par défaut', async () => {
		const screen = render(References);
		await expect
			.element(screen.getByRole('heading', { name: /ont fait confiance/ }))
			.toBeInTheDocument();
		await expect.element(screen.getByText('Groupe M6')).toBeInTheDocument();
		expect(screen.container.querySelectorAll('li')).toHaveLength(
			defaultAccueil.references.entreprises.length
		);
		expect(screen.container.querySelector('img')).toBeNull();
	});

	it('affiche le logo envoyé, avec le nom en texte alternatif', async () => {
		const screen = render(References, {
			content: {
				...defaultAccueil.references,
				entreprises: [
					{
						nom: 'Groupe M6',
						logo: { src: 'https://cms.test/m6.png', largeur: 300, hauteur: 120, alt: '' }
					}
				]
			}
		});
		await expect
			.element(screen.getByRole('img', { name: 'Groupe M6' }))
			.toHaveAttribute('src', 'https://cms.test/m6.png');
	});

	it('masque la section quand la liste est vide', async () => {
		const screen = render(References, {
			content: { ...defaultAccueil.references, entreprises: [] }
		});
		expect(screen.container.querySelector('section')).toBeNull();
	});
});

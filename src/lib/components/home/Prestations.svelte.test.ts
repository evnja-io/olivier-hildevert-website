import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultPrestations } from '$lib/content/defaults';
import Prestations from './Prestations.svelte';

describe('Prestations', () => {
	it('affiche le contenu par défaut sans props', async () => {
		const screen = render(Prestations);
		await expect
			.element(screen.getByRole('heading', { name: 'Des accompagnements pour chaque chemin' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('heading', { name: 'Séance individuelle' }))
			.toBeInTheDocument();
	});

	it('affiche le contenu passé en props (CMS)', async () => {
		const screen = render(Prestations, {
			props: {
				intro: { eyebrow: 'Offre', titre: 'Titre venu du CMS', paragraphe: 'Intro CMS.' },
				prestations: [{ ...defaultPrestations[0], titre: 'Titre de prestation revu' }]
			}
		});
		await expect
			.element(screen.getByRole('heading', { name: 'Titre venu du CMS' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('heading', { name: 'Titre de prestation revu' }))
			.toBeInTheDocument();
	});
});

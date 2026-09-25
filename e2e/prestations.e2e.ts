import { expect, test } from '@playwright/test';

const PAGES = [
	['individuelle', 'Séance individuelle', 'Réserver'],
	['programme', "Programmes d'éveil", 'Découvrir'],
	['entreprise', 'Entreprises', 'Contacter'],
	['stage', 'Stages & ateliers', 'Participer']
] as const;

test.describe('pages des prestations', () => {
	test('« En savoir plus » de chaque carte mène à la bonne page', async ({ page }) => {
		for (const [cle, titre] of PAGES) {
			await page.goto('/');
			await page
				.locator('#prestations')
				.getByRole('link', { name: `En savoir plus : ${titre}` })
				.click();
			await expect(page).toHaveURL(new RegExp(`/prestations/${cle}$`));
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
			await expect(page.locator('.texte-riche')).toContainText('Présentation détaillée à venir.');
			await expect(page).toHaveTitle(`${titre} — Olivier Hildevert`);
		}
	});

	test('une prestation inconnue renvoie une 404', async ({ page }) => {
		const reponse = await page.goto('/prestations/inconnue');
		expect(reponse?.status()).toBe(404);
	});

	test('le bouton d’action ouvre la modale sur la prestation de la page', async ({ page }) => {
		await page.goto('/prestations/stage');
		await page.getByRole('link', { name: 'Participer', exact: true }).first().click();
		const modale = page.getByRole('dialog', { name: 'Prendre rendez-vous' });
		await expect(modale.getByText('Vos coordonnées')).toBeVisible();
		await expect(modale.getByText('En présentiel', { exact: true })).toBeVisible();
	});

	test('les autres accompagnements sont proposés, pas celui de la page', async ({ page }) => {
		await page.goto('/prestations/programme');
		const autres = page.getByRole('region', { name: 'Voir les autres accompagnements' });
		await expect(autres.getByRole('link')).toHaveCount(3);
		await expect(autres.getByRole('link', { name: "Programmes d'éveil" })).toHaveCount(0);
	});

	test('la page tient sur mobile, même avec le texte le plus long', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		for (const [cle] of PAGES) {
			await page.goto(`/prestations/${cle}`);
			const debordement = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(debordement, `/prestations/${cle}`).toBe(0);
		}
	});

	test('le sitemap liste les 4 pages', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		for (const [cle] of PAGES) expect(xml).toContain(`/prestations/${cle}</loc>`);
	});
});

test.describe('pages des prestations sans JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('le bouton d’action retombe sur la page de réservation', async ({ page }) => {
		for (const [cle, , action] of PAGES) {
			await page.goto(`/prestations/${cle}`);
			// SvelteKit rend des chemins relatifs côté serveur (« ../reservation… ») :
			// on vérifie où mène le clic, pas la forme de l'attribut.
			await page.getByRole('link', { name: action, exact: true }).first().click();
			await expect(page).toHaveURL(new RegExp(`/reservation\\?prestation=${cle}$`));
		}
	});
});

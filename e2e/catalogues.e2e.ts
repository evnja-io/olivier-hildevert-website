import { expect, test } from '@playwright/test';

// Sans .env, Strapi n'est pas configuré : les catalogues sont vides.
test.describe('catalogues', () => {
	test('les sections vides sont absentes de l’accueil', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#boutique')).toBeVisible();
		await expect(page.locator('#ressources')).toHaveCount(0);
		await expect(page.locator('#audios')).toHaveCount(0);
		await expect(page.locator('#fascicules')).toHaveCount(0);
	});

	for (const [chemin, titre] of [
		['/audios', 'Écouter, respirer, se relier'],
		['/fascicules', 'Des fascicules à thème pour approfondir']
	]) {
		test(`${chemin} répond et annonce un catalogue à venir`, async ({ page }) => {
			const res = await page.goto(chemin);
			expect(res?.status()).toBe(200);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
			await expect(page.getByText('Bientôt disponible.')).toBeVisible();
			await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute(
				'href',
				'/'
			);
		});
	}

	test('le pied de page mène aux deux catalogues', async ({ page }) => {
		await page.goto('/');
		const plan = page.getByRole('navigation', { name: 'Plan du site' });
		await expect(plan.getByRole('link', { name: 'Audios', exact: true })).toHaveAttribute(
			'href',
			'/audios'
		);
		await expect(plan.getByRole('link', { name: 'Fascicules', exact: true })).toHaveAttribute(
			'href',
			'/fascicules'
		);
	});

	test('le sitemap liste les deux pages', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		expect(xml).toContain('/audios</loc>');
		expect(xml).toContain('/fascicules</loc>');
	});
});

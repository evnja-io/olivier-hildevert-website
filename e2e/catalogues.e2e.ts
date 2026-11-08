import { expect, test } from '@playwright/test';

// Sans .env, Strapi n'est pas configuré : les catalogues sont vides.
test.describe('catalogues', () => {
	test('les sections vides sont absentes de l’accueil', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#boutique')).toBeVisible();
		await expect(page.locator('#audios')).toHaveCount(0);
		await expect(page.locator('#fascicules')).toHaveCount(0);
	});

	for (const [chemin, titre] of [
		['/audios', 'Écouter pour se transformer']
	]) {
		test(`${chemin} répond et annonce un catalogue à venir`, async ({ page }) => {
			const res = await page.goto(chemin);
			expect(res?.status()).toBe(200);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
			await expect(
				page.getByText(
					'Des exercices sophrologiques offerts, à écouter ici même ou à emporter chez vous quand vous en aurez besoin.'
				)
			).toBeVisible();
			await expect(page.getByText('Bientôt disponible.')).toBeVisible();
			await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute(
				'href',
				'/'
			);
		});
	}

	test('/fascicules n’existe plus', async ({ page }) => {
		expect((await page.goto('/fascicules'))?.status()).toBe(404);
	});

	test('le pied de page mène aux audios, plus aux fascicules', async ({ page }) => {
		await page.goto('/');
		const plan = page.getByRole('navigation', { name: 'Plan du site' });
		await expect(plan.getByRole('link', { name: 'Audios', exact: true })).toHaveAttribute(
			'href',
			'/audios'
		);
		await expect(plan.getByRole('link', { name: 'Fascicules', exact: true })).toHaveCount(0);
	});

	test('le sitemap liste les audios, plus les fascicules', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		expect(xml).toContain('/audios</loc>');
		expect(xml).not.toContain('/fascicules</loc>');
	});
});

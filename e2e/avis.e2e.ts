import { expect, test } from '@playwright/test';

// Sans .env, Strapi n'est pas configuré : aucun avis.
test.describe('avis', () => {
	test('la section est absente de l’accueil sans avis', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#boutique')).toBeVisible();
		await expect(page.locator('#avis')).toHaveCount(0);
	});

	test('/avis répond et annonce des avis à venir', async ({ page }) => {
		const res = await page.goto('/avis');
		expect(res?.status()).toBe(200);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ils en parlent');
		await expect(page.getByText('Bientôt disponible.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute(
			'href',
			'/'
		);
	});

	test('le pied de page mène aux avis', async ({ page }) => {
		await page.goto('/');
		const plan = page.getByRole('navigation', { name: 'Plan du site' });
		await expect(plan.getByRole('link', { name: 'Avis', exact: true })).toHaveAttribute(
			'href',
			'/avis'
		);
	});

	test('le sitemap liste /avis', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		expect(xml).toContain('/avis</loc>');
	});
});

import { expect, test, type Page } from '@playwright/test';

// L'armement de l'exit-intent dure 15 s : on pilote l'horloge de la page
// (page.clock) puis on simule la sortie du curseur par le haut du viewport.
async function simulerSortie(page: Page) {
	await page.dispatchEvent('html', 'mouseleave', { clientY: 0 });
}

test.describe('modale newsletter (exit-intent)', () => {
	test('apparaît à l’intention de sortie et enregistre l’inscription', async ({ page }) => {
		await page.clock.install();
		await page.goto('/');
		await page.clock.fastForward(16_000);
		await simulerSortie(page);

		const modale = page.getByRole('dialog', { name: 'Newsletter' });
		await expect(modale).toBeVisible();

		await modale.getByLabel('Adresse e-mail').fill('jeanne@example.com');
		await modale.getByRole('button', { name: "Je m'inscris" }).click();
		await expect(modale.getByRole('heading', { name: 'Inscription confirmée' })).toBeVisible();

		const inscrit = await page.evaluate(() => localStorage.getItem('newsletter:subscribed'));
		expect(inscrit).toBeTruthy();

		// Une fois inscrit·e, la modale ne réapparaît plus, même après rechargement.
		await page.reload();
		await page.clock.fastForward(16_000);
		await simulerSortie(page);
		await expect(modale).toBeHidden();
	});

	test('fermée sans inscription, elle pose un snooze et ne réapparaît pas', async ({ page }) => {
		await page.clock.install();
		await page.goto('/');
		await page.clock.fastForward(16_000);
		await simulerSortie(page);

		const modale = page.getByRole('dialog', { name: 'Newsletter' });
		await expect(modale).toBeVisible();
		await modale.getByRole('button', { name: 'Non merci' }).click();
		await expect(modale).toBeHidden();

		// l'événement close du <dialog> (qui pose le snooze) est asynchrone
		await expect
			.poll(() => page.evaluate(() => Number(localStorage.getItem('newsletter:snooze-until'))))
			.toBeGreaterThan(Date.now());

		await page.reload();
		await page.clock.fastForward(16_000);
		await simulerSortie(page);
		await expect(modale).toBeHidden();
	});

	test('ne se déclenche pas avant l’armement de 15 s', async ({ page }) => {
		await page.clock.install();
		await page.goto('/');
		await page.clock.fastForward(2_000);
		await simulerSortie(page);

		await expect(page.getByRole('dialog', { name: 'Newsletter' })).toBeHidden();
	});

	test('n’interrompt jamais la modale de réservation', async ({ page }) => {
		await page.clock.install();
		await page.goto('/');
		await page.getByRole('link', { name: 'Réserver une séance' }).click();
		await expect(page.getByRole('dialog', { name: 'Prendre rendez-vous' })).toBeVisible();

		await page.clock.fastForward(16_000);
		await simulerSortie(page);

		await expect(page.getByRole('dialog', { name: 'Newsletter' })).toBeHidden();
		await expect(page.getByRole('dialog', { name: 'Prendre rendez-vous' })).toBeVisible();
	});
});

test.describe('page /newsletter (fallback)', () => {
	test('valide en français puis confirme l’inscription', async ({ page }) => {
		await page.goto('/newsletter');

		// scope « main » : la modale newsletter (fermée) porte les mêmes libellés
		const zone = page.getByRole('main');
		await expect(zone.getByRole('heading', { name: 'Restons en lien' })).toBeVisible();

		await zone.getByRole('button', { name: "Je m'inscris" }).click();
		await expect(zone.getByText('Veuillez indiquer une adresse e-mail valide.')).toBeVisible();

		await zone.getByLabel('Adresse e-mail').fill('jeanne@example.com');
		await zone.getByRole('button', { name: "Je m'inscris" }).click();
		await expect(zone.getByRole('status')).toContainText('Inscription confirmée');
	});
});

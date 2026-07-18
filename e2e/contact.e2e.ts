import { expect, test } from '@playwright/test';

test('la page d’accueil affiche le titre principal', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test.describe('formulaire de contact', () => {
	test('affiche les erreurs de validation en français pour un envoi vide', async ({ page }) => {
		await page.goto('/contact');
		await page.getByRole('button', { name: 'Envoyer' }).click();

		await expect(
			page.getByText('Veuillez indiquer votre nom (2 caractères minimum).')
		).toBeVisible();
		await expect(page.getByText('Veuillez indiquer une adresse e-mail valide.')).toBeVisible();
		await expect(
			page.getByText('Votre message doit contenir au moins 10 caractères.')
		).toBeVisible();
	});

	test('affiche le message de succès après un envoi valide', async ({ page }) => {
		await page.goto('/contact');

		await page.getByLabel('Nom').fill('Olivier');
		await page.getByLabel('Adresse e-mail').fill('olivier@example.com');
		await page
			.getByLabel('Message')
			.fill('Bonjour, ceci est un message de test suffisamment long.');
		await page.getByRole('button', { name: 'Envoyer' }).click();

		await expect(page.getByRole('status')).toHaveText('Merci ! Votre message a bien été envoyé.');
	});
});

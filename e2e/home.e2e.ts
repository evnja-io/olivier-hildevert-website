import { expect, test } from '@playwright/test';

test.describe('page d’accueil Aurore', () => {
	test('affiche le hero et toutes les sections ancrées', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1 })).toContainText('Décoder le visible');
		for (const ancre of ['approche', 'apropos', 'prestations', 'boutique', 'tarifs', 'contact']) {
			await expect(page.locator(`#${ancre}`)).toBeAttached();
		}
		await expect(page.getByText('ne relèvent pas de la médecine', { exact: false })).toBeVisible();
	});

	test('la nav mène aux ancres depuis une autre route', async ({ page }) => {
		await page.goto('/contact');
		await page
			.getByRole('navigation', { name: 'Navigation principale' })
			.getByRole('link', { name: 'Prestations' })
			.click();

		await expect(page).toHaveURL(/\/#prestations$/);
		await expect(page.locator('#prestations')).toBeVisible();
	});
});

test.describe('réservation', () => {
	test('la modale envoie une demande complète', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Réserver une séance' }).click();

		const modale = page.getByRole('dialog', { name: 'Prendre rendez-vous' });
		await expect(modale).toBeVisible();

		await modale.getByRole('button', { name: 'Séance individuelle' }).click();
		await expect(modale.getByText('Accompagnement')).toBeVisible();

		await modale.getByLabel('Nom et prénom').fill('Jeanne Dupont');
		await modale.getByLabel('Adresse e-mail').fill('jeanne@example.com');
		await modale.getByLabel('Téléphone').fill('06 12 34 56 78');
		await modale.getByRole('button', { name: 'Envoyer ma demande' }).click();

		await expect(modale.getByRole('heading', { name: 'Demande transmise' })).toBeVisible();
	});

	test('la modale affiche les erreurs de validation en français', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Prendre rendez-vous' }).first().click();

		const modale = page.getByRole('dialog', { name: 'Prendre rendez-vous' });
		await modale.getByRole('button', { name: 'Programme personnalisé' }).click();
		await modale.getByRole('button', { name: 'Envoyer ma demande' }).click();

		await expect(
			modale.getByText('Veuillez indiquer votre nom (2 caractères minimum).')
		).toBeVisible();
		await expect(modale.getByText('Veuillez indiquer une adresse e-mail valide.')).toBeVisible();
	});

	test('la page /reservation fonctionne comme fallback avec pré-sélection', async ({ page }) => {
		await page.goto('/reservation?prestation=individuelle');

		await expect(page.getByRole('heading', { name: 'Prendre rendez-vous' })).toBeVisible();
		await expect(page.getByRole('radio', { name: /Séance individuelle/ })).toBeChecked();

		await page.getByLabel('Nom et prénom').fill('Jeanne Dupont');
		await page.getByLabel('Adresse e-mail').fill('jeanne@example.com');
		await page.getByLabel('Téléphone').fill('06 12 34 56 78');
		await page.getByRole('button', { name: 'Envoyer ma demande' }).click();

		await expect(page.getByRole('status')).toContainText('Demande transmise');
	});
});

test.describe('navigation mobile', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('le burger donne accès aux six liens de navigation', async ({ page }) => {
		await page.goto('/');

		const menu = page.locator('header details');
		const nav = page.getByRole('navigation', { name: 'Navigation mobile' });

		await expect(nav).toBeHidden();
		await menu.locator('summary').click();
		await expect(nav).toBeVisible();

		for (const label of [
			"L'approche",
			'À propos',
			'Prestations',
			'Tarifs',
			'Contact',
			'Boutique'
		]) {
			await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
		}

		await nav.getByRole('link', { name: 'Prestations', exact: true }).click();
		await expect(page).toHaveURL(/#prestations$/);
		await expect(page.locator('#prestations')).toBeInViewport();
	});

	test('l’en-tête ne déborde pas de la fenêtre', async ({ page }) => {
		await page.goto('/');
		const debordement = await page.evaluate(() => {
			const el = document.querySelector('header .wrap') as HTMLElement;
			return el.scrollWidth - el.clientWidth;
		});
		expect(debordement).toBe(0);
	});
});

test.describe('liens externes', () => {
	test('les boutons de la boutique mènent hors du site', async ({ page }) => {
		await page.goto('/');
		const boutique = page.locator('#boutique');

		for (const nom of ['Commander', 'Découvrir']) {
			const lien = boutique.getByRole('link', { name: nom, exact: true });
			await expect(lien).toHaveAttribute('href', /^https:\/\//);
			await expect(lien).toHaveAttribute('target', '_blank');
			await expect(lien).toHaveAttribute('rel', /noopener/);
		}
	});
});

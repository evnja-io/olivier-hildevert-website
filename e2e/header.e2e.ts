import { expect, test } from '@playwright/test';

/** Mesure, dans le navigateur, l'étendue horizontale réelle de chaque enfant de
 *  `header .wrap` — contenu débordant compris : un enfant en `white-space: nowrap`
 *  se dessine hors de la boîte de son parent sans élargir le rectangle de celui-ci.
 *  On compare ensuite l'étendue du logo à celle de chacun de ses voisins visibles. */
function mesureEnTete() {
	const etendue = (el: Element) => {
		const rects = [el, ...el.querySelectorAll('*')].map((n) => n.getBoundingClientRect());
		return {
			gauche: Math.min(...rects.map((r) => r.left)),
			droite: Math.max(...rects.map((r) => r.right))
		};
	};
	const wrap = document.querySelector('header .wrap') as HTMLElement;
	const enfants = [...wrap.children];
	const eLogo = etendue(enfants[0]);
	const voisinsVisibles = enfants
		.slice(1)
		.filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0);

	return {
		debordement: wrap.scrollWidth - wrap.clientWidth,
		chevauchements: voisinsVisibles.map((el) => {
			const e = etendue(el);
			return {
				nom: el.getAttribute('aria-label') ?? el.tagName.toLowerCase(),
				px: Math.round(Math.min(eLogo.droite, e.droite) - Math.max(eLogo.gauche, e.gauche))
			};
		})
	};
}

test.describe('en-tête — aucun chevauchement aux largeurs intermédiaires', () => {
	for (const largeur of [1024, 1112, 1200, 1280]) {
		test(`la rangée de l'en-tête tient à ${largeur} px`, async ({ page }) => {
			await page.setViewportSize({ width: largeur, height: 900 });
			await page.goto('/');

			const mesure = await page.evaluate(mesureEnTete);

			for (const c of mesure.chevauchements) {
				expect(
					c.px,
					`le logo chevauche « ${c.nom} » de ${c.px} px à ${largeur} px`
				).toBeLessThanOrEqual(0);
			}
			expect(mesure.debordement, `l'en-tête déborde de ${mesure.debordement} px`).toBe(0);
		});
	}
});

test.describe('menu mobile', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('le panneau se referme après un clic sur un lien', async ({ page }) => {
		await page.goto('/');

		const menu = page.locator('header details');
		const nav = page.getByRole('navigation', { name: 'Navigation mobile' });

		await menu.locator('summary').click();
		await expect(nav).toBeVisible();

		await nav.getByRole('link', { name: 'Prestations', exact: true }).click();
		await expect(nav).toBeHidden();
	});

	test('le panneau se referme aussi à l’ouverture de la modale de réservation', async ({
		page
	}) => {
		await page.goto('/');

		const menu = page.locator('header details');
		const nav = page.getByRole('navigation', { name: 'Navigation mobile' });

		await menu.locator('summary').click();
		await nav.getByRole('link', { name: 'Prendre rendez-vous' }).click();

		await expect(page.getByRole('dialog', { name: 'Prendre rendez-vous' })).toBeVisible();
		await expect(nav).toBeHidden();
	});

	test('l’intitulé du bouton suit l’état du panneau', async ({ page }) => {
		await page.goto('/');

		const summary = page.locator('header details summary');
		await expect(summary).toHaveAttribute('aria-label', 'Ouvrir le menu');

		await summary.click();
		await expect(summary).toHaveAttribute('aria-label', 'Fermer le menu');

		await summary.click();
		await expect(summary).toHaveAttribute('aria-label', 'Ouvrir le menu');
	});
});

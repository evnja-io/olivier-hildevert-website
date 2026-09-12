import { expect, test } from '@playwright/test';

/* iOS Safari zoome automatiquement sur un champ dont la taille de police est
   inférieure à 16 px. Les trois pages de repli — celles qui font vivre le
   parcours sans JavaScript — doivent donc rester au-dessus de ce plancher. */
test.describe('pages de repli — champs sans zoom iOS', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	for (const chemin of ['/contact', '/reservation', '/newsletter']) {
		test(`les champs de ${chemin} font au moins 16 px`, async ({ page }) => {
			await page.goto(chemin);

			const tailles = await page.evaluate(() =>
				[...document.querySelectorAll<HTMLElement>('form input, form textarea, form select')]
					.filter((el) => !['radio', 'checkbox', 'hidden'].includes((el as HTMLInputElement).type))
					.map((el) => ({
						champ: el.getAttribute('name') ?? el.tagName.toLowerCase(),
						px: parseFloat(getComputedStyle(el).fontSize)
					}))
			);

			expect(tailles.length).toBeGreaterThan(0);
			for (const t of tailles) {
				expect(t.px, `le champ « ${t.champ} » fait ${t.px} px`).toBeGreaterThanOrEqual(16);
			}
		});
	}
});

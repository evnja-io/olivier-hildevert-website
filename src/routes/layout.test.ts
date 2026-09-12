import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./layout.css', import.meta.url), 'utf8');

/** Lit la valeur hexadécimale d'un token `--color-…` déclaré dans layout.css. */
function token(nom: string): string {
	const trouve = css.match(new RegExp(`--color-${nom}:\\s*(#[0-9a-fA-F]{6})`));
	if (!trouve) throw new Error(`token --color-${nom} introuvable dans layout.css`);
	return trouve[1];
}

/** Luminance relative WCAG 2.1 d'une couleur `#rrggbb`. */
function luminance(hex: string): number {
	const canal = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
	const [r, g, b] = [1, 3, 5].map((i) => canal(parseInt(hex.slice(i, i + 2), 16) / 255));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste WCAG entre deux couleurs `#rrggbb`. */
function ratio(a: string, b: string): number {
	const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (clair + 0.05) / (sombre + 0.05);
}

describe('contraste des tokens de texte', () => {
	const AA = 4.5;

	it('--color-mute est lisible sur le fond crème', () => {
		expect(ratio(token('mute'), token('sky'))).toBeGreaterThanOrEqual(AA);
	});

	it('--color-coral-ink est lisible sur le fond crème', () => {
		expect(ratio(token('coral-ink'), token('sky'))).toBeGreaterThanOrEqual(AA);
	});

	it('le blanc est lisible sur --color-coral-deep (fond des boutons)', () => {
		expect(ratio('#ffffff', token('coral-deep'))).toBeGreaterThanOrEqual(AA);
	});

	it('les surtitres utilisent le corail assombri, pas le corail décoratif', () => {
		const eyebrow = css.match(/@utility eyebrow \{[\s\S]*?\n\}/)?.[0] ?? '';
		expect(eyebrow).toContain('color: var(--color-coral-ink)');
	});

	it('le corail décoratif reste disponible et inchangé', () => {
		expect(token('coral')).toBe('#f0653a');
	});
});

describe('échelle typographique', () => {
	it('déclare une échelle fluide de xs à 5xl', () => {
		for (const nom of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']) {
			expect(css).toMatch(new RegExp(`--text-${nom}:\\s*clamp\\(`));
		}
	});

	it('le plancher des plus petites étiquettes est à 12,5 px', () => {
		expect(css).toMatch(/--text-xs:\s*clamp\(12\.5px/);
	});

	it('le conteneur monte à 1440 px', () => {
		expect(css).toMatch(/--container-wrap:\s*1440px/);
	});
});

import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
	it('rend paragraphes, gras, listes et intertitres', () => {
		const html = renderMarkdown('## Déroulé\n\nUne séance **ciblée**.\n\n- écoute\n- décodage');
		expect(html).toContain('<h2>Déroulé</h2>');
		expect(html).toContain('<strong>ciblée</strong>');
		expect(html).toContain('<li>écoute</li>');
	});

	it('ne produit jamais de h1 : la page a déjà le sien', () => {
		const html = renderMarkdown('# Grand titre\n\n### Sous-titre');
		expect(html).not.toContain('<h1');
		expect(html).toContain('<h2>Grand titre</h2>');
		expect(html).toContain('<h3>Sous-titre</h3>');
	});

	it('affiche le HTML brut en texte au lieu de l’interpréter', () => {
		const html = renderMarkdown(
			'Avant <script>alert(1)</script> après\n\n<div onclick="x()">bloc</div>'
		);
		expect(html).not.toContain('<script');
		expect(html).not.toContain('<div');
		expect(html).toContain('&lt;script&gt;');
	});

	it('neutralise les liens javascript: et data:', () => {
		const html = renderMarkdown('[a](javascript:alert(1)) [b](data:text/html,x)');
		expect(html).not.toMatch(/href="(javascript|data):/i);
		expect(html).toContain('href="#"');
	});

	it('ouvre les liens externes dans un nouvel onglet, pas les liens internes', () => {
		const html = renderMarkdown('[site](https://example.com) [contact](/contact)');
		expect(html).toContain(
			'<a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a>'
		);
		expect(html).toContain('<a href="/contact">contact</a>');
	});

	it('garde les retours à la ligne simples saisis dans l’administration', () => {
		expect(renderMarkdown('ligne 1\nligne 2')).toContain('ligne 1<br>ligne 2');
	});

	it('rend un bloc indenté ou délimité comme un paragraphe, pas un <pre> qui déborde sur mobile', () => {
		const html = renderMarkdown(
			'Intro\n\n    texte collé depuis Word, indenté\n\n```\nbloc délimité\n```'
		);
		expect(html).not.toContain('<pre');
		expect(html).not.toContain('<code');
		expect(html).toContain('<p>texte collé depuis Word, indenté</p>');
		expect(html).toContain('<p>bloc délimité</p>');
	});

	it('n’insère aucune image distante : seul le texte alternatif reste', () => {
		const html = renderMarkdown(
			'![Coucher de soleil](https://images.example.com/x.jpg) ![b](javascript:alert(1))'
		);
		expect(html).not.toContain('<img');
		expect(html).not.toContain('images.example.com');
		expect(html).toContain('Coucher de soleil');
	});
});

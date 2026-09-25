/**
 * Rendu Markdown du texte long des prestations (saisi par le client dans
 * Strapi, champ « Rich text »). Exécuté côté serveur uniquement.
 *
 * Le texte vient de l'administration, pas d'un visiteur, mais on ne lui fait
 * pas confiance pour autant : le HTML brut est affiché en texte, les liens
 * `javascript:`/`data:` sont neutralisés, et les intertitres commencent à h2
 * (la page porte déjà le h1 du titre de la prestation).
 */
import { Marked, type Tokens } from 'marked';

const echapper = (texte: string) =>
	texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SCHEMA_SUR = /^(https?:|mailto:|tel:|\/|#)/i;

const marked = new Marked({
	gfm: true,
	breaks: true,
	renderer: {
		html({ text }: Tokens.HTML | Tokens.Tag) {
			return echapper(text);
		},
		heading({ tokens, depth }: Tokens.Heading) {
			const niveau = Math.min(Math.max(depth, 2), 4);
			return `<h${niveau}>${this.parser.parseInline(tokens)}</h${niveau}>\n`;
		},
		link({ href, title, tokens }: Tokens.Link) {
			const cible = SCHEMA_SUR.test(href) ? href : '#';
			const externe = /^https?:/i.test(cible);
			const titre = title ? ` title="${echapper(title)}"` : '';
			const onglet = externe ? ' target="_blank" rel="noopener noreferrer"' : '';
			return `<a href="${echapper(cible)}"${titre}${onglet}>${this.parser.parseInline(tokens)}</a>`;
		}
	}
});

export function renderMarkdown(source: string): string {
	return marked.parse(source, { async: false });
}

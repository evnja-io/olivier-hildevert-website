# Pages « En savoir plus » des prestations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une page `/prestations/<cle>` par prestation (texte long en Markdown administrable dans Strapi, infos pratiques optionnelles) et un bouton « En savoir plus » sur chaque carte de l'accueil.

**Architecture:** Deux champs ajoutés à la collection Strapi `prestation` existante, lus par la couche contenu du site avec une validation tolérante (texte absent → texte provisoire des défauts). Une route dynamique unique à param matcher lit les prestations déjà chargées par le layout et rend le Markdown côté serveur. Côté CMS, migration du schéma puis remplissage par un script gardé, déployés APRÈS le site.

**Tech Stack:** SvelteKit 2 / Svelte 5 runes, TypeScript, Tailwind v4 (CSS-first), zod v4, `marked` (nouvelle dépendance), Vitest (projets `server` Node et `client` Chromium), Playwright ; Strapi v5 (dépôt `../olivier-hildevert-cms`, npm).

**Spec:** `docs/superpowers/specs/2026-09-25-pages-prestations-design.md`

## Global Constraints

- Tout texte visible est en français.
- Palette « Aurore » exclusive : uniquement les tokens (`sky`, `ink`, `ink-soft`, `mute`, `line`, `coral`, `coral-ink`, `ember`, `surface`, …) — `gray-*`, `red-*`, etc. ne compilent pas.
- Liens internes via `resolve()` de `$app/paths` (règle eslint `svelte/no-navigation-without-resolve`).
- `src/lib/content/**` : imports relatifs uniquement (exécuté par tsx pour le seed).
- `pnpm build` DOIT réussir sans `.env`.
- Chaque déclencheur de la modale est un vrai lien vers `/reservation?prestation=<cle>` + `onclick` `preventDefault` + `openBooking(cle)`.
- Dépôt CMS : **npm uniquement** (`npm`, `npx --no-install`) — jamais `pnpm` (déclenche un `pnpm install` destructeur).
- Texte provisoire exact : `Présentation détaillée à venir.`
- URL des pages : `/prestations/individuelle`, `/prestations/programme`, `/prestations/entreprise`, `/prestations/stage`.
- Titre de page : `<titre> — Olivier Hildevert` ; canonical `${site.url}/prestations/<cle>`.
- Aucun push, déploiement ni écriture en production sans accord explicite de l'utilisateur ; les écritures Strapi (`--appliquer`) sont lancées par l'utilisateur.
- Commandes de contrôle du site : `pnpm test:unit -- --run`, `pnpm check`, `pnpm lint` (corriger avec `pnpm format`), `pnpm exec playwright test`.

## Review Focus

- Le client tape `# Mon titre` dans le Markdown → la page aurait deux `h1` ; attendu : les intertitres commencent à `h2` (test ajouté en Task 2).
- Le client colle un lien `javascript:` ou du HTML brut dans Strapi → attendu : lien neutralisé, HTML affiché en texte (tests en Task 2).
- `infosPratiques` rempli d'espaces seulement → attendu : aucune ligne vide affichée (test en Task 1).
- `descLongue` vidé (`""`) dans l'administration → attendu : texte provisoire, domaine Prestations NON déclassé (test en Task 1).
- Un mot long ou une URL collée dans le texte long sur mobile 390 px → attendu : pas de défilement horizontal (test e2e en Task 4).

---

## File Structure

**Site (`olivier-hildevert-website`)**

| Fichier                                                          | Responsabilité                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/lib/content/types.ts` (modif.)                              | `PrestationContent` : + `descLongue`, + `infosPratiques?`, − `prixCarte` |
| `src/lib/content/defaults.ts` (modif.)                           | texte provisoire, retrait `prixCarte`                                    |
| `src/lib/server/content.ts` (modif.)                             | validation tolérante de `descLongue` / `infosPratiques`                  |
| `src/lib/server/markdown.ts` (créé)                              | `renderMarkdown(source): string` sûr                                     |
| `src/lib/booking/images.ts` (créé)                               | table photo/alt par clé, partagée cartes + page                          |
| `src/params/prestation.ts` (créé)                                | matcher de la route                                                      |
| `src/routes/prestations/[cle=prestation]/+page.server.ts` (créé) | load : prestation, HTML, autres prestations ; ISR                        |
| `src/routes/prestations/[cle=prestation]/+page.svelte` (créé)    | la page                                                                  |
| `src/lib/components/home/Prestations.svelte` (modif.)            | liens photo/titre + bouton « En savoir plus »                            |
| `src/routes/layout.css` (modif.)                                 | bloc `.texte-riche`                                                      |
| `src/routes/sitemap.xml/+server.ts` (modif.)                     | 4 URL ajoutées                                                           |
| `e2e/prestations.e2e.ts` (créé)                                  | parcours des pages                                                       |

**CMS (`olivier-hildevert-cms`)**

| Fichier                                                   | Responsabilité                                    |
| --------------------------------------------------------- | ------------------------------------------------- |
| `src/api/prestation/content-types/prestation/schema.json` | + `descLongue`, + `infosPratiques`, − `prixCarte` |
| `src/components/sections/contact-cta.json`                | − `modes`                                         |
| `scripts/verifier-conformite.mjs`                         | contrat mis à jour                                |
| `scripts/seed-data.json`                                  | régénéré depuis le site                           |
| `config/middlewares.ts`                                   | origine CORS morte retirée                        |
| `scripts/remplir-desc-longue-2026-09-25.mjs` (créé)       | remplissage gardé de `descLongue`                 |

---

### Task 1: Modèle de contenu — `descLongue`, `infosPratiques`, retrait de `prixCarte`

**Files:**

- Modify: `src/lib/content/types.ts` (interface `PrestationContent`, ~l. 140-152)
- Modify: `src/lib/content/defaults.ts` (`defaultPrestations` et son commentaire, ~l. 221-270)
- Modify: `src/lib/server/content.ts` (`prestationSchema`, ~l. 151-159 ; `getPrestations`, ~l. 205-229)
- Test: `src/lib/content/defaults.test.ts`, `src/lib/server/content.test.ts`

**Interfaces:**

- Produces: `PrestationContent` = `{ cle: PrestationId; titre: string; metaReservation: string; descReservation: string; descCarte: string; descLongue: string; infosPratiques?: string; actionCarte: string }`. `getPrestations()` renvoie toujours 4 entrées dont `descLongue` est une chaîne non vide.

- [ ] **Step 1: Écrire les tests qui échouent — défauts**

Dans `src/lib/content/defaults.test.ts`, remplacer le test `'conserve la durée de séance là où elle a un sens'` par :

```ts
it('conserve la durée de séance là où elle a un sens', () => {
	expect(defaultAccueil.tarifs.cartes[1].sousTexte).toContain('1 h 30');
});
```

et ajouter à la fin du `describe('corrections éditoriales validées le 2026-09-25', …)` :

```ts
it('donne à chaque prestation un texte long provisoire, sans prix de carte', () => {
	for (const p of defaultPrestations) {
		expect(p.descLongue).toBe('Présentation détaillée à venir.');
		expect(p).not.toHaveProperty('prixCarte');
		expect(p).not.toHaveProperty('infosPratiques');
	}
});
```

- [ ] **Step 2: Écrire les tests qui échouent — validation Strapi**

Dans `src/lib/server/content.test.ts`, ajouter dans `describe('getPrestations', …)` :

```ts
it('sert le texte long par défaut quand Strapi ne le fournit pas, sans déclasser le domaine', async () => {
	const fetcher = reponse({
		data: [
			{ ...defaultPrestations[0], titre: 'Séance revue', descLongue: null },
			{ ...defaultPrestations[1], titre: 'Programmes revus', descLongue: '' },
			{ ...defaultPrestations[2], titre: 'Entreprises revues', descLongue: undefined },
			{ ...defaultPrestations[3], descLongue: '## Déroulé\n\nTexte **client**.' }
		],
		meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
	});
	const prestations = await getPrestations(fetcher);
	expect(prestations.map((p) => p.titre)).toEqual([
		'Séance revue',
		'Programmes revus',
		'Entreprises revues',
		defaultPrestations[3].titre
	]);
	expect(prestations.slice(0, 3).map((p) => p.descLongue)).toEqual([
		'Présentation détaillée à venir.',
		'Présentation détaillée à venir.',
		'Présentation détaillée à venir.'
	]);
	expect(prestations[3].descLongue).toBe('## Déroulé\n\nTexte **client**.');
});

it('ignore des infos pratiques vides ou faites d’espaces, garde les autres', async () => {
	const fetcher = reponse({
		data: [
			{ ...defaultPrestations[0], infosPratiques: '140 € · 1 h 30 · par téléphone' },
			{ ...defaultPrestations[1], infosPratiques: '   ' },
			{ ...defaultPrestations[2], infosPratiques: null },
			{ ...defaultPrestations[3], prixCarte: 'Sur devis · groupe' }
		],
		meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
	});
	const prestations = await getPrestations(fetcher);
	expect(prestations[0].infosPratiques).toBe('140 € · 1 h 30 · par téléphone');
	expect(prestations[1].infosPratiques).toBeUndefined();
	expect(prestations[2].infosPratiques).toBeUndefined();
	// l'ancien champ prixCarte, encore présent en production, ne gêne pas et n'est pas repris
	expect(prestations[3]).not.toHaveProperty('prixCarte');
	expect(prestations[3].titre).toBe(defaultPrestations[3].titre);
});
```

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

Run: `pnpm test:unit -- --run src/lib/content/defaults.test.ts src/lib/server/content.test.ts`
Expected: FAIL — `descLongue` undefined, `prixCarte` présent.

- [ ] **Step 4: Mettre à jour le type**

Dans `src/lib/content/types.ts`, remplacer l'interface `PrestationContent` par :

```ts
/**
 * Une prestation = UNE entrée avec des rédactions distinctes par contexte
 * (modale/réservation, carte home, page « En savoir plus »).
 */
export interface PrestationContent {
	cle: PrestationId;
	titre: string;
	metaReservation: string;
	descReservation: string;
	descCarte: string;
	/** Texte long de la page /prestations/<cle>, en Markdown. */
	descLongue: string;
	/** Ligne d'infos pratiques de la page (prix, durée, format) — absente, rien ne s'affiche. */
	infosPratiques?: string;
	actionCarte: string;
}
```

- [ ] **Step 5: Mettre à jour les défauts**

Dans `src/lib/content/defaults.ts` :

- remplacer le commentaire au-dessus de `defaultPrestations` par :

```ts
/**
 * Rédactions unifiées. En ajouter/retirer une = modification de code (clés
 * statiques dans booking/prestations.ts). `descLongue` est un texte provisoire
 * que le client remplace dans Strapi (retours du 2026-09-25).
 */
```

- déclarer, juste au-dessus de `defaultPrestations` :

```ts
const TEXTE_LONG_PROVISOIRE = 'Présentation détaillée à venir.';
```

- dans chacune des 4 entrées, **supprimer** la ligne `prixCarte: …,` et ajouter `descLongue: TEXTE_LONG_PROVISOIRE,` juste après `descCarte`.

- [ ] **Step 6: Mettre à jour la validation**

Dans `src/lib/server/content.ts`, remplacer `prestationSchema` par :

```ts
// `descLongue` : tolérant pour de bon — absent, null ou vide, la page sert le
// texte par défaut de la clé plutôt que de déclasser tout le domaine (un champ
// vidé par erreur dans l'administration ne doit rien faire tomber). La valeur
// `undefined` est résolue dans getPrestations, qui connaît la clé.
const prestationSchema = z.object({
	cle: z.enum(PRESTATION_IDS),
	titre: z.string(),
	metaReservation: z.string(),
	descReservation: z.string(),
	descCarte: z.string(),
	descLongue: z
		.string()
		.nullish()
		.transform((v) => (v?.trim() ? v : undefined)),
	infosPratiques: z
		.string()
		.nullish()
		.transform((v) => v?.trim() || undefined),
	actionCarte: z.string()
});
```

et, dans `getPrestations`, remplacer le corps de la boucle et le `return` :

```ts
const valides = new Map<string, PrestationContent>();
for (const item of items) {
	const res = prestationSchema.safeParse(item);
	if (!res.success) {
		console.warn('Prestation Strapi ignorée (invalide ou clé inconnue).', res.error.issues);
		continue;
	}
	if (valides.has(res.data.cle)) continue;
	const parDefaut = defaultPrestations.find((p) => p.cle === res.data.cle)!;
	const { infosPratiques, ...reste } = res.data;
	valides.set(res.data.cle, {
		...reste,
		descLongue: res.data.descLongue ?? parDefaut.descLongue,
		...(infosPratiques ? { infosPratiques } : {})
	});
}
```

(le `return PRESTATION_IDS.map(…)` existant est conservé tel quel).

- [ ] **Step 7: Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm test:unit -- --run src/lib/content/defaults.test.ts src/lib/server/content.test.ts`
Expected: PASS — y compris le round-trip existant `'mappe les 4 prestations (round-trip avec le format de seed)'` (`prestationsVersStrapi` n'a pas besoin de changer : il recopie les champs).

- [ ] **Step 8: Contrôles globaux**

Run: `pnpm check && pnpm test:unit -- --run`
Expected: 0 erreur ; tous les tests passent (aucun autre fichier ne lit `prixCarte` : `grep -rn prixCarte src` ne renvoie rien).

- [ ] **Step 9: Commit**

```bash
git add src/lib/content/types.ts src/lib/content/defaults.ts src/lib/content/defaults.test.ts src/lib/server/content.ts src/lib/server/content.test.ts
git commit -m "feat(contenu): texte long et infos pratiques des prestations, retrait de prixCarte"
```

---

### Task 2: Rendu Markdown sûr

**Files:**

- Create: `src/lib/server/markdown.ts`
- Test: `src/lib/server/markdown.test.ts`
- Modify: `package.json` / `pnpm-lock.yaml` (dépendance `marked`)

**Interfaces:**

- Produces: `renderMarkdown(source: string): string` — HTML prêt pour `{@html}` ; intertitres `h2`→`h4` minimum `h2` ; HTML brut échappé ; liens `javascript:`/`data:` neutralisés en `#` ; liens `http(s)` externes en `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 1: Ajouter la dépendance**

Run: `pnpm add marked`
Expected: `marked` apparaît dans `dependencies` de `package.json`.

- [ ] **Step 2: Écrire les tests qui échouent**

Créer `src/lib/server/markdown.test.ts` :

```ts
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
});
```

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

Run: `pnpm test:unit -- --run src/lib/server/markdown.test.ts`
Expected: FAIL — module `./markdown` introuvable.

- [ ] **Step 4: Écrire l'implémentation**

Créer `src/lib/server/markdown.ts` :

```ts
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
```

- [ ] **Step 5: Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm test:unit -- --run src/lib/server/markdown.test.ts`
Expected: PASS (6 tests). Si le test « HTML brut » échoue sur le bloc `<div …>`, vérifier que la version installée de `marked` passe bien les jetons `html` de bloc ET en ligne par `renderer.html` (c'est le cas depuis marked 13) ; ne pas contourner avec une regex.

- [ ] **Step 6: Contrôles et commit**

Run: `pnpm check && pnpm lint`
Expected: 0 erreur (sinon `pnpm format` puis relancer).

```bash
git add package.json pnpm-lock.yaml src/lib/server/markdown.ts src/lib/server/markdown.test.ts
git commit -m "feat(contenu): rendu Markdown sûr pour le texte long des prestations"
```

---

### Task 3: Images partagées et bouton « En savoir plus » sur les cartes

**Files:**

- Create: `src/lib/booking/images.ts`
- Modify: `src/lib/components/home/Prestations.svelte`
- Create: `src/params/prestation.ts`
- Test: `src/lib/components/home/Prestations.svelte.test.ts`, `src/params/prestation.test.ts`

**Interfaces:**

- Produces: `match(param: string): param is PrestationId` exporté par `src/params/prestation.ts`.
- Produces: `IMAGES_PRESTATIONS: Record<PrestationId, { image: EnhancedSrc; alt: string }>` exporté par `$lib/booking/images`, et `type EnhancedSrc`.
- Consumes (Task 4) : la route `/prestations/[cle]` — les liens de cette tâche pointent vers `resolve('/prestations/[cle]', { cle })`. Tant que la Task 4 n'existe pas, `pnpm check` peut signaler la route inconnue : **faire les Tasks 3 et 4 dans l'ordre et ne lancer `pnpm check` qu'en fin de Task 3 après avoir créé le matcher et un `+page.svelte` minimal** (Step 3 ci-dessous).

- [ ] **Step 1: Écrire les tests qui échouent**

Dans `src/lib/components/home/Prestations.svelte.test.ts`, remplacer le test `'porte l’action sur un bouton dédié, pas sur toute la carte'` par :

```ts
it('porte l’action sur un bouton dédié, pas sur toute la carte', async () => {
	const screen = render(Prestations);
	const actions = [
		['Réserver', 'individuelle'],
		['Découvrir', 'programme'],
		['Contacter', 'entreprise'],
		['Participer', 'stage']
	];
	for (const [label, cle] of actions) {
		await expect
			.element(screen.getByRole('link', { name: label, exact: true }))
			.toHaveAttribute('href', expect.stringContaining(`?prestation=${cle}`));
	}
	// pas de lien englobant : la carte reste un article, aucun lien ne la contient
	expect(screen.container.querySelectorAll('article')).toHaveLength(4);
	expect(screen.container.querySelector('a:has(article)')).toBeNull();
});

it('mène à la page de chaque prestation par « En savoir plus », le titre et la photo', async () => {
	const screen = render(Prestations);
	const pages = [
		['Séance individuelle', 'individuelle'],
		["Programmes d'éveil", 'programme'],
		['Entreprises', 'entreprise'],
		['Stages & ateliers', 'stage']
	];
	for (const [titre, cle] of pages) {
		const href = `/prestations/${cle}`;
		await expect
			.element(screen.getByRole('link', { name: `En savoir plus : ${titre}` }))
			.toHaveAttribute('href', href);
		await expect
			.element(screen.getByRole('link', { name: titre, exact: true }))
			.toHaveAttribute('href', href);
		// la photo mène au même endroit, sans doubler le lien pour le clavier
		const photo = screen.container.querySelector(`a[href="${href}"][aria-hidden="true"]`);
		expect(photo?.getAttribute('tabindex')).toBe('-1');
	}
});
```

Créer `src/params/prestation.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { match } from './prestation';

describe('matcher de la route /prestations/[cle]', () => {
	it('accepte les 4 clés de prestation', () => {
		for (const cle of ['individuelle', 'programme', 'entreprise', 'stage']) {
			expect(match(cle)).toBe(true);
		}
	});

	it('refuse toute autre valeur, casse comprise', () => {
		for (const valeur of ['inconnue', 'Stage', '', 'stage/', 'constructor']) {
			expect(match(valeur)).toBe(false);
		}
	});
});
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `pnpm test:unit -- --run src/lib/components/home/Prestations.svelte.test.ts src/params/prestation.test.ts`
Expected: FAIL — lien « En savoir plus : … » introuvable ; module `./prestation` introuvable.

- [ ] **Step 3: Créer le matcher et une page minimale (pour que `resolve` connaisse la route)**

Créer `src/params/prestation.ts` :

```ts
import type { ParamMatcher } from '@sveltejs/kit';
import { PRESTATION_IDS, type PrestationId } from '$lib/booking/prestations';

export const match = ((param: string): param is PrestationId =>
	(PRESTATION_IDS as readonly string[]).includes(param)) satisfies ParamMatcher;
```

Créer `src/routes/prestations/[cle=prestation]/+page.svelte` (remplacé en Task 4) :

```svelte
<h1>Prestation</h1>
```

- [ ] **Step 4: Extraire la table d'images**

Créer `src/lib/booking/images.ts` :

```ts
/**
 * Photos des prestations, appariées par clé stable — partagées par les cartes
 * de l'accueil et les pages /prestations/<cle>. Changer une image reste une
 * modification de code (les images sont optimisées au build par enhanced-img).
 */
import type { PrestationId } from './prestations';

import cardIndividuelle from '$lib/assets/card-individuelle.jpg?enhanced';
import cardProgramme from '$lib/assets/card-programme.jpg?enhanced';
import cardEntreprise from '$lib/assets/card-entreprise.jpg?enhanced';
import cardStages from '$lib/assets/card-stages.jpg?enhanced';

export type EnhancedSrc = typeof cardIndividuelle;

export const IMAGES_PRESTATIONS: Record<PrestationId, { image: EnhancedSrc; alt: string }> = {
	individuelle: {
		image: cardIndividuelle,
		alt: "Personne assise en méditation au bord d'une falaise, face à la mer au soleil levant"
	},
	programme: {
		image: cardProgramme,
		alt: 'Sentier de crête serpentant vers le soleil levant au-dessus des montagnes'
	},
	entreprise: {
		image: cardEntreprise,
		alt: 'Petit groupe de professionnels en échange sur une passerelle en forêt, lumière dorée'
	},
	stage: {
		image: cardStages,
		alt: "Cercle de participants réunis autour d'un feu de camp et de lanternes au crépuscule"
	}
};
```

- [ ] **Step 5: Mettre à jour la carte**

Dans `src/lib/components/home/Prestations.svelte` :

Remplacer tout le bloc `<script>` par :

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import { IMAGES_PRESTATIONS } from '$lib/booking/images';
	import type { IntroSection, PrestationContent } from '$lib/content/types';
	import { defaultAccueil, defaultPrestations } from '$lib/content/defaults';

	let {
		intro = defaultAccueil.prestationsIntro,
		prestations = defaultPrestations
	}: { intro?: IntroSection; prestations?: PrestationContent[] } = $props();

	const reservation = resolve('/reservation');

	const cartes = $derived(
		prestations.map((p) => ({
			...p,
			...IMAGES_PRESTATIONS[p.cle],
			page: resolve('/prestations/[cle=prestation]', { cle: p.cle })
		}))
	);
</script>
```

Remplacer le commentaire `<!-- La carte n'est plus un lien englobant … -->` par :

```svelte
<!-- Pas de lien englobant : la photo et le titre mènent à la page de la
				     prestation, le bouton d'action ouvre la modale (retours client du
				     2026-09-25). -->
```

Remplacer `<div class="relative aspect-square overflow-hidden">` … `</div>` (bloc photo) par :

```svelte
<a
	href={carte.page}
	tabindex="-1"
	aria-hidden="true"
	class="relative block aspect-square overflow-hidden"
>
	<enhanced:img
		src={carte.image}
		alt={carte.alt}
		loading="lazy"
		sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, calc(100vw - 2.75rem)"
		class="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-106"
	/>
</a>
```

Remplacer la ligne du titre par :

```svelte
<h3 class="text-2xl tracking-[0.01em] xl:text-xl">
	<a href={carte.page} class="transition-colors hover:text-coral-ink">{carte.titre}</a>
</h3>
```

Remplacer le pied de carte (`<div class="flex flex-wrap items-center gap-3 border-t border-line pt-4">` … `</div>`) par :

```svelte
<!-- Côte à côte à 2 colonnes ; empilés pleine largeur à 4 colonnes,
						     où la carte n'offre que ~250 px utiles. -->
<div
	class="flex flex-wrap items-center gap-3 border-t border-line pt-4 xl:flex-col xl:items-stretch"
>
	<a
		class="btn btn-sun justify-center"
		href="{reservation}?prestation={carte.cle}"
		onclick={(e) => {
			e.preventDefault();
			openBooking(carte.cle);
		}}
	>
		{carte.actionCarte}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</a>
	<a class="btn btn-line justify-center" href={carte.page}>
		En savoir plus<span class="sr-only"> : {carte.titre}</span>
	</a>
</div>
```

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm test:unit -- --run src/lib/components/home/Prestations.svelte.test.ts src/params/prestation.test.ts`
Expected: PASS (5 + 2 tests). Le test `'n’affiche plus ni numéro ni prix sur les cartes'` reste vert.

- [ ] **Step 7: Contrôles et commit**

Run: `pnpm check && pnpm lint && pnpm test:unit -- --run`
Expected: 0 erreur, tous les tests passent.

```bash
git add src/lib/booking/images.ts src/params/prestation.ts src/params/prestation.test.ts "src/routes/prestations/[cle=prestation]/+page.svelte" src/lib/components/home/Prestations.svelte src/lib/components/home/Prestations.svelte.test.ts
git commit -m "feat(prestations): bouton « En savoir plus » et liens photo/titre vers la page de chaque prestation"
```

---

### Task 4: Page `/prestations/<cle>`, styles du texte riche, sitemap

**Files:**

- Create: `src/routes/prestations/[cle=prestation]/+page.server.ts`
- Modify: `src/routes/prestations/[cle=prestation]/+page.svelte` (remplace la page minimale de la Task 3)
- Modify: `src/routes/layout.css` (bloc `.texte-riche` dans un `@layer components`)
- Modify: `src/routes/sitemap.xml/+server.ts`
- Test: `e2e/prestations.e2e.ts`

**Interfaces:**

- Consumes: `renderMarkdown` (Task 2), `IMAGES_PRESTATIONS` (Task 3), `PrestationContent` (Task 1), `data.prestations` du layout (`src/routes/+layout.server.ts`), `openBooking` de `$lib/booking/booking.svelte`.
- Produces: `load` → `{ prestation: PrestationContent; descLongueHtml: string; autres: PrestationContent[] }`.

- [ ] **Step 1: Écrire les tests e2e qui échouent**

Créer `e2e/prestations.e2e.ts` :

```ts
import { expect, test } from '@playwright/test';

const PAGES = [
	['individuelle', 'Séance individuelle', 'Réserver'],
	['programme', "Programmes d'éveil", 'Découvrir'],
	['entreprise', 'Entreprises', 'Contacter'],
	['stage', 'Stages & ateliers', 'Participer']
] as const;

test.describe('pages des prestations', () => {
	test('« En savoir plus » de chaque carte mène à la bonne page', async ({ page }) => {
		for (const [cle, titre] of PAGES) {
			await page.goto('/');
			await page
				.locator('#prestations')
				.getByRole('link', { name: `En savoir plus : ${titre}` })
				.click();
			await expect(page).toHaveURL(new RegExp(`/prestations/${cle}$`));
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
			await expect(page.locator('.texte-riche')).toContainText('Présentation détaillée à venir.');
			await expect(page).toHaveTitle(`${titre} — Olivier Hildevert`);
		}
	});

	test('une prestation inconnue renvoie une 404', async ({ page }) => {
		const reponse = await page.goto('/prestations/inconnue');
		expect(reponse?.status()).toBe(404);
	});

	test('le bouton d’action ouvre la modale sur la prestation de la page', async ({ page }) => {
		await page.goto('/prestations/stage');
		await page.getByRole('link', { name: 'Participer', exact: true }).first().click();
		const modale = page.getByRole('dialog', { name: 'Prendre rendez-vous' });
		await expect(modale.getByText('Vos coordonnées')).toBeVisible();
		await expect(modale.getByText('En présentiel', { exact: true })).toBeVisible();
	});

	test('les autres accompagnements sont proposés, pas celui de la page', async ({ page }) => {
		await page.goto('/prestations/programme');
		const autres = page.getByRole('region', { name: 'Voir les autres accompagnements' });
		await expect(autres.getByRole('link')).toHaveCount(3);
		await expect(autres.getByRole('link', { name: "Programmes d'éveil" })).toHaveCount(0);
	});

	test('la page tient sur mobile, même avec le texte le plus long', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		for (const [cle] of PAGES) {
			await page.goto(`/prestations/${cle}`);
			const debordement = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(debordement, `/prestations/${cle}`).toBe(0);
		}
	});

	test('le sitemap liste les 4 pages', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		for (const [cle] of PAGES) expect(xml).toContain(`/prestations/${cle}</loc>`);
	});
});

test.describe('pages des prestations sans JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('le bouton d’action retombe sur la page de réservation', async ({ page }) => {
		for (const [cle, , action] of PAGES) {
			await page.goto(`/prestations/${cle}`);
			await expect(page.getByRole('link', { name: action, exact: true }).first()).toHaveAttribute(
				'href',
				`/reservation?prestation=${cle}`
			);
		}
	});
});
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `pnpm exec playwright test e2e/prestations.e2e.ts`
Expected: FAIL — `h1` vaut « Prestation », pas de `.texte-riche`, sitemap sans les pages.

- [ ] **Step 3: Écrire le load**

Créer `src/routes/prestations/[cle=prestation]/+page.server.ts` :

```ts
import type { Config } from '@sveltejs/adapter-vercel';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { renderMarkdown } from '$lib/server/markdown';

// ISR comme l'accueil : régénérée au plus toutes les 5 minutes sur Vercel.
export const config: Config = { isr: { expiration: 300 } };

// Les prestations sont déjà chargées par +layout.server.ts : aucun appel
// Strapi supplémentaire ici.
export const load: PageServerLoad = async ({ params, parent }) => {
	const { prestations } = await parent();
	const prestation = prestations.find((p) => p.cle === params.cle);
	if (!prestation) error(404, 'Prestation introuvable');
	return {
		prestation,
		descLongueHtml: renderMarkdown(prestation.descLongue),
		autres: prestations.filter((p) => p.cle !== prestation.cle)
	};
};
```

- [ ] **Step 4: Écrire la page**

Remplacer `src/routes/prestations/[cle=prestation]/+page.svelte` par :

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { IMAGES_PRESTATIONS } from '$lib/booking/images';

	let { data } = $props();

	const prestation = $derived(data.prestation);
	const photo = $derived(IMAGES_PRESTATIONS[prestation.cle]);
	const reservation = resolve('/reservation');
</script>

<svelte:head>
	<title>{prestation.titre} — {site.name}</title>
	<meta name="description" content={prestation.descCarte} />
	<link rel="canonical" href="{site.url}/prestations/{prestation.cle}" />
</svelte:head>

<article class="wrap pt-36 pb-[clamp(64px,8vw,112px)]">
	<div class="max-w-[760px]">
		<a class="eyebrow" href="{resolve('/')}#prestations">Prestations</a>
		<h1 class="mt-5 mb-5 text-4xl tracking-[0.005em] sm:text-5xl">{prestation.titre}</h1>
		<p class="text-lg leading-[1.62] text-ink-soft">{prestation.descCarte}</p>
		{#if prestation.infosPratiques}
			<p class="mt-5 font-mono text-xs leading-[1.6] tracking-[0.16em] text-coral-ink uppercase">
				{prestation.infosPratiques}
			</p>
		{/if}
	</div>

	<div class="my-[clamp(36px,5vw,64px)] aspect-[16/9] overflow-hidden rounded-card">
		<enhanced:img
			src={photo.image}
			alt={photo.alt}
			fetchpriority="high"
			loading="eager"
			sizes="(min-width: 1280px) 1200px, 100vw"
			class="h-full w-full object-cover"
		/>
	</div>

	<div class="max-w-[760px]">
		<!-- HTML produit par renderMarkdown (src/lib/server/markdown.ts) : HTML brut
		     échappé, liens dangereux neutralisés. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="texte-riche">{@html data.descLongueHtml}</div>

		<a
			class="mt-10 btn btn-sun"
			href="{reservation}?prestation={prestation.cle}"
			onclick={(e) => {
				e.preventDefault();
				openBooking(prestation.cle);
			}}
		>
			{prestation.actionCarte}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</a>
	</div>
</article>

<section aria-labelledby="autres-titre" class="bg-sky-2 py-[clamp(64px,8vw,112px)]">
	<div class="wrap">
		<h2 id="autres-titre" class="mb-10 text-3xl">Voir les autres accompagnements</h2>
		<div class="grid gap-5.5 sm:grid-cols-3">
			{#each data.autres as autre (autre.cle)}
				<a
					href={resolve('/prestations/[cle=prestation]', { cle: autre.cle })}
					class="group overflow-hidden rounded-card border border-line bg-white transition-all duration-400 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--color-coral)_45%,transparent)]"
				>
					<div class="aspect-[4/3] overflow-hidden">
						<enhanced:img
							src={IMAGES_PRESTATIONS[autre.cle].image}
							alt=""
							loading="lazy"
							sizes="(min-width: 640px) 33vw, 100vw"
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-106"
						/>
					</div>
					<span class="block p-5 font-display text-xl">{autre.titre}</span>
				</a>
			{/each}
		</div>
	</div>
</section>
```

Note : la section a un nom accessible (`aria-labelledby`) ce qui lui donne le rôle `region` utilisé par l'e2e. L'image des autres cartes a un `alt` vide : le lien est déjà nommé par le titre.

- [ ] **Step 5: Styles du texte riche**

Dans `src/routes/layout.css`, ajouter à la fin du fichier :

```css
/* ---------- Texte riche (Markdown des pages prestations) ----------
   Le plugin @tailwindcss/typography est déclaré mais inutilisé : ses couleurs
   par défaut reposent sur la palette Tailwind, désactivée ici. */
@layer components {
	.texte-riche {
		color: var(--color-ink-soft);
		font-size: var(--text-base);
		line-height: 1.72;
		overflow-wrap: anywhere;
		& > * + * {
			margin-top: 1.1em;
		}
		& h2,
		& h3,
		& h4 {
			font-family: var(--font-display);
			color: var(--color-ink);
			line-height: 1.25;
			margin-top: 1.8em;
		}
		& h2 {
			font-size: var(--text-2xl);
		}
		& h3 {
			font-size: var(--text-xl);
		}
		& h4 {
			font-size: var(--text-lg);
		}
		& strong {
			color: var(--color-ink);
			font-weight: 700;
		}
		& ul,
		& ol {
			padding-left: 1.3em;
		}
		& ul {
			list-style: disc;
		}
		& ol {
			list-style: decimal;
		}
		& li + li {
			margin-top: 0.4em;
		}
		& li::marker {
			color: var(--color-coral);
		}
		& a {
			color: var(--color-coral-ink);
			text-decoration: underline;
			text-underline-offset: 3px;
		}
		& blockquote {
			border-left: 2px solid var(--color-coral);
			padding-left: 1em;
			font-style: italic;
		}
	}
}
```

Vérifier que les variables utilisées existent : `grep -n "\-\-text-2xl\|\-\-text-xl\|\-\-text-lg\|\-\-text-base\|\-\-font-display" src/routes/layout.css`. Si l'une manque dans `@theme`, utiliser la valeur voisine existante (ne pas en créer de nouvelle).

- [ ] **Step 6: Sitemap**

Dans `src/routes/sitemap.xml/+server.ts`, remplacer l'import et la constante `routes` :

```ts
import { site } from '$lib/config';
import { PRESTATION_IDS } from '$lib/booking/prestations';

export const prerender = true;

// Routes statiques du site, puis une page par prestation (clés statiques).
const routes = [
	'/',
	'/contact',
	'/reservation',
	'/newsletter',
	...PRESTATION_IDS.map((cle) => `/prestations/${cle}`)
];
```

- [ ] **Step 7: Lancer les tests e2e pour vérifier qu'ils passent**

Run: `pnpm exec playwright test e2e/prestations.e2e.ts`
Expected: PASS (7 tests).

- [ ] **Step 8: Contrôle visuel**

Lancer `pnpm build && pnpm preview --port 4180` en arrière-plan, puis faire des captures Playwright de `/prestations/individuelle` à 1440×900 et 390×844 et de la section `#prestations` de l'accueil à 1440 (4 colonnes, boutons empilés) et 900 (2 colonnes, boutons côte à côte). Vérifier : pas de texte coupé dans les boutons, photo non déformée, bandeau des 3 autres lisible. Arrêter ensuite le serveur par son port (`lsof -ti:4180 | xargs -r kill`), jamais par `pkill -f` (qui tue le shell qui le lance).

- [ ] **Step 9: Contrôles complets et commit**

Run: `pnpm format && pnpm lint && pnpm check && pnpm test:unit -- --run && pnpm exec playwright test && pnpm build`
Expected: tout passe.

```bash
git add "src/routes/prestations/[cle=prestation]" src/routes/layout.css src/routes/sitemap.xml/+server.ts e2e/prestations.e2e.ts
git commit -m "feat(prestations): page « En savoir plus » par prestation, texte riche et sitemap"
```

---

### Task 5: CMS — migration du schéma, contrat, seed, CORS, script de remplissage

Travail dans `../olivier-hildevert-cms` (**npm uniquement**).

**Files:**

- Modify: `src/api/prestation/content-types/prestation/schema.json`
- Modify: `src/components/sections/contact-cta.json`
- Modify: `scripts/verifier-conformite.mjs` (`ATTENDU_ACCUEIL.contactCta`, `ATTENDU_IMBRIQUE['contactCta.modes']`, `ATTENDU_PRESTATION`)
- Modify: `scripts/seed-data.json` (régénéré)
- Modify: `config/middlewares.ts`
- Create: `scripts/remplir-desc-longue-2026-09-25.mjs`

**Interfaces:**

- Consumes: le contenu par défaut du site après Tasks 1-4 (`npx tsx scripts/export-defaults.ts` lancé depuis le dépôt du site).
- Produces: contrat Strapi `prestation` = `cle, titre, metaReservation, descReservation, descCarte, descLongue (richtext, requis), infosPratiques (string, facultatif), actionCarte, ordre`.

- [ ] **Step 1: Schéma des prestations**

Dans `src/api/prestation/content-types/prestation/schema.json`, remplacer la ligne `"prixCarte": { "type": "string", "required": true },` par :

```json
		"descLongue": { "type": "richtext", "required": true },
		"infosPratiques": { "type": "string", "required": false },
```

- [ ] **Step 2: Retirer `modes` du composant d'appel au contact**

Dans `src/components/sections/contact-cta.json`, supprimer l'attribut `modes` (et la virgule qui précède) ; `boutonLabel` devient le dernier attribut.

- [ ] **Step 3: Contrat du vérificateur**

Dans `scripts/verifier-conformite.mjs` :

- `ATTENDU_ACCUEIL.contactCta` devient `['eyebrow', 'titre', 'paragraphe', 'boutonLabel']` ;
- supprimer l'entrée `'contactCta.modes': ['texte']` de `ATTENDU_IMBRIQUE` (et la virgule de l'entrée précédente) ;
- `ATTENDU_PRESTATION` devient :

```js
const ATTENDU_PRESTATION = [
	'cle',
	'titre',
	'metaReservation',
	'descReservation',
	'descCarte',
	// Le site tolère un texte long absent (texte provisoire servi), mais un
	// champ renommé côté CMS ne doit pas passer inaperçu.
	'descLongue',
	'actionCarte',
	'ordre'
];
```

(`infosPratiques` est volontairement absent : facultatif des deux côtés, comme `email`/`telephone` des réglages.)

- [ ] **Step 4: Régénérer le seed**

Run (depuis `../olivier-hildevert-website`) : `npx tsx scripts/export-defaults.ts`
Puis dans le CMS : `git diff --stat scripts/seed-data.json` et vérifier avec :

```bash
node -e 'const s=require("./scripts/seed-data.json");
const p=s.prestations; if(p.length!==4||p.some(x=>"prixCarte" in x||!x.descLongue)) throw "prestations";
if("modes" in s.pageAccueil.contactCta) throw "modes";
console.log("seed conforme")'
```

Expected: `seed conforme`.

- [ ] **Step 5: CORS**

Dans `config/middlewares.ts`, supprimer la ligne `'https://olivier-hildevert.vercel.app',` du tableau `origin`.

- [ ] **Step 6: Script de remplissage gardé**

Créer `scripts/remplir-desc-longue-2026-09-25.mjs` :

```js
/**
 * Remplit `descLongue` des 4 prestations avec le texte provisoire, après la
 * migration du schéma (le champ naît vide sur les entrées existantes).
 *
 * Garde : n'écrit QUE dans un champ vide — un texte déjà rédigé par le client
 * n'est jamais écrasé. Simulation par défaut ; `--appliquer` écrit et publie.
 *
 * Jeton : PAS le jeton « site-web » (lecture seule). Jeton temporaire
 * « maj-contenu » (find + update sur prestation), à SUPPRIMER après usage.
 *
 * Usage :
 *   STRAPI_URL=… STRAPI_WRITE_TOKEN=… node scripts/remplir-desc-longue-2026-09-25.mjs
 *   STRAPI_URL=… STRAPI_WRITE_TOKEN=… node scripts/remplir-desc-longue-2026-09-25.mjs --appliquer
 */
const URL_BASE = (process.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/$/, '');
const JETON = process.env.STRAPI_WRITE_TOKEN;
const APPLIQUER = process.argv.includes('--appliquer');
const TEXTE = 'Présentation détaillée à venir.';

if (!JETON) {
	console.error(
		'STRAPI_WRITE_TOKEN manquant (jeton temporaire « maj-contenu », pas « site-web »).'
	);
	process.exit(1);
}

async function api(chemin, init = {}) {
	const reponse = await fetch(`${URL_BASE}/api/${chemin}`, {
		...init,
		headers: { Authorization: `Bearer ${JETON}`, 'Content-Type': 'application/json' }
	});
	if (!reponse.ok) {
		throw new Error(
			`${init.method ?? 'GET'} /api/${chemin} → ${reponse.status} ${await reponse.text()}`
		);
	}
	return reponse.json();
}

console.log(`${APPLIQUER ? 'ÉCRITURE' : 'SIMULATION (aucune écriture)'} — ${URL_BASE}\n`);

const { data: prestations } = await api('prestations?pagination[pageSize]=100');
if (prestations.length && !('descLongue' in prestations[0])) {
	console.error(
		'Le champ descLongue est absent de la réponse : la migration du schéma n’est pas déployée.'
	);
	process.exit(1);
}

let aRemplir = 0;
for (const p of prestations) {
	if (p.descLongue?.trim()) {
		console.log(`  = ${p.cle} — texte déjà rédigé, laissé intact`);
		continue;
	}
	aRemplir++;
	console.log(`  ~ ${p.cle} — vide → « ${TEXTE} »`);
	if (APPLIQUER) {
		await api(`prestations/${p.documentId}`, {
			method: 'PUT',
			body: JSON.stringify({ data: { descLongue: TEXTE } })
		});
	}
}

console.log(`\n${aRemplir} prestation(s) ${APPLIQUER ? 'remplie(s) et publiée(s)' : 'à remplir'}.`);
if (!APPLIQUER && aRemplir) console.log('Relancer avec --appliquer pour écrire.');
if (APPLIQUER) console.log('Pensez à supprimer le jeton « maj-contenu » dans l’administration.');
```

- [ ] **Step 7: Contrôles CMS**

Run (dans le CMS) :

```bash
node --check scripts/remplir-desc-longue-2026-09-25.mjs && node --check scripts/verifier-conformite.mjs && npx --no-install tsc --noEmit -p tsconfig.json && npm run build
```

Expected: aucune erreur ; `strapi build` termine. (Démarrer Strapi en local est bloqué par le classifieur de permissions : ne pas insister, la migration est validée en production à la Task 6.)

- [ ] **Step 8: Commit (CMS)**

```bash
git add src/api/prestation/content-types/prestation/schema.json src/components/sections/contact-cta.json scripts/verifier-conformite.mjs scripts/seed-data.json config/middlewares.ts scripts/remplir-desc-longue-2026-09-25.mjs
git commit -m "feat(prestations): texte long et infos pratiques, retrait de prixCarte et de contactCta.modes"
```

---

### Task 6: Déploiement ordonné et contrôle en production

**Chaque étape de cette tâche requiert l'accord explicite de l'utilisateur ; les écritures Strapi sont lancées par lui.**

- [ ] **Step 1: Site d'abord** — avec accord : `git push origin main` (site). Attendre le déploiement : `curl -s https://olivier-hildevert-website.vercel.app/prestations/individuelle | grep -c texte-riche` renvoie `1`. Vérifier que l'accueil sert toujours les textes Strapi (ex. `curl -s https://olivier-hildevert-website.vercel.app/ | grep -c Participer` ≥ 1) : l'ancien schéma CMS (avec `prixCarte`, sans `descLongue`) est bien toléré.

- [ ] **Step 2: CMS ensuite** — avec accord : `git push` du dépôt CMS (déploiement Railway, qui inclut aussi le commit `b6fd4e8` du script du lot A). Attendre `Strapi started successfully` dans les journaux Railway (à vérifier par l'utilisateur). Recontrôler l'accueil en ligne (toujours « Participer ») : le site tolère `descLongue` vide.

- [ ] **Step 3: Remplissage** — simulation (lecture seule) avec le jeton temporaire :

```bash
cd ../olivier-hildevert-cms && set -a && . ../olivier-hildevert-website/.env && set +a && STRAPI_WRITE_TOKEN="$(printf %s "$STRAPI_API_TOKEN" | tr -d '\r')" node scripts/remplir-desc-longue-2026-09-25.mjs
```

Expected: `4 prestation(s) à remplir.` Puis **l'utilisateur** lance la même commande avec `--appliquer` (préfixe `!`).

- [ ] **Step 4: Contrôle** — `npm run verifier` du CMS contre la production (jeton lu comme ci-dessus, variable `STRAPI_API_TOKEN`) : tous les domaines ✓. Puis vérifier en ligne les 4 pages `/prestations/<cle>` (HTTP 200, `h1` correct) et le sitemap (`/sitemap.xml` contient les 4 URL).

- [ ] **Step 5: Nettoyage** — rappeler à l'utilisateur : remettre le jeton `site-web` dans le `.env` du site et supprimer le jeton temporaire dans l'administration Strapi. Mettre à jour la mémoire `strapi-prod-content-updates` (seed resynchronisé, `modes` retiré, origine CORS morte retirée).

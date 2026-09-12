# Refonte lisibilité & responsive — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre la page d'accueil lisible sur tous les écrans — du téléphone au 27″ — en remplaçant les tailles de police figées par une échelle fluide, en élargissant le conteneur, en corrigeant trois couleurs sous le seuil de contraste, en appliquant les corrections éditoriales du client et en réparant onze défauts mobiles et deux bugs de liens.

**Architecture :** Tout part de `src/routes/layout.css`, seul fichier de configuration du design (Tailwind v4 en CSS-first, pas de `tailwind.config.js`). On y **redéfinit l'échelle `--text-*` de Tailwind elle-même** plutôt que d'ajouter des paliers sur-mesure : les ~50 `text-sm`, `text-4xl`… déjà écrits dans le projet deviennent fluides sans toucher à leurs sites d'appel, y compris sur `/contact`, `/reservation`, `/newsletter` et `+error`. Les 81 valeurs arbitraires restantes (`text-[15px]`, `text-[clamp(…)]`) sont ensuite remplacées par le nom d'échelle le plus proche, composant par composant. Le contenu éditorial vit intégralement dans `src/lib/content/defaults.ts`, qui est à la fois le repli affiché et la source du seed Strapi.

**Tech Stack :** SvelteKit 2 / Svelte 5 (runes forcées), TypeScript, Tailwind v4 (config CSS-first), `@sveltejs/enhanced-img`, Vitest (2 projets : `client` en Chromium, `server` en Node), Playwright, zod v4 + Superforms v2, `sharp` (transitif, via `vite-imagetools`).

**Spec :** `docs/superpowers/specs/2026-09-12-refonte-lisibilite-responsive-design.md`

## Global Constraints

- **Tout le texte visible est en français.** Commentaires de code et messages de commit en français également (convention du dépôt).
- **`pnpm build` doit réussir sans `.env`.** Le client Strapi est en environnement paresseux ; aucun accès réseau au build.
- **Amélioration progressive obligatoire :** chaque parcours (formulaires, réservation, newsletter, et désormais le menu mobile) doit fonctionner sans JavaScript.
- **Palette « Aurore » exclusive :** `--color-*: initial` désactive la palette Tailwind par défaut. `gray-*`, `red-*` etc. ne compilent pas. N'utiliser que les tokens du design.
- **Pas de `svelte.config.js`** — toute la config SvelteKit est dans les options du plugin `sveltekit()` de `vite.config.ts`.
- **Liens internes via `resolve()`** de `$app/paths` (règle eslint `svelte/no-navigation-without-resolve`). Les liens **externes** (`https://…`) en sont exemptés.
- **Tests colocalisés** avec le code (`src/**/*.test.ts`). Playwright ne ramasse que `e2e/**/*.e2e.ts`.
- **Le commentaire `// svelte-ignore state_referenced_locally`** au-dessus de `superForm(data.form)` est voulu et doit rester seul sur sa ligne.
- **Identité Git :** non configurée dans ce dépôt. Committer avec `git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit …`, comme tous les commits précédents.
- **Seuil de contraste :** WCAG AA, 4,5:1 pour le texte de taille normale.

### Écart assumé par rapport à la spec

La spec § 3.1 nommait les sept paliers `--text-etiquette`, `--text-courant`, `--text-titre-m`… Ce plan **redéfinit à la place les noms d'échelle de Tailwind** (`--text-xs` … `--text-5xl`). Raison : le projet contient déjà 52 usages de `text-sm`, `text-xs`, `text-lg`, `text-2xl`, `text-4xl`, `text-5xl` — dont la totalité de `/contact`, `/reservation`, `/newsletter` et `+error`. Avec des noms sur-mesure, ces 52 sites d'appel seraient restés figés ou auraient tous dû être réécrits ; avec les noms de Tailwind, ils deviennent fluides gratuitement. Le résultat visuel et les valeurs des `clamp()` sont identiques à ceux validés par le client à l'écran. Correspondance : `xs` = étiquette, `sm` = légende, `base` = courant, `lg` = chapô, `2xl` = titre-s, `4xl` = titre-m, `5xl` = titre-l.

**Conséquence à ne pas se tromper :** les `<h2>` de section (`text-[clamp(34px,5vw,58px)]` et `text-[clamp(34px,4.6vw,56px)]`) deviennent **`text-4xl`** (plafond 46 px), pas `text-5xl`. Seul le titre de l'appel au contact (`text-[clamp(38px,5.4vw,68px)]`) monte à `text-5xl` (plafond 62 px). Vérification faite sur le cas le plus contraint, « États d'esprit & états d'âme » forcé sur une ligne : à `text-4xl` il mesure ≈ 605 px à 2560 px pour un bloc de 820 px ; à `text-5xl` il mesurerait 816 px et déborderait au premier écart de métrique.

---

## Structure des fichiers

**Créés :**

| Fichier | Responsabilité |
|---|---|
| `src/lib/components/SunMark.svelte` | Le soleil, seul SVG de marque du site. Un consommateur par contexte : en-tête, section Approche, favicon. |
| `src/routes/layout.test.ts` | Garde-fou de contraste : lit `layout.css`, extrait les tokens, calcule les ratios WCAG. Le seul test qui vérifie une décision de design. |

**Modifiés :**

| Fichier | Nature du changement |
|---|---|
| `src/routes/layout.css` | Échelle `--text-*` fluide, `--container-wrap`, 3 tokens de couleur, `eyebrow`/`btn`/`btn-sun` |
| `src/lib/content/defaults.ts` | Corrections éditoriales (hero, mantra, espritAme, boutique, prestations) |
| `src/lib/content/types.ts` | `+ ProduitBoutique.lien`, `− MantraContent.auteur` |
| `src/lib/server/content.ts` | Schéma zod : `+ lien`, `− auteur` |
| `src/lib/content/defaults.test.ts` | Verrouille les nouveaux textes |
| `src/lib/components/Header.svelte` | Soleil agrandi, menu burger `<details>` |
| `src/lib/components/home/Hero.svelte` | Nouvel asset, dégradé vertical, titre sur une ligne, chiffres en grille |
| `src/lib/components/home/ImmersiveBand.svelte` | Voile assombri |
| `src/lib/components/home/{Mantra,EspritAme,PourQui,ContactCta,Approche,APropos,Prestations,Boutique,Tarifs}.svelte` | Échelle + corrections ponctuelles |
| `src/lib/components/Footer.svelte` | Lien externe, échelle |
| `src/lib/components/{BookingModal,NewsletterModal}.svelte` | Champs 16 px, fermeture 44 px |
| `src/lib/assets/favicon.svg` | Remplace le logo Svelte par le soleil |
| `src/lib/assets/hero-mer.jpg` *(nouveau binaire)* | Hero recadré sans portrait |
| `e2e/home.e2e.ts` | Menu mobile, échelle fluide, liens externes |
| `README.md` | Commande de génération de `hero-mer.jpg`, changements du modèle CMS |

**Ordre des dépendances :** Tâche 1 (fondations) → Tâche 2 (contenu/modèle) → Tâche 3 (SunMark) → Tâches 4-10 (composants, parallélisables après 3) → Tâche 11 (vérification).

---

## Task 1 : Fondations — échelle fluide, conteneur, contraste

**Files:**
- Modify: `src/routes/layout.css`
- Test: `src/routes/layout.test.ts` *(créé)*

**Interfaces:**
- Consomme : rien.
- Produit : les tokens `--text-xs` … `--text-5xl` (utilisables comme `text-xs` … `text-5xl`), `--container-wrap: 1440px`, et les tokens de couleur `--color-mute` (corrigé), `--color-coral-ink`, `--color-coral-deep` (nouveaux). Toutes les tâches suivantes en dépendent.

- [ ] **Step 1 : Écrire le test de contraste qui échoue**

Créer `src/routes/layout.test.ts` :

```ts
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
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm test:unit -- --run src/routes/layout.test.ts`
Expected: FAIL — `token --color-coral-ink introuvable dans layout.css`, et les assertions d'échelle échouent (`--text-xs` n'existe pas encore).

- [ ] **Step 3 : Ajouter l'échelle typographique dans `@theme`**

Dans `src/routes/layout.css`, à l'intérieur du bloc `@theme`, juste après le bloc `--font-*` (avant `--radius-card`) :

```css
	/* ---------- Échelle typographique fluide ----------
	   On redéfinit les noms d'échelle de Tailwind eux-mêmes : tout `text-sm`,
	   `text-4xl`… déjà écrit dans le projet devient fluide sans toucher au site
	   d'appel — y compris sur /contact, /reservation, /newsletter et +error.
	   Chaque palier : plancher (mobile) · rem + vw · plafond (grands écrans).
	   Le `rem` fait respecter la taille de police choisie dans le navigateur ;
	   le `vw` fait suivre l'écran. */
	--text-xs: clamp(12.5px, 0.72rem + 0.18vw, 15px);
	--text-xs--line-height: 1.5;
	--text-sm: clamp(14px, 0.8rem + 0.25vw, 17px);
	--text-sm--line-height: 1.6;
	--text-base: clamp(16.5px, 0.95rem + 0.35vw, 21px);
	--text-base--line-height: 1.65;
	--text-lg: clamp(19px, 1.05rem + 0.5vw, 25px);
	--text-lg--line-height: 1.5;
	--text-xl: clamp(21px, 1.1rem + 0.7vw, 28px);
	--text-xl--line-height: 1.4;
	--text-2xl: clamp(24px, 1.2rem + 1vw, 34px);
	--text-2xl--line-height: 1.25;
	--text-3xl: clamp(27px, 1.3rem + 1.4vw, 40px);
	--text-3xl--line-height: 1.2;
	--text-4xl: clamp(30px, 1.4rem + 1.8vw, 46px);
	--text-4xl--line-height: 1.12;
	--text-5xl: clamp(36px, 1.6rem + 2.6vw, 62px);
	--text-5xl--line-height: 1.08;
```

- [ ] **Step 4 : Corriger les trois tokens de couleur**

Toujours dans `@theme`, remplacer la ligne `--color-mute` et ajouter deux tokens après `--color-coral` :

```css
	--color-mute: #8a6a53; /* gris chaud — assombri pour atteindre 4,7:1 sur --color-sky */
```

```css
	--color-coral: #f0653a; /* corail — accent décoratif : filets, pastilles, ornements */
	--color-coral-ink: #b93a18; /* corail en TEXTE sur fond clair — 5,4:1 */
	--color-coral-deep: #d03c19; /* corail en FOND de bouton, texte blanc dessus — 4,8:1 */
```

- [ ] **Step 5 : Élargir le conteneur**

Remplacer `--container-wrap: 1180px;` par :

```css
	--container-wrap: 1440px;
```

et l'utilitaire `wrap` :

```css
/* ---------- Conteneur du design ---------- */
@utility wrap {
	/* `100% - 2.75rem` plutôt que `90vw` : gouttières fixes de 22 px sur mobile,
	   et pas de dépendance à vw (qui inclut la barre de défilement). */
	width: min(var(--container-wrap), 100% - 2.75rem);
	margin-inline: auto;
}
```

- [ ] **Step 6 : Basculer `eyebrow` et `btn` sur les nouveaux tokens**

Dans `@utility btn`, remplacer `font-size: 12.5px;` par `font-size: var(--text-xs);`.

Dans `@utility btn-sun`, remplacer les trois occurrences de `var(--color-coral)` **du fond et de l'ombre** :

```css
@utility btn-sun {
	background: var(--color-coral-deep);
	color: #fff;
	box-shadow: 0 16px 36px -16px var(--color-coral-deep);
	&:hover {
		background: var(--color-ember);
		transform: translateY(-2px);
		box-shadow: 0 20px 44px -14px var(--color-coral-deep);
	}
}
```

Dans `@utility eyebrow`, remplacer `font-size: 11.5px;` par `font-size: var(--text-xs);` et `color: var(--color-coral);` par `color: var(--color-coral-ink);`.

`btn-line` garde `var(--color-coral)` pour sa bordure (décoratif), mais son `&:hover { color: … }` porte du texte : y remplacer `var(--color-coral)` par `var(--color-coral-ink)`.

- [ ] **Step 7 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm test:unit -- --run src/routes/layout.test.ts`
Expected: PASS — 8 tests verts.

- [ ] **Step 8 : Vérifier que le projet compile toujours**

Run: `pnpm check && pnpm build`
Expected: aucune erreur. Le build doit réussir **sans `.env`**.

- [ ] **Step 9 : Commit**

```bash
git add src/routes/layout.css src/routes/layout.test.ts
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "feat(design): échelle typographique fluide, conteneur 1440 px, contraste AA

Les noms d'échelle de Tailwind (--text-xs…5xl) sont redéfinis en clamp()
rem+vw : les 52 usages existants de text-sm/text-4xl deviennent fluides
sans modification, sur toutes les pages.

--color-mute passe de 2,9:1 à 4,7:1 ; deux tokens naissent pour les usages
porteurs de texte du corail (3,0:1 en texte, 3,2:1 en fond de bouton), le
corail décoratif restant inchangé. Test de non-régression sur les ratios.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2 : Contenu éditorial et modèle

**Files:**
- Modify: `src/lib/content/defaults.ts`, `src/lib/content/types.ts`, `src/lib/server/content.ts`
- Test: `src/lib/content/defaults.test.ts`

**Interfaces:**
- Consomme : rien.
- Produit :
  - `ProduitBoutique.lien: string` — consommé par la tâche 9 (`Boutique.svelte`).
  - `MantraContent` **sans** `auteur` — consommé par la tâche 6 (`Mantra.svelte`).
  - `defaultAccueil.hero.stats` : `[{ valeur: 'Depuis 1992', … }, { valeur: '+ de 10 000', … }, { valeur: '34 ans', … }]` — consommé par la tâche 5 (`Hero.svelte`).

Le test d'aller-retour Strapi de `src/lib/server/content.test.ts` passe par `accueilVersStrapi(defaultAccueil)`, qui propage les champs par `...c` : **il n'a pas besoin d'être modifié** et doit rester vert par lui-même. C'est ce qui prouve que le schéma zod et les types restent cohérents.

- [ ] **Step 1 : Écrire les tests de contenu qui échouent**

Dans `src/lib/content/defaults.test.ts`, ajouter un nouveau `describe` après le `describe('contenu par défaut', …)` existant :

```ts
describe('corrections éditoriales validées le 2026-09-12', () => {
	it('annonce la dimension transpersonnelle dans le surtitre du hero', () => {
		expect(defaultAccueil.hero.eyebrow).toBe(
			'Sophrologie · Thérapie psycho énergétique et transpersonnelle'
		);
	});

	it('affiche les trois repères d’expérience corrigés', () => {
		expect(defaultAccueil.hero.stats).toEqual([
			{ valeur: 'Depuis 1992', legende: "Praticien en relation d'aide" },
			{ valeur: '+ de 10 000', legende: 'Séances animées' },
			{ valeur: '34 ans', legende: "D'accompagnements individuels et collectifs" }
		]);
	});

	it('ne mentionne plus la durée de séance dans le hero', () => {
		expect(JSON.stringify(defaultAccueil.hero)).not.toContain('1 h 30');
	});

	it('conserve la durée de séance là où elle a un sens', () => {
		expect(defaultAccueil.tarifs.cartes[1].sousTexte).toContain('1 h 30');
		expect(defaultPrestations[0].prixCarte).toContain('1 h 30');
	});

	it('nuance le surtitre des deux logiques', () => {
		expect(defaultAccueil.espritAme.eyebrow).toBe('Deux logiques, pour une même personne');
	});

	it('prolonge le chemin de l’éveil dans la boutique', () => {
		expect(defaultAccueil.boutique.titre).toBe("Prolonger le chemin de l'éveil");
		expect(defaultAccueil.boutique.paragraphe).toBe(
			'Un roman thérapeutique pour se réaligner et des veilleuses énergétiques pour réharmoniser les lieux et les êtres.'
		);
	});

	it('annonce le roman comme disponible à l’achat', () => {
		expect(defaultAccueil.boutique.produits[0].prixTexte).toBe("Disponible à l'achat");
	});

	it('donne à chaque produit un lien externe éditable', () => {
		for (const produit of defaultAccueil.boutique.produits) {
			expect(produit.lien).toMatch(/^https:\/\//);
		}
	});

	it('précise ce que couvre la séance individuelle', () => {
		expect(defaultPrestations[0].titre).toBe('Séance individuelle — décodage et solutions');
	});
});
```

Et dans le `describe('contenu par défaut', …)` existant, ajouter :

```ts
	it('n’attribue plus le mantra à une formule signature', () => {
		expect(defaultAccueil.mantra).not.toHaveProperty('auteur');
	});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `pnpm test:unit -- --run src/lib/content/defaults.test.ts`
Expected: FAIL — 10 tests rouges (`expected 'Sophrologie · Thérapie psycho énergétique' to be '… et transpersonnelle'`, `produit.lien` est `undefined`, etc.). Le fichier ne compilera pas non plus côté types tant que `lien` n'existe pas : c'est attendu.

- [ ] **Step 3 : Ajuster les types**

Dans `src/lib/content/types.ts`, ajouter le champ `lien` à `ProduitBoutique` (l'interface commence ligne 81) :

```ts
export interface ProduitBoutique {
	cleImage: CleImageBoutique;
	tag: string;
	titre: string;
	desc: string;
	prixTexte: string;
	boutonLabel: string;
	/** URL externe de la boutique — éditable dans Strapi, ouverte dans un nouvel onglet. */
	lien: string;
}
```

et retirer `auteur` de `MantraContent` :

```ts
/** `citation` : les segments entre astérisques (`*…*`) sont mis en valeur. */
export interface MantraContent {
	citation: string;
}
```

- [ ] **Step 4 : Ajuster le schéma zod du serveur**

Dans `src/lib/server/content.ts`, ajouter `lien` à l'objet produit du schéma `boutique` :

```ts
				z.object({
					cleImage: z.enum(['livre', 'veilleuses']),
					tag: z.string(),
					titre: z.string(),
					desc: z.string(),
					prixTexte: z.string(),
					boutonLabel: z.string(),
					lien: z.string()
				})
```

et simplifier le schéma `mantra` :

```ts
	mantra: z.object({ citation: z.string() }),
```

- [ ] **Step 5 : Appliquer les corrections éditoriales**

Dans `src/lib/content/defaults.ts` :

`hero.eyebrow` :

```ts
		eyebrow: 'Sophrologie · Thérapie psycho énergétique et transpersonnelle',
```

`hero.stats` :

```ts
		stats: [
			{ valeur: 'Depuis 1992', legende: "Praticien en relation d'aide" },
			{ valeur: '+ de 10 000', legende: 'Séances animées' },
			// « 34 ans » est du texte, pas un calcul : à corriger dans le CMS en 2027.
			{ valeur: '34 ans', legende: "D'accompagnements individuels et collectifs" }
		]
```

`espritAme.eyebrow` :

```ts
		eyebrow: 'Deux logiques, pour une même personne',
```

`boutique` — titre, paragraphe, et les deux produits :

```ts
	boutique: {
		eyebrow: 'Boutique',
		titre: "Prolonger le chemin de l'éveil",
		paragraphe:
			'Un roman thérapeutique pour se réaligner et des veilleuses énergétiques pour réharmoniser les lieux et les êtres.',
		produits: [
			{
				cleImage: 'livre',
				tag: 'Roman fantastique & thérapeutique',
				titre: "Angela, l'ange est là !",
				desc: "Un récit où le merveilleux soigne; premier roman d'Olivier Hildevert, paru chez BoD.",
				prixTexte: "Disponible à l'achat",
				boutonLabel: 'Commander',
				// URL de remplacement — à renseigner dans Strapi.
				lien: 'https://www.bod.fr/'
			},
			{
				cleImage: 'veilleuses',
				tag: 'Veilleuses thérapeutiques',
				titre: 'LUMINÂME',
				desc: "Inspirées de motifs sacrés, pour l'harmonisation vibratoire des lieux, le bien-être énergétique et les pratiques méditatives.",
				prixTexte: 'Catalogue en ligne',
				boutonLabel: 'Découvrir',
				// URL de remplacement — à renseigner dans Strapi.
				lien: 'https://olivierhildevert.com/'
			}
		]
	},
```

`mantra` — supprimer la clé `auteur` :

```ts
	mantra: {
		citation:
			"Relier les *états d'esprit* et les *états d'âme*, pour révéler le sens des expériences où chacun se construit, se répare et se transforme."
	},
```

`defaultPrestations[0].titre` :

```ts
		titre: 'Séance individuelle — décodage et solutions',
```

- [ ] **Step 6 : Retirer la signature du mantra de l'affichage**

`src/lib/components/home/Mantra.svelte` référence encore `content.auteur` : sans ce pas, la tâche laisserait le dépôt non compilable. Supprimer le bloc `<cite>` en entier :

```svelte
		<cite
			class="mt-4.5 block font-mono text-[11px] tracking-[0.26em] text-white/80 uppercase not-italic"
		>
			{content.auteur}
		</cite>
```

Le filet ornemental qui le précède est conservé. La mise en forme du mantra est reprise en tâche 6.

- [ ] **Step 7 : Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm test:unit -- --run && pnpm check`
Expected: PASS. `defaults.test.ts` vert (10 nouveaux tests), et **`src/lib/server/content.test.ts` vert sans avoir été touché** — c'est la preuve que types, zod et seed-format restent cohérents.

- [ ] **Step 8 : Commit**

```bash
git add src/lib/content/ src/lib/server/content.ts src/lib/components/home/Mantra.svelte
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "feat(contenu): corrections éditoriales validées par le client

Surtitre du hero complété (« et transpersonnelle »), trois repères
d'expérience refondus (depuis 1992, + de 10 000 séances, 34 ans), surtitre
des deux logiques nuancé, boutique reformulée, séance individuelle précisée.

Modèle : chaque produit de la boutique porte désormais un lien externe
éditable dans le CMS ; le champ auteur du mantra disparaît du modèle.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3 : Le soleil — composant partagé et favicon

**Files:**
- Create: `src/lib/components/SunMark.svelte`
- Modify: `src/lib/assets/favicon.svg`, `src/lib/components/Header.svelte`

**Interfaces:**
- Consomme : rien.
- Produit : `SunMark.svelte`, dont la signature est `{ class?: string }` — la classe reçue est appliquée au `<svg>` racine, qui porte déjà `aria-hidden="true"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.1"` et `viewBox="0 0 40 40"`. La couleur se pilote depuis le parent via une classe `text-*`. Consommé par la tâche 4 (`Header.svelte`) et la tâche 8 (`Approche.svelte`).

- [ ] **Step 1 : Créer le composant**

Créer `src/lib/components/SunMark.svelte` :

```svelte
<script lang="ts">
	/**
	 * Le soleil — unique signe de marque du site : en-tête, section « Sept
	 * niveaux de lecture de l'être », favicon. La taille et la couleur se
	 * pilotent depuis le parent (`class="h-16 w-16 text-coral"`).
	 */
	let { class: classe = '' }: { class?: string } = $props();
</script>

<svg
	class={classe}
	viewBox="0 0 40 40"
	fill="none"
	stroke="currentColor"
	stroke-width="1.1"
	aria-hidden="true"
>
	<circle cx="20" cy="20" r="8" />
	<path
		d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M32 8l-3.5 3.5M11.5 28.5L8 32"
		stroke-linecap="round"
	/>
</svg>
```

- [ ] **Step 2 : Remplacer le favicon**

Le fichier actuel `src/lib/assets/favicon.svg` est **le logo de Svelte**, jamais remplacé depuis la création du projet. L'écraser intégralement par :

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><title>Olivier Hildevert</title><g fill="none" stroke="#d03c19" stroke-width="1.8" stroke-linecap="round"><circle cx="20" cy="20" r="8"/><path d="M20 3v5M20 32v5M3 20h5M32 20h5M8 8l3.5 3.5M28.5 28.5L32 32M32 8l-3.5 3.5M11.5 28.5L8 32"/></g></svg>
```

L'épaisseur passe de 1,1 à 1,8 : à 16 × 16 px dans un onglet, un trait de 1,1 disparaît. La couleur est `--color-coral-deep` en dur — un fichier `.svg` statique n'a pas accès aux tokens CSS.

- [ ] **Step 3 : Faire consommer le composant par l'en-tête**

Dans `src/lib/components/Header.svelte`, ajouter l'import après les autres :

```ts
	import SunMark from '$lib/components/SunMark.svelte';
```

et remplacer le bloc `<svg class="h-[38px] w-[38px] flex-none text-coral" …>…</svg>` (les 14 lignes du SVG inline) par :

```svelte
			<SunMark class="h-[38px] w-[38px] flex-none text-coral" />
```

*(la taille définitive est fixée en tâche 4 ; ici on ne fait que déplacer le SVG sans changer le rendu)*

- [ ] **Step 4 : Vérifier que rien n'a bougé visuellement**

Run: `pnpm check && pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS — les tests existants passent, le rendu de l'en-tête est identique.

- [ ] **Step 5 : Commit**

```bash
git add src/lib/components/SunMark.svelte src/lib/assets/favicon.svg src/lib/components/Header.svelte
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "feat(marque): le soleil devient un composant partagé, et le favicon

Le favicon du site était resté le logo de Svelte depuis la création du
projet : il affichait la marque du framework dans l'onglet des visiteurs.
Il porte désormais le soleil, en trait épaissi pour rester lisible à 16 px.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4 : En-tête — soleil agrandi et menu mobile sans JavaScript

**Files:**
- Modify: `src/lib/components/Header.svelte`
- Test: `e2e/home.e2e.ts`

**Interfaces:**
- Consomme : `SunMark` (tâche 3) ; `nav` et `site` de `$lib/config` (inchangés : `nav` est un tableau de `{ label, anchor, pill? }`).
- Produit : un `<nav aria-label="Navigation mobile">` dans le DOM sous 1024 px, et un `<summary aria-label="Ouvrir le menu">` dans le `<header>`. Le e2e de la tâche 11 s'appuie sur ces deux sélecteurs.

C'est le seul ajout fonctionnel du lot. Il est implémenté avec `<details>` / `<summary>` **et non avec un état Svelte** : le panneau s'ouvre, se ferme et se pilote au clavier sans JavaScript, comme tout le reste du site.

- [ ] **Step 1 : Écrire le test e2e qui échoue**

Dans `e2e/home.e2e.ts`, ajouter à la fin du fichier :

```ts
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
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec playwright test e2e/home.e2e.ts -g "navigation mobile"`
Expected: FAIL — `header details` n'existe pas ; le test de débordement échoue aussi (logo et bouton réclament ensemble ~440 px pour 346 px disponibles).

- [ ] **Step 3 : Réécrire l'en-tête**

Remplacer l'intégralité du bloc `<div class="wrap …">…</div>` de `src/lib/components/Header.svelte` par :

```svelte
	<div class="wrap relative flex items-center justify-between gap-4">
		<a class="flex min-w-0 items-center gap-3.5 text-ink" href={home} aria-label="Accueil">
			<SunMark class="h-[clamp(46px,3.6vw,62px)] w-[clamp(46px,3.6vw,62px)] flex-none text-coral" />
			<span
				class="font-display text-[clamp(24px,1.9vw,34px)] leading-none tracking-[0.04em] whitespace-nowrap text-[#5E4108]"
			>
				{site.name}
				<small
					class="mt-2 block font-mono text-xs font-medium tracking-[0.28em] text-mute uppercase"
				>
					{reglages.sousTitreLogo}
				</small>
			</span>
		</a>

		<nav class="hidden items-center gap-[30px] lg:flex" aria-label="Navigation principale">
			{#each nav as item (item.anchor)}
				{#if item.pill}
					<a
						href="{home}#{item.anchor}"
						class="rounded-full bg-amber-soft px-4 py-2 font-mono text-xs font-semibold tracking-[0.14em] text-white uppercase shadow-[0_3px_10px_rgba(242,160,61,0.22)] transition hover:-translate-y-px hover:bg-amber hover:shadow-[0_5px_14px_rgba(242,160,61,0.34)]"
					>
						{item.label}
					</a>
				{:else}
					<a
						href="{home}#{item.anchor}"
						class="relative font-mono text-xs tracking-[0.14em] whitespace-nowrap text-ink-soft uppercase transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-coral after:transition-[width] after:duration-300 hover:text-coral-ink hover:after:w-full"
					>
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>

		<a
			class="btn btn-sun hidden lg:inline-flex"
			href={resolve('/reservation')}
			onclick={(e) => {
				e.preventDefault();
				openBooking();
			}}
		>
			Prendre rendez-vous
		</a>

		<!-- Menu mobile : <details> plutôt qu'un état Svelte, pour qu'il
		     fonctionne sans JavaScript comme le reste des parcours du site. -->
		<details class="lg:hidden">
			<summary
				class="grid h-12 w-12 cursor-pointer list-none place-items-center gap-[5px] rounded-btn border border-[color-mix(in_oklab,var(--color-coral)_40%,transparent)] bg-[color-mix(in_oklab,#fff_55%,transparent)] [&::-webkit-details-marker]:hidden"
				aria-label="Ouvrir le menu"
			>
				<span class="block h-0.5 w-5 rounded-full bg-coral-ink"></span>
				<span class="block h-0.5 w-5 rounded-full bg-coral-ink"></span>
				<span class="block h-0.5 w-5 rounded-full bg-coral-ink"></span>
			</summary>

			<nav
				class="absolute top-[calc(100%+14px)] right-0 flex w-[min(320px,calc(100vw-2.75rem))] flex-col gap-1 rounded-card border border-line bg-[color-mix(in_oklab,var(--color-sky)_97%,transparent)] p-4 shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--color-ember)_45%,transparent)] backdrop-blur-[14px]"
				aria-label="Navigation mobile"
			>
				{#each nav as item (item.anchor)}
					<a
						href="{home}#{item.anchor}"
						class="rounded-btn px-3 py-3 font-mono text-xs tracking-[0.14em] text-ink-soft uppercase transition-colors hover:bg-[color-mix(in_oklab,var(--color-coral)_10%,transparent)] hover:text-coral-ink"
					>
						{item.label}
					</a>
				{/each}
				<a
					class="btn btn-sun mt-2 justify-center"
					href={resolve('/reservation')}
					onclick={(e) => {
						e.preventDefault();
						openBooking();
					}}
				>
					Prendre rendez-vous
				</a>
			</nav>
		</details>
	</div>
```

Trois points à ne pas rater :
- `min-w-0` sur le lien du logo : sans lui, le `whitespace-nowrap` du nom empêche toute compression et le débordement persiste.
- `list-none` **et** `[&::-webkit-details-marker]:hidden` : le premier supprime le triangle sur Firefox et Chrome, le second sur Safari.
- `relative` sur le `.wrap` : le panneau se positionne par rapport à lui, pas par rapport au `<header>` qui est `fixed`.

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

Run: `pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS — les deux nouveaux tests verts, et les tests existants (dont « la nav mène aux ancres depuis une autre route », qui tourne à 1280 px et utilise donc la navigation desktop) toujours verts.

- [ ] **Step 5 : Vérifier le fonctionnement sans JavaScript**

Run: `pnpm exec playwright test e2e/home.e2e.ts -g "navigation mobile" --project=chromium` avec JavaScript désactivé — ajouter temporairement `test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })` dans le `describe`, lancer, puis retirer `javaScriptEnabled: false`.
Expected: PASS sur le premier test (ouverture du menu et présence des six liens). C'est la vérification du principe d'amélioration progressive.

- [ ] **Step 6 : Commit**

```bash
git add src/lib/components/Header.svelte e2e/home.e2e.ts
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "feat(en-tête): menu mobile et logo agrandi

Sous 1024 px, la navigation était purement absente : les six liens du site
étaient inaccessibles sur téléphone et sur tablette en portrait, et le logo
et le bouton de rendez-vous débordaient ensemble de la fenêtre.

Le menu s'ouvre avec <details>/<summary> plutôt qu'avec un état Svelte : il
fonctionne sans JavaScript, comme les formulaires et la réservation.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5 : Hero — recadrage sans portrait, titre sur une ligne, repères en grille

**Files:**
- Create: `src/lib/assets/hero-mer.jpg` *(binaire généré)*
- Modify: `src/lib/components/home/Hero.svelte`, `README.md`

**Interfaces:**
- Consomme : `defaultAccueil.hero.stats` (tâche 2) ; les tokens de la tâche 1.
- Produit : rien que d'autres tâches consomment.

- [ ] **Step 1 : Générer l'image recadrée**

Le portrait du client commence à x ≈ 1460 px dans `hero-bg.jpg` (2560 × 1429). On extrait tout ce qui est à sa gauche — mer et lever de soleil — puis on agrandit ×2.

```bash
node -e "
const fs = require('fs');
const dossier = fs.readdirSync('node_modules/.pnpm').find((d) => d.startsWith('sharp@'));
const sharp = require('./node_modules/.pnpm/' + dossier + '/node_modules/sharp');
sharp('src/lib/assets/hero-bg.jpg')
  .extract({ left: 0, top: 0, width: 1460, height: 1429 })
  .resize({ width: 2920, kernel: 'lanczos3' })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('src/lib/assets/hero-mer.jpg')
  .then((i) => console.log('hero-mer.jpg', i.width + 'x' + i.height, Math.round(i.size / 1024) + ' Ko'));
"
```

Expected: `hero-mer.jpg 2920x2858 ~286 Ko`.

L'agrandissement ×2 est acceptable parce que la source est un composite déjà doux, sans détail fin à préserver, et parce que la moitié gauche de l'image est couverte par le voile crème à 66-88 % d'opacité. `hero-bg.jpg` reste au dépôt comme source du recadrage ; n'étant plus importé, il n'est pas embarqué dans le bundle.

- [ ] **Step 2 : Consigner la commande dans le README**

Ajouter une sous-section dans le README, sous la partie qui décrit les assets :

```markdown
### Régénérer `hero-mer.jpg`

Le fond du hero est la moitié gauche de `hero-bg.jpg` (mer et lever de soleil,
sans le portrait, qui commence à x ≈ 1460 px), agrandie ×2 en lanczos :

    node -e "
    const fs = require('fs');
    const dossier = fs.readdirSync('node_modules/.pnpm').find((d) => d.startsWith('sharp@'));
    const sharp = require('./node_modules/.pnpm/' + dossier + '/node_modules/sharp');
    sharp('src/lib/assets/hero-bg.jpg')
      .extract({ left: 0, top: 0, width: 1460, height: 1429 })
      .resize({ width: 2920, kernel: 'lanczos3' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile('src/lib/assets/hero-mer.jpg')
      .then((i) => console.log(i.width + 'x' + i.height));
    "

`sharp` est une dépendance transitive de `vite-imagetools` : elle n'est pas
déclarée dans `package.json` et se résout depuis le magasin pnpm.
`hero-bg.jpg` est conservé comme source du recadrage.
```

- [ ] **Step 3 : Réécrire le corps du hero**

Dans `src/lib/components/home/Hero.svelte`, remplacer le `<enhanced:img>` et tout le bloc `.hero-copy` par :

```svelte
	<enhanced:img
		src="$lib/assets/hero-mer.jpg"
		alt=""
		fetchpriority="high"
		loading="eager"
		sizes="100vw"
		class="absolute inset-0 h-full w-full object-cover object-[center_58%]"
	/>
	<div class="hero-wash absolute inset-0 z-1" aria-hidden="true"></div>

	<div class="relative z-3 wrap">
		<div
			class="hero-copy max-w-[min(1000px,100%)] [text-shadow:0_1px_10px_rgba(255,246,236,0.55)]"
			class:ready={ready}
		>
			<span class="eyebrow text-[#A55A43]!">{content.eyebrow}</span>
			<h1 class="hero-titre mt-6.5 mb-7 text-4xl tracking-[0.006em]">
				<span class="font-rubik text-[#396CB2]">{content.titreLigne1}</span>
				<em class="font-merriweather font-bold text-coral not-italic">{content.titreLigne2}</em>
			</h1>
			<p class="mb-3.5 max-w-[34em] text-base text-ink">{content.paragraphe}</p>
			<p class="mb-9 font-mono text-xs leading-[1.6] tracking-[0.16em] text-[#5E4108] uppercase">
				{content.ligneMono}
			</p>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-[13px]">
				<a
					class="btn btn-sun justify-center sm:justify-start"
					href={resolve('/reservation')}
					onclick={(e) => {
						e.preventDefault();
						openBooking();
					}}
				>
					{content.boutonPrincipal}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</a>
				<a
					class="btn btn-line justify-center sm:justify-start"
					href="{resolve('/')}#approche">{content.boutonSecondaire}</a
				>
			</div>
			<div
				class="mt-10.5 grid border-t border-[color-mix(in_oklab,var(--color-ink)_26%,transparent)] pt-5.5 sm:flex"
			>
				{#each content.stats as stat (stat.valeur)}
					<div
						class="border-b border-[color-mix(in_oklab,var(--color-ink)_16%,transparent)] py-4 last:border-b-0 sm:mr-[clamp(24px,2.4vw,40px)] sm:max-w-[22ch] sm:border-r sm:border-b-0 sm:py-0 sm:pr-[clamp(24px,2.4vw,40px)] sm:last:mr-0 sm:last:border-r-0 sm:last:pr-0"
					>
						<strong
							class="mb-1.5 block font-display text-[clamp(30px,2.6vw,42px)] leading-none font-normal text-coral-ink"
						>
							{stat.valeur}
						</strong>
						<span
							class="block font-mono text-xs leading-[1.5] font-medium tracking-[0.1em] text-ink-soft uppercase"
						>
							{stat.legende}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
```

Quatre changements structurels à comprendre :
- `object-[center_58%]` remplace `object-right` : l'ancienne valeur cadrait sur le portrait, qui n'est plus là.
- Le titre passe de deux `<span>` séparés par un `<br>` à deux `<span>` en flux : c'est le CSS de l'étape suivante qui décide s'ils tiennent sur une ligne.
- Le `whitespace-nowrap` des légendes disparaît — « D'accompagnements individuels et collectifs » ne peut pas tenir sur une ligne de téléphone. `sm:max-w-[22ch]` borne la largeur en mode rangée.
- Les repères sont une **grille à filets horizontaux** sous `sm`, une rangée à séparateurs verticaux au-dessus : plus de trait orphelin en fin de ligne.

- [ ] **Step 4 : Adapter le CSS du hero**

Dans le `<style>` du même fichier, remplacer le bloc `.hero-wash` et ajouter `.hero-titre` juste après :

```css
	/* dégradé crème : le texte reste lisible sur la photo d'aube.
	   Horizontal sur grand écran (texte à gauche, mer à droite) ; vertical en
	   dessous de 900 px, où le texte occupe toute la largeur. */
	.hero-wash {
		pointer-events: none;
		background: linear-gradient(
			178deg,
			rgba(255, 246, 236, 0.92) 0%,
			rgba(255, 246, 236, 0.86) 46%,
			rgba(255, 246, 236, 0.66) 74%,
			rgba(255, 246, 236, 0.4) 100%
		);
	}
	@media (min-width: 900px) {
		.hero-wash {
			background: linear-gradient(
				90deg,
				rgba(255, 246, 236, 0.88) 0%,
				rgba(255, 246, 236, 0.82) 34%,
				rgba(255, 246, 236, 0.66) 52%,
				rgba(255, 246, 236, 0.44) 68%,
				rgba(255, 246, 236, 0.2) 84%,
				rgba(255, 246, 236, 0) 98%
			);
		}
	}

	/* « Décoder le visible, grâce à l'invisible » tient sur une ligne à partir
	   de 900 px : 38 caractères ≈ 763 px pour 856 px de colonne utile au seuil,
	   et ≈ 909 px pour 1000 px de bloc à 2560 px. En dessous, il se répartit
	   sur deux lignes. */
	.hero-titre {
		line-height: 1.14;
	}
	.hero-titre > :global(span) {
		display: block;
	}
	@media (min-width: 900px) {
		.hero-titre {
			white-space: nowrap;
		}
		.hero-titre > :global(span) {
			display: inline;
		}
	}
```

- [ ] **Step 5 : Ajuster la cascade d'entrée**

Le bloc `.hero-copy` animait ses six enfants directs avec des délais par `:nth-child`. La structure garde exactement six enfants (surtitre, h1, paragraphe, ligne mono, boutons, repères) : **les règles `:nth-child(1)` à `:nth-child(6)` restent valides sans modification**. Vérifier visuellement que la cascade fonctionne encore.

- [ ] **Step 6 : Vérifier**

Run: `pnpm check && pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS. Le test existant `getByRole('heading', { level: 1 })` doit toujours contenir « Décoder le visible ».

- [ ] **Step 7 : Commit**

```bash
git add src/lib/assets/hero-mer.jpg src/lib/components/home/Hero.svelte README.md
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "feat(hero): fond recadré sur la mer, titre sur une ligne, repères en grille

Le portrait sort du fond à la demande du client : l'image est la moitié
gauche du montage d'origine, sans personnage. Le titre tient sur une ligne
à partir de 900 px. Les trois repères passent en grille à filets sur mobile,
où ils se bousculaient en laissant des séparateurs orphelins, et leurs
légendes peuvent enfin revenir à la ligne.

Le dégradé de lisibilité devient vertical sous 900 px : il était pensé pour
un texte à gauche d'une photo à droite.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6 : Bandes photo assombries, mantra, deux logiques

**Files:**
- Modify: `src/lib/components/home/ImmersiveBand.svelte`, `src/lib/components/home/Mantra.svelte`, `src/lib/components/home/EspritAme.svelte`, `src/lib/components/home/PourQui.svelte`, `src/lib/components/home/ContactCta.svelte`

**Interfaces:**
- Consomme : `MantraContent` sans `auteur` (tâche 2) ; les tokens de la tâche 1.
- Produit : rien que d'autres tâches consomment.

Les trois bandes (sable, papillon, dunes) partagent `ImmersiveBand` : une seule modification les corrige toutes. Le traitement retenu par le client est celui qu'il a comparé à l'écran — assombrir la photo sans changer une seule couleur de texte.

- [ ] **Step 1 : Assombrir le voile**

Dans le `<style>` de `src/lib/components/home/ImmersiveBand.svelte`, remplacer les trois règles :

```css
	/* lumière chaude : voile radial corail → vermillon en multiply, puis
	   vignette crépuscule. Renforcé : le blanc et l'ambre se noyaient dans les
	   zones claires des photos (sable, feuillage). */
	.band-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			120% 120% at 50% 50%,
			color-mix(in oklab, var(--color-coral) 46%, transparent),
			color-mix(in oklab, var(--color-ember) 96%, transparent)
		);
		mix-blend-mode: multiply;
	}
	.band::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background: radial-gradient(
			125% 125% at 50% 45%,
			color-mix(in oklab, var(--color-dusk) 18%, transparent) 0%,
			color-mix(in oklab, var(--color-dusk) 66%, transparent) 100%
		);
	}
	.band-bg :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(1.08) brightness(0.86);
	}
```

- [ ] **Step 2 : Tenir les expressions du mantra d'un seul tenant**

Le `<cite>` de la signature a déjà été retiré en tâche 2. Dans `src/lib/components/home/Mantra.svelte`, remplacer le balisage restant par :

```svelte
<div class="wrap">
	<div class="reveal mx-auto max-w-[900px] text-center" {@attach reveal()}>
		<p
			class="font-display text-[clamp(26px,1.4rem+2.4vw,52px)] leading-[1.22] tracking-[0.004em] [text-shadow:0_2px_30px_rgba(74,27,18,0.4)]"
		>
			{#each segments as segment, i (i)}
				{#if i % 2 === 1}<b class="font-normal whitespace-nowrap text-amber-soft italic"
						>{segment}</b
					>{:else}{segment}{/if}
			{/each}
		</p>
		<div class="rule mx-auto mt-7.5 max-w-[200px] text-white [&>b]:bg-amber-soft">
			<i></i><b></b><i></i>
		</div>
	</div>
</div>
```

Deux changements : le `<cite>` de l'auteur disparaît, et les segments mis en valeur reçoivent `whitespace-nowrap`. « états d'esprit » et « états d'âme » font 14 et 11 caractères, soit ~200 px au plus petit palier, pour 346 px utiles sur un iPhone : aucun risque de débordement.

- [ ] **Step 3 : Tenir le titre des deux logiques sur une ligne**

Dans `src/lib/components/home/EspritAme.svelte`, remplacer le bloc de titre :

```svelte
		<div class="reveal mx-auto mb-16 max-w-[820px] text-center" {@attach reveal()}>
			<span class="eyebrow eyebrow-center">{content.eyebrow}</span>
			<h2 class="mt-5 mb-4.5 text-4xl tracking-[0.005em] sm:whitespace-nowrap">
				{content.titre}
			</h2>
		</div>
```

Vérification de largeur — c'est le cas le plus contraint du lot : « États d'esprit & états d'âme » à `text-4xl` mesure ≈ 446 px à 640 px de fenêtre, ≈ 537 px à 1024 px et ≈ 605 px à 2560 px, toujours sous les 820 px du bloc. **Ne pas monter ce titre à `text-5xl`** : il atteindrait 816 px pour 820 px disponibles et déborderait au premier écart de métrique. En dessous de `sm`, il mesurerait 395 px pour 346 px utiles, d'où le retour à la ligne autorisé.

Puis, dans le même fichier, basculer les tailles des cartes sur l'échelle : `text-[10.5px]` → `text-xs`, `text-[32px]` → `text-2xl`, `text-[15px]` → `text-sm`, `text-sm` (les points) → inchangé (il est déjà fluide depuis la tâche 1).

- [ ] **Step 4 : Basculer les deux dernières sections sur l'échelle**

`PourQui.svelte` : `text-[clamp(34px,5vw,58px)]` → `text-4xl`, `text-xs` (pastilles) → inchangé.

`ContactCta.svelte` : `text-[clamp(38px,5.4vw,68px)]` → `text-5xl`, `text-[17px]` → `text-base`, `text-[11px]` → `text-xs`.

- [ ] **Step 5 : Vérifier**

Run: `pnpm check && pnpm test:unit -- --run && pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS. `pnpm check` passe enfin sans erreur sur `Mantra.svelte`, qui référençait encore `content.auteur` depuis la tâche 2.

- [ ] **Step 6 : Commit**

```bash
git add src/lib/components/home/ImmersiveBand.svelte src/lib/components/home/Mantra.svelte src/lib/components/home/EspritAme.svelte src/lib/components/home/PourQui.svelte src/lib/components/home/ContactCta.svelte
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "fix(bandes): texte lisible sur les trois bandes photo

Le blanc et l'ambre se confondaient avec le sable et le feuillage. Le voile
des bandes est renforcé — traitement choisi par le client après comparaison
de trois variantes — sans changer une seule couleur de texte.

Le mantra perd sa signature et garde « états d'esprit » et « états d'âme »
d'un seul tenant ; le titre des deux logiques tient sur une ligne.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7 : Approche — le soleil remplace la fleur de vie

**Files:**
- Modify: `src/lib/components/home/Approche.svelte`

**Interfaces:**
- Consomme : `SunMark` (tâche 3) ; les tokens de la tâche 1.
- Produit : rien.

- [ ] **Step 1 : Importer le composant**

Dans le `<script>` de `src/lib/components/home/Approche.svelte`, après les imports existants :

```ts
	import SunMark from '$lib/components/SunMark.svelte';
```

- [ ] **Step 2 : Remplacer la fleur de vie**

Remplacer l'intégralité du `<svg class="mt-7.5 h-21 w-21 text-coral opacity-90" …>` (les sept `<circle>` de la fleur de vie) par :

```svelte
			<SunMark class="mt-7.5 h-21 w-21 text-coral opacity-90" />
```

- [ ] **Step 3 : Basculer les tailles sur l'échelle**

Dans le même fichier : `text-[clamp(34px,4.6vw,56px)]` → `text-4xl`, les deux `text-[16.5px]` → `text-base`, `text-[25px]` → `text-2xl`, `text-[14.5px]` → `text-sm`, `text-[10px]` → `text-xs`, `text-[10.5px]` → `text-xs`, `text-xs` (la pastille numérotée) → inchangé.

- [ ] **Step 4 : Vérifier**

Run: `pnpm check && pnpm exec playwright test e2e/home.e2e.ts -g "sections ancrées"`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add src/lib/components/home/Approche.svelte
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "feat(approche): le soleil remplace la fleur de vie

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8 : À propos — portrait recentré et largeurs d'image corrigées

**Files:**
- Modify: `src/lib/components/home/APropos.svelte`

**Interfaces:**
- Consomme : les tokens de la tâche 1.
- Produit : rien.

`portrait-cabinet.jpg` fait 1800 × 1200 en paysage et s'affiche dans un cadre portrait 4/5 : le recadrage centré par défaut plaque le visage sur le bord gauche. Et son attribut `sizes` annonce 460 px, largeur calée sur l'ancienne colonne de 1180 px — le navigateur télécharge donc une image trop petite et l'étire, ce qui est la cause du flou signalé par le client.

- [ ] **Step 1 : Recentrer le portrait et corriger sa largeur déclarée**

Dans `src/lib/components/home/APropos.svelte`, remplacer l'`<enhanced:img>` :

```svelte
				<enhanced:img
					src="$lib/assets/portrait-cabinet.jpg"
					alt="Olivier Hildevert dans son cabinet"
					loading="lazy"
					sizes="(min-width: 1024px) 560px, calc(100vw - 2.75rem)"
					class="h-full w-full object-cover object-[22%_center]"
				/>
```

`object-[22%_center]` décale le recadrage vers la gauche pour ramener le visage au centre du cadre portrait.

- [ ] **Step 2 : Basculer les tailles sur l'échelle**

`text-[clamp(34px,4.6vw,56px)]` → `text-4xl`, les trois `text-[15.5px]` → `text-base`, `text-2xl` (la citation) → inchangé, `text-[11px]` → `text-xs`, `text-[10px]` → `text-xs`, `text-[10.5px]` → `text-xs`.

- [ ] **Step 3 : Vérifier**

Run: `pnpm check && pnpm build`
Expected: PASS.

- [ ] **Step 4 : Commit**

```bash
git add src/lib/components/home/APropos.svelte
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "fix(à propos): portrait recentré et largeur d'image corrigée

Le cadre portrait 4/5 rognait une source paysage depuis son centre, plaquant
le visage sur le bord gauche. L'attribut sizes annonçait par ailleurs 460 px,
largeur de l'ancienne colonne de 1180 px : le navigateur téléchargeait une
image trop petite et l'étirait — c'est l'origine du flou constaté.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9 : Boutique — vrais liens externes

**Files:**
- Modify: `src/lib/components/home/Boutique.svelte`, `src/lib/components/home/Prestations.svelte`, `src/lib/components/home/Tarifs.svelte`
- Test: `e2e/home.e2e.ts`

**Interfaces:**
- Consomme : `ProduitBoutique.lien` (tâche 2) ; les tokens de la tâche 1.
- Produit : rien.

Les boutons « Commander » et « Découvrir » appellent aujourd'hui `openBooking()` sur `preventDefault` : cliquer pour acheter le roman ouvre une demande de rendez-vous.

- [ ] **Step 1 : Écrire le test e2e qui échoue**

Dans `e2e/home.e2e.ts`, ajouter :

```ts
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
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec playwright test e2e/home.e2e.ts -g "liens externes"`
Expected: FAIL — `href` vaut `/reservation`, pas une URL externe.

- [ ] **Step 3 : Câbler les vrais liens**

Dans `src/lib/components/home/Boutique.svelte`, remplacer le `<a class="btn btn-line" …>` par :

```svelte
							<a
								class="btn btn-line"
								href={produit.lien}
								target="_blank"
								rel="noopener noreferrer"
							>
								{produit.boutonLabel}
							</a>
```

Puis **supprimer les imports devenus inutiles** en haut du fichier — sans quoi `pnpm lint` échoue :

```ts
	import { reveal } from '$lib/attachments/reveal';
	import type { BoutiqueContent, CleImageBoutique } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';
```

(`resolve` de `$app/paths`, `openBooking` de `$lib/booking/booking.svelte` et la constante locale `const reservation = resolve('/reservation');` disparaissent.)

- [ ] **Step 4 : Basculer les trois sections sur l'échelle**

`Boutique.svelte` : `text-[clamp(34px,5vw,58px)]` → `text-4xl`, `text-[17.5px]` → `text-base`, `text-[26px]` → `text-2xl`, `text-[13.5px]` → `text-sm`, `text-[11px]` → `text-xs`, `text-[10px]` → `text-xs`. Corriger aussi `sizes` : `"(min-width: 1024px) 290px, (min-width: 640px) 240px, 200px"`.

`Prestations.svelte` : `text-[clamp(34px,5vw,58px)]` → `text-4xl`, `text-[17.5px]` → `text-base`, `text-[25px]` → `text-2xl`, `text-sm` → inchangé, `text-[21px]` → `text-lg`, `text-[11px]` → `text-xs`, `text-[10.5px]` → `text-xs`. Corriger `sizes` : `"(min-width: 1024px) 700px, calc(100vw - 2.75rem)"`.

`Tarifs.svelte` : `text-[clamp(34px,5vw,58px)]` → `text-4xl`, les deux `text-[56px]` → `text-[clamp(46px,3.4rem+2vw,70px)]`, les deux `text-xl` (le suffixe €) → `text-[0.4em]`, les deux `text-[13.5px]` → `text-sm`, les deux `text-[10.5px]` → `text-xs`.

- [ ] **Step 5 : Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm lint && pnpm check && pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS. `pnpm lint` en premier : c'est lui qui attrape les imports orphelins.

- [ ] **Step 6 : Commit**

```bash
git add src/lib/components/home/Boutique.svelte src/lib/components/home/Prestations.svelte src/lib/components/home/Tarifs.svelte e2e/home.e2e.ts
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "fix(boutique): « Commander » ouvrait une demande de rendez-vous

Les deux boutons de la boutique appelaient openBooking() : cliquer pour
acheter le roman ouvrait la modale de réservation. Ils pointent désormais
vers l'URL portée par le produit, éditable dans le CMS.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10 : Pied de page et modales

**Files:**
- Modify: `src/lib/components/Footer.svelte`, `src/lib/components/BookingModal.svelte`, `src/lib/components/NewsletterModal.svelte`, `src/routes/newsletter/+page.svelte`
- Test: `e2e/home.e2e.ts`

**Interfaces:**
- Consomme : les tokens de la tâche 1.
- Produit : rien.

Le pied de page porte le même bug que la boutique : l'entrée `{ label: 'olivierhildevert.com' }` de `rdvLinks` n'a pas de `prestation`, son `onclick` appelle donc `openBooking(undefined)` et ouvre la modale de réservation au lieu du site externe.

- [ ] **Step 1 : Écrire le test e2e qui échoue**

Ajouter dans le `describe('liens externes', …)` créé en tâche 9 :

```ts
	test('le lien du site personnel mène hors du site', async ({ page }) => {
		await page.goto('/');
		const lien = page
			.getByRole('contentinfo')
			.getByRole('link', { name: 'olivierhildevert.com', exact: true });
		await expect(lien).toHaveAttribute('href', /^https:\/\//);
		await expect(lien).toHaveAttribute('target', '_blank');
	});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

Run: `pnpm exec playwright test e2e/home.e2e.ts -g "site personnel"`
Expected: FAIL — `href` vaut `/reservation`.

- [ ] **Step 3 : Réparer le lien du pied de page**

Dans `src/lib/components/Footer.svelte`, typer le tableau avec un `href` optionnel :

```ts
	const rdvLinks: { label: string; prestation?: PrestationId; href?: string }[] = [
		{ label: 'Séance individuelle', prestation: 'individuelle' },
		{ label: 'Entreprises', prestation: 'entreprise' },
		{ label: 'Stages & ateliers', prestation: 'stage' },
		{ label: 'olivierhildevert.com', href: 'https://olivierhildevert.com/' }
	];
```

et brancher le rendu sur la présence de `href` :

```svelte
				{#each rdvLinks as link (link.label)}
					{#if link.href}
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
						>
							{link.label}
						</a>
					{:else}
						<a
							href="{reservation}{link.prestation ? '?prestation=' + link.prestation : ''}"
							class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
							onclick={(e) => {
								e.preventDefault();
								openBooking(link.prestation);
							}}
						>
							{link.label}
						</a>
					{/if}
				{/each}
```

Puis basculer l'échelle : `text-2xl` → inchangé, les trois `text-[10.5px]` → `text-xs`, `text-[8.5px]` → `text-xs` avec `tracking-[0.28em]` (le suivi de 0,36em devient trop large à 12,5 px), les `text-sm` → inchangés.

- [ ] **Step 4 : Agrandir les champs et les cibles tactiles des modales**

Dans `src/lib/components/BookingModal.svelte` et `src/lib/components/NewsletterModal.svelte` :

- remplacer **chaque** `text-[15px]` des `<input>` et `<textarea>` par `text-base`. Sous 16 px, Safari iOS zoome automatiquement à la prise de focus et décale la page — c'est la raison d'être de ce changement, ne pas le remplacer par `text-sm`.
- le bouton de fermeture passe de `h-[38px] w-[38px]` à `h-11 w-11` (44 px, seuil de cible tactile), en ajustant `top-3 right-3` pour qu'il reste dans le coin.
- les autres tailles : `text-[clamp(24px,4vw,30px)]` → `text-2xl`, `text-[clamp(24px,4.4vw,30px)]` → `text-2xl`, `text-[clamp(22px,4vw,27px)]` → `text-2xl`, `text-[14.5px]` → `text-sm`, `text-[13.5px]` → `text-sm`, `text-[12.5px]` → `text-xs`, `text-[10.5px]` → `text-xs`, `text-[1.2em]` → inchangé (relatif), `text-xs`/`text-sm`/`text-lg` → inchangés.

Dans `src/routes/newsletter/+page.svelte` : `text-[11px]` → `text-xs`.

- [ ] **Step 5 : Lancer les tests pour vérifier qu'ils passent**

Run: `pnpm lint && pnpm check && pnpm exec playwright test`
Expected: PASS — toute la suite e2e, y compris les parcours de réservation, de contact et de newsletter.

- [ ] **Step 6 : Commit**

```bash
git add src/lib/components/Footer.svelte src/lib/components/BookingModal.svelte src/lib/components/NewsletterModal.svelte src/routes/newsletter/+page.svelte e2e/home.e2e.ts
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "fix(liens, modales): site personnel joignable, champs sans zoom iOS

Le lien « olivierhildevert.com » du pied de page ouvrait la modale de
réservation, comme les boutons de la boutique. Les champs de formulaire
passaient sous 16 px, seuil en dessous duquel Safari iOS zoome tout seul
et décale la page pendant la saisie. Les croix de fermeture atteignent
les 44 px d'une cible tactile.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 11 : Vérification d'ensemble

**Files:**
- Test: `e2e/home.e2e.ts`
- Modify: `README.md`

**Interfaces:**
- Consomme : tout ce qui précède.
- Produit : la preuve que le défaut d'origine est corrigé.

- [ ] **Step 1 : Écrire le test qui prouve que l'échelle est fluide**

C'est le test qui verrouille le motif du lot. Ajouter dans `e2e/home.e2e.ts` :

```ts
test.describe('échelle typographique', () => {
	test('les textes grandissent avec la fenêtre, plancher et plafond respectés', async ({
		page
	}) => {
		await page.goto('/');
		const surtitre = page.locator('.eyebrow').first();
		const taille = async () =>
			parseFloat(await surtitre.evaluate((el) => getComputedStyle(el).fontSize));

		await page.setViewportSize({ width: 390, height: 844 });
		const surMobile = await taille();

		await page.setViewportSize({ width: 2560, height: 1440 });
		const surGrandEcran = await taille();

		// Le défaut d'origine : 11,5 px figés, quelle que soit la taille de l'écran.
		expect(surMobile).toBeGreaterThanOrEqual(12.4);
		expect(surGrandEcran).toBeGreaterThan(surMobile);
		expect(surGrandEcran).toBeGreaterThanOrEqual(14.9);
	});
});
```

- [ ] **Step 2 : Lancer ce test**

Run: `pnpm exec playwright test e2e/home.e2e.ts -g "échelle typographique"`
Expected: PASS — c'est la démonstration chiffrée que le problème rapporté par le client est réglé.

- [ ] **Step 3 : Vérifier qu'il ne reste aucune taille figée**

Le critère porte sur les tailles **figées**, pas sur les `clamp()` :

Run: `grep -rnE 'text-\[[0-9.]+px\]' src/`
Expected: **aucune sortie.** C'est la garantie que plus une seule taille ne reste insensible à la largeur de l'écran.

Puis inspecter à la main ce qu'il reste :

Run: `grep -rn 'text-\[' src/`
Expected: exactement trois familles, toutes volontaires —
1. **quatre `clamp()` sur mesure**, là où aucun palier ne convenait : le nom du site dans l'en-tête (`Header.svelte`), la valeur des repères du hero (`Hero.svelte`), le montant des tarifs (`Tarifs.svelte`, deux occurrences) et la citation du mantra (`Mantra.svelte`) ;
2. **trois couleurs** (`text-[#5E4108]`, `text-[#A55A43]`, `text-[#396CB2]`) et un `color-mix` dans le pied de page ;
3. **deux valeurs relatives** (`text-[0.4em]` dans `Tarifs.svelte`, `text-[1.2em]` dans `NewsletterModal.svelte`).

Toute autre occurrence est un oubli de migration.

Note sur les trois couleurs en dur du hero : elles sortent de la palette « Aurore », ce que la convention du projet interdit en principe, mais **elles passent toutes les trois le contraste AA** sur le fond crème (`#396CB2` → 5,0:1 ; `#A55A43` → 4,7:1 ; `#5E4108` → 8,8:1). Les conserver est délibéré ; leur remontée en tokens est un nettoyage distinct, hors périmètre.

- [ ] **Step 4 : Faire tourner la suite complète**

Run: `pnpm lint && pnpm check && pnpm build && pnpm test:unit -- --run && pnpm exec playwright test`
Expected: tout vert. **Ne rien déclarer terminé sans avoir lu ces sorties.** Le `pnpm build` doit réussir sans `.env` présent.

- [ ] **Step 5 : Consigner les changements du modèle pour le dépôt CMS**

Ajouter au README, dans la section qui décrit la chaîne de contenu Strapi :

```markdown
> **À reporter dans `../olivier-hildevert-cms` avant le premier branchement :**
> le composant « produit boutique » gagne un champ `lien` (texte, URL), et le
> composant « mantra » perd son champ `auteur`. Tant que ce n'est pas fait, le
> mapping de `src/lib/server/content.ts` rejettera la réponse de Strapi et le
> site retombera sur `defaults.ts` (repli tout-ou-rien par domaine).
```

- [ ] **Step 6 : Commit**

```bash
git add e2e/home.e2e.ts README.md
git -c user.name='Sephi' -c user.email='david@kamealabs.com' commit -m "test(e2e): l'échelle typographique suit la largeur de la fenêtre

Verrouille le défaut d'origine : les surtitres étaient figés à 11,5 px quelle
que soit la taille de l'écran, soit illisibles sur un 27 pouces.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Ce que ce plan ne fait pas

Repris de la spec § 10, pour que l'exécutant ne s'y aventure pas :

- **Câbler les vraies URL de la boutique** — le client les posera dans Strapi. Les URL de remplacement sont volontaires.
- **Mettre à jour `../olivier-hildevert-cms`** — signalé au README en tâche 11, fait au moment du branchement.
- **Remplacer `portrait-cabinet.jpg`** par un original mieux défini — dépend du client.
- **Revoir la mise en page de `/contact`, `/reservation`, `/newsletter` et `+error`** — elles héritent de l'échelle fluide par la tâche 1 et deviennent lisibles, mais leur composition n'est pas repensée.
- **Remonter les trois couleurs en dur du hero en tokens de palette** — vérifiées conformes AA, nettoyage distinct.
- **Le « sun chart » animé du hero**, volontairement absent depuis le handoff, le reste.

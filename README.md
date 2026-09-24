# olivier-hildevert

Site vitrine construit avec SvelteKit (Svelte 5), Tailwind CSS v4 et Strapi comme CMS headless. Déployé sur Vercel.

## Stack

- **SvelteKit 2 / Svelte 5** (TypeScript, runes) — scaffold via la [CLI officielle `sv`](https://github.com/sveltejs/cli)
- **Tailwind CSS v4** (config CSS-first dans `src/routes/layout.css`, plugins typography + forms)
- **Formulaires** : [sveltekit-superforms](https://superforms.rocks) v2 + zod v4 (adapter `zod4`) — exemple complet sur `/contact`, avec amélioration progressive (fonctionne sans JavaScript)
- **Contenu** : par défaut `src/lib/content/` (fallback), lecture serveur via `src/lib/server/content.ts` (Strapi + fallback, client typé dans `src/lib/server/strapi.ts`), écriture des formulaires via `src/lib/server/forms.ts` (Strapi est un service séparé, voir Configuration)
- **Tests** : Vitest (unitaires + composants en mode navigateur) et Playwright (E2E dans `e2e/`)
- **Déploiement** : Vercel via `@sveltejs/adapter-vercel` (configuré dans `vite.config.ts` — pas de `svelte.config.js`)

## Démarrage

```sh
pnpm install
pnpm dev
```

## Configuration (Strapi)

Le site builde et tourne **sans** Strapi : si `STRAPI_URL`/`STRAPI_API_TOKEN`
sont absents ou que le CMS est injoignable, le site sert son contenu par
défaut (`src/lib/content/defaults.ts`) — jamais de page cassée.

Le CMS est un dépôt séparé, cloné en frère de celui-ci : `../olivier-hildevert-cms`
(Strapi 5, TypeScript, SQLite en dev).

> **À reporter dans `../olivier-hildevert-cms` avant le premier branchement :**
> le composant « produit boutique » gagne un champ `lien` (texte, URL) — il
> est **obligatoire** côté front (`content.ts`), donc tant qu'il manque côté
> CMS, le mapping rejette la réponse de Strapi et le site retombe sur
> `defaults.ts` (repli tout-ou-rien par domaine). Le composant « mantra »
> perd de son côté son champ `auteur` : à retirer côté CMS pour rester
> cohérent avec le front, mais son maintien est **sans effet** sur le site —
> zod (mode « strip » par défaut, sans `.strict()`) l'ignore silencieusement
> plutôt que de rejeter la réponse.

```sh
cp .env.example .env
# puis renseigner STRAPI_URL et STRAPI_API_TOKEN
```

- **Démarrer le CMS** : `cd ../olivier-hildevert-cms && npm install && npm run develop`
  (admin sur `http://localhost:1337/admin`).
- **Token API** (`STRAPI_API_TOKEN`) : token custom `site-web` à créer dans
  l'admin Strapi — permissions exactes documentées dans le
  `README.md` du dépôt CMS.
- **Seed du contenu initial** (idempotent) :
  ```sh
  npx tsx scripts/export-defaults.ts          # ici : écrit scripts/seed-data.json côté CMS
  cd ../olivier-hildevert-cms
  STRAPI_SEED_TOKEN=<token full access temporaire> node scripts/seed.mjs
  ```
- **Déploiement (Vercel)** : définir `STRAPI_URL` et `STRAPI_API_TOKEN` dans
  les variables d'environnement du projet Vercel. Sans elles (ou si le CMS
  est indisponible), le site sert simplement son contenu par défaut.

Exemple d'usage dans une load function : voir le docblock de `src/lib/server/strapi.ts`.

## Commandes

| Commande         | Description                                     |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Serveur de développement                        |
| `pnpm build`     | Build de production (adapter Vercel)            |
| `pnpm preview`   | Prévisualisation du build                       |
| `pnpm check`     | svelte-check + TypeScript                       |
| `pnpm lint`      | Prettier + ESLint                               |
| `pnpm format`    | Formatage Prettier                              |
| `pnpm test:unit` | Tests Vitest (`--run` pour un seul passage)     |
| `pnpm test:e2e`  | Tests Playwright (build + preview automatiques) |
| `pnpm test`      | Tous les tests                                  |

## Structure

```
src/
├── lib/
│   ├── config.ts            # Nom du site, URL, description, navigation
│   ├── content/              # Contenu par défaut (fallback, sans CMS)
│   └── server/
│       ├── strapi.ts        # Client Strapi typé (serveur uniquement)
│       ├── content.ts       # Lecture contenu : Strapi + fallback
│       └── forms.ts         # Écriture des soumissions de formulaires
└── routes/
    ├── +layout.svelte       # Header / nav / footer
    ├── +page.svelte         # Accueil
    ├── +error.svelte        # Page d'erreur (404, …)
    ├── layout.css           # Tailwind v4 + tokens @theme
    ├── contact/             # Formulaire Superforms + zod (schéma, action, tests)
    └── sitemap.xml/         # Sitemap prerendered (routes statiques + slugs Strapi à terme)
```

## Assets

### `hero-mer.jpg`

Le fond du hero est une image générée (Nano Banana), versée telle quelle, sans
recompression : `enhanced-img` en dérive les variantes AVIF/WebP/JPEG
(qualité 80, cf. `?quality=80` dans `Hero.svelte`). Les variantes ne dépassent
jamais la largeur de la source : la remplacer par une version plus large
(idéalement ≥ 2880 px, 16:9) améliore directement la netteté sur grand écran.
Garder le sujet (soleil, reflet) vers le centre-droit : sur mobile, l'image est
recadrée en portrait autour de `object-position` 68 %.

## Recréer ce socle

```sh
pnpm dlx sv@0.16.3 create --template minimal --types ts \
  --add tailwindcss="plugins:typography,forms" vitest="usages:unit,component" \
        playwright eslint prettier sveltekit-adapter="adapter:vercel" --install pnpm .
pnpm add sveltekit-superforms zod
```

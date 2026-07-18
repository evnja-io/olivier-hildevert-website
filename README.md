# olivier-hildevert

Site vitrine construit avec SvelteKit (Svelte 5), Tailwind CSS v4 et Strapi comme CMS headless. Déployé sur Vercel.

## Stack

- **SvelteKit 2 / Svelte 5** (TypeScript, runes) — scaffold via la [CLI officielle `sv`](https://github.com/sveltejs/cli)
- **Tailwind CSS v4** (config CSS-first dans `src/routes/layout.css`, plugins typography + forms)
- **Formulaires** : [sveltekit-superforms](https://superforms.rocks) v2 + zod v4 (adapter `zod4`) — exemple complet sur `/contact`, avec amélioration progressive (fonctionne sans JavaScript)
- **Contenu** : client Strapi v5 typé dans `src/lib/server/strapi.ts` (Strapi est un service séparé, voir Configuration)
- **Tests** : Vitest (unitaires + composants en mode navigateur) et Playwright (E2E dans `e2e/`)
- **Déploiement** : Vercel via `@sveltejs/adapter-vercel` (configuré dans `vite.config.ts` — pas de `svelte.config.js`)

## Démarrage

```sh
pnpm install
pnpm dev
```

## Configuration (Strapi)

Le site builde et tourne **sans** Strapi. Pour brancher le contenu :

```sh
cp .env.example .env
# puis renseigner STRAPI_URL et STRAPI_API_TOKEN
```

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
│   └── server/strapi.ts     # Client Strapi typé (serveur uniquement)
└── routes/
    ├── +layout.svelte       # Header / nav / footer
    ├── +page.svelte         # Accueil
    ├── +error.svelte        # Page d'erreur (404, …)
    ├── layout.css           # Tailwind v4 + tokens @theme
    ├── contact/             # Formulaire Superforms + zod (schéma, action, tests)
    └── sitemap.xml/         # Sitemap prerendered (routes statiques + slugs Strapi à terme)
```

## Recréer ce socle

```sh
pnpm dlx sv@0.16.3 create --template minimal --types ts \
  --add tailwindcss="plugins:typography,forms" vitest="usages:unit,component" \
        playwright eslint prettier sveltekit-adapter="adapter:vercel" --install pnpm .
pnpm add sveltekit-superforms zod
```

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

## Recréer ce socle

```sh
pnpm dlx sv@0.16.3 create --template minimal --types ts \
  --add tailwindcss="plugins:typography,forms" vitest="usages:unit,component" \
        playwright eslint prettier sveltekit-adapter="adapter:vercel" --install pnpm .
pnpm add sveltekit-superforms zod
```

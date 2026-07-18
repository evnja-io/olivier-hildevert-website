# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site vitrine français (SvelteKit 2 / Svelte 5 runes, TypeScript) déployé sur Vercel, contenu à terme via Strapi (service séparé, non inclus dans ce dépôt). Tout le texte visible par l'utilisateur est en français.

## Commandes

```sh
pnpm dev                 # serveur de développement
pnpm build               # build prod (DOIT réussir sans .env — le client Strapi est en env paresseux)
pnpm check               # svelte-check + tsc
pnpm lint                # prettier --check + eslint ; corriger le formatage avec pnpm format
pnpm test:unit -- --run  # tous les tests Vitest
pnpm test:unit -- --run src/routes/contact/schema.test.ts   # un seul fichier de test
pnpm exec playwright test                 # E2E (build + preview auto sur le port 4173)
pnpm exec playwright test e2e/contact.e2e.ts -g "succès"    # un seul test E2E
```

`pnpm test:e2e` fonctionne aussi mais relance `playwright install` à chaque fois — préférer `pnpm exec playwright test`.

## Architecture — points non évidents

- **Pas de `svelte.config.js`** : toute la config SvelteKit (adapter Vercel, `compilerOptions.runes` forcé) est passée en options du plugin `sveltekit()` dans `vite.config.ts`. Ne pas créer de svelte.config.js.
- **Tailwind v4, config CSS-first** : pas de `tailwind.config.js`. Les tokens (`@theme`), les utilities maison (`btn`, `btn-sun`, `btn-line`, `eyebrow`, `wrap`, `.reveal`) et les plugins (`@plugin`) vivent dans `src/routes/layout.css`, importé par `+layout.svelte`.
- **Palette « Aurore » exclusive** : `--color-*: initial` dans `@theme` désactive la palette Tailwind par défaut — `gray-*`, `red-*`, etc. ne compilent pas. Utiliser uniquement les tokens du design (sky, blush, ink, ink-soft, mute, line, amber, coral, ember, rose, plum, dusk, surface…). Polices auto-hébergées via `@fontsource` (RGPD, pas de CDN Google).
- **Images via `@sveltejs/enhanced-img`** (`enhancedImages()` avant `sveltekit()` dans vite.config.ts) : sources optimisées dans `src/lib/assets/` (pré-réduites depuis le handoff design ~30 Mo → ~3 Mo), balise `<enhanced:img>`, imports `?enhanced` pour les listes (cf. `Prestations.svelte`).
- **Réservation** : état global de la modale dans `src/lib/booking/booking.svelte.ts` (runes en portée module, `openBooking(id?)`) ; la modale `BookingModal.svelte` poste vers l'action de `/reservation` (`superForm(defaults(adapter))`, sans load). Chaque déclencheur est un vrai lien vers `/reservation?prestation=…` + `onclick preventDefault` — le parcours fonctionne sans JavaScript via la page `/reservation`.
- **Newsletter** : même architecture que la réservation — état `src/lib/newsletter/newsletter.svelte.ts`, `NewsletterModal.svelte` poste vers l'action de `/newsletter` (page fallback sans modale). Déclenchement exit-intent desktop-only dans `src/lib/newsletter/exit-intent.ts` (`pointer: fine`, `mouseleave` par le haut du viewport, armement 15 s, jamais si un `<dialog>` est déjà ouvert) ; persistance localStorage `newsletter:subscribed` (définitif) / `newsletter:snooze-until` (30 j après fermeture sans inscription). Les e2e pilotent le délai d'armement avec `page.clock` et simulent la sortie via `dispatchEvent('html', 'mouseleave', { clientY: 0 })`.
- **Design de référence** : handoff Claude Design « Accueil — Aurore » (prototype HTML/CSS hors dépôt). Le « sun chart » animé du hero est volontairement absent (masqué dans le prototype final) — add-back isolé possible en recréant un `SunChart.svelte` + `shell.png` du handoff.
- **Vitest a deux projets** (définis dans `vite.config.ts`) : `client` exécute `src/**/*.svelte.{test,spec}.ts` dans un vrai Chromium (browser mode, nécessite `pnpm exec playwright install chromium`) ; `server` exécute les autres `src/**/*.{test,spec}.ts` en Node. Les tests sont colocalisés avec le code (convention du projet). Playwright ne ramasse que `**/*.e2e.ts` (dossier `e2e/`).
- **Formulaires = Superforms v2 + zod v4** : utiliser l'adapter `zod4` (`sveltekit-superforms/adapters`) — l'adapter `zod` est réservé à zod v3. Créer l'adapter en portée module pour le cache. zod v4 : `z.email()` est top-level. Modèle de référence complet : `src/routes/contact/` (schéma partagé, action serveur, page avec `use:enhance`, amélioration progressive — le formulaire doit fonctionner sans JavaScript).
- **Client Strapi** (`src/lib/server/strapi.ts`) : utilise `$env/dynamic/private` avec vérification paresseuse pour que le build passe sans `.env`. Si des pages Strapi deviennent prerendered un jour, basculer vers `$env/static/private` (l'env dynamique est indisponible au prerendering). Formes Strapi v5 : attributs à plat, `documentId`.
- **`src/lib/config.ts`** est la source unique du nom du site, de l'URL canonique, de la description et de la navigation — utilisée par le layout, les `<svelte:head>` et `src/routes/sitemap.xml/+server.ts` (ajouter toute nouvelle route statique au tableau `routes` du sitemap).
- **Liens internes via `resolve()`** de `$app/paths` (règle eslint `svelte/no-navigation-without-resolve`).
- Le rune-mode est forcé sur tout le projet ; `+error.svelte` et le layout lisent `page` depuis `$app/state` (pas `$app/stores`, déprécié).

## Pièges connus

- Un POST direct (curl, etc.) vers une action de formulaire sans en-tête `Origin` correspondant renvoie 403 : c'est la protection CSRF de SvelteKit, pas un bug.
- Le commentaire `// svelte-ignore state_referenced_locally` au-dessus de `superForm(data.form)` est voulu (Superforms capture la valeur initiale par design) ; le code d'ignore doit être seul sur sa ligne, sans texte à la suite.

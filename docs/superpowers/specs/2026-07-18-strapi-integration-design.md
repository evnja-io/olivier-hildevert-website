# Intégration Strapi v5 — contenu administrable

## Contexte

Le site vitrine (SvelteKit 2 / Svelte 5 runes, Vercel) a tout son contenu éditorial codé en dur dans les composants. Le client Strapi (`src/lib/server/strapi.ts`) est écrit mais consommé nulle part. Objectif : rendre tout le contenu éditorial administrable par Olivier via un CMS Strapi v5, sans dégrader la robustesse (le site doit vivre sans Strapi) ni la performance (ISR).

**Décisions actées avec l'utilisateur :**
1. Tout le contenu éditorial est administrable (sections home + footer/mentions/coordonnées) ; la structure/ordre des sections et le design restent dans le code.
2. Nouveau projet Strapi v5 dans un dépôt séparé : `/home/sephi/olivier-hildevert-cms` (SQLite en dev, schémas versionnés).
3. Fallback : le contenu en dur actuel devient le contenu par défaut si Strapi est indisponible/non configuré. Le build passe toujours sans `.env`.
4. Images : restent locales (enhanced-img), appariées au contenu CMS par clé stable.
5. Les 3 formulaires (contact, réservation, newsletter) écrivent dans des collections Strapi. E-mail (Resend) hors périmètre.
6. Fraîcheur : ISR Vercel ~5 min.

**Point technique tranché (doc adapter-vercel vérifiée) :** l'ISR se configure **par route** (`export const config: Config = { isr: { expiration: 300 } }` dans `+page.server.ts`), pas dans `vite.config.ts`. ISR ≠ prerendering → `$env/dynamic/private` reste compatible : `strapi.ts` ne change pas de mécanisme d'env.

## Content model (dépôt CMS séparé)

**`page-accueil`** (single type, Draft & Publish activé) : un composant non répétable par section — `hero` (textes, 2 boutons, 3 stats), `approche` (intro + 7 strates répétables), `espritAme` (deux champs nommés `colonneEsprit`/`colonneAme`, chacun tag/titre/desc/4 points — variante implicite, ordre non cassable), `aPropos` (bio 3 §, citation, 5 chips), `prestationsIntro`, `pourQui` (9 chips), `boutique` (intro + produits répétables `{cleImage enum(livre|veilleuses), tag, titre, description, prixTexte, boutonLabel}`), `tarifs` (cartes répétables `{label, montant, sousTexte, prestationCle enum, misEnAvant}`), `mantra`, `contactCta` (titre, §, bouton, 3 modes).

**`prestation`** (collection, 4 entrées, D&P activé) — unifie les 3 rédactions divergentes actuelles en une entrée par prestation avec champs distincts : `cle` (enum individuelle|programme|entreprise|stage, unique), `ordre`, `titre` (partagé modale + carte), `metaReservation`, `descReservation` (courte, modale), `descCarte` (longue, home), `prixCarte`, `actionCarte`. Les cartes Tarifs ne dérivent pas de la collection (3 cartes ≠ 4 prestations) — elles vivent dans `page-accueil` avec `prestationCle` pour le lien.

**`reglages-site`** (single type, D&P activé) : tagline, descriptionSeo, mentionLegale, footerIntro, sousTitreLogo, coordonnées optionnelles (email, telephone, adresse, siteExterne). La nav reste dans `config.ts`.

**Collections formulaires** (D&P désactivé) : `message-contact`, `demande-reservation`, `inscrit-newsletter` (email unique).

**Auth :** un API Token custom unique, côté serveur uniquement (`STRAPI_API_TOKEN`) : find sur les 3 contenus, create seulement sur les 3 collections formulaires (pas de find → pas de lecture de données perso). Rôle Public : aucune permission. Pas d'i18n.

## Côté SvelteKit (fichiers clés)

- **`src/lib/content/types.ts`** (nouveau, hors `server/`) : types front écrits à la main (`PageAccueilContent`, `ReglagesSite`, `PrestationContent`…), découplés de la forme Strapi.
- **`src/lib/content/defaults.ts`** (nouveau) : tout le contenu en dur actuel extrait des composants — fallback ET source du seed.
- **`src/lib/server/content.ts`** (nouveau) : `getPageAccueil(fetch)`, `getReglages(fetch)`, `getPrestations(fetch)` — si non configuré → défauts directs ; sinon fetch avec `populate` profond explicite (point fragile de Strapi v5, à couvrir en test), mapping vers types front, try/catch + `data: null` (non publié) → défauts + `console.warn`. **Fallback tout-ou-rien par domaine** (pas de merge champ-à-champ) — 3 domaines indépendants.
- **`src/lib/server/strapi.ts`** (étendre) : `isStrapiConfigured()`, `createEntry(collection, data, fetcher)` (POST `{ data }`, `StrapiError` sur échec).
- **`src/routes/+layout.server.ts`** (nouveau) : charge `reglages` + `prestations` (consommés par Footer/BookingModal partout).
- **`src/routes/+page.server.ts`** (nouveau) : `config: Config = { isr: { expiration: 300 } }` + load de `accueil`. Pas de bypassToken en v1. Les routes formulaires restent SSR pur (pas d'ISR sur des form actions).
- **Composants home + Footer + BookingModal** : passent des constantes locales à des props avec défaut (`let { content = defaultAccueil.hero } = $props()`). Images/alt/position restent en dur, appariées par clé (`IMAGES_PRESTATIONS[cle]`, clé inconnue ignorée avec warn). `Tarifs.svelte` et `Boutique.svelte` factorisent leur markup dupliqué en `{#each}`.
- **`src/lib/booking/prestations.ts`** : `PRESTATION_IDS`/`PrestationId` **restent statiques** (z.enum, images, `?prestation=`, e2e) ; `getPrestations` filtre les clés inconnues et complète les manquantes par les défauts (garantit toujours 4 entrées). Ajouter/retirer une prestation = dev, documenté.
- **Actions formulaires** : non configuré → comportement actuel (log + succès, e2e verts) ; configuré + échec POST → `message(form, …, { status: 500 })` en français ; newsletter : email déjà inscrit (400 unique) = succès (idempotence). Progressive enhancement intacte.
- `sitemap.xml` et `vite.config.ts` : inchangés.

## Seed

Dépôt SvelteKit : `scripts/export-defaults.ts` (via `npx tsx`) sérialise `defaults.ts` → `seed-data.json`. Dépôt CMS : `scripts/seed.mjs` (Node natif, REST, token full-access local), idempotent (PUT single types, lookup par `cle` pour les prestations, `?status=published`).

## Tests

- Unit server : `content.test.ts` (mapping fixtures Strapi v5, fallback si échec/null/non-configuré, filtrage clés, complétion), `strapi.test.ts` (`createEntry`), actions (3 comportements). Env via `vi.stubEnv`, fetch injecté.
- Unit client : un test `Prestations.svelte.test.ts` (props affichées, défauts sans props).
- E2e : **inchangés et verts sans Strapi** — c'est le test d'acceptation du fallback (build+preview sans `.env`).
- Bout-en-bout dev : CMS local + seed + token → `pnpm dev` → modifier/publier dans l'admin → visible ; dépublier → fallback ; 3 formulaires → entrées dans l'admin ; couper Strapi → site intact + message d'erreur au submit.

## Ordre d'implémentation

1. **Refactor pur SvelteKit** (sans Strapi) : `types.ts` + `defaults.ts`, composants en props avec défauts, unification prestations. Vérif : site visuellement identique, check/unit/e2e verts. C'est l'étape qui dérisque tout.
2. **Dépôt CMS** : init Strapi v5, content model, D&P, token, schémas committés.
3. **Lecture** : `content.ts`, `+layout.server.ts`, `+page.server.ts` + ISR, head sur `reglages`, tests mapping/fallback.
4. **Écriture** : `createEntry`, branchement des 3 actions, tests.
5. **Seed** : export-defaults + seed.mjs.
6. **Bouclage** : parcours bout-en-bout complet, README des deux dépôts (token/seed/env Vercel).

## Risques

- Dérive types TS ↔ schémas Strapi (pas de génération de types) : mitigée par fixtures de mapping + fallback tout-ou-rien.
- `populate` profond Strapi v5 : le point le plus fragile, à figer dans `content.ts` et tester.
- Unification des titres de prestations (« Entreprise(s) & dirigeants ») : vérifier les sélecteurs e2e `getByRole(name)` après coup.
- `+layout.server.ts` ajoute un fetch Strapi par requête SSR des pages formulaires : acceptable ; memo TTL 60 s en évolution si besoin.
- Latence de publication jusqu'à 5 min (ISR) : `bypassToken` en évolution future si irritant.

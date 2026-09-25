# Pages « En savoir plus » des prestations

**Date :** 2026-09-25
**Branche de départ :** `main` (après `c443714`)
**Statut :** design validé, prêt pour le plan d'implémentation
**Dépôts concernés :** `olivier-hildevert-website` et `olivier-hildevert-cms`

---

## 1. Problème

Retours client du 2026-09-25 : un clic sur une carte de prestation ouvrait systématiquement la modale « Prendre rendez-vous ». Le client veut, pour chaque carte, un bouton **« En savoir plus »** donnant accès à un espace de texte explicatif, en plus du bouton d'action.

Le lot A (commit `5b1f468`, en production) a déjà retiré les numéros et les prix des cartes, rendu la carte non cliquable et posé le bouton d'action (Réserver, Découvrir, Contacter, Participer). Ce lot B ajoute le bouton « En savoir plus » et les pages qu'il ouvre.

## 2. Décisions validées

| Décision                                          | Choix retenu                                                                                        | Alternatives écartées                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Emplacement du texte explicatif                   | **Page dédiée par prestation** `/prestations/<cle>` (référencement, texte long, fonctionne sans JS) | modale ; dépliant dans la carte                                    |
| Rédaction du texte long                           | **Provisoire visible**, le client rédige dans Strapi                                                | attendre le texte ; premier jet rédigé par Claude                  |
| Format du texte long                              | **Markdown** (champ Strapi « Rich text ») : gras, listes, intertitres                               | paragraphes simples ; éditeur « Blocks » (rendu Svelte à écrire)   |
| Infos pratiques (prix, durée, format) sur la page | **Champ optionnel, au cas par cas** — vide, rien ne s'affiche                                       | bloc systématique depuis `metaReservation` ; aucune info           |
| Modèle de données                                 | **Deux champs ajoutés à la collection `prestation` existante** + route dynamique unique             | collection Strapi séparée « Page prestation » ; 4 routes statiques |

## 3. Données et migration

### 3.1 Site

`PrestationContent` (`src/lib/content/types.ts`) :

- **ajout** `descLongue: string` — Markdown ;
- **ajout** `infosPratiques?: string` — une ligne, ex. « 140 € · 1 h 30 · par téléphone » ;
- **retrait** `prixCarte` — plus affiché nulle part depuis le lot A.

`defaultPrestations` (`src/lib/content/defaults.ts`) : `descLongue` vaut pour les 4 prestations le texte provisoire **« Présentation détaillée à venir. »** ; `infosPratiques` absent.

Validation (`src/lib/server/content.ts`, `prestationSchema`) — **tolérante pendant la transition** :

- `descLongue` optionnel côté Strapi ; absent, vide ou `null` → texte par défaut de la même clé ;
- `infosPratiques` : helper `optionnel` existant (`null` → absent) ;
- `prixCarte` retiré du schéma (zod ignore les clés en trop : l'ancien Strapi reste valide).

Cette tolérance est définitive pour `descLongue` : un champ vidé par erreur dans l'administration ne doit pas faire retomber tout le domaine Prestations sur ses défauts.

### 3.2 CMS

- `src/api/prestation/content-types/prestation/schema.json` : **ajout** `descLongue` (`richtext`, requis), `infosPratiques` (`string`, facultatif) ; **retrait** `prixCarte`.
- `src/components/sections/contact-cta.json` : **retrait** `modes` (reliquat abandonné par le site au commit `7a1222e`, toujours requis par le schéma).
- `scripts/verifier-conformite.mjs` : contrat mis à jour (`descLongue` ajouté, `prixCarte` et `contactCta.modes` retirés).
- `scripts/seed-data.json` : régénéré depuis le site (`npx tsx scripts/export-defaults.ts`) — il était resté figé bien avant le lot A.
- `config/middlewares.ts` : retrait de l'origine CORS morte `https://olivier-hildevert.vercel.app`.
- Script gardé de remplissage (modèle `scripts/maj-contenu-2026-09-25.mjs`) : écrit le texte provisoire dans `descLongue` des 4 prestations **seulement si le champ est vide** ; simulation par défaut, `--appliquer` pour écrire, jeton temporaire d'écriture.

### 3.3 Ordre de déploiement

La validation du site est tout-ou-rien par domaine ; aucun moment ne doit la faire échouer.

1. **Site** (Vercel) : pages, cartes et validation tolérante. Fonctionne sur le Strapi actuel — les pages affichent le texte provisoire des défauts.
2. **CMS** (Railway) : migration du schéma. Strapi supprime les colonnes retirées et crée les nouvelles vides ; le site les tolère.
3. **Remplissage** : script gardé (simulation, puis `--appliquer` lancé par l'utilisateur).
4. **Contrôle** : `npm run verifier` contre la production, puis visite des 4 pages en ligne.

Suppression de `prixCarte` et `modes` : les valeurs existantes sont perdues. Elles ne sont plus lues par le site ; `prixCarte` est de toute façon reproductible dans `infosPratiques` si le client le souhaite.

## 4. Cartes de l'accueil (`Prestations.svelte`)

- **Deux boutons** en pied de carte :
  - action — `btn btn-sun`, inchangé (ouvre la modale, repli `/reservation?prestation=<cle>`) ;
  - **« En savoir plus »** — `btn btn-line`, lien vers `/prestations/<cle>`.
- Côte à côte quand la place le permet (grille à 2 colonnes) ; **empilés pleine largeur** à 4 colonnes (`xl`), où la carte n'offre que ~250 px utiles.
- **La photo et le titre mènent aussi à la page** de la prestation (liens distincts, pas de lien englobant : la carte reste un `<article>`). Le lien de la photo est `tabindex="-1"` et `aria-hidden="true"` pour ne pas doubler celui du titre au clavier et au lecteur d'écran.

## 5. Page `/prestations/[cle=prestation]`

### 5.1 Routage

- `src/params/prestation.ts` : matcher `(param) => PRESTATION_IDS.includes(param)` — une clé inconnue donne un 404 standard (`+error.svelte`).
- `+page.server.ts` : lit `prestations` depuis les données du layout parent (`await parent()`) — **aucun appel Strapi supplémentaire** ; rend le Markdown côté serveur ; `export const config = { isr: { expiration: 300 } }` comme l'accueil.

### 5.2 Contenu, de haut en bas

1. surtitre « Prestations » (`eyebrow`, lien vers `/#prestations`) ;
2. titre `h1` ;
3. `descCarte` en chapô ;
4. `infosPratiques` si renseigné (ligne mono, style des infos du hero) ;
5. photo de la carte, grand format (`enhanced:img`, même appariement par clé que `Prestations.svelte` — table d'images extraite dans un module partagé `src/lib/booking/images.ts` pour ne pas la dupliquer) ;
6. texte long rendu ;
7. bouton d'action (`actionCarte`) — ouvre la modale de la prestation, repli `/reservation?prestation=<cle>` sans JS ;
8. bandeau « Voir les autres accompagnements » : les 3 autres prestations en petites cartes (photo, titre, lien vers leur page).

### 5.3 Rendu Markdown

- Dépendance ajoutée : `marked`.
- `src/lib/server/markdown.ts` : `renderMarkdown(source: string): string`. Le HTML brut saisi dans Strapi est **échappé, jamais interprété** (surcharge du rendu des jetons `html`). Liens : `rel="noopener noreferrer"` et `target="_blank"` pour les URL externes.
- Styles : bloc `.texte-riche` dans `src/routes/layout.css` (paragraphes, `h2`/`h3`, listes, `strong`, liens) avec les tokens de la palette Aurore — le plugin `@tailwindcss/typography` est déclaré dans `layout.css` mais inutilisé, et ses couleurs par défaut reposent sur la palette Tailwind désactivée (`--color-*: initial`).

### 5.4 Référencement

- `<title>` : « <titre> — Olivier Hildevert » ; `description` : `descCarte` ; `canonical` : `${site.url}/prestations/<cle>`.
- `src/routes/sitemap.xml/+server.ts` : ajout des 4 URL, générées depuis `PRESTATION_IDS`.

## 6. Tests

- **Unitaires (Node)** : `renderMarkdown` (gras, listes, intertitres conservés ; `<script>` et HTML brut échappés ; liens externes en nouvel onglet) ; matcher `prestation` ; défauts (`descLongue` présent pour les 4, `prixCarte` absent) ; `getPrestations` (`descLongue` absent ou `null` → défaut de la clé, domaine non déclassé).
- **Composant (navigateur)** : chaque carte porte 2 liens-boutons (action + « En savoir plus » vers `/prestations/<cle>`) et sa photo et son titre pointent vers la page.
- **E2E** :
  - « En savoir plus » de chaque carte mène à la bonne page (`h1`, texte provisoire) ;
  - `/prestations/inconnue` → 404 ;
  - le bouton d'action de la page ouvre la modale sur la bonne prestation ;
  - sans JavaScript, le bouton d'action pointe vers `/reservation?prestation=<cle>` ;
  - le sitemap liste les 4 pages.
- **CMS** : `npm run verifier` sur le nouveau contrat, contre la production après migration.

## 7. Hors périmètre

- Rédaction du texte long définitif (client, dans Strapi).
- Images propres à chaque page (la photo de la carte est réutilisée ; une image dédiée reste une modification de code).
- Lien des prestations dans le menu principal : la navigation passe par l'accueil et le pied de page.

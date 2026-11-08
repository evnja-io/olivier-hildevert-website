# Retours du 11/11 : fascicules retirés, audios recentrés, pop-up, section Avis

**Date :** 2026-11-08
**Échéance client :** 2026-11-11, 11 h 11
**Branche de départ :** `feat/menu-sans-ressources` (après `013c45b`)
**Dépôts concernés :** `olivier-hildevert-website` (lots 1 et 2) et `olivier-hildevert-cms` (lot 2 seulement)

---

## 1. Intention

Olivier prépare la mise en ligne du 11/11. Il n'aura pas le temps de remplir les fascicules d'ici là. Il trouve aussi que l'accueil répète deux fois l'accès aux audios : son pavé « Catalogue audio » de la Boutique, un produit qu'il a créé lui-même dans Strapi et qui mène aux audios, suffit. Il veut que les visiteurs puissent **emporter** les audios sans connaître le clic droit, une pop-up de newsletter réécrite à sa façon, et une nouvelle section **Avis** pour rassurer les visiteurs qui hésitent, avec les mots de personnes déjà accompagnées.

Le point commun de ces retours, c'est d'alléger et de clarifier pour une mise en ligne propre, en ne montrant rien de vide ou de redondant.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**

1. Le site ne montre plus aucun fascicule : pas de page, pas de lien, pas de section, pas d'entrée dans le sitemap.
2. L'accueil n'a plus de section « Audios ». La page `/audios` reste, avec un nouvel en-tête.
3. Un bouton « À emporter ! » sous chaque lecteur audio, qui **enregistre** le fichier sur l'appareil.
4. Les nouveaux textes de la pop-up de newsletter.
5. Une section **Avis** sur l'accueil (3 cartes) et une page `/avis` qui les liste tous, alimentées par Olivier dans Strapi en mode livre d'or.

**Non-objectifs**

- Les visiteurs ne déposent pas d'avis sur le site (pas de formulaire, pas de modération).
- Pas de note en étoiles, de photo ou de date affichée sur les avis.
- Pas d'entrée « Avis » dans le menu principal.
- On ne supprime pas la collection Strapi `fascicule` ni les données qu'Olivier aurait saisies.

**Anti-objectifs** (ce qui ferait échouer la livraison même si tout « marche »)

- Le bouton « À emporter ! » ouvre le fichier dans un nouvel onglet ou un lecteur au lieu de l'enregistrer, ce qui revient au problème actuel.
- La page d'accueil retombe entière sur les textes par défaut parce que le site a été déployé avant le CMS (cf. § 6).
- Un avis mal saisi fait disparaître toute la section Avis.
- Un lien mort vers `/fascicules` reste quelque part (pied de page, sitemap, ancres).

## 3. Lot 1 : retraits, textes et téléchargement

Ce lot doit pouvoir partir seul, même si le lot 2 n'est pas prêt le 11/11. Seul le téléchargement (§ 3.3) touche au CMS, et son déploiement n'impose pas d'ordre.

### 3.1 Fascicules retirés du site

- Supprimer la route `src/routes/fascicules/`. `/fascicules` répond alors 404 : la page était vide et n'a pas été annoncée. _Choix de ma part._
- Accueil : retirer le `CatalogueAccueil` des fascicules (`src/routes/+page.svelte`) et l'appel à `getFascicules` dans `src/routes/+page.server.ts`.
- Pied de page : retirer le lien « Fascicules » (`src/lib/components/Footer.svelte`).
- Sitemap : retirer `/fascicules` du tableau `routes` (`src/routes/sitemap.xml/+server.ts`).
- **On garde** `CarteFascicule.svelte`, `getFascicules`, les types, la clé `fascicules` de la page d'accueil et la collection Strapi, pour pouvoir remettre la rubrique plus tard en réactivant la route et la section. _Choix de ma part, que l'utilisateur n'a pas contesté._ Le CLAUDE.md doit dire que les fascicules sont **en sommeil** : code et CMS présents, aucune exposition sur le site.
- Les e2e qui visitent `/fascicules` ou attendent son lien (`e2e/catalogues.e2e.ts`) sont adaptés : ils vérifient l'**absence** du lien et de l'entrée du sitemap.

### 3.2 Audios : plus de section sur l'accueil, nouvel en-tête de `/audios`

- Accueil : retirer le `CatalogueAccueil` des audios et l'appel à `getAudios` dans `+page.server.ts`. L'accès aux audios passe par le pavé « Catalogue audio » de la Boutique (contenu Strapi d'Olivier) et par le lien « Audios » du pied de page, qui reste.
- L'en-tête de `/audios` vient de la clé `audios` de la page d'accueil (`PageAccueilContent.audios`) : c'est elle qu'Olivier ne trouvait pas. Nouveaux **défauts** dans `src/lib/content/defaults.ts` :
  - `eyebrow` : « Audios » (inchangé)
  - `titre` : « Écouter pour se transformer »
  - `paragraphe` : « Des exercices sophrologiques offerts, à écouter ici même ou à emporter chez vous quand vous en aurez besoin. »

  Le texte d'Olivier est repris tel quel, à deux détails près : la mention « (téléchargement) » est retirée, puisque le bouton « À emporter ! » la rend inutile, et une virgule est ajoutée. _Choix de ma part, à signaler à Olivier._

- Si Strapi contient déjà une valeur pour cette clé, c'est elle qui s'affiche, pas le défaut. **Action hors code :** mettre à jour le champ dans Strapi (Page d'accueil → Audios) et indiquer à Olivier où il se trouve.
- Le lien d'ancre `#audios` n'existe plus sur l'accueil : vérifier qu'aucun lien interne n'y pointe encore.
- Le pavé « Catalogue audio » de la Boutique pointe déjà sur `https://olivier-hildevert-website.vercel.app/audios`, ce que l'utilisateur a confirmé. Aucune redirection d'ancre n'est donc nécessaire. **Action hors code** au passage au domaine définitif : mettre à jour ce lien dans Strapi.

### 3.3 Bouton « À emporter ! »

- Dans `CarteAudio.svelte`, sous le lecteur (`<audio>` ou `<video>`), un bouton secondaire « À emporter ! » (espace insécable avant le `!`), avec un `sr-only` « : {titre} » comme le bouton « Télécharger » de `CarteFascicule`. Style : `btn btn-line`, aligné sur les boutons existants.
- **Exigence** : un clic doit **enregistrer** le fichier, sur ordinateur comme sur mobile autant que le navigateur le permet, avec un nom de fichier lisible (dérivé du titre, extension conservée).
- **Contrainte technique** : les médias sont servis par le domaine de Strapi (upload local, `urlMedia()`). L'attribut `download` d'un lien vers une **autre origine** est ignoré par les navigateurs, qui ouvrent alors le fichier. Il ne suffit donc pas.
- **Une modification du CMS est autorisée pour ce point**, l'utilisateur l'a confirmé. La solution privilégiée est que Strapi serve lui-même le fichier en téléchargement : par exemple un middleware qui ajoute `Content-Disposition: attachment; filename="…"` sur `/uploads/…` quand la requête porte `?download`. Le site lie alors `fichier.url + '?download'`. L'ordre de déploiement reste souple : un Strapi pas encore à jour ignore le paramètre et ouvre le fichier, ce qui dégrade le comportement sans rien casser.
- **À vérifier par le constructeur** : le stockage des médias en production n'est pas connu (volume Railway avec l'upload local par défaut, ou S3/Cloudinary, cf. CMS README « Persistance obligatoire »). Le middleware ne vaut que pour l'upload local. Avec S3 ou Cloudinary, il faut utiliser le mécanisme de téléchargement du fournisseur.
- **Laissé au constructeur** : le mécanisme exact. On ne relaie pas par une fonction Vercel (limites de taille et de durée pour un mp4) si la solution côté Strapi fonctionne. Contraintes à respecter :
  - ne relayer **que** des médias de la collection `audio` publiée, jamais une URL arbitraire passée en paramètre ;
  - sans JavaScript, le bouton reste un vrai lien qui mène au moins au fichier.
- Test : un test de composant vérifie la présence du bouton et sa cible. Un e2e vérifie qu'un clic déclenche un téléchargement (`page.waitForEvent('download')`) quand c'est faisable sans `.env`, sinon le test de composant suffit.

### 3.4 Pop-up newsletter

`NewsletterModal.svelte` :

- titre : « Avant de partir » (sans points de suspension) ;
- ligne manuscrite (`font-script`) : « Une lettre de temps en temps ? » ;
- paragraphe : « Actualités, nouveaux programmes et ateliers, conseils, lectures. Rien de plus. »

Accents rétablis (« Actualités ») et espace insécable avant le « ? ». La page de repli `/newsletter` reprend le même titre et le même paragraphe, son `<meta description>` aussi. _Choix de ma part._ Adapter les tests et e2e qui ciblent les anciens textes.

## 4. Lot 2 : section Avis

### 4.1 CMS (`olivier-hildevert-cms`)

- Nouvelle collection, `displayName` « Avis », `draftAndPublish: true`. Strapi exige un `singularName` différent du `pluralName` : par exemple `temoignage` / `temoignages`. Le nom technique est laissé au constructeur, l'admin affiche « Avis ».
- Champs :
  - `texte` : `text`, **obligatoire** ;
  - `nom` : `string`, **obligatoire**, nom affiché tel que saisi (consigne dans la description du champ : « Prénom et initiale, par ex. Claire M. ») ;
  - `contexte` : `string`, facultatif (« Stage en entreprise », « Préparation mentale »…) ;
  - `misEnAvant` : `boolean`, `default: false`.
- Page d'accueil : nouvelle clé facultative `avis` (eyebrow, titre, paragraphe), **même composant** que `audios` / `fascicules`.
- Lecture par le site : permission `find` sur la nouvelle collection **ajoutée au jeton d'API `site-web`** (pas de permission publique), comme `audio` (CMS README, « Jeton d'API `site-web` », qui passe de neuf à dix permissions). Sans elle, `getAvis` retombe sans bruit sur une liste vide et la section n'apparaît jamais. Mettre à jour le README du CMS, `scripts/verifier-conformite.mjs` (contrôles de la nouvelle collection) et le seed (titres de section seulement, aucun avis par défaut).

### 4.2 Site

- Types (`src/lib/content/types.ts`) : `AvisContent { texte; nom; contexte? }`. `PageAccueilContent.avis` est du même type que les sections catalogue.
- Défauts : section `{ eyebrow: 'Avis', titre: 'Ils en parlent', paragraphe: absent }`. **Aucun avis par défaut**. _Choix de ma part, Olivier pourra changer le titre dans Strapi._
- Lecture : `getAvis` dans `src/lib/server/content.ts`, sur le modèle de `getAudios` : validation **élément par élément** (un avis invalide est écarté avec `console.warn`, les autres restent) et repli sur une liste vide.
- `POPULATE_ACCUEIL` : ajout de `populate[avis][populate]` (cf. § 6).
- **Accueil** : nouvelle section `Avis.svelte` (`src/lib/components/home/`) placée **juste avant `<References>`**, c'est-à-dire après le bandeau de contact. Disposition validée avec l'utilisateur sur maquette (option A, « grille de cartes ») :
  - eyebrow, titre, paragraphe facultatif ;
  - **3 cartes** (`vitrine(avis, 3)`) : guillemet décoratif corail, texte, nom en gras, contexte en gris dessous. Cartes blanches `border-line`, arrondi `rounded-card`, même esprit que les cartes Boutique ;
  - 3 colonnes à partir de `md` (_choix de ma part : 3 et non 4, pour que la grille soit pleine_), une colonne sur mobile ;
  - bouton `btn btn-line` « Lire tous les avis » vers `/avis` ;
  - aucun avis publié : la section n'est pas rendue (ni ancre, ni titre).
- **Page `/avis`** : sur le modèle de `/audios` (ISR 300 s via `export const config`, `<svelte:head>` avec titre, description et canonical). En-tête tiré de la clé `avis`, toutes les cartes dans le même composant de carte que l'accueil, « Bientôt disponible. » avec un retour à l'accueil si la liste est vide. Ajouter `/avis` au sitemap.
- Pied de page : un lien « Avis » vers `/avis` à la place de « Fascicules ». Pas d'entrée dans le menu principal.
- Les cartes affichent le texte en entier, sans « lire la suite ». Les avis longs allongent la carte, et la grille aligne les hauteurs par ligne.
- Tests : composant (cartes rendues, section absente si vide), serveur (`getAvis` écarte un élément invalide), e2e (sans `.env` : section absente de l'accueil, `/avis` répond avec « Bientôt disponible. », lien présent dans le pied de page et dans le sitemap).

## 5. Ce qui reste au constructeur

- Le mécanisme exact du téléchargement (§ 3.3), dans les contraintes données.
- Le nom technique de la collection Avis.
- Le découpage en commits et l'ordre des tâches à l'intérieur de chaque lot.
- Les détails de style des cartes Avis dans la palette Aurore (guillemet, espacements), en restant proche de la maquette A et des cartes existantes.

## 6. Déploiement

- **Lot 1** : déployable à tout moment. Le middleware de téléchargement côté CMS peut partir avant ou après le site.
- **Les deux lots partent avant le 11/11 à 11 h 11**, déployés par l'équipe : CMS, permission du jeton, puis site. Le nom de domaine définitif est branché au même moment. Les lots restent indépendants pour qu'un retard du lot 2 ne bloque pas le lot 1.
- Au branchement du domaine : mettre à jour `site.url` (`src/lib/config.ts`) si besoin, les origines CORS du CMS (`config/middlewares.ts`) et le lien du pavé « Catalogue audio » dans Strapi.
- **Lot 2** : **déployer le CMS AVANT le site**. Strapi répond 400 à un `populate` inconnu (`avis`), ce qui ferait retomber toute la page d'accueil sur les défauts. Après le déploiement du CMS, ajouter `find` sur la collection Avis au jeton `site-web` en production, puis lancer `npm run verifier` contre la production.
- Actions hors code à signaler dans la PR : mettre à jour le champ Page d'accueil → Audios dans Strapi (§ 3.2), et indiquer à Olivier où saisir les avis et où changer le titre de la section.
- Mettre à jour le CLAUDE.md : fascicules en sommeil, section Avis, `/avis`, plus de section Audios sur l'accueil.

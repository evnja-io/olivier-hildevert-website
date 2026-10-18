# Boutique : adhésions, catalogues Audios et Fascicules

**Date :** 2026-10-18
**Branche de départ :** `main` (après `dff9682`)
**Statut :** design validé, spec à relire avant le plan d'implémentation
**Dépôts concernés :** `olivier-hildevert-website` et `olivier-hildevert-cms`

---

## 1. Problème

Retours client du 2026-10-18 :

1. Pour les produits « inscription » de la boutique, la modale affiche « Commander » et ce titre n'est pas modifiable dans Strapi : il faut « Adhérer ».
2. « Je vous recontacte pour finaliser votre commande » doit devenir « …votre inscription ».
3. Le champ libre sous « Téléphone » (« Quantité, adresse de livraison ou précisions ») doit devenir « Votre message ».
4. Le bouton « Infos » doit s'appeler « En savoir plus » et passer **au-dessus** du bouton principal (on se renseigne avant de s'inscrire).
5. Ajouter des **audios** (mp3/mp4) gratuits et des **fascicules à thème**, payants ou gratuits : sur l'accueil, une section par catégorie avec 4 éléments et un bouton « Voir tout » vers une page qui liste tout.

État actuel : le libellé du bouton de carte (`boutonLabel`) est déjà modifiable par produit dans Strapi. Le titre de la modale, sa phrase d'accroche, le champ libre, la confirmation serveur et le bouton « Infos » sont écrits en dur. Le CMS accepte déjà `audio/*` et `video/*` à l'envoi (`config/plugins.ts`).

## 2. Décisions validées

| Décision                        | Choix retenu                                                                                    | Alternatives écartées                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Textes de la modale de commande | **Type de demande par produit** (`commande` / `inscription`) dans Strapi, qui pilote les textes | remplacement global en « inscription » ; textes neutres       |
| Emplacement des audios          | **Catalogue séparé** (section d'accueil et page `/audios`)                                      | champ « extrait » sur le produit ; sous-partie de la boutique |
| Modèle des audios et fascicules | **Collections Strapi** `audio` et `fascicule`                                                   | listes répétables dans la page d'accueil                      |
| Audios                          | **Gratuits**, écoute dans la carte                                                              | vente avec extrait                                            |
| Fascicules                      | **Gratuits** (téléchargement du PDF) **ou payants** (commande via la modale ou un lien externe) | uniquement payants                                            |
| 4 éléments de l'accueil         | **Case « Mis en avant »**, complétée par les plus récents                                       | 4 plus récents automatiquement ; ordre manuel                 |
| Page complète                   | **Simple grille de cartes**, sans page par élément ni filtre                                    | filtre par thème ; page par élément                           |
| Emplacement sur l'accueil       | **Boutique → Audios → Fascicules → Tarifs**                                                     | —                                                             |
| Menu                            | **Une entrée « Ressources »** (ancre `audios`), liens vers les deux pages dans le pied de page  | deux entrées ; aucune entrée                                  |
| Livraison                       | **Une spec, deux lots** : lot 1 = points 1 à 4, lot 2 = catalogues                              | un seul lot                                                   |

## 3. Lot 1 : commande ou inscription, libellés

### 3.1 CMS

- `blocs.produit` : **ajout** `typeDemande`, liste à choix `["commande", "inscription"]`, facultative, `default: "commande"`.
- `api::demande-commande` : **ajout** `type`, liste à choix `["commande", "inscription"]`, facultative, `default: "commande"` (pour qu'Olivier distingue les deux dans l'admin). Le `displayName` devient « Demandes (commandes et inscriptions) ».

### 3.2 Site

- `src/lib/content/types.ts` : `export type TypeDemande = 'commande' | 'inscription'` ; `ProduitBoutique.typeDemande?: TypeDemande` (absent = `commande`). Le commentaire du champ `info` dit « En savoir plus ».
- `src/lib/server/content.ts` (schéma de la boutique) : `typeDemande: z.enum([...]).nullish()`. La transformation omet la clé quand elle vaut `commande` ou est absente (round-trip strict avec les défauts, qui n'en déclarent pas).
- **Textes par type**, dans un nouveau module `src/lib/commande/textes.ts`, source unique utilisée par la modale, la page de repli et l'action serveur :

  | Clé            | `commande`                                                                      | `inscription`                                                                     |
  | -------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
  | `titre`        | Commander                                                                       | Adhérer                                                                           |
  | `accroche`     | Je vous recontacte pour finaliser votre commande.                               | Je vous recontacte pour finaliser votre inscription.                              |
  | `confirmation` | Demande de commande transmise. Je vous recontacte rapidement pour la finaliser. | Demande d'inscription transmise. Je vous recontacte rapidement pour la finaliser. |

- `src/lib/commande/schema.ts` : **ajout** `type: z.enum(['commande', 'inscription']).default('commande')`.
- `src/lib/commande/commande.svelte.ts` : `openCommande(produit, type = 'commande')` mémorise le type à côté du produit.
- `CommandeModal.svelte` :
  - `aria-label`, surtitre et accroche lus depuis `textes.ts` selon le type mémorisé ;
  - champ caché `type` ;
  - libellé caché et texte indicatif du champ libre : **« Votre message »** (les deux types).
- `src/routes/commande/` :
  - `+page.server.ts` lit `?type=` (valeur inconnue → `commande`) pour pré-remplir le formulaire et choisit la confirmation selon `form.data.type` ;
  - `+page.svelte` : titre `<h1>`, `<title>` et accroche selon le type ; champ libre « Votre message ».
- `src/lib/server/forms.ts` : la demande de commande envoie `type` à Strapi.
- `Boutique.svelte` :
  - le bouton « En savoir plus » (`btn-line`) passe **avant** le bouton principal (`btn-sun`) dans le bloc d'actions ;
  - le bouton principal sans `lien` appelle `openCommande(produit.titre, produit.typeDemande)` et son `href` porte `&type=inscription` quand c'est le cas.

## 4. Lot 2 : catalogues Audios et Fascicules

### 4.1 CMS

**Collection `audio`** (`draftAndPublish: true`) :

| Champ         | Type                                                | Règle       |
| ------------- | --------------------------------------------------- | ----------- |
| `titre`       | string                                              | obligatoire |
| `description` | text                                                | facultatif  |
| `fichier`     | media, unique, `allowedTypes: ["audios", "videos"]` | obligatoire |
| `visuel`      | media, unique, `allowedTypes: ["images"]`           | facultatif  |
| `duree`       | string (« 12 min »)                                 | facultatif  |
| `misEnAvant`  | boolean, `default: false`                           | —           |

**Collection `fascicule`** (`draftAndPublish: true`) :

| Champ         | Type                                               | Règle                                               |
| ------------- | -------------------------------------------------- | --------------------------------------------------- |
| `titre`       | string                                             | obligatoire                                         |
| `description` | text                                               | facultatif                                          |
| `couverture`  | media, unique, images                              | facultatif                                          |
| `prixTexte`   | string                                             | vide = **gratuit** (« 12 € », « Prix libre »…)      |
| `document`    | media, unique, `["files"]`                         | relayé **seulement si gratuit**                     |
| `lien`        | string, regex `^(https?://.*)?$`                   | facultatif ; commande externe d'un fascicule payant |
| `typeDemande` | enum `commande` / `inscription`, défaut `commande` | utilisé si payant et sans `lien`                    |
| `misEnAvant`  | boolean, `default: false`                          | —                                                   |

**Composants de titres** (`sections.audios`, `sections.fascicules`) : `eyebrow`, `titre` (obligatoires), `paragraphe` (facultatif). Ajoutés à `page-accueil` en champs **facultatifs**.

**Permissions** : lecture `find` des deux collections pour le jeton API utilisé par le site (à vérifier dans l'admin, comme pour `prestation`).

**README du CMS** : mode d'emploi pour Olivier (ajouter un audio ou un fascicule, cocher « Mis en avant », gratuit = prix vide + PDF, payant = prix + lien ou formulaire) et recommandations de poids (mp3 à 128 kb/s, environ 1 Mo par minute ; mp4 à éviter au-delà de quelques minutes, car la bande passante passe par Railway).

### 4.2 Site : données

`src/lib/content/types.ts` :

```ts
export interface SectionCatalogue {
	eyebrow: string;
	titre: string;
	paragraphe?: string;
}

export interface AudioContent {
	titre: string;
	description?: string;
	fichier: { url: string; mime: string };
	visuel?: ImageCms;
	duree?: string;
}

export type FasciculeAction =
	| { kind: 'telecharger'; url: string }
	| { kind: 'lien'; url: string }
	| { kind: 'demande'; type: TypeDemande }
	| { kind: 'aucune' };

export interface FasciculeContent {
	titre: string;
	description?: string;
	couverture?: ImageCms;
	/** Absent : gratuit. */
	prixTexte?: string;
	action: FasciculeAction;
}
```

`PageAccueilContent` gagne `audios: SectionCatalogue` et `fascicules: SectionCatalogue`. Les défauts dans `defaults.ts` :

- Audios : surtitre « Audios », titre « Écouter, respirer, se relier », paragraphe court ;
- Fascicules : surtitre « Fascicules », titre « Des fascicules à thème pour approfondir », paragraphe court.

Textes provisoires, modifiables dans Strapi. Il n'y a **aucun audio ni fascicule par défaut**.

`src/lib/server/content.ts` :

- `POPULATE_ACCUEIL` gagne `audios: true, fascicules: true`. Ces clés sont facultatives, comme `references` : si elles sont absentes de la réponse, les défauts s'appliquent sans déclasser la page.
- `getAudios(fetcher)` et `getFascicules(fetcher)` via `fetchEntries`, avec populate explicite des médias et tri Strapi `sort=publishedAt:desc`.
- **Validation élément par élément** : chaque entrée passe `safeParse`. Une entrée invalide est écartée avec `console.warn` (titre et erreur), sans vider la liste. Une erreur réseau ou de format global renvoie `[]` avec `console.warn`.
- Transformation d'un fascicule :
  1. `prixTexte` vide ou absent, avec `document` : action `telecharger` (URL rendue absolue par `urlMedia()`) ;
  2. gratuit sans document : action `aucune` ;
  3. payant avec `lien` : action `lien` ;
  4. payant sans `lien` : action `demande` avec `typeDemande` ;
  5. l'URL du `document` d'un fascicule payant **n'est jamais** incluse dans le résultat.
- Fonction pure `vitrine<T extends { misEnAvant: boolean }>(items, n = 4)` : les éléments mis en avant d'abord (ordre d'origine conservé, donc récents d'abord), puis les autres, coupé à `n`. Le champ `misEnAvant` sert au tri puis est retiré des objets transmis aux composants.

Chargements :

- `src/routes/+page.server.ts` : `Promise.all` de `getPageAccueil`, `getAudios`, `getFascicules`, puis `vitrine()` sur chaque liste. L'ISR à 300 s est inchangée.
- `src/routes/audios/+page.server.ts` et `src/routes/fascicules/+page.server.ts` : `getPageAccueil` (pour les titres) et la liste complète, avec `export const config = { isr: { expiration: 300 } }`.

### 4.3 Site : composants et pages

`src/lib/components/catalogue/` :

- `CarteAudio.svelte` : visuel facultatif (`object-contain`, comme les visuels Strapi de la boutique), titre, durée, description. Ensuite, `<video controls preload="none" playsinline>` si `mime` commence par `video/`, sinon `<audio controls preload="none">`, en pleine largeur. Le titre sert de nom accessible au lecteur.
- `CarteFascicule.svelte` : couverture facultative, titre, mention « Gratuit » ou `prixTexte`, description. Bouton selon `action` :
  - `telecharger` : « Télécharger » (`btn-sun`, nouvel onglet, `rel="noopener"`) ;
  - `lien` : « Commander » (lien externe, comme la boutique) ;
  - `demande` : texte du bouton selon le type (« Commander » ou « Adhérer »), `href` vers `/commande?produit=…[&type=inscription]` avec `onclick` qui ouvre la modale (`openCommande(titre, type)`) ;
  - `aucune` : pas de bouton.
- `CatalogueAccueil.svelte` (nom distinct du type `SectionCatalogue`) : props `id`, `content: SectionCatalogue`, `href` (page complète), et un snippet de carte (ou deux composants enveloppes `AudiosAccueil` et `FasciculesAccueil`, au choix de l'implémentation). Il affiche le bloc de titres (`eyebrow`, `h2`, paragraphe), une grille `md:grid-cols-2 xl:grid-cols-4` et le lien « Voir tout » (`btn btn-line`). Si la liste est vide, rien n'est rendu. Les animations `reveal` sont celles de la boutique.

Pages `src/routes/audios/+page.svelte` et `src/routes/fascicules/+page.svelte` :

- `<svelte:head>` : `<title>` « Audios — {site.name} », description, canonical ;
- en-tête avec les textes de la section (`h1`), grille de toutes les cartes ;
- si la liste est vide : « Bientôt disponible. » et un lien de retour vers l'accueil.

Accueil (`src/routes/+page.svelte`) : `<CatalogueAccueil id="audios" …>` et `<CatalogueAccueil id="fascicules" …>` entre `<Boutique>` et `<Tarifs>`.

Navigation et référencement :

- `src/lib/config.ts` : `{ label: 'Ressources', anchor: 'audios' }`, inséré avant `Boutique`. Si la section Audios est vide, l'ancre ne mène nulle part. C'est accepté : le catalogue sera rempli avant la mise en ligne, et masquer l'entrée selon le contenu compliquerait le menu pour un cas transitoire.
- `Footer.svelte` : liens « Audios » et « Fascicules » via `resolve()`.
- `src/routes/sitemap.xml/+server.ts` : ajout de `/audios` et `/fascicules`.

## 5. Tests

Unitaires (projet `server`, colocalisés) :

- `src/lib/commande/schema.test.ts` : `type` par défaut `commande`, valeur inconnue rejetée.
- `src/lib/commande/textes.test.ts` (ou test de l'action) : bonne confirmation selon le type.
- `src/lib/server/content.test.ts` (existant ou nouveau) :
  - boutique : `typeDemande: 'inscription'` conservé, `commande` ou `null` omis ;
  - fascicules : les quatre cas d'action, document d'un payant jamais relayé ;
  - audios : entrée sans fichier écartée, les autres conservées ;
  - URLs de médias rendues absolues.
- `vitrine()` : mis en avant d'abord, complété par les autres, limite à 4, moins de 4 éléments.

Composants (projet `client`, `*.svelte.test.ts`) :

- `CarteFascicule` : bon bouton et bon `href` pour chaque action ;
- `CarteAudio` : `<audio>` pour `audio/mpeg`, `<video>` pour `video/mp4`.

E2E (sans `.env`, collections vides) :

- accueil : pas de section `#audios` ni `#fascicules` ;
- `/audios` et `/fascicules` répondent 200 et affichent « Bientôt disponible » ;
- `/commande?produit=X&type=inscription` affiche « Adhérer » et « finaliser votre inscription », l'envoi affiche la confirmation d'inscription ;
- champ libre « Votre message » dans la modale et sur `/commande` (adapter les tests existants qui ciblent « Quantité… ») ;
- boutique : « En savoir plus » précède le bouton principal quand un produit a `info`. Les défauts n'en ont pas, donc ce cas est couvert par un test de composant si nécessaire.

Contrôles : `pnpm check`, `pnpm lint`, `pnpm test:unit -- --run`, `pnpm exec playwright test`, `pnpm build` **sans `.env`**.

## 6. Déploiement

1. **CMS d'abord** : schémas (lots 1 et 2), permissions du jeton, README. Redéployer sur Railway et vérifier que l'admin affiche les nouvelles collections.
2. **Site ensuite** : lot 1 puis lot 2 (PR séparées, ou une PR avec deux commits distincts). Sans ce préalable, le populate `audios` / `fascicules` de la page d'accueil ferait répondre 400 à Strapi, et **toute** la page d'accueil retomberait sur les défauts.
3. `CLAUDE.md` : paragraphe « Catalogues » (collections, `vitrine()`, règle du document jamais relayé pour un fascicule payant, `typeDemande`).

## 7. Hors périmètre

- Paiement en ligne et livraison automatique des fascicules payants : la commande reste une demande de recontact ou un lien externe.
- Page par élément, filtre par thème, pagination de la page complète.
- Plateformes d'hébergement tierces (YouTube, SoundCloud) : non retenues pour éviter un bandeau de consentement.

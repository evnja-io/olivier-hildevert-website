# Refonte lisibilité & responsive — page d'accueil

**Date :** 2026-09-12
**Branche de départ :** `feat/strapi-cms`
**Statut :** design validé, prêt pour le plan d'implémentation

---

## 1. Problème

Le site est illisible sur les grands écrans. Constaté sur un iMac 27″ (2560 × 1440 logiques) : le texte courant est minuscule et les étiquettes sont impossibles à lire.

Deux causes, toutes deux dans le code :

1. **Les tailles de police sont figées en pixels** — 85 valeurs en dur réparties dans les 12 composants de l'accueil, l'en-tête, le pied de page et les 2 modales. Elles ne varient jamais : 9,5 px pour les légendes des chiffres du hero, 11,5 px pour les surtitres, 13,5 à 18,5 px pour le texte courant.
2. **Le conteneur est plafonné à 1180 px** (`--container-wrap`), soit 46 % de la largeur d'un 27″.

Ce n'est pas un artefact de la version de préproduction : tout visiteur sur un écran de 24″ ou plus subira le même défaut. Sur un portable de 13–14″ (1440–1512 px logiques) la mise en page occupe 78 % de l'écran et le défaut est peu visible, ce qui explique qu'il soit passé inaperçu.

Le zoom navigateur (`Cmd +`) agrandit uniformément texte **et** images plein cadre, d'où la photo disproportionnée signalée par le client. Ce n'est pas une solution.

S'y ajoutent : une liste de corrections éditoriales, deux bugs de liens, onze défauts d'adaptation mobile et trois couleurs qui échouent au contraste WCAG AA.

## 2. Décisions validées avec le client

Trois décisions ont été prises sur maquettes interactives rendues à l'échelle réelle dans son navigateur (compagnon visuel, écrans conservés dans `.superpowers/brainstorm/`) :

| Décision                        | Choix retenu                                                                        | Alternatives écartées                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Portrait du client dans le hero | **Recadrage sur la mer seule** — la moitié gauche de `hero-bg.jpg`, sans personnage | autre photo du site ; dégradé sans photo ; portrait en médaillon |
| Lisibilité des bandes photo     | **Voile assombri** — photos plus sombres, aucune couleur de texte modifiée          | plaque sombre sous le texte ; texte espresso sur voile crème     |
| Calibre typographique           | **L'échelle proposée telle quelle**                                                 | un cran plus gros ; un cran plus petit                           |

Le client a par ailleurs demandé que **les liens de la boutique soient câblés plus tard via Strapi** : des URL de remplacement sont posées en attendant, et le lien devient un champ éditorial.

## 3. Fondations — `src/routes/layout.css`

### 3.1 Échelle typographique fluide

Sept paliers remplacent toutes les tailles en dur. Chacun est un `clamp()` bâti sur `rem + vw` : le `rem` respecte la taille de police configurée dans le navigateur (accessibilité), le `vw` fait croître le texte avec l'écran, le plancher protège le mobile, le plafond évite l'effet grotesque sur un 32″.

**Livré :** les paliers ne portent pas de noms français ; ils **redéfinissent les paliers natifs de Tailwind** (`--text-xs` … `--text-5xl`). Raison du choix : les 52 usages `text-xs` / `text-sm` / `text-base` / `text-lg` / `text-2xl` / `text-4xl` déjà écrits dans les composants deviennent fluides sans qu'une seule classe soit touchée, alors que des tokens nommés auraient imposé de réécrire chaque occurrence — et laissé les paliers Tailwind figés en embuscade pour le prochain composant écrit distraitement.

```css
@theme {
	--text-xs: clamp(12.5px, 0.72rem + 0.18vw, 15px); /* étiquette */
	--text-sm: clamp(14px, 0.8rem + 0.25vw, 17px); /* légende */
	--text-base: clamp(16.5px, 0.95rem + 0.35vw, 21px); /* courant */
	--text-lg: clamp(19px, 1.05rem + 0.5vw, 25px); /* chapô */
	--text-xl: clamp(21px, 1.1rem + 0.7vw, 28px);
	--text-2xl: clamp(24px, 1.2rem + 1vw, 34px); /* titre-s */
	--text-3xl: clamp(27px, 1.3rem + 1.4vw, 40px);
	--text-4xl: clamp(30px, 1.4rem + 1.8vw, 46px); /* titre-m */
	--text-5xl: clamp(36px, 1.6rem + 2.6vw, 62px); /* titre-l */
}
```

Chaque palier reçoit aussi son `--text-*--line-height`. `xl` et `3xl` complètent l'échelle pour qu'aucun palier natif de Tailwind ne reste figé.

| Palier      | Rôle        | Usage                                             | 390 px  | 1440 px | 2560 px |
| ----------- | ----------- | ------------------------------------------------- | ------- | ------- | ------- |
| `text-xs`   | `etiquette` | étiquettes mono, surtitres, légendes des chiffres | 12,5 px | 14,1 px | 15 px   |
| `text-sm`   | `legende`   | texte secondaire, descriptions de cartes          | 14 px   | 16,4 px | 17 px   |
| `text-base` | `courant`   | texte courant                                     | 16,5 px | 20,2 px | 21 px   |
| `text-lg`   | `chapo`     | chapôs, prix sur les cartes                       | 19 px   | 24,0 px | 25 px   |
| `text-2xl`  | `titre-s`   | h3, titres de cartes                              | 24 px   | 33,6 px | 34 px   |
| `text-4xl`  | `titre-m`   | h2 de section, titre du hero                      | 30 px   | 46 px   | 46 px   |
| `text-5xl`  | `titre-l`   | grands titres (appel contact)                     | 36 px   | 62 px   | 62 px   |

Les `clamp()` déjà présents dans les composants (`text-[clamp(34px,5vw,58px)]` et consorts) sont remplacés par le palier correspondant. Les espacements verticaux de section (`py-[clamp(86px,11vw,148px)]`) sont conservés tels quels : ils fonctionnent déjà.

### 3.2 Conteneur

```css
--container-wrap: 1440px; /* était 1180px */

@utility wrap {
	width: min(var(--container-wrap), 100% - 2.75rem);
	margin-inline: auto;
}
```

Le passage de `90vw` à `100% - 2.75rem` donne des gouttières fixes de 22 px sur mobile au lieu de 19,5 px proportionnels, et supprime la dépendance à `vw` (qui inclut la barre de défilement).

### 3.3 Contraste — trois tokens corrigés

Mesures sur le fond `--color-sky` (`#fff6ec`). Le seuil WCAG AA pour du texte de taille normale est 4,5:1.

| Token                            | Usage                                                                                  | Avant                                 | Après     | Ratio obtenu |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- | --------- | ------------ |
| `--color-mute`                   | sous-titre « Consultant », légendes de section, prix boutique, profondeurs des strates | `#ac8b73` — **2,9:1**                 | `#8a6a53` | 4,60:1       |
| `--color-coral-ink` _(nouveau)_  | tous les surtitres `eyebrow`, mentions « Réserver → » des cartes                       | `--color-coral` `#f0653a` — **3,0:1** | `#b93a18` | 5,4:1        |
| `--color-coral-deep` _(nouveau)_ | fond des boutons `btn-sun` (texte blanc dessus)                                        | `--color-coral` `#f0653a` — **3,2:1** | `#d03c19` | 4,8:1        |

`--color-coral` reste inchangé et conserve tous ses usages décoratifs : filets, pastilles, ornements SVG, bordures, points de liste. Seuls ses deux usages porteurs de texte migrent.

L'utilitaire `eyebrow` passe à `color: var(--color-coral-ink)` et `font-size: var(--text-xs)` ; `btn` passe à `font-size: var(--text-xs)` ; `btn-sun` à `background: var(--color-coral-deep)`.

## 4. Contenu — `src/lib/content/defaults.ts`

Le site déployé n'est pas encore branché sur Strapi : `defaults.ts` est à la fois ce qui s'affiche et la source du seed du CMS. Toutes les corrections éditoriales s'y font donc, et une seule fois.

### 4.1 Hero

| Champ      | Après                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| `eyebrow`  | `Sophrologie · Thérapie psycho énergétique et transpersonnelle`                |
| `stats[0]` | `{ valeur: 'Depuis 1992', legende: "Praticien en relation d'aide" }`           |
| `stats[1]` | `{ valeur: '+ de 10 000', legende: 'Séances animées' }`                        |
| `stats[2]` | `{ valeur: '34 ans', legende: "D'accompagnements individuels et collectifs" }` |

`titreLigne1` et `titreLigne2` sont inchangés ; c'est la mise en page qui les réunit sur une ligne (§ 5.3).

**« 1 h 30 » n'est retiré que du hero.** La durée reste dans `tarifs.cartes[1].sousTexte`, dans `defaultPrestations[0].prixCarte` et dans `defaultPrestations[0].metaReservation` — le client n'a pas demandé leur suppression. **« 34 ans » est du texte modifiable**, pas un calcul : il sera à corriger dans Strapi en 2027. Les deux points ont été signalés au client, qui a validé.

### 4.2 Mantra

- `citation` inchangée.
- **`auteur` supprimé** — le champ disparaît du modèle, pas seulement de l'affichage (§ 6).

### 4.3 États d'esprit & états d'âme

| Champ               | Après                                   |
| ------------------- | --------------------------------------- |
| `espritAme.eyebrow` | `Deux logiques, pour une même personne` |

`titre` inchangé ; il est forcé sur une seule ligne par la mise en page (§ 5.5).

### 4.4 Boutique

| Champ                   | Après                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `boutique.titre`        | `Prolonger le chemin de l'éveil`                                                                                    |
| `boutique.paragraphe`   | `Un roman thérapeutique pour se réaligner et des veilleuses énergétiques pour réharmoniser les lieux et les êtres.` |
| `produits[0].prixTexte` | `Disponible à l'achat`                                                                                              |
| `produits[0].lien`      | `https://www.bod.fr/` _(remplacement — à câbler dans Strapi)_                                                       |
| `produits[1].lien`      | `https://olivierhildevert.com/` _(remplacement — à câbler dans Strapi)_                                             |

### 4.5 Prestations

| Champ                         | Après                                         |
| ----------------------------- | --------------------------------------------- |
| `defaultPrestations[0].titre` | `Séance individuelle — décodage et solutions` |

Ce titre alimente la carte de l'accueil, la modale de réservation et le CMS : il se lira identiquement aux trois endroits. Le client a été averti et a validé.

## 5. Composants

### 5.1 Nouveau — `src/lib/components/SunMark.svelte`

Le SVG du soleil, aujourd'hui écrit en dur dans `Header.svelte`, devient un composant à taille paramétrable (prop `class`, `aria-hidden` par défaut). Trois consommateurs : `Header.svelte`, `Approche.svelte`, et le favicon (§ 7.2).

### 5.2 `Header.svelte`

- Soleil agrandi de 38 px à `clamp(46px, 3.6vw, 62px)` ; « Olivier Hildevert » de 22 px à `clamp(24px, 1.9vw, 34px)` ; « Consultant » au palier `text-xs` (étiquette).
- **Menu mobile** — sous `lg` (1024 px), un `<details>` / `<summary>` stylé en bouton burger (48 × 48 px) ouvre un panneau contenant les six liens de `nav` (`$lib/config`) et le bouton « Prendre rendez-vous ».
  Le choix de `<details>` plutôt que d'un état Svelte est délibéré : le panneau s'ouvre, se ferme et se pilote au clavier **sans JavaScript**, conformément au principe d'amélioration progressive suivi partout ailleurs dans le projet (formulaires, réservation, newsletter). Un `$effect` facultatif referme le panneau après un clic sur un lien ; son absence dégrade proprement.
  `aria-label` sur le `<summary>`, `aria-label="Navigation principale"` conservé sur le `<nav>` desktop, second `<nav aria-label="Navigation mobile">` dans le panneau.
- Le bouton « Prendre rendez-vous » disparaît de la barre sous `lg` (il y provoquait un débordement : logo et bouton réclamaient ensemble ~440 px pour 350 px disponibles, tous deux en `white-space: nowrap`).

### 5.3 `Hero.svelte`

- `src` passe à `$lib/assets/hero-mer.jpg` (§ 7.1), `object-position` recalé au centre.
- `.hero-wash` : dégradé horizontal conservé au-dessus de 900 px, **vertical en dessous** via `@media (max-width: 899px)`. Le dégradé actuel suppose un texte à gauche d'une photo à droite ; sur écran étroit le texte déborde sur la zone non voilée.
- Bloc de texte : `max-w-[600px]` → `max-w-[min(1000px,100%)]`.
- Titre : `titreLigne1` et `titreLigne2` sur une seule ligne à partir de 900 px (`white-space: nowrap` conditionnel), sur deux lignes en dessous. Les deux fragments passent au palier `titre-m` et partagent la même `line-height`.
  Justification du seuil de 900 px : « Décoder le visible, grâce à l'invisible » fait 38 caractères, soit environ 763 px à 900 px de fenêtre (palier `titre-m` = 38,6 px) pour 856 px de colonne utile, et 909 px à 2560 px pour 1000 px de bloc. Le titre tient dans tous les cas au-dessus du seuil, avec une marge d'environ 10 %. En dessous, il repasse sur deux lignes.
- Chiffres : la rangée `flex` avec bordures droites devient une **grille verticale à filets horizontaux sous `sm`**, et une rangée à séparateurs verticaux au-dessus. Suppression de `white-space: nowrap` sur les légendes — « D'accompagnements individuels et collectifs » ne peut pas tenir sur une ligne de téléphone.
- Les deux boutons s'empilent en pleine largeur sous `sm`.

### 5.4 `ImmersiveBand.svelte`

Voile validé (option A), appliqué en une fois aux trois bandes :

```css
.band-bg :global(img) {
	filter: saturate(1.08) brightness(0.86);
} /* était saturate(1.05) contrast(1.02) */
.band-bg::after {
	background: radial-gradient(
		120% 120% at 50% 50%,
		color-mix(in oklab, var(--color-coral) 46%, transparent),
		color-mix(in oklab, var(--color-ember) 96%, transparent)
	);
	mix-blend-mode: multiply;
}
.band::after {
	background: radial-gradient(
		125% 125% at 50% 45%,
		color-mix(in oklab, var(--color-dusk) 18%, transparent) 0%,
		color-mix(in oklab, var(--color-dusk) 66%, transparent) 100%
	);
}
```

### 5.5 `Mantra.svelte`, `EspritAme.svelte`, `PourQui.svelte`, `ContactCta.svelte`

- `Mantra.svelte` : le `<cite>` de l'auteur est supprimé, le filet ornemental conservé. Les segments mis en valeur entre `*…*` reçoivent `white-space: nowrap` **sans condition de largeur** : « états d'esprit » et « états d'âme » font 14 et 11 caractères, soit environ 200 px au plus petit palier — ils tiennent sur la ligne d'un iPhone (346 px utiles) sans risque de débordement.
- `EspritAme.svelte` : le bloc de titre passe de `max-w-[640px]` à `max-w-[820px]` et le titre reçoit `white-space: nowrap` **au-dessus de `sm` seulement**. Vérification : « États d'esprit & états d'âme » mesure environ 446 px à 640 px de fenêtre, 537 px à 1024 px et 605 px à 2560 px — toujours sous les 820 px du bloc. En dessous de `sm` il mesurerait 395 px pour 346 px utiles, d'où le retour à la ligne autorisé.
- `PourQui.svelte`, `ContactCta.svelte` : passage aux paliers, rien d'autre.

### 5.6 `Approche.svelte`

- Le SVG « fleur de vie » (sept cercles) est **remplacé par `<SunMark />`**, à taille équivalente (84 px) et en `--color-coral`.
- Strates, légendes et descriptions passent aux paliers.

### 5.7 `APropos.svelte`

- `object-position: 22% center` sur le portrait : la source est en paysage 1800 × 1200, affichée dans un cadre portrait 4/5 ; le recadrage centré par défaut plaque le visage sur le bord gauche.
- `sizes` recalculé (§ 5.10).
- **À signaler au client :** `portrait-cabinet.jpg` (1800 × 1200) est l'asset le plus juste en résolution une fois la colonne élargie. Un original d'appareil photo donnerait un meilleur rendu sur grand écran. Non bloquant.

### 5.8 `Boutique.svelte` — bug de lien

Les boutons « Commander » et « Découvrir » appellent aujourd'hui `openBooking()` sur `preventDefault`. Ils deviennent de vrais liens externes :

```svelte
<a class="btn btn-line" href={produit.lien} target="_blank" rel="noopener noreferrer">
	{produit.boutonLabel}
</a>
```

### 5.9 `Footer.svelte` — même bug

L'entrée `{ label: 'olivierhildevert.com' }` de `rdvLinks` n'a pas de `prestation` : son `onclick` appelle `openBooking(undefined)` et ouvre la modale de réservation au lieu du site externe. Le tableau reçoit un champ `href` optionnel ; les entrées qui en ont un rendent un lien externe sans `onclick`.

Le pied de page passe par ailleurs aux paliers (ses mono à 8,5 px et 10,5 px sont les plus petits du site).

### 5.10 Attributs `sizes`

Tous calés sur l'ancienne colonne de 1180 px, ils font télécharger au navigateur une image trop petite qu'il étire ensuite — c'est la cause du portrait flou signalé par le client.

| Fichier               | Avant                             | Après                                                        |
| --------------------- | --------------------------------- | ------------------------------------------------------------ |
| `APropos.svelte`      | `(min-width: 1024px) 460px, 90vw` | `(min-width: 1024px) 560px, calc(100vw - 2.75rem)`           |
| `Prestations.svelte`  | `(min-width: 1024px) 570px, 90vw` | `(min-width: 1024px) 700px, calc(100vw - 2.75rem)`           |
| `Boutique.svelte`     | `(min-width: 640px) 240px, 200px` | `(min-width: 1024px) 290px, (min-width: 640px) 240px, 200px` |
| `Hero.svelte`, bandes | `100vw`                           | inchangé — correct                                           |

### 5.11 Modales — `BookingModal.svelte`, `NewsletterModal.svelte`

- Champs de saisie : `text-[15px]` → 16 px minimum. Sous 16 px, Safari iOS zoome automatiquement à la prise de focus et décale la page.
- Bouton de fermeture : 38 × 38 px → 44 × 44 px (seuil de cible tactile).
- Passage aux paliers pour le reste.

### 5.12 Les composants restants

Aucune modification structurelle, mais la migration vers les paliers doit être exhaustive — un seul `text-[13.5px]` oublié rouvre le défaut d'origine. Les valeurs en dur à remplacer :

| Composant                                                  | Tailles en dur à migrer                                                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Prestations.svelte`                                       | `text-[25px]` (h3), `text-sm` (description), `text-[21px]` (prix), `text-[11px]` et `text-[10.5px]` (mono)                                                     |
| `Tarifs.svelte`                                            | `text-[56px]` (montant) → `clamp(46px, 3.4rem + 2vw, 70px)`, `text-xl` (suffixe €) → `0.4em` du montant, `text-[13.5px]` (sous-texte), `text-[10.5px]` (label) |
| `Approche.svelte`                                          | `text-[16.5px]`, `text-[25px]`, `text-[14.5px]`, `text-[10px]`, `text-[10.5px]`, `text-xs`                                                                     |
| `EspritAme.svelte`                                         | `text-[32px]` (h3), `text-[15px]` (desc), `text-sm` (points), `text-[10.5px]` (tag)                                                                            |
| `APropos.svelte`                                           | `text-[15.5px]` ×3, `text-2xl` (citation), `text-[11px]`, `text-[10px]`, `text-[10.5px]`                                                                       |
| `Boutique.svelte`                                          | `text-[17.5px]`, `text-[26px]`, `text-[13.5px]`, `text-[11px]`, `text-[10px]`                                                                                  |
| `PourQui.svelte`                                           | `text-xs` (pastilles)                                                                                                                                          |
| `ContactCta.svelte`                                        | `text-[17px]`, `text-[11px]`                                                                                                                                   |
| `Footer.svelte`                                            | `text-2xl`, `text-sm` ×2, `text-[10.5px]` ×3, `text-[8.5px]`                                                                                                   |
| `Header.svelte`                                            | `text-[22px]`, `text-[8.5px]`, `text-[11.5px]` ×2                                                                                                              |
| `BookingModal.svelte`, `NewsletterModal.svelte`            | `text-[15px]` ×n, `text-[13.5px]`, `text-[12.5px]`, `text-xs`, `text-lg`, `text-sm`                                                                            |
| `+error.svelte`, `/contact`, `/reservation`, `/newsletter` | héritent des tokens ; leurs tailles en dur sont migrées mais leur mise en page n'est pas revue (§ 10)                                                          |

Inventaire de départ : `grep -ro 'text-\[[^]]*\]' src/ | wc -l` renvoie **85** occurrences, dont 4 sont des couleurs (`text-[#5E4108]`, `text-[#A55A43]`, `text-[#396CB2]`, un `color-mix`) et 1 est relative (`text-[1.2em]`). **Critère de complétude de cette étape :** `grep -rnE 'text-\[[0-9.]+px\]|text-\[clamp' src/` ne renvoie plus rien.

Note sur les trois couleurs en dur du hero — elles sortent de la palette « Aurore », ce que la convention du projet interdit en principe. Vérification faite, **elles passent toutes les trois le contraste AA** sur le fond crème (`#396CB2` → 5,0:1 ; `#A55A43` → 4,7:1 ; `#5E4108` → 8,8:1) : le surtitre du hero surcharge déjà le corail par un brun plus sombre, précisément pour rester lisible sur la photo. Elles sont donc conservées telles quelles dans ce lot ; leur remontée en tokens de palette est un nettoyage distinct, hors périmètre.

## 6. Modèle de contenu

Trois fichiers bougent de concert : `types.ts`, `defaults.ts`, `server/content.ts`.

**Ajout** — `ProduitBoutique.lien: string` :

- `types.ts` : champ ajouté à l'interface ;
- `server/content.ts` : `lien: z.string()` dans le schéma zod du tableau `produits` ;
- `seed-format.ts` : aucune modification — `accueilVersStrapi` propage par `...c`.

**Suppression** — `MantraContent.auteur` :

- `types.ts` : champ retiré ;
- `defaults.ts` : clé retirée ;
- `server/content.ts` : `mantra: z.object({ citation: z.string() })` ;
- `Mantra.svelte` : `<cite>` retiré.

**Conséquence côté CMS :** le dépôt `../olivier-hildevert-cms` devra refléter les deux changements (champ `lien` sur le composant produit, champ `auteur` retiré du composant mantra) avant le premier branchement. Hors périmètre de ce lot, mais à consigner dans le README.

## 7. Assets

### 7.1 `hero-mer.jpg`

Généré depuis `src/lib/assets/hero-bg.jpg` par `sharp` : extraction `{ left: 0, top: 0, width: 1460, height: 1429 }` — la limite de 1460 px est le bord gauche du personnage — puis agrandissement à 2920 px de large en `lanczos3`, JPEG qualité 84 avec `mozjpeg`. Poids obtenu : ~290 Ko, comparable à l'original.

L'agrandissement ×2 est acceptable ici parce que la source est un composite déjà doux, sans détail fin à préserver, et parce que la moitié gauche est couverte par le voile crème à 66–88 % d'opacité. `hero-bg.jpg` est conservé au dépôt (il n'est plus référencé, mais reste la source du recadrage).

La commande de génération est consignée dans le README pour être rejouable.

### 7.2 `favicon.svg`

**Le favicon actuel est le logo de Svelte** — `src/lib/assets/favicon.svg` n'a jamais été remplacé depuis la création du projet. Il est remplacé par le soleil de `SunMark`, en `--color-coral` sur fond transparent, dans un viewBox carré.

## 8. Défauts mobiles traités

Audit mené à 375, 390 et 768 px. Onze défauts, tous couverts par les sections ci-dessus :

| #   | Défaut                                                                                      | Traité en |
| --- | ------------------------------------------------------------------------------------------- | --------- |
| 1   | En-tête en débordement (logo + bouton `nowrap`)                                             | § 5.2     |
| 2   | **Aucune navigation sous 1024 px** — six liens inaccessibles sur téléphone et iPad portrait | § 5.2     |
| 3   | Chiffres du hero qui se bousculent, séparateurs orphelins en fin de ligne                   | § 5.3     |
| 4   | Légende de chiffre en `nowrap`, impossible à afficher                                       | § 5.3     |
| 5   | Boutons du hero serrés et tronqués                                                          | § 5.3     |
| 6   | Dégradé du hero horizontal sur écran étroit                                                 | § 5.3     |
| 7   | Champs de formulaire à 15 px → zoom automatique iOS                                         | § 5.11    |
| 8   | Croix de fermeture des modales à 38 px                                                      | § 5.11    |
| 9   | Gouttières à 19,5 px                                                                        | § 3.2     |
| 10  | `sizes` figés sur l'ancienne grille → images floues                                         | § 5.10    |
| 11  | Lien « olivierhildevert.com » ouvrant la modale de réservation                              | § 5.9     |

Le défaut n° 2 est le plus lourd : la navigation est aujourd'hui purement absente pour tout visiteur sur téléphone ou tablette en portrait.

## 9. Vérification

Aucune affirmation de réussite sans la sortie de commande correspondante.

- `pnpm check` — svelte-check + tsc.
- `pnpm lint` — prettier + eslint (règle `svelte/no-navigation-without-resolve` : les nouveaux liens externes de la boutique et du pied de page sortent du site, `resolve()` ne s'y applique pas).
- `pnpm build` **sans `.env`** — exigence du projet.
- `pnpm test:unit -- --run` — avec adaptation de :
  - `src/lib/content/defaults.test.ts` : les trois chiffres du hero, le mantra sans `auteur` ;
  - `src/lib/server/content.test.ts` : aller-retour `versStrapi → getPageAccueil ≡ identité` avec `lien` ajouté et `auteur` retiré.
- `pnpm exec playwright test` — tests existants verts, **plus deux nouveaux** dans `e2e/home.e2e.ts` :
  1. à 390 × 844, le burger ouvre un panneau contenant les six liens de navigation, et un clic sur « Prestations » atteint l'ancre ;
  2. les boutons de la boutique portent un `href` externe et n'ouvrent pas la modale de réservation.
- Contraste : les trois ratios du § 3.3 revérifiés sur les valeurs finales.

## 10. Hors périmètre

- **Câblage des vraies URL de la boutique** — le client les posera dans Strapi. Des URL de remplacement sont en place.
- **Mise à jour du dépôt CMS** `../olivier-hildevert-cms` (§ 6) — consignée au README, faite au moment du branchement.
- **Remplacement de `portrait-cabinet.jpg`** par un original de meilleure résolution (§ 5.7) — dépend du client.
- **Le reste du site** : `/contact`, `/reservation`, `/newsletter` et `/error` héritent des tokens et des paliers, mais leur mise en page n'est pas revue section par section dans ce lot.
- **Le « sun chart » animé du hero**, volontairement absent depuis le handoff, le reste.

## 11. Points signalés au client, tranchés

| Point                                                                     | Décision                              |
| ------------------------------------------------------------------------- | ------------------------------------- |
| « 1 h 30 » ailleurs sur le site                                           | conservé — seul le hero le perd       |
| « 34 ans » figé ou calculé depuis 1992                                    | texte modifiable dans le CMS          |
| Titre long « Séance individuelle — décodage et solutions » dans la modale | accepté tel quel, pas de champ séparé |
| Favicon au logo Svelte                                                    | remplacé par le soleil                |

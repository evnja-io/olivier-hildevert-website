# Intégration Strapi v5 — Plan d’implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre tout le contenu éditorial du site administrable via un CMS Strapi v5 (dépôt séparé), avec fallback intégral sur le contenu actuel, ISR Vercel, et enregistrement des 3 formulaires dans Strapi.

**Architecture:** Le contenu en dur est d’abord extrait dans `src/lib/content/` (types + défauts) et les composants passent en props — le site reste identique et testable sans Strapi. Un dépôt CMS séparé (`/home/sephi/olivier-hildevert-cms`) porte le content model versionné. Une couche `src/lib/server/content.ts` lit Strapi (populate explicite, validation zod) et retombe sur les défauts en tout-ou-rien par domaine. Les actions de formulaires écrivent dans des collections Strapi via `createEntry`.

**Tech Stack:** SvelteKit 2 / Svelte 5 runes, TypeScript, Superforms v2 + zod v4 (adapter `zod4`), Tailwind v4, adapter Vercel (ISR par route), Vitest (projets `client`/`server`), Playwright. CMS : Strapi v5 TypeScript + SQLite.

**Spec :** `docs/superpowers/specs/2026-07-18-strapi-integration-design.md`

## Global Constraints

- Tout texte visible par l’utilisateur est en **français**.
- `pnpm build` DOIT réussir **sans `.env`** ; les e2e (`pnpm exec playwright test`, build+preview sans `.env`) DOIVENT rester verts à chaque commit — c’est le test d’acceptation du fallback.
- Rune-mode forcé ; **pas de `svelte.config.js`** (config dans `vite.config.ts`) ; liens internes via `resolve()` de `$app/paths` ; palette Aurore uniquement (pas de `gray-*`, `red-*`…).
- Superforms : adapter `zod4` uniquement, créé **en portée module**.
- Les modules `src/lib/content/*.ts` et `src/lib/booking/prestations.ts` n’utilisent que des **imports relatifs** (pas `$lib`, pas `$app`) : ils doivent être exécutables par `npx tsx` pour le seed.
- `$env/dynamic/private` reste le mécanisme d’env de `src/lib/server/strapi.ts` (compatible ISR ; `$env/static/private` casserait le build sans `.env`).
- ISR : config **par route** (`export const config: Config = { isr: { expiration: 300 } }` dans `src/routes/+page.server.ts`), jamais sur les routes à form actions. `vite.config.ts` inchangé.
- `PRESTATION_IDS` / `PrestationId` restent **statiques** (`['individuelle', 'programme', 'entreprise', 'stage']`).
- Avant chaque commit : `pnpm format && pnpm lint && pnpm check`.
- Messages de commit en français (conventional commits), terminés par :
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` + `Claude-Session: https://claude.ai/code/session_013myY31TbFs9GHeTkTBLJd1`
- Dépôt CMS : Strapi v5, TypeScript, SQLite, schémas versionnés dans git ; `.tmp/`, `.env`, `public/uploads` ignorés (le `.gitignore` généré par Strapi les couvre).
- Branche de travail du site : `feat/strapi-cms` (déjà créée).

---

## Phase 1 — Refactor pur SvelteKit (sans Strapi)

### Task 1: Types de contenu + contenu par défaut

**Files:**

- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/defaults.ts`
- Test: `src/lib/content/defaults.test.ts` (projet Vitest `server`)

**Interfaces:**

- Consumes: `PrestationId` depuis `../booking/prestations` (type inchangé à ce stade).
- Produces: tous les types de contenu (`PageAccueilContent`, `HeroContent`, `ApprocheContent`, `EspritAmeContent`, `AProposContent`, `IntroSection`, `PourQuiContent`, `BoutiqueContent`, `TarifsContent`, `MantraContent`, `ContactCtaContent`, `PrestationContent`, `ReglagesSite`, `StatHero`, `Strate`, `ColonneEspritAme`, `ProduitBoutique`, `CarteTarif`, `CleImageBoutique`) et les constantes `defaultAccueil: PageAccueilContent`, `defaultPrestations: PrestationContent[]`, `defaultReglages: ReglagesSite`.

- [ ] **Step 1: Écrire `src/lib/content/types.ts`**

```ts
/**
 * Types du contenu éditorial — source de vérité côté front, découplés de la
 * forme Strapi (le mapping vit dans $lib/server/content.ts). Les images, alt
 * et positions restent dans les composants, appariés par clé stable.
 */
import type { PrestationId } from '../booking/prestations';

export interface StatHero {
	valeur: string;
	legende: string;
}

export interface HeroContent {
	eyebrow: string;
	titreLigne1: string;
	titreLigne2: string;
	paragraphe: string;
	ligneMono: string;
	boutonPrincipal: string;
	boutonSecondaire: string;
	stats: StatHero[];
}

export interface Strate {
	num: string;
	titre: string;
	desc: string;
	profondeur: string;
}

export interface ApprocheContent {
	eyebrow: string;
	titre: string;
	paragraphe1: string;
	paragraphe2: string;
	strates: Strate[];
	legendeGauche: string;
	legendeDroite: string;
}

export interface ColonneEspritAme {
	tag: string;
	titre: string;
	desc: string;
	points: string[];
}

export interface EspritAmeContent {
	eyebrow: string;
	titre: string;
	colonneEsprit: ColonneEspritAme;
	colonneAme: ColonneEspritAme;
}

export interface AProposContent {
	eyebrow: string;
	titre: string;
	sousTitre: string;
	paragraphe1: string;
	paragraphe2: string;
	paragraphe3: string;
	citation: string;
	qualifications: string[];
	legendePortrait: string;
}

export interface IntroSection {
	eyebrow: string;
	titre: string;
	paragraphe: string;
}

export interface PourQuiContent {
	eyebrow: string;
	titre: string;
	publics: string[];
}

export type CleImageBoutique = 'livre' | 'veilleuses';

export interface ProduitBoutique {
	cleImage: CleImageBoutique;
	tag: string;
	titre: string;
	desc: string;
	prixTexte: string;
	boutonLabel: string;
}

export interface BoutiqueContent {
	eyebrow: string;
	titre: string;
	paragraphe: string;
	produits: ProduitBoutique[];
}

export interface CarteTarif {
	label: string;
	montant: string;
	suffixe?: string;
	sousTexte: string;
	boutonLabel: string;
	prestationCle: PrestationId;
	misEnAvant: boolean;
}

export interface TarifsContent {
	eyebrow: string;
	titre: string;
	cartes: CarteTarif[];
}

/** `citation` : les segments entre astérisques (`*…*`) sont mis en valeur. */
export interface MantraContent {
	citation: string;
	auteur: string;
}

export interface ContactCtaContent {
	eyebrow: string;
	titre: string;
	paragraphe: string;
	boutonLabel: string;
	modes: string[];
}

export interface PageAccueilContent {
	hero: HeroContent;
	approche: ApprocheContent;
	espritAme: EspritAmeContent;
	aPropos: AProposContent;
	prestationsIntro: IntroSection;
	pourQui: PourQuiContent;
	boutique: BoutiqueContent;
	tarifs: TarifsContent;
	mantra: MantraContent;
	contactCta: ContactCtaContent;
}

/**
 * Une prestation = UNE entrée avec des rédactions distinctes par contexte
 * (modale/réservation vs carte home) — unifie les 3 sources divergentes.
 */
export interface PrestationContent {
	cle: PrestationId;
	titre: string;
	metaReservation: string;
	descReservation: string;
	descCarte: string;
	prixCarte: string;
	actionCarte: string;
}

export interface ReglagesSite {
	tagline: string;
	descriptionSeo: string;
	mentionLegale: string;
	footerIntro: string;
	sousTitreLogo: string;
	email?: string;
	telephone?: string;
	adresse?: string;
	siteExterne?: string;
}
```

- [ ] **Step 2: Écrire `src/lib/content/defaults.ts`** — extraction fidèle du contenu en dur actuel (sources : `Hero.svelte`, `Approche.svelte`, `EspritAme.svelte`, `APropos.svelte`, `Prestations.svelte`, `PourQui.svelte`, `Boutique.svelte`, `Tarifs.svelte`, `Mantra.svelte`, `ContactCta.svelte`, `Footer.svelte`, `config.ts`, `booking/prestations.ts`). Conserver les apostrophes typographiques telles quelles dans les textes.

```ts
/**
 * Contenu par défaut du site : fallback intégral quand Strapi est absent ou
 * indisponible, ET source canonique du seed du CMS. Texte extrait à
 * l’identique des composants d’origine — toute retouche éditoriale se fait
 * ici tant que Strapi n’est pas la source active.
 */
import type { PageAccueilContent, PrestationContent, ReglagesSite } from './types';

export const defaultAccueil: PageAccueilContent = {
	hero: {
		eyebrow: 'Sophrologie · Thérapie psycho énergétique',
		titreLigne1: 'Décoder le visible,',
		titreLigne2: 'grâce à l’invisible',
		paragraphe:
			'Un accompagnement psycho-spirituel qui relie l’esprit et l’âme pour révéler le sens profond de ce que vous traversez, et faire lever en vous l’élan de la transformation.',
		ligneMono: 'Accompagnement non médical · Particuliers, groupes & entreprises',
		boutonPrincipal: 'Réserver une séance',
		boutonSecondaire: 'Découvrir l’approche',
		stats: [
			{ valeur: '1992', legende: 'Praticien en relation d’aide' },
			{ valeur: '1 h 30', legende: 'Par séance individuelle' },
			{ valeur: '+30 ans', legende: 'D’accompagnements' }
		]
	},
	approche: {
		eyebrow: 'L’approche',
		titre: 'Sept niveaux de lecture de l’être',
		paragraphe1:
			'Comprendre ne suffit pas. Chaque situation de vie se lit à plusieurs profondeurs de la surface du mental jusqu’au sens symbolique de l’expérience.',
		paragraphe2:
			'L’accompagnement parcourt cette échelle pour révéler ce qui se joue vraiment, et favoriser la réparation, la transformation et l’évolution.',
		strates: [
			{
				num: 'I',
				titre: 'Psychologique',
				desc: 'Les mécanismes de pensée, les schémas et les histoires intérieures.',
				profondeur: 'Surface · mental'
			},
			{
				num: 'II',
				titre: 'Émotionnel',
				desc: 'Ce qui se ressent, se retient ou cherche à se libérer.',
				profondeur: 'Ressenti'
			},
			{
				num: 'III',
				titre: 'Relationnel',
				desc: 'Les liens, les loyautés et les dynamiques qui nous traversent.',
				profondeur: 'Liens'
			},
			{
				num: 'IV',
				titre: 'Philosophique',
				desc: 'Le sens, les valeurs et les questionnements existentiels.',
				profondeur: 'Sens · valeurs'
			},
			{
				num: 'V',
				titre: 'Énergétique',
				desc: 'Les équilibres subtils, vibratoires et fréquentiels de l’être.',
				profondeur: 'Subtil · vibratoire'
			},
			{
				num: 'VI',
				titre: 'Spirituel',
				desc: 'La dimension de l’âme, sans dogme ni appartenance religieuse.',
				profondeur: 'Âme'
			},
			{
				num: 'VII',
				titre: 'Symbolique',
				desc: 'Le langage des images, métaphores et signes de l’expérience.',
				profondeur: 'Profondeur · sens'
			}
		],
		legendeGauche: 'De la surface à la profondeur',
		legendeDroite: 'Sept portes — une même lumière'
	},
	espritAme: {
		eyebrow: 'Deux logiques, une même personne',
		titre: 'États d’esprit & états d’âme',
		colonneEsprit: {
			tag: 'États d’esprit',
			titre: 'La logique humaine',
			desc: 'Le terrain du mental : raison, analyse, synthèse. Ce que l’on peut nommer, structurer et comprendre par le raisonnement.',
			points: [
				'Rationalité & clarté',
				'Analyse des situations',
				'Synthèse & mise en sens',
				'Lecture comportementale'
			]
		},
		colonneAme: {
			tag: 'États d’âme',
			titre: 'La logique subtile',
			desc: 'Le terrain de l’invisible : intuition, énergie, extra-sensorialité. Ce qui se perçoit au-delà du mental et oriente nos profondeurs.',
			points: [
				'Intuition & clair-connaissance',
				'Dimension vibratoire',
				'Mondes subtils & fréquentiels',
				'Sens spirituel de l’expérience'
			]
		}
	},
	aPropos: {
		eyebrow: 'À propos',
		titre: 'Olivier Hildevert',
		sousTitre: 'Sophrologue · praticien en relation d’aide',
		paragraphe1:
			'Sophrologue social et praticien en relation d’aide depuis 1992, formé au Collège International de Sophrologie de Paris et membre professionnel de la Chambre Syndicale de la Sophrologie.',
		paragraphe2:
			'Initié aux techniques d’éveil énergétique, il met en évidence les interactions fondamentales entre les dimensions psychologique, émotionnelle, vibratoire, philosophique et spirituelle de l’être humain.',
		paragraphe3:
			'Conseiller en entreprise spécialisé en psycho-recrutement, préparateur mental des sportifs et des artistes, auteur d’audios de sophrologie, d’articles et de pièces de théâtre.',
		citation:
			'Révéler le sens des expériences dans lesquelles chacun est en quête de construction, de réparation et de transformation.',
		qualifications: [
			'Praticien depuis 1992',
			'Collège International de Sophrologie de Paris',
			'Chambre Syndicale de la Sophrologie',
			'Préparation mentale',
			'Psycho-recrutement'
		],
		legendePortrait: 'Cabinet — relation d’aide'
	},
	prestationsIntro: {
		eyebrow: 'Prestations',
		titre: 'Des accompagnements pour chaque chemin',
		paragraphe:
			'Pour les particuliers, les groupes et les entreprises en présentiel, en visioconférence ou par téléphone.'
	},
	pourQui: {
		eyebrow: 'Pour qui ?',
		titre: 'Un accompagnement ouvert à chacun(e)',
		publics: [
			'Particuliers',
			'Couples',
			'Familles',
			'Artistes',
			'Sportifs',
			'Dirigeants',
			'Entreprises',
			'Associations',
			'Groupes de développement personnel'
		]
	},
	boutique: {
		eyebrow: 'Boutique',
		titre: 'Prolonger le chemin',
		paragraphe:
			'Un roman thérapeutique et les veilleuses LUMINÂME, pensées pour la réharmonisation vibratoire des lieux et des états d’être.',
		produits: [
			{
				cleImage: 'livre',
				tag: 'Roman fantastique & thérapeutique',
				titre: 'Angela, l’ange est là !',
				desc: 'Un récit où le merveilleux soigne; premier roman d’Olivier Hildevert, paru chez BoD.',
				prixTexte: 'Disponible à la commande',
				boutonLabel: 'Commander'
			},
			{
				cleImage: 'veilleuses',
				tag: 'Veilleuses thérapeutiques',
				titre: 'LUMINÂME',
				desc: 'Inspirées de motifs sacrés, pour l’harmonisation vibratoire des lieux, le bien-être énergétique et les pratiques méditatives.',
				prixTexte: 'Catalogue en ligne',
				boutonLabel: 'Découvrir'
			}
		]
	},
	tarifs: {
		eyebrow: 'Tarifs',
		titre: 'Une tarification claire',
		cartes: [
			{
				label: 'Groupes',
				montant: 'Devis',
				sousTexte: 'Ateliers et stages collectifs, adaptés à votre groupe.',
				boutonLabel: 'Demander',
				prestationCle: 'stage',
				misEnAvant: false
			},
			{
				label: 'Particuliers',
				montant: '140',
				suffixe: '€',
				sousTexte: 'Séance individuelle de 1 h 30, en présentiel ou à distance.',
				boutonLabel: 'Réserver',
				prestationCle: 'individuelle',
				misEnAvant: true
			},
			{
				label: 'Entreprises',
				montant: 'Devis',
				sousTexte: 'Accompagnement des dirigeants et des collaborateurs sur mesure.',
				boutonLabel: 'Demander',
				prestationCle: 'entreprise',
				misEnAvant: false
			}
		]
	},
	mantra: {
		citation:
			'Relier les *états d’esprit* et les *états d’âme*, pour révéler le sens des expériences où chacun se construit, se répare et se transforme.',
		auteur: 'La vocation de l’accompagnement'
	},
	contactCta: {
		eyebrow: 'Contact',
		titre: 'Faisons lever votre chemin',
		paragraphe:
			'Prenez rendez-vous pour une première séance, ou écrivez-moi votre demande. Les consultations sont proposées en présentiel, en visioconférence ou par téléphone, selon vos besoins.',
		boutonLabel: 'Prendre rendez-vous',
		modes: ['En présentiel', 'En visioconférence', 'Par téléphone']
	}
};

/**
 * Rédactions unifiées (titres des cartes home retenus : « Entreprises &
 * dirigeants », « Stages & ateliers »). En ajouter/retirer une = modification
 * de code (clés statiques dans booking/prestations.ts).
 */
export const defaultPrestations: PrestationContent[] = [
	{
		cle: 'individuelle',
		titre: 'Séance individuelle',
		metaReservation: '1 h 30 · 140 €',
		descReservation: 'Décodage et accompagnement d’une situation de vie.',
		descCarte:
			'Décodage des situations de vie : relationnel, affectif, burn-out, transitions, traumatismes, recherche de sens et préparation de projets.',
		prixCarte: '140 € · 1 h 30',
		actionCarte: 'Réserver →'
	},
	{
		cle: 'programme',
		titre: 'Programme personnalisé',
		metaReservation: 'Sur mesure · plusieurs séances',
		descReservation: 'Parcours d’éveil, de réorientation et de transformation.',
		descCarte:
			'Parcours d’éveil et de transformation : éveil de conscience, réorientation de vie, développement intuitif et rééquilibrage psycho-énergétique.',
		prixCarte: 'Sur mesure',
		actionCarte: 'En savoir plus →'
	},
	{
		cle: 'entreprise',
		titre: 'Entreprises & dirigeants',
		metaReservation: 'Sur devis',
		descReservation: 'Psycho-recrutement, préparation mentale, cohésion.',
		descCarte:
			'Psycho-recrutement, analyse comportementale, préparation mentale, cohésion d’équipe et optimisation des ressources humaines.',
		prixCarte: 'Sur devis',
		actionCarte: 'Demander un devis →'
	},
	{
		cle: 'stage',
		titre: 'Stages & ateliers',
		metaReservation: 'Sur devis · groupe',
		descReservation: 'Conférences et ateliers pratiques d’éveil énergétique.',
		descCarte:
			'Conférences et ateliers : sophrologie, intelligence émotionnelle, conscience de soi, éveil énergétique et spiritualité appliquée.',
		prixCarte: 'Sur devis · groupe',
		actionCarte: 'Organiser →'
	}
];

export const defaultReglages: ReglagesSite = {
	tagline: 'Décoder le visible grâce à l’invisible',
	descriptionSeo:
		'Accompagnement psycho-spirituel et psycho énergétique — décoder le visible grâce à l’invisible. Particuliers, groupes et entreprises.',
	mentionLegale:
		'Les accompagnements proposés ne relèvent pas de la médecine et ne se substituent en aucun cas à un avis, un diagnostic ou un traitement médical.',
	footerIntro:
		'Décoder le visible grâce à l’invisible. Accompagnement psycho-spirituel et psycho énergétique pour particuliers, groupes et entreprises.',
	sousTitreLogo: 'Consultant',
	siteExterne: 'olivierhildevert.com'
};
```

⚠️ **Autorité des textes : les composants sources, pas ce plan.** Copier-coller chaque chaîne depuis le composant d'origine (chemins listés en tête de step) pour préserver les glyphes exacts d'apostrophe — les sources mêlent apostrophes typographiques `’` (valides entre guillemets simples) et droites `'` (à mettre entre guillemets doubles). Seules exceptions, propres à ce refactor : `titreLigne1`/`titreLigne2` (découpe du h1 du hero), `footerIntro` (phrase du footer recomposée en une chaîne), la `citation` du mantra (balisage `*…*` ajouté) et les rédactions unifiées de `defaultPrestations` (titres des cartes retenus). Laisser `pnpm format` normaliser le style de guillemets.

- [ ] **Step 3: Écrire le test de structure `src/lib/content/defaults.test.ts` (échec attendu impossible ici — le module vient d’être créé ; ce test verrouille la structure pour la suite)**

```ts
import { describe, expect, it } from 'vitest';
import { PRESTATION_IDS } from '../booking/prestations';
import { defaultAccueil, defaultPrestations, defaultReglages } from './defaults';

describe('contenu par défaut', () => {
	it('fournit les 4 prestations dans l’ordre canonique des clés', () => {
		expect(defaultPrestations.map((p) => p.cle)).toEqual([...PRESTATION_IDS]);
	});

	it('a une page d’accueil structurée (7 strates, 3 stats, 2 colonnes de 4 points)', () => {
		expect(defaultAccueil.approche.strates).toHaveLength(7);
		expect(defaultAccueil.hero.stats).toHaveLength(3);
		expect(defaultAccueil.espritAme.colonneEsprit.points).toHaveLength(4);
		expect(defaultAccueil.espritAme.colonneAme.points).toHaveLength(4);
		expect(defaultAccueil.tarifs.cartes).toHaveLength(3);
		expect(defaultAccueil.boutique.produits.map((p) => p.cleImage)).toEqual([
			'livre',
			'veilleuses'
		]);
	});

	it('met en valeur des segments du mantra (nombre impair de segments *…*)', () => {
		expect(defaultAccueil.mantra.citation.split('*').length % 2).toBe(1);
	});

	it('porte les réglages du site (mention légale, tagline)', () => {
		expect(defaultReglages.mentionLegale).toContain('ne relèvent pas de la médecine');
		expect(defaultReglages.tagline).toBe('Décoder le visible grâce à l’invisible');
	});
});
```

- [ ] **Step 4: Vérifier**

Run: `pnpm check && pnpm test:unit -- --run src/lib/content/defaults.test.ts`
Expected: check OK, 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/
git commit -m "feat(contenu): types et contenu par défaut extraits dans \$lib/content"
```

---

### Task 2: Clés de prestations statiques + modale et page /reservation sur PrestationContent

**Files:**

- Modify: `src/lib/booking/prestations.ts` (réécriture complète)
- Modify: `src/lib/components/BookingModal.svelte`
- Modify: `src/routes/reservation/+page.svelte`

**Interfaces:**

- Consumes: `PrestationContent`, `defaultPrestations` (Task 1).
- Produces: `PRESTATION_IDS` (readonly tuple) et `PrestationId` inchangés pour `booking/schema.ts` (`z.enum(PRESTATION_IDS)` — ne pas toucher au schéma) ; `BookingModal` accepte une prop optionnelle `prestations?: PrestationContent[]`.

- [ ] **Step 1: Réécrire `src/lib/booking/prestations.ts`** (l’export `PRESTATIONS` disparaît)

```ts
/**
 * Clés structurelles des prestations — statiques par design : elles apparient
 * les images locales, le paramètre ?prestation= et le z.enum du formulaire.
 * Les TEXTES des prestations vivent dans $lib/content (défauts + Strapi) ;
 * ajouter ou retirer une prestation reste une modification de code.
 */
export const PRESTATION_IDS = ['individuelle', 'programme', 'entreprise', 'stage'] as const;

export type PrestationId = (typeof PRESTATION_IDS)[number];
```

- [ ] **Step 2: Adapter `src/lib/components/BookingModal.svelte`** — dans le `<script lang="ts">` (pas le bloc `module`) :

Remplacer :

```ts
import { PRESTATIONS, type PrestationId } from '$lib/booking/prestations';
```

par :

```ts
import type { PrestationId } from '$lib/booking/prestations';
import type { PrestationContent } from '$lib/content/types';
import { defaultPrestations } from '$lib/content/defaults';

let { prestations = defaultPrestations }: { prestations?: PrestationContent[] } = $props();
```

Puis dans le composant :

- `const prestationChoisie = $derived(PRESTATIONS.find((p) => p.id === $form.prestation));` → `const prestationChoisie = $derived(prestations.find((p) => p.cle === $form.prestation));`
- `{#each PRESTATIONS as p (p.id)}` → `{#each prestations as p (p.cle)}`
- dans le bouton de choix : `{p.titre}` inchangé, `{p.meta}` → `{p.metaReservation}`, `{p.desc}` → `{p.descReservation}`, `onclick={() => choisir(p.id)}` → `onclick={() => choisir(p.cle)}`

- [ ] **Step 3: Adapter `src/routes/reservation/+page.svelte`**

Remplacer :

```ts
import { PRESTATIONS } from '$lib/booking/prestations';
```

par :

```ts
import { defaultPrestations } from '$lib/content/defaults';
```

Et dans le fieldset : `{#each PRESTATIONS as p (p.id)}` → `{#each defaultPrestations as p (p.cle)}`, `value={p.id}` → `value={p.cle}`, `{p.meta}` → `{p.metaReservation}`, `{p.desc}` → `{p.descReservation}`. (`data.prestations` remplacera `defaultPrestations` en Task 12.)

- [ ] **Step 4: Vérifier (le z.enum et les e2e modale doivent rester intacts)**

Run: `pnpm check && pnpm test:unit -- --run && pnpm exec playwright test e2e/home.e2e.ts`
Expected: tout PASS (les noms « Séance individuelle », « Programme personnalisé » n’ont pas changé).

- [ ] **Step 5: Commit**

```bash
git add src/lib/booking/prestations.ts src/lib/components/BookingModal.svelte src/routes/reservation/+page.svelte
git commit -m "refactor(prestations): clés statiques, textes portés par PrestationContent"
```

---

### Task 3: Hero, Approche, EspritAme, APropos pilotés par props

**Files:**

- Modify: `src/lib/components/home/Hero.svelte`
- Modify: `src/lib/components/home/Approche.svelte`
- Modify: `src/lib/components/home/EspritAme.svelte`
- Modify: `src/lib/components/home/APropos.svelte`

**Interfaces:**

- Consumes: `defaultAccueil` + types (Task 1).
- Produces: chaque composant expose `content?: <SectionContent>` avec défaut — `<Hero />` sans prop rend exactement le site actuel.

Refactor mécanique, à l’identique visuellement. Pour chaque composant : supprimer les constantes locales, ajouter la prop, substituer les littéraux du markup. Les images, `alt`, SVG et classes ne changent pas.

- [ ] **Step 1: `Hero.svelte`** — script :

```ts
import { resolve } from '$app/paths';
import { openBooking } from '$lib/booking/booking.svelte';
import type { HeroContent } from '$lib/content/types';
import { defaultAccueil } from '$lib/content/defaults';

let { content = defaultAccueil.hero }: { content?: HeroContent } = $props();

let ready = $state(false);
$effect(() => {
	requestAnimationFrame(() => (ready = true));
});
```

(la constante `stats` disparaît). Markup : eyebrow → `{content.eyebrow}` ; h1 → `{content.titreLigne1}<br /> <em class="…">{content.titreLigne2}</em>` ; paragraphe → `{content.paragraphe}` ; ligne mono → `{content.ligneMono}` ; boutons → `{content.boutonPrincipal}` (le SVG flèche reste dans le `<a>`) et `{content.boutonSecondaire}` ; `{#each stats as stat (stat.valeur)}` → `{#each content.stats as stat (stat.valeur)}`.

- [ ] **Step 2: `Approche.svelte`** — script :

```ts
import { reveal } from '$lib/attachments/reveal';
import type { ApprocheContent } from '$lib/content/types';
import { defaultAccueil } from '$lib/content/defaults';

let { content = defaultAccueil.approche }: { content?: ApprocheContent } = $props();
```

Markup : eyebrow/h2/2 paragraphes → `{content.…}` ; `{#each strates …}` → `{#each content.strates as strate, i (strate.num)}` ; les deux légendes mono du bas → `{content.legendeGauche}` / `{content.legendeDroite}`.

- [ ] **Step 3: `EspritAme.svelte`** — script :

```ts
import { reveal } from '$lib/attachments/reveal';
import type { EspritAmeContent } from '$lib/content/types';
import { defaultAccueil } from '$lib/content/defaults';

let { content = defaultAccueil.espritAme }: { content?: EspritAmeContent } = $props();

const colonnes = $derived([
	{ variante: 'mind' as const, ...content.colonneEsprit },
	{ variante: 'soul' as const, ...content.colonneAme }
]);
```

Markup inchangé (il consomme déjà `colonnes`), sauf l’en-tête de section : eyebrow → `{content.eyebrow}`, h2 → `{content.titre}` (le `&amp;` littéral devient le texte de `content.titre`).

- [ ] **Step 4: `APropos.svelte`** — script :

```ts
import { reveal } from '$lib/attachments/reveal';
import type { AProposContent } from '$lib/content/types';
import { defaultAccueil } from '$lib/content/defaults';

let { content = defaultAccueil.aPropos }: { content?: AProposContent } = $props();
```

Markup : eyebrow/h2/sous-titre/3 paragraphes/blockquote → `{content.…}` (`paragraphe1..3`, `citation`) ; `{#each creds …}` → `{#each content.qualifications as cred (cred)}` ; légende sous le portrait → `{content.legendePortrait}`. L'`alt` du portrait reste en dur.

- [ ] **Step 5: Vérifier puis committer**

Run: `pnpm check && pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS. Puis :

```bash
git add src/lib/components/home/
git commit -m "refactor(home): Hero, Approche, EspritAme et APropos pilotés par props de contenu"
```

---

### Task 4: Prestations, PourQui, Mantra, ContactCta pilotés par props

**Files:**

- Modify: `src/lib/components/home/Prestations.svelte`
- Modify: `src/lib/components/home/PourQui.svelte`
- Modify: `src/lib/components/home/Mantra.svelte`
- Modify: `src/lib/components/home/ContactCta.svelte`

**Interfaces:**

- Produces: `Prestations` accepte `intro?: IntroSection` et `prestations?: PrestationContent[]` ; les autres `content?: <SectionContent>`.

- [ ] **Step 1: `Prestations.svelte`** — script complet :

```ts
import { resolve } from '$app/paths';
import { openBooking } from '$lib/booking/booking.svelte';
import { reveal } from '$lib/attachments/reveal';
import type { PrestationId } from '$lib/booking/prestations';
import type { IntroSection, PrestationContent } from '$lib/content/types';
import { defaultAccueil, defaultPrestations } from '$lib/content/defaults';

import cardIndividuelle from '$lib/assets/card-individuelle.jpg?enhanced';
import cardProgramme from '$lib/assets/card-programme.jpg?enhanced';
import cardEntreprise from '$lib/assets/card-entreprise.jpg?enhanced';
import cardStages from '$lib/assets/card-stages.jpg?enhanced';

let {
	intro = defaultAccueil.prestationsIntro,
	prestations = defaultPrestations
}: { intro?: IntroSection; prestations?: PrestationContent[] } = $props();

const reservation = resolve('/reservation');

type EnhancedSrc = typeof cardIndividuelle;

// Les images restent locales, appariées par clé stable.
const IMAGES_PRESTATIONS: Record<
	PrestationId,
	{ num: string; image: EnhancedSrc; position: string; alt: string }
> = {
	individuelle: {
		num: '01',
		image: cardIndividuelle,
		position: 'center 60%',
		alt: 'Silhouette en méditation, énergie lumineuse reliant l’esprit et le cœur'
	},
	programme: {
		num: '02',
		image: cardProgramme,
		position: 'center 42%',
		alt: 'Chemin de lumière serpentant vers un soleil levant à travers les nuées'
	},
	entreprise: {
		num: '03',
		image: cardEntreprise,
		position: 'center 58%',
		alt: 'Groupe de silhouettes reliées par des fils de lumière devant un soleil levant'
	},
	stage: {
		num: '04',
		image: cardStages,
		position: 'center 48%',
		alt: 'Cercle de sphères lumineuses gravitant autour d’un soleil central'
	}
};

const cartes = $derived(prestations.map((p) => ({ ...p, ...IMAGES_PRESTATIONS[p.cle] })));
```

Markup : en-tête → `{intro.eyebrow}` / `{intro.titre}` / `{intro.paragraphe}` ; `{#each cartes as carte, i (carte.id)}` → `{#each cartes as carte, i (carte.cle)}` ; `href="{reservation}?prestation={carte.id}"` → `…{carte.cle}` ; `openBooking(carte.id)` → `openBooking(carte.cle)` ; `{carte.desc}` → `{carte.descCarte}` ; `{carte.prix}` → `{carte.prixCarte}` ; `{carte.action}` → `{carte.actionCarte}` ; `{carte.num}`, `{carte.titre}`, `src={carte.image}`, `alt={carte.alt}`, `carte.position` inchangés.

- [ ] **Step 2: `PourQui.svelte`** — script :

```ts
import { reveal } from '$lib/attachments/reveal';
import type { PourQuiContent } from '$lib/content/types';
import { defaultAccueil } from '$lib/content/defaults';

let { content = defaultAccueil.pourQui }: { content?: PourQuiContent } = $props();
```

Markup : eyebrow → `{content.eyebrow}`, h2 → `{content.titre}`, `{#each publics …}` → `{#each content.publics as public_ (public_)}`.

- [ ] **Step 3: `Mantra.svelte`** — fichier complet :

```svelte
<script lang="ts">
	import { reveal } from '$lib/attachments/reveal';
	import type { MantraContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.mantra }: { content?: MantraContent } = $props();

	// segments impairs (entre *…*) mis en valeur
	const segments = $derived(content.citation.split('*'));
</script>

<div class="wrap">
	<div class="reveal mx-auto max-w-[900px] text-center" {@attach reveal()}>
		<p
			class="font-display text-[clamp(28px,4.3vw,52px)] leading-[1.22] tracking-[0.004em] [text-shadow:0_2px_30px_rgba(74,27,18,0.4)]"
		>
			{#each segments as segment, i (i)}
				{#if i % 2 === 1}<b class="font-normal text-amber-soft italic">{segment}</b
					>{:else}{segment}{/if}
			{/each}
		</p>
		<div class="rule mx-auto mt-7.5 max-w-[200px] text-white [&>b]:bg-amber-soft">
			<i></i><b></b><i></i>
		</div>
		<cite
			class="mt-4.5 block font-mono text-[11px] tracking-[0.26em] text-white/80 uppercase not-italic"
		>
			{content.auteur}
		</cite>
	</div>
</div>
```

- [ ] **Step 4: `ContactCta.svelte`** — script :

```ts
import { resolve } from '$app/paths';
import { openBooking } from '$lib/booking/booking.svelte';
import { reveal } from '$lib/attachments/reveal';
import type { ContactCtaContent } from '$lib/content/types';
import { defaultAccueil } from '$lib/content/defaults';

let { content = defaultAccueil.contactCta }: { content?: ContactCtaContent } = $props();
```

Markup : eyebrow/h2/paragraphe → `{content.…}` ; libellé du bouton → `{content.boutonLabel}` (le SVG flèche reste) ; `{#each modes …}` → `{#each content.modes as mode (mode)}`.

- [ ] **Step 5: Test client de composant `src/lib/components/home/Prestations.svelte.test.ts`** (projet Vitest `client` — Chromium requis : `pnpm exec playwright install chromium` si absent)

```ts
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { defaultPrestations } from '$lib/content/defaults';
import Prestations from './Prestations.svelte';

describe('Prestations', () => {
	it('affiche le contenu par défaut sans props', async () => {
		const screen = render(Prestations);
		await expect
			.element(screen.getByRole('heading', { name: 'Des accompagnements pour chaque chemin' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('heading', { name: 'Séance individuelle' }))
			.toBeInTheDocument();
	});

	it('affiche le contenu passé en props (CMS)', async () => {
		const screen = render(Prestations, {
			props: {
				intro: { eyebrow: 'Offre', titre: 'Titre venu du CMS', paragraphe: 'Intro CMS.' },
				prestations: [{ ...defaultPrestations[0], titre: 'Titre de prestation revu' }]
			}
		});
		await expect
			.element(screen.getByRole('heading', { name: 'Titre venu du CMS' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole('heading', { name: 'Titre de prestation revu' }))
			.toBeInTheDocument();
	});
});
```

Run: `pnpm test:unit -- --run src/lib/components/home/Prestations.svelte.test.ts`
Expected: PASS (2 tests, navigateur Chromium).

- [ ] **Step 6: Vérifier puis committer**

Run: `pnpm check && pnpm exec playwright test`
Expected: PASS (3 fichiers e2e).

```bash
git add src/lib/components/home/
git commit -m "refactor(home): Prestations, PourQui, Mantra et ContactCta pilotés par props (+ test client)"
```

---

### Task 5: Boutique et Tarifs factorisés en listes de contenu

**Files:**

- Modify: `src/lib/components/home/Boutique.svelte` (réécriture)
- Modify: `src/lib/components/home/Tarifs.svelte` (réécriture)

- [ ] **Step 1: Réécrire `Boutique.svelte`**

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { BoutiqueContent, CleImageBoutique } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	import bookCover from '$lib/assets/book-cover.jpeg?enhanced';
	import luminame from '$lib/assets/luminame.jpg?enhanced';

	let { content = defaultAccueil.boutique }: { content?: BoutiqueContent } = $props();

	const reservation = resolve('/reservation');

	type EnhancedSrc = typeof bookCover;

	// Les images restent locales, appariées au contenu par cleImage.
	const IMAGES_BOUTIQUE: Record<
		CleImageBoutique,
		{ image: EnhancedSrc; alt: string; ratio: string; style?: string }
	> = {
		livre: {
			image: bookCover,
			alt: 'Couverture du roman Angela, l’ange est là !',
			ratio: 'aspect-3/4'
		},
		veilleuses: {
			image: luminame,
			alt: 'Veilleuse LUMINÂME gravée de motifs sacrés, allumée sur un socle en bois',
			ratio: 'aspect-square',
			style: 'object-position: 38% center'
		}
	};
</script>

<section
	id="boutique"
	class="relative z-1 scroll-mt-24 bg-linear-to-b from-blush to-blush-2 py-[clamp(86px,11vw,148px)]"
>
	<div class="wrap">
		<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
			<span class="eyebrow">{content.eyebrow}</span>
			<h2 class="mt-5 mb-4.5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">
				{content.titre}
			</h2>
			<p class="text-[17.5px] leading-[1.66] text-ink-soft">
				{content.paragraphe}
			</p>
		</div>
		<div class="grid gap-5.5 lg:grid-cols-2">
			{#each content.produits as produit (produit.cleImage)}
				{@const img = IMAGES_BOUTIQUE[produit.cleImage]}
				<div
					class="reveal grid items-center gap-6 rounded-card border border-line bg-white p-6 shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)] transition hover:-translate-y-[5px] hover:shadow-[0_38px_76px_-46px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] sm:grid-cols-[0.82fr_1.18fr]"
					{@attach reveal()}
				>
					<div
						class="{img.ratio} overflow-hidden rounded-btn shadow-[0_16px_38px_-22px_color-mix(in_oklab,var(--color-ember)_50%,transparent)] max-sm:mx-auto max-sm:max-w-[200px]"
					>
						<enhanced:img
							src={img.image}
							alt={img.alt}
							loading="lazy"
							sizes="(min-width: 640px) 240px, 200px"
							class="h-full w-full object-cover"
							style={img.style}
						/>
					</div>
					<div>
						<span class="font-mono text-[10px] tracking-[0.18em] text-coral uppercase">
							{produit.tag}
						</span>
						<h3 class="mt-2 mb-2.5 text-[26px] tracking-[0.01em]">{produit.titre}</h3>
						<p class="mb-4.5 text-[13.5px] leading-[1.6] text-ink-soft">
							{produit.desc}
						</p>
						<div class="flex flex-wrap items-center gap-3.5">
							<b class="font-mono text-[11px] tracking-[0.08em] text-mute uppercase">
								{produit.prixTexte}
							</b>
							<a
								class="btn btn-line"
								href={reservation}
								onclick={(e) => {
									e.preventDefault();
									openBooking();
								}}
							>
								{produit.boutonLabel}
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
```

- [ ] **Step 2: Réécrire `Tarifs.svelte`**

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { openBooking } from '$lib/booking/booking.svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { PrestationId } from '$lib/booking/prestations';
	import type { TarifsContent } from '$lib/content/types';
	import { defaultAccueil } from '$lib/content/defaults';

	let { content = defaultAccueil.tarifs }: { content?: TarifsContent } = $props();

	const reservation = resolve('/reservation');

	function ouvrir(e: MouseEvent, id: PrestationId) {
		e.preventDefault();
		openBooking(id);
	}
</script>

<section id="tarifs" class="relative z-1 scroll-mt-24 bg-sky py-[clamp(86px,11vw,148px)]">
	<div class="wrap">
		<div class="reveal mx-auto mb-16 max-w-[640px] text-center" {@attach reveal()}>
			<span class="eyebrow eyebrow-center">{content.eyebrow}</span>
			<h2 class="mt-5 text-[clamp(34px,5vw,58px)] tracking-[0.005em]">{content.titre}</h2>
		</div>
		<div class="grid items-stretch gap-4.5 lg:grid-cols-3">
			{#each content.cartes as carte, i (carte.label)}
				{#if carte.misEnAvant}
					<div
						class="reveal flex flex-col items-center gap-2 rounded-card bg-linear-165 from-coral to-ember px-7.5 py-11 text-center text-white shadow-[0_34px_70px_-38px_color-mix(in_oklab,var(--color-ember)_80%,transparent)] lg:-translate-y-2.5"
						{@attach reveal(i * 90)}
					>
						<span class="font-mono text-[10.5px] tracking-[0.2em] text-amber-soft uppercase">
							{carte.label}
						</span>
						<div class="my-1.5 font-display text-[56px] leading-none">
							{carte.montant}{#if carte.suffixe}<small class="text-xl text-white/82">
									{carte.suffixe}</small
								>{/if}
						</div>
						<p class="mb-3 text-[13.5px] leading-[1.55] text-white/88">{carte.sousTexte}</p>
						<a
							class="btn bg-white text-ember shadow-none hover:bg-amber-soft hover:text-dusk"
							href="{reservation}?prestation={carte.prestationCle}"
							onclick={(e) => ouvrir(e, carte.prestationCle)}
						>
							{carte.boutonLabel}
						</a>
					</div>
				{:else}
					<div
						class="reveal flex flex-col items-center gap-2 rounded-card border border-line bg-white px-7.5 py-11 text-center shadow-[0_24px_50px_-46px_color-mix(in_oklab,var(--color-ember)_36%,transparent)]"
						{@attach reveal(i * 90)}
					>
						<span class="font-mono text-[10.5px] tracking-[0.2em] text-coral uppercase">
							{carte.label}
						</span>
						<div class="my-1.5 font-display text-[56px] leading-none text-ink">
							{carte.montant}{#if carte.suffixe}<small class="text-xl"> {carte.suffixe}</small>{/if}
						</div>
						<p class="mb-3 text-[13.5px] leading-[1.55] text-ink-soft">{carte.sousTexte}</p>
						<a
							class="btn btn-line"
							href="{reservation}?prestation={carte.prestationCle}"
							onclick={(e) => ouvrir(e, carte.prestationCle)}
						>
							{carte.boutonLabel}
						</a>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>
```

- [ ] **Step 3: Vérifier puis committer**

Run: `pnpm check && pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS ; contrôle visuel rapide avec `pnpm dev` (cartes identiques, carte Particuliers coral surélevée, « 140 € », veilleuse cadrée à 38%).

```bash
git add src/lib/components/home/Boutique.svelte src/lib/components/home/Tarifs.svelte
git commit -m "refactor(home): Boutique et Tarifs factorisés en listes de contenu"
```

---

### Task 6: Header et Footer pilotés par ReglagesSite

**Files:**

- Modify: `src/lib/components/Header.svelte`
- Modify: `src/lib/components/Footer.svelte`

**Interfaces:**

- Produces: `Header` et `Footer` acceptent `reglages?: ReglagesSite` (défaut `defaultReglages`).

- [ ] **Step 1: `Header.svelte`** — ajouter au script :

```ts
import type { ReglagesSite } from '$lib/content/types';
import { defaultReglages } from '$lib/content/defaults';

let { reglages = defaultReglages }: { reglages?: ReglagesSite } = $props();
```

Dans le markup, remplacer le texte `Consultant` du `<small>` par `{reglages.sousTitreLogo}`.

- [ ] **Step 2: `Footer.svelte`** — ajouter au script :

```ts
import type { ReglagesSite } from '$lib/content/types';
import { defaultReglages } from '$lib/content/defaults';

let { reglages = defaultReglages }: { reglages?: ReglagesSite } = $props();
```

Markup :

- `<small>…Consultant…</small>` → `{reglages.sousTitreLogo}`
- le paragraphe `{site.tagline}. Accompagnement psycho-spirituel…` → `{reglages.footerIntro}`
- la mention légale (« Les accompagnements proposés ne relèvent pas… ») → `{reglages.mentionLegale}`
- `© {new Date().getFullYear()} {site.name} Consultant` → `© {new Date().getFullYear()} {site.name} {reglages.sousTitreLogo}`
- `siteLinks` / `rdvLinks` restent en dur (structurels).

- [ ] **Step 3: Vérifier puis committer (fin de la Phase 1 — passage complet)**

Run: `pnpm format && pnpm lint && pnpm check && pnpm test:unit -- --run && pnpm exec playwright test`
Expected: tout PASS — le site est visuellement identique, entièrement piloté par `defaults.ts`.

```bash
git add -A
git commit -m "refactor(layout): Header et Footer pilotés par ReglagesSite"
```

---

## Phase 2 — Dépôt CMS Strapi

### Task 7: Initialisation du projet Strapi v5

**Files:**

- Create: dépôt `/home/sephi/olivier-hildevert-cms` (généré par create-strapi-app)

- [ ] **Step 1: Scaffolder**

```bash
cd /home/sephi
npx create-strapi-app@latest olivier-hildevert-cms --typescript --no-run --skip-cloud
```

Si le CLI pose des questions : base **SQLite**, pas de données d’exemple, pas d’hébergement cloud, installation des dépendances **oui**. (Les flags exacts varient selon la version du CLI — l’objectif est : Strapi 5, TypeScript, SQLite, sans exemple.)

- [ ] **Step 2: Vérifier le démarrage**

```bash
cd /home/sephi/olivier-hildevert-cms && npm run develop
```

Expected: l’admin s’ouvre sur `http://localhost:1337/admin` et propose la création du premier administrateur. Créer le compte admin (ou `npx strapi admin:create-user`), puis arrêter le serveur (Ctrl-C).

- [ ] **Step 3: Commit initial**

```bash
cd /home/sephi/olivier-hildevert-cms
git init && git add -A
git commit -m "chore: initialisation Strapi v5 (TypeScript, SQLite)"
```

Vérifier que `.gitignore` (généré) couvre `.env`, `.tmp/`, `dist/`, `node_modules/`, `public/uploads`.

---

### Task 8: Content model complet (schémas versionnés)

**Files (dépôt CMS):**

- Create: `src/components/elements/stat.json`, `strate.json`, `item-texte.json`, `colonne-esprit-ame.json`, `produit.json`, `carte-tarif.json`
- Create: `src/components/sections/hero.json`, `approche.json`, `esprit-ame.json`, `a-propos.json`, `intro.json`, `pour-qui.json`, `boutique.json`, `tarifs.json`, `mantra.json`, `contact-cta.json`
- Create: `src/api/<api>/content-types/<api>/schema.json` + `routes/<api>.ts` + `controllers/<api>.ts` + `services/<api>.ts` pour : `page-accueil`, `reglages-site`, `prestation`, `message-contact`, `demande-reservation`, `inscrit-newsletter`

**Interfaces:**

- Produces: API REST `GET /api/page-accueil`, `GET /api/reglages-site`, `GET /api/prestations`, `POST /api/messages-contact`, `POST /api/demandes-reservation`, `POST /api/inscrits-newsletter`. Les noms d’attributs sont IDENTIQUES aux types front (Task 1) ; seules les listes `string[]` deviennent des composants répétables `elements.item-texte` (`{ texte }`).

- [ ] **Step 1: Composants `elements`**

`src/components/elements/stat.json` :

```json
{
	"collectionName": "components_elements_stats",
	"info": { "displayName": "Stat", "description": "Chiffre clé du hero" },
	"attributes": {
		"valeur": { "type": "string", "required": true },
		"legende": { "type": "string", "required": true }
	}
}
```

`src/components/elements/strate.json` :

```json
{
	"collectionName": "components_elements_strates",
	"info": { "displayName": "Strate", "description": "Niveau de lecture de l’être" },
	"attributes": {
		"num": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"desc": { "type": "text", "required": true },
		"profondeur": { "type": "string", "required": true }
	}
}
```

`src/components/elements/item-texte.json` :

```json
{
	"collectionName": "components_elements_item_textes",
	"info": { "displayName": "Item texte", "description": "Élément de liste simple" },
	"attributes": {
		"texte": { "type": "string", "required": true }
	}
}
```

`src/components/elements/colonne-esprit-ame.json` :

```json
{
	"collectionName": "components_elements_colonne_esprit_ames",
	"info": { "displayName": "Colonne esprit/âme" },
	"attributes": {
		"tag": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"desc": { "type": "text", "required": true },
		"points": {
			"type": "component",
			"repeatable": true,
			"component": "elements.item-texte",
			"required": true,
			"min": 1
		}
	}
}
```

`src/components/elements/produit.json` :

```json
{
	"collectionName": "components_elements_produits",
	"info": { "displayName": "Produit boutique" },
	"attributes": {
		"cleImage": { "type": "enumeration", "enum": ["livre", "veilleuses"], "required": true },
		"tag": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"desc": { "type": "text", "required": true },
		"prixTexte": { "type": "string", "required": true },
		"boutonLabel": { "type": "string", "required": true }
	}
}
```

`src/components/elements/carte-tarif.json` :

```json
{
	"collectionName": "components_elements_carte_tarifs",
	"info": { "displayName": "Carte tarif" },
	"attributes": {
		"label": { "type": "string", "required": true },
		"montant": { "type": "string", "required": true },
		"suffixe": { "type": "string" },
		"sousTexte": { "type": "text", "required": true },
		"boutonLabel": { "type": "string", "required": true },
		"prestationCle": {
			"type": "enumeration",
			"enum": ["individuelle", "programme", "entreprise", "stage"],
			"required": true
		},
		"misEnAvant": { "type": "boolean", "default": false, "required": true }
	}
}
```

- [ ] **Step 2: Composants `sections`**

`src/components/sections/hero.json` :

```json
{
	"collectionName": "components_sections_heros",
	"info": { "displayName": "Hero" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titreLigne1": { "type": "string", "required": true },
		"titreLigne2": { "type": "string", "required": true },
		"paragraphe": { "type": "text", "required": true },
		"ligneMono": { "type": "string", "required": true },
		"boutonPrincipal": { "type": "string", "required": true },
		"boutonSecondaire": { "type": "string", "required": true },
		"stats": {
			"type": "component",
			"repeatable": true,
			"component": "elements.stat",
			"required": true,
			"min": 3,
			"max": 3
		}
	}
}
```

`src/components/sections/approche.json` :

```json
{
	"collectionName": "components_sections_approches",
	"info": { "displayName": "Approche" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"paragraphe1": { "type": "text", "required": true },
		"paragraphe2": { "type": "text", "required": true },
		"strates": {
			"type": "component",
			"repeatable": true,
			"component": "elements.strate",
			"required": true,
			"min": 1
		},
		"legendeGauche": { "type": "string", "required": true },
		"legendeDroite": { "type": "string", "required": true }
	}
}
```

`src/components/sections/esprit-ame.json` :

```json
{
	"collectionName": "components_sections_esprit_ames",
	"info": { "displayName": "Esprit & âme" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"colonneEsprit": {
			"type": "component",
			"component": "elements.colonne-esprit-ame",
			"required": true
		},
		"colonneAme": {
			"type": "component",
			"component": "elements.colonne-esprit-ame",
			"required": true
		}
	}
}
```

`src/components/sections/a-propos.json` :

```json
{
	"collectionName": "components_sections_a_propos",
	"info": { "displayName": "À propos" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"sousTitre": { "type": "string", "required": true },
		"paragraphe1": { "type": "text", "required": true },
		"paragraphe2": { "type": "text", "required": true },
		"paragraphe3": { "type": "text", "required": true },
		"citation": { "type": "text", "required": true },
		"qualifications": {
			"type": "component",
			"repeatable": true,
			"component": "elements.item-texte",
			"required": true,
			"min": 1
		},
		"legendePortrait": { "type": "string", "required": true }
	}
}
```

`src/components/sections/intro.json` :

```json
{
	"collectionName": "components_sections_intros",
	"info": { "displayName": "Intro de section" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"paragraphe": { "type": "text", "required": true }
	}
}
```

`src/components/sections/pour-qui.json` :

```json
{
	"collectionName": "components_sections_pour_quis",
	"info": { "displayName": "Pour qui ?" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"publics": {
			"type": "component",
			"repeatable": true,
			"component": "elements.item-texte",
			"required": true,
			"min": 1
		}
	}
}
```

`src/components/sections/boutique.json` :

```json
{
	"collectionName": "components_sections_boutiques",
	"info": { "displayName": "Boutique" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"paragraphe": { "type": "text", "required": true },
		"produits": {
			"type": "component",
			"repeatable": true,
			"component": "elements.produit",
			"required": true,
			"min": 1
		}
	}
}
```

`src/components/sections/tarifs.json` :

```json
{
	"collectionName": "components_sections_tarifs",
	"info": { "displayName": "Tarifs" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"cartes": {
			"type": "component",
			"repeatable": true,
			"component": "elements.carte-tarif",
			"required": true,
			"min": 1
		}
	}
}
```

`src/components/sections/mantra.json` :

```json
{
	"collectionName": "components_sections_mantras",
	"info": { "displayName": "Mantra", "description": "Les segments entre *…* sont mis en valeur" },
	"attributes": {
		"citation": { "type": "text", "required": true },
		"auteur": { "type": "string", "required": true }
	}
}
```

`src/components/sections/contact-cta.json` :

```json
{
	"collectionName": "components_sections_contact_ctas",
	"info": { "displayName": "Contact (CTA)" },
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"paragraphe": { "type": "text", "required": true },
		"boutonLabel": { "type": "string", "required": true },
		"modes": {
			"type": "component",
			"repeatable": true,
			"component": "elements.item-texte",
			"required": true,
			"min": 1
		}
	}
}
```

- [ ] **Step 3: Content types**

`src/api/page-accueil/content-types/page-accueil/schema.json` :

```json
{
	"kind": "singleType",
	"collectionName": "page_accueils",
	"info": {
		"singularName": "page-accueil",
		"pluralName": "page-accueils",
		"displayName": "Page d’accueil"
	},
	"options": { "draftAndPublish": true },
	"attributes": {
		"hero": { "type": "component", "component": "sections.hero", "required": true },
		"approche": { "type": "component", "component": "sections.approche", "required": true },
		"espritAme": { "type": "component", "component": "sections.esprit-ame", "required": true },
		"aPropos": { "type": "component", "component": "sections.a-propos", "required": true },
		"prestationsIntro": { "type": "component", "component": "sections.intro", "required": true },
		"pourQui": { "type": "component", "component": "sections.pour-qui", "required": true },
		"boutique": { "type": "component", "component": "sections.boutique", "required": true },
		"tarifs": { "type": "component", "component": "sections.tarifs", "required": true },
		"mantra": { "type": "component", "component": "sections.mantra", "required": true },
		"contactCta": { "type": "component", "component": "sections.contact-cta", "required": true }
	}
}
```

`src/api/reglages-site/content-types/reglages-site/schema.json` :

```json
{
	"kind": "singleType",
	"collectionName": "reglages_sites",
	"info": {
		"singularName": "reglages-site",
		"pluralName": "reglages-sites",
		"displayName": "Réglages du site"
	},
	"options": { "draftAndPublish": true },
	"attributes": {
		"tagline": { "type": "string", "required": true },
		"descriptionSeo": { "type": "text", "required": true },
		"mentionLegale": { "type": "text", "required": true },
		"footerIntro": { "type": "text", "required": true },
		"sousTitreLogo": { "type": "string", "required": true },
		"email": { "type": "email" },
		"telephone": { "type": "string" },
		"adresse": { "type": "text" },
		"siteExterne": { "type": "string" }
	}
}
```

`src/api/prestation/content-types/prestation/schema.json` (l’unicité de `cle` n’est pas applicable sur une énumération — le seed et le mapping front la garantissent) :

```json
{
	"kind": "collectionType",
	"collectionName": "prestations",
	"info": {
		"singularName": "prestation",
		"pluralName": "prestations",
		"displayName": "Prestation"
	},
	"options": { "draftAndPublish": true },
	"attributes": {
		"cle": {
			"type": "enumeration",
			"enum": ["individuelle", "programme", "entreprise", "stage"],
			"required": true
		},
		"ordre": { "type": "integer", "required": true },
		"titre": { "type": "string", "required": true },
		"metaReservation": { "type": "string", "required": true },
		"descReservation": { "type": "text", "required": true },
		"descCarte": { "type": "text", "required": true },
		"prixCarte": { "type": "string", "required": true },
		"actionCarte": { "type": "string", "required": true }
	}
}
```

`src/api/message-contact/content-types/message-contact/schema.json` :

```json
{
	"kind": "collectionType",
	"collectionName": "messages_contact",
	"info": {
		"singularName": "message-contact",
		"pluralName": "messages-contact",
		"displayName": "Message de contact"
	},
	"options": { "draftAndPublish": false },
	"attributes": {
		"nom": { "type": "string", "required": true },
		"email": { "type": "email", "required": true },
		"message": { "type": "text", "required": true }
	}
}
```

`src/api/demande-reservation/content-types/demande-reservation/schema.json` :

```json
{
	"kind": "collectionType",
	"collectionName": "demandes_reservation",
	"info": {
		"singularName": "demande-reservation",
		"pluralName": "demandes-reservation",
		"displayName": "Demande de réservation"
	},
	"options": { "draftAndPublish": false },
	"attributes": {
		"prestation": {
			"type": "enumeration",
			"enum": ["individuelle", "programme", "entreprise", "stage"],
			"required": true
		},
		"nom": { "type": "string", "required": true },
		"email": { "type": "email", "required": true },
		"telephone": { "type": "string", "required": true },
		"message": { "type": "text" }
	}
}
```

`src/api/inscrit-newsletter/content-types/inscrit-newsletter/schema.json` :

```json
{
	"kind": "collectionType",
	"collectionName": "inscrits_newsletter",
	"info": {
		"singularName": "inscrit-newsletter",
		"pluralName": "inscrits-newsletter",
		"displayName": "Inscrit newsletter"
	},
	"options": { "draftAndPublish": false },
	"attributes": {
		"email": { "type": "email", "required": true, "unique": true }
	}
}
```

- [ ] **Step 4: Boilerplate routes/controllers/services** — pour chacun des 6 apis, créer 3 fichiers avec les factories. Modèle (ici `page-accueil`) :

`src/api/page-accueil/routes/page-accueil.ts` :

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::page-accueil.page-accueil');
```

`src/api/page-accueil/controllers/page-accueil.ts` :

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::page-accueil.page-accueil');
```

`src/api/page-accueil/services/page-accueil.ts` :

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::page-accueil.page-accueil');
```

Répéter à l’identique avec les uid suivants (chemin `src/api/<nom>/{routes,controllers,services}/<nom>.ts`) :

- `api::reglages-site.reglages-site`
- `api::prestation.prestation`
- `api::message-contact.message-contact`
- `api::demande-reservation.demande-reservation`
- `api::inscrit-newsletter.inscrit-newsletter`

- [ ] **Step 5: Vérifier**

```bash
cd /home/sephi/olivier-hildevert-cms && npm run develop
```

Expected: démarrage sans erreur de schéma ; dans l’admin, le Content Manager liste « Page d’accueil », « Réglages du site », « Prestation », « Message de contact », « Demande de réservation », « Inscrit newsletter » ; le Content-Type Builder montre les composants `sections.*` et `elements.*`. Arrêter le serveur.

- [ ] **Step 6: Commit**

```bash
cd /home/sephi/olivier-hildevert-cms
git add src/
git commit -m "feat: content model complet (page-accueil, réglages, prestations, formulaires)"
```

---

### Task 9: README CMS — admin, token API, permissions

**Files (dépôt CMS):**

- Modify: `README.md` (remplacer le contenu généré)

- [ ] **Step 1: Écrire `README.md`**

```markdown
# olivier-hildevert-cms

CMS Strapi v5 (TypeScript, SQLite en dev) du site vitrine
[olivier-hildevert](https://github.com/…) — contenu éditorial, prestations,
réglages du site et collecte des formulaires.

## Démarrage

​`sh
npm install
npm run develop        # admin sur http://localhost:1337/admin
​`

Premier lancement : créer le compte administrateur, puis lancer le seed
(voir ci-dessous) pour peupler le contenu initial.

## Token API du site (STRAPI_API_TOKEN)

Le site SvelteKit consomme l’API avec UN token de type « custom »,
côté serveur uniquement. À créer dans
Settings → API Tokens → Create new API Token :

- Name : `site-web` · Token duration : Unlimited · Token type : **Custom**
- Permissions accordées (rien d’autre) :
  - `page-accueil` : `find`
  - `reglages-site` : `find`
  - `prestation` : `find`, `findOne`
  - `message-contact` : `create`
  - `demande-reservation` : `create`
  - `inscrit-newsletter` : `create`

Le rôle Public (Users & Permissions) ne reçoit AUCUNE permission : l’API
n’est pas appelable directement depuis un navigateur.

Reporter la valeur dans le `.env` du site (`STRAPI_URL`, `STRAPI_API_TOKEN`).

## Seed du contenu initial

1. Dans le dépôt du site : `npx tsx scripts/export-defaults.ts` — écrit
   `scripts/seed-data.json` ici.
2. Créer un second token **Full access** temporaire (Settings → API Tokens).
3. `STRAPI_SEED_TOKEN=<token> node scripts/seed.mjs`
4. Supprimer le token full access.

Le seed est idempotent (PUT sur les single types, upsert par `cle` pour les
prestations) et publie directement (`?status=published`).

## Éditorial

- « Page d’accueil », « Réglages du site » et « Prestation » sont en
  Draft & Publish : les modifications ne sont visibles qu’après **Publish**.
- Le site retombe sur son contenu par défaut si un contenu est dépublié ou
  si le CMS est indisponible — dépublier n’est donc jamais destructif.
- Dans le mantra, les segments entre astérisques (`*…*`) sont mis en valeur.
- Les images du site restent dans le code (pas de media library).

## Production

La base SQLite (`.tmp/`) n’est pas versionnée. Pour un déploiement,
configurer `DATABASE_CLIENT=postgres` et les variables associées
(`config/database.ts` généré les lit déjà), puis rejouer le seed.
```

(Retirer les zero-width `​` devant les fences imbriquées lors de l’écriture réelle.)

- [ ] **Step 2: Créer le token custom `site-web`** en suivant le README (manuel, admin UI), et reporter `STRAPI_URL=http://localhost:1337` + le token dans le `.env` du dépôt **site** (ne pas committer).

- [ ] **Step 3: Commit**

```bash
cd /home/sephi/olivier-hildevert-cms
git add README.md
git commit -m "docs: README (démarrage, token API, seed, éditorial)"
```

---

## Phase 3 — Lecture du contenu (site)

### Task 10: `isStrapiConfigured` dans le client Strapi

**Files:**

- Modify: `src/lib/server/strapi.ts`
- Test: `src/lib/server/strapi.test.ts` (nouveau, projet `server`)

**Interfaces:**

- Produces: `export function isStrapiConfigured(): boolean`.

- [ ] **Step 1: Écrire le test (échec attendu)**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStrapiConfigured } from './strapi';

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('isStrapiConfigured', () => {
	it('est faux sans STRAPI_URL', () => {
		vi.stubEnv('STRAPI_URL', '');
		expect(isStrapiConfigured()).toBe(false);
	});

	it('est vrai avec STRAPI_URL', () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		expect(isStrapiConfigured()).toBe(true);
	});
});
```

NB : sous Vitest (projets étendus de `vite.config.ts`, plugin `sveltekit()` actif), `$env/dynamic/private` lit `process.env` dynamiquement — `vi.stubEnv` fonctionne. Si la résolution du module virtuel échouait, ajouter en tête de test : `vi.mock('$env/dynamic/private', () => ({ env: process.env }));`.

- [ ] **Step 2: Vérifier l’échec**

Run: `pnpm test:unit -- --run src/lib/server/strapi.test.ts`
Expected: FAIL — `isStrapiConfigured` n’est pas exporté.

- [ ] **Step 3: Implémenter** — dans `src/lib/server/strapi.ts`, après `config()` :

```ts
/** Vrai si STRAPI_URL est renseigné — sinon le site vit sur son contenu par défaut. */
export function isStrapiConfigured(): boolean {
	return Boolean(env.STRAPI_URL);
}
```

- [ ] **Step 4: Vérifier le succès**

Run: `pnpm test:unit -- --run src/lib/server/strapi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/strapi.ts src/lib/server/strapi.test.ts
git commit -m "feat(strapi): isStrapiConfigured pour le mode dégradé sans CMS"
```

---

### Task 11: Couche de lecture `content.ts` (mapping zod + fallback) et format de seed partagé

**Files:**

- Create: `src/lib/content/seed-format.ts`
- Create: `src/lib/server/content.ts`
- Test: `src/lib/server/content.test.ts`

**Interfaces:**

- Consumes: `fetchEntries`, `fetchSingle`, `isStrapiConfigured` (strapi.ts) ; défauts et types (Task 1).
- Produces:
  - `getPageAccueil(fetcher: typeof fetch): Promise<PageAccueilContent>`
  - `getPrestations(fetcher: typeof fetch): Promise<PrestationContent[]>` (toujours 4 entrées, ordre `PRESTATION_IDS`)
  - `getReglages(fetcher: typeof fetch): Promise<ReglagesSite>`
  - `accueilVersStrapi`, `prestationsVersStrapi`, `reglagesVersStrapi` (seed-format — utilisés par le test round-trip ET l’export de seed).

- [ ] **Step 1: Écrire `src/lib/content/seed-format.ts`** (imports relatifs — exécutable par tsx)

```ts
/**
 * Conversion du contenu front vers le format d’écriture de l’API Strapi :
 * les listes `string[]` deviennent des composants répétables `{ texte }`.
 * Utilisé par scripts/export-defaults.ts (seed) et par les tests de mapping
 * (round-trip : versStrapi → getPageAccueil ≡ identité).
 */
import type { PageAccueilContent, PrestationContent, ReglagesSite } from './types';

const items = (liste: string[]) => liste.map((texte) => ({ texte }));

export function accueilVersStrapi(c: PageAccueilContent) {
	return {
		...c,
		espritAme: {
			...c.espritAme,
			colonneEsprit: {
				...c.espritAme.colonneEsprit,
				points: items(c.espritAme.colonneEsprit.points)
			},
			colonneAme: { ...c.espritAme.colonneAme, points: items(c.espritAme.colonneAme.points) }
		},
		aPropos: { ...c.aPropos, qualifications: items(c.aPropos.qualifications) },
		pourQui: { ...c.pourQui, publics: items(c.pourQui.publics) },
		contactCta: { ...c.contactCta, modes: items(c.contactCta.modes) }
	};
}

export function prestationsVersStrapi(prestations: PrestationContent[]) {
	return prestations.map((p, i) => ({ ...p, ordre: i + 1 }));
}

export function reglagesVersStrapi(r: ReglagesSite) {
	return { ...r };
}
```

- [ ] **Step 2: Écrire le test `src/lib/server/content.test.ts` (échec attendu)**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultAccueil, defaultPrestations, defaultReglages } from '$lib/content/defaults';
import {
	accueilVersStrapi,
	prestationsVersStrapi,
	reglagesVersStrapi
} from '$lib/content/seed-format';
import { getPageAccueil, getPrestations, getReglages } from './content';

const reponse = (body: unknown) =>
	vi.fn(async () => new Response(JSON.stringify(body))) as unknown as typeof fetch;

const enEchec = vi.fn(async () => new Response('boom', { status: 500 })) as unknown as typeof fetch;

beforeEach(() => {
	vi.stubEnv('STRAPI_URL', 'http://cms.test');
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

describe('getPageAccueil', () => {
	it('mappe la réponse Strapi (round-trip avec le format de seed)', async () => {
		const fetcher = reponse({ data: accueilVersStrapi(defaultAccueil) });
		await expect(getPageAccueil(fetcher)).resolves.toEqual(defaultAccueil);
	});

	it('retombe sur le défaut si le contenu est dépublié (data: null)', async () => {
		await expect(getPageAccueil(reponse({ data: null }))).resolves.toEqual(defaultAccueil);
	});

	it('retombe sur le défaut si la réponse est invalide', async () => {
		await expect(getPageAccueil(reponse({ data: { hero: {} } }))).resolves.toEqual(defaultAccueil);
	});

	it('retombe sur le défaut si Strapi est en erreur', async () => {
		await expect(getPageAccueil(enEchec)).resolves.toEqual(defaultAccueil);
	});

	it('sert le défaut sans appel réseau quand Strapi n’est pas configuré', async () => {
		vi.stubEnv('STRAPI_URL', '');
		const fetcher = vi.fn() as unknown as typeof fetch;
		await expect(getPageAccueil(fetcher)).resolves.toEqual(defaultAccueil);
		expect(fetcher).not.toHaveBeenCalled();
	});
});

describe('getPrestations', () => {
	it('mappe les 4 prestations (round-trip avec le format de seed)', async () => {
		const fetcher = reponse({
			data: prestationsVersStrapi(defaultPrestations),
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
		});
		await expect(getPrestations(fetcher)).resolves.toEqual(defaultPrestations);
	});

	it('ignore les entrées invalides et complète les manquantes par les défauts', async () => {
		const fetcher = reponse({
			data: [
				{ ...defaultPrestations[0], titre: 'Séance revue' },
				{ cle: 'inconnue', titre: 'X' }
			],
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 2 } }
		});
		const prestations = await getPrestations(fetcher);
		expect(prestations).toHaveLength(4);
		expect(prestations[0].titre).toBe('Séance revue');
		expect(prestations.slice(1)).toEqual(defaultPrestations.slice(1));
	});

	it('retombe sur les défauts si Strapi est en erreur', async () => {
		await expect(getPrestations(enEchec)).resolves.toEqual(defaultPrestations);
	});
});

describe('getReglages', () => {
	it('mappe les réglages (round-trip) et normalise null → undefined', async () => {
		const fetcher = reponse({ data: { ...reglagesVersStrapi(defaultReglages), email: null } });
		await expect(getReglages(fetcher)).resolves.toEqual(defaultReglages);
	});

	it('retombe sur les défauts si dépublié', async () => {
		await expect(getReglages(reponse({ data: null }))).resolves.toEqual(defaultReglages);
	});
});
```

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: FAIL — `./content` n’existe pas.

- [ ] **Step 3: Écrire `src/lib/server/content.ts`**

```ts
/**
 * Couche contenu : lit Strapi quand il est configuré, sinon (erreur réseau,
 * contenu dépublié, réponse invalide) sert le contenu par défaut du code.
 * Fallback TOUT-OU-RIEN par domaine — jamais de page mi-CMS mi-code.
 * Le populate profond est le point fragile de Strapi v5 : il est figé ici
 * et couvert par les tests round-trip de content.test.ts.
 */
import { z } from 'zod';
import { fetchEntries, fetchSingle, isStrapiConfigured } from './strapi';
import { PRESTATION_IDS } from '$lib/booking/prestations';
import { defaultAccueil, defaultPrestations, defaultReglages } from '$lib/content/defaults';
import type { PageAccueilContent, PrestationContent, ReglagesSite } from '$lib/content/types';

// ————— Schémas de validation de la réponse Strapi (attributs à plat, v5) —————

const itemsTexte = z
	.array(z.object({ texte: z.string() }))
	.nonempty()
	.transform((items) => items.map((i) => i.texte));

const optionnel = z
	.string()
	.nullish()
	.transform((v) => v ?? undefined);

const colonneSchema = z.object({
	tag: z.string(),
	titre: z.string(),
	desc: z.string(),
	points: itemsTexte
});

const accueilSchema = z.object({
	hero: z.object({
		eyebrow: z.string(),
		titreLigne1: z.string(),
		titreLigne2: z.string(),
		paragraphe: z.string(),
		ligneMono: z.string(),
		boutonPrincipal: z.string(),
		boutonSecondaire: z.string(),
		stats: z.array(z.object({ valeur: z.string(), legende: z.string() })).nonempty()
	}),
	approche: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe1: z.string(),
		paragraphe2: z.string(),
		strates: z
			.array(
				z.object({
					num: z.string(),
					titre: z.string(),
					desc: z.string(),
					profondeur: z.string()
				})
			)
			.nonempty(),
		legendeGauche: z.string(),
		legendeDroite: z.string()
	}),
	espritAme: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		colonneEsprit: colonneSchema,
		colonneAme: colonneSchema
	}),
	aPropos: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		sousTitre: z.string(),
		paragraphe1: z.string(),
		paragraphe2: z.string(),
		paragraphe3: z.string(),
		citation: z.string(),
		qualifications: itemsTexte,
		legendePortrait: z.string()
	}),
	prestationsIntro: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe: z.string()
	}),
	pourQui: z.object({ eyebrow: z.string(), titre: z.string(), publics: itemsTexte }),
	boutique: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe: z.string(),
		produits: z
			.array(
				z.object({
					cleImage: z.enum(['livre', 'veilleuses']),
					tag: z.string(),
					titre: z.string(),
					desc: z.string(),
					prixTexte: z.string(),
					boutonLabel: z.string()
				})
			)
			.nonempty()
	}),
	tarifs: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		cartes: z
			.array(
				z.object({
					label: z.string(),
					montant: z.string(),
					suffixe: optionnel,
					sousTexte: z.string(),
					boutonLabel: z.string(),
					prestationCle: z.enum(PRESTATION_IDS),
					misEnAvant: z.boolean()
				})
			)
			.nonempty()
	}),
	mantra: z.object({ citation: z.string(), auteur: z.string() }),
	contactCta: z.object({
		eyebrow: z.string(),
		titre: z.string(),
		paragraphe: z.string(),
		boutonLabel: z.string(),
		modes: itemsTexte
	})
});

const prestationSchema = z.object({
	cle: z.enum(PRESTATION_IDS),
	titre: z.string(),
	metaReservation: z.string(),
	descReservation: z.string(),
	descCarte: z.string(),
	prixCarte: z.string(),
	actionCarte: z.string()
});

const reglagesSchema = z.object({
	tagline: z.string(),
	descriptionSeo: z.string(),
	mentionLegale: z.string(),
	footerIntro: z.string(),
	sousTitreLogo: z.string(),
	email: optionnel,
	telephone: optionnel,
	adresse: optionnel,
	siteExterne: optionnel
});

// Populate explicite des composants imbriqués (Strapi v5 ne populate rien par défaut).
const POPULATE_ACCUEIL = {
	'populate[hero][populate]': '*',
	'populate[approche][populate]': '*',
	'populate[espritAme][populate][colonneEsprit][populate]': '*',
	'populate[espritAme][populate][colonneAme][populate]': '*',
	'populate[aPropos][populate]': '*',
	'populate[prestationsIntro][populate]': '*',
	'populate[pourQui][populate]': '*',
	'populate[boutique][populate]': '*',
	'populate[tarifs][populate]': '*',
	'populate[mantra][populate]': '*',
	'populate[contactCta][populate]': '*'
};

export async function getPageAccueil(fetcher: typeof fetch): Promise<PageAccueilContent> {
	if (!isStrapiConfigured()) return defaultAccueil;
	try {
		const data = await fetchSingle<Record<string, unknown>>(
			'page-accueil',
			POPULATE_ACCUEIL,
			fetcher
		);
		if (!data) throw new Error('page-accueil non publiée');
		const contenu: PageAccueilContent = accueilSchema.parse(data);
		return contenu;
	} catch (err) {
		console.warn('Contenu Strapi « page-accueil » indisponible — défauts servis.', err);
		return defaultAccueil;
	}
}

export async function getPrestations(fetcher: typeof fetch): Promise<PrestationContent[]> {
	if (!isStrapiConfigured()) return defaultPrestations;
	try {
		const { items } = await fetchEntries<Record<string, unknown>>(
			'prestations',
			{ sort: 'ordre' },
			fetcher
		);
		const valides = new Map<string, PrestationContent>();
		for (const item of items) {
			const res = prestationSchema.safeParse(item);
			if (!res.success) {
				console.warn('Prestation Strapi ignorée (invalide ou clé inconnue).', res.error.issues);
				continue;
			}
			if (!valides.has(res.data.cle)) valides.set(res.data.cle, res.data);
		}
		// Toujours 4 entrées, dans l’ordre canonique — les manquantes viennent des défauts.
		return PRESTATION_IDS.map(
			(cle) => valides.get(cle) ?? defaultPrestations.find((p) => p.cle === cle)!
		);
	} catch (err) {
		console.warn('Prestations Strapi indisponibles — défauts servis.', err);
		return defaultPrestations;
	}
}

export async function getReglages(fetcher: typeof fetch): Promise<ReglagesSite> {
	if (!isStrapiConfigured()) return defaultReglages;
	try {
		const data = await fetchSingle<Record<string, unknown>>('reglages-site', undefined, fetcher);
		if (!data) throw new Error('reglages-site non publiés');
		const reglages: ReglagesSite = reglagesSchema.parse(data);
		return reglages;
	} catch (err) {
		console.warn('Réglages Strapi indisponibles — défauts servis.', err);
		return defaultReglages;
	}
}
```

NB : `toEqual` ignore les clés à valeur `undefined` — le round-trip des réglages passe même si `email: undefined` est présent d’un côté seulement.

- [ ] **Step 4: Vérifier le succès**

Run: `pnpm check && pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/seed-format.ts src/lib/server/content.ts src/lib/server/content.test.ts
git commit -m "feat(contenu): couche de lecture Strapi avec validation zod et fallback intégral"
```

---

### Task 12: Load functions, ISR et branchement des props

**Files:**

- Create: `src/routes/+layout.server.ts`
- Create: `src/routes/+page.server.ts`
- Modify: `src/routes/+layout.svelte`
- Modify: `src/routes/+page.svelte`
- Modify: `src/routes/reservation/+page.svelte`

**Interfaces:**

- Consumes: `getPageAccueil`, `getPrestations`, `getReglages` (Task 11).
- Produces: `data.reglages` + `data.prestations` sur toutes les routes (layout), `data.accueil` sur la home.

- [ ] **Step 1: Créer `src/routes/+layout.server.ts`**

```ts
import type { LayoutServerLoad } from './$types';
import { getPrestations, getReglages } from '$lib/server/content';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const [reglages, prestations] = await Promise.all([getReglages(fetch), getPrestations(fetch)]);
	return { reglages, prestations };
};
```

- [ ] **Step 2: Créer `src/routes/+page.server.ts`**

```ts
import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getPageAccueil } from '$lib/server/content';

// ISR : la home est régénérée au plus toutes les 5 minutes sur Vercel.
// (Config par route — jamais sur les routes à form actions.)
export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	return { accueil: await getPageAccueil(fetch) };
};
```

- [ ] **Step 3: Brancher `src/routes/+layout.svelte`**

```ts
let { data, children } = $props();
```

et :

```svelte
<Header reglages={data.reglages} />
…
<Footer reglages={data.reglages} />
<BookingModal prestations={data.prestations} />
```

- [ ] **Step 4: Brancher `src/routes/+page.svelte`** — script :

```ts
import { site } from '$lib/config';
/* imports de composants inchangés */

let { data } = $props();
```

Head :

```svelte
<svelte:head>
	<title>{site.name} — {data.reglages.tagline}</title>
	<meta name="description" content={data.reglages.descriptionSeo} />
	<link rel="canonical" href={site.url} />
</svelte:head>
```

Sections :

```svelte
<Hero content={data.accueil.hero} />
…
<Mantra content={data.accueil.mantra} />
…
<Approche content={data.accueil.approche} />
<EspritAme content={data.accueil.espritAme} />
<APropos content={data.accueil.aPropos} />
<Prestations intro={data.accueil.prestationsIntro} prestations={data.prestations} />
…
<PourQui content={data.accueil.pourQui} />
…
<Boutique content={data.accueil.boutique} />
<Tarifs content={data.accueil.tarifs} />
…
<ContactCta content={data.accueil.contactCta} />
```

(les `<ImmersiveBand>` et leurs `<enhanced:img>` ne changent pas.)

- [ ] **Step 5: Brancher `src/routes/reservation/+page.svelte`** — remplacer l’import et l’usage de `defaultPrestations` (Task 2) par `data.prestations` :

```ts
// supprimer : import { defaultPrestations } from '$lib/content/defaults';
```

et `{#each defaultPrestations as p (p.cle)}` → `{#each data.prestations as p (p.cle)}`.

- [ ] **Step 6: Vérifier**

Run: `pnpm format && pnpm lint && pnpm check && pnpm test:unit -- --run && pnpm exec playwright test`
Expected: tout PASS **sans Strapi lancé** (fallback). Puis vérification avec CMS : lancer `npm run develop` dans le CMS, renseigner `.env` du site (token Task 9), `pnpm dev`, saisir/publier un titre de hero différent dans l’admin → visible sur `http://localhost:5173` ; dépublier « Page d’accueil » → retour au contenu par défaut. (Sans seed, un contenu vide non publié = fallback, comportement normal.)

- [ ] **Step 7: Commit**

```bash
git add src/routes/
git commit -m "feat(routes): contenu servi par Strapi (layout + home), ISR 5 min sur la home"
```

---

## Phase 4 — Écriture des formulaires

### Task 13: `createEntry` dans le client Strapi

**Files:**

- Modify: `src/lib/server/strapi.ts`
- Test: `src/lib/server/strapi.test.ts` (compléter)

**Interfaces:**

- Produces: `createEntry<T>(collection: string, data: Record<string, unknown>, fetcher?: typeof fetch): Promise<T>` — POST `{ data }`, lève `StrapiError` si `!res.ok`.

- [ ] **Step 1: Compléter le test (échec attendu)** — ajouter à `src/lib/server/strapi.test.ts` :

```ts
import { createEntry, StrapiError } from './strapi';

describe('createEntry', () => {
	it('poste { data } sur la collection avec le token', async () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		vi.stubEnv('STRAPI_API_TOKEN', 'jeton');
		const fetcher = vi.fn(
			async () =>
				new Response(JSON.stringify({ data: { id: 1, documentId: 'abc' } }), { status: 201 })
		) as unknown as typeof fetch;

		await createEntry('messages-contact', { nom: 'Jeanne' }, fetcher);

		const [url, init] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(url).toBe('http://cms.test/api/messages-contact');
		expect(init.method).toBe('POST');
		expect(init.headers.Authorization).toBe('Bearer jeton');
		expect(init.headers['Content-Type']).toBe('application/json');
		expect(JSON.parse(init.body)).toEqual({ data: { nom: 'Jeanne' } });
	});

	it('lève StrapiError sur une réponse en échec', async () => {
		vi.stubEnv('STRAPI_URL', 'http://cms.test');
		const fetcher = vi.fn(
			async () => new Response('nope', { status: 500 })
		) as unknown as typeof fetch;
		await expect(createEntry('messages-contact', {}, fetcher)).rejects.toBeInstanceOf(StrapiError);
	});
});
```

Run: `pnpm test:unit -- --run src/lib/server/strapi.test.ts` → FAIL (`createEntry` absent).

- [ ] **Step 2: Implémenter** — dans `strapi.ts`, étendre `strapiFetch` avec une option d’écriture :

```ts
async function strapiFetch<T>(
	path: string,
	query?: Query,
	fetcher: typeof fetch = fetch,
	init?: { method: string; body: unknown }
): Promise<T> {
	const { url, token } = config();
	const params = new URLSearchParams(query);
	const search = params.size > 0 ? `?${params}` : '';

	const res = await fetcher(`${url}/api${path}${search}`, {
		method: init?.method ?? 'GET',
		headers: {
			Accept: 'application/json',
			...(init ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {})
		},
		body: init ? JSON.stringify(init.body) : undefined
	});

	if (!res.ok) {
		throw new StrapiError(res.status, `Strapi a répondu ${res.status} pour ${path}`);
	}

	return res.json() as Promise<T>;
}
```

puis, après `fetchSingle` :

```ts
/** Crée une entrée dans une collection (ex. `createEntry('messages-contact', {...})`). */
export async function createEntry<T = unknown>(
	collection: string,
	data: Record<string, unknown>,
	fetcher?: typeof fetch
): Promise<T> {
	const res = await strapiFetch<{ data: T }>(`/${collection}`, undefined, fetcher, {
		method: 'POST',
		body: { data }
	});
	return res.data;
}
```

- [ ] **Step 3: Vérifier puis committer**

Run: `pnpm check && pnpm test:unit -- --run src/lib/server/strapi.test.ts` → PASS.

```bash
git add src/lib/server/strapi.ts src/lib/server/strapi.test.ts
git commit -m "feat(strapi): createEntry pour l’écriture dans les collections"
```

---

### Task 14: Enregistrement des formulaires + messages typés succès/erreur

**Files:**

- Modify: `src/app.d.ts`
- Create: `src/lib/server/forms.ts`
- Test: `src/lib/server/forms.test.ts`
- Modify: `src/routes/contact/+page.server.ts`, `src/routes/reservation/+page.server.ts`, `src/routes/newsletter/+page.server.ts`
- Modify: `src/routes/contact/+page.svelte`, `src/routes/reservation/+page.svelte`, `src/routes/newsletter/+page.svelte`, `src/lib/components/BookingModal.svelte`, `src/lib/components/NewsletterModal.svelte`

**Interfaces:**

- Produces: `App.Superforms.Message = { type: 'succes' | 'erreur'; texte: string }` (type global — Superforms type alors `$message` partout) ; `enregistrerContact`, `enregistrerReservation`, `inscrireNewsletter` dans `forms.ts` (résolvent en silence en mode dégradé, lèvent `StrapiError` en échec réel, newsletter idempotente sur 400).

- [ ] **Step 1: Typer le message dans `src/app.d.ts`**

```ts
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = { type: 'succes' | 'erreur'; texte: string };
		}
	}
}

export {};
```

- [ ] **Step 2: Écrire le test `src/lib/server/forms.test.ts` (échec attendu)**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enregistrerContact, enregistrerReservation, inscrireNewsletter } from './forms';
import { StrapiError } from './strapi';

const ok = () => vi.fn(async () => new Response('{"data":{}}', { status: 201 }));
const statut = (status: number) => vi.fn(async () => new Response('{}', { status }));

beforeEach(() => {
	vi.stubEnv('STRAPI_URL', 'http://cms.test');
	vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});

describe('mode dégradé (Strapi non configuré)', () => {
	it('trace en console sans appel réseau', async () => {
		vi.stubEnv('STRAPI_URL', '');
		const fetcher = vi.fn();
		await enregistrerContact(
			{ name: 'Jeanne', email: 'j@ex.fr', message: 'Bonjour, message assez long.' },
			fetcher as unknown as typeof fetch
		);
		expect(fetcher).not.toHaveBeenCalled();
		expect(console.log).toHaveBeenCalled();
	});
});

describe('enregistrerReservation', () => {
	it('poste la demande sur demandes-reservation avec les champs traduits', async () => {
		const fetcher = ok();
		await enregistrerReservation(
			{
				prestation: 'individuelle',
				name: 'Jeanne Dupont',
				email: 'jeanne@example.com',
				phone: '06 12 34 56 78',
				message: 'Disponible le soir.'
			},
			fetcher as unknown as typeof fetch
		);
		const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('http://cms.test/api/demandes-reservation');
		expect(JSON.parse(init.body as string)).toEqual({
			data: {
				prestation: 'individuelle',
				nom: 'Jeanne Dupont',
				email: 'jeanne@example.com',
				telephone: '06 12 34 56 78',
				message: 'Disponible le soir.'
			}
		});
	});

	it('propage l’erreur Strapi', async () => {
		await expect(
			enregistrerReservation(
				{ prestation: 'stage', name: 'J', email: 'j@ex.fr', phone: '0600000000', message: '' },
				statut(500) as unknown as typeof fetch
			)
		).rejects.toBeInstanceOf(StrapiError);
	});
});

describe('inscrireNewsletter', () => {
	it('traite une adresse déjà inscrite (400 unicité) comme un succès', async () => {
		await expect(
			inscrireNewsletter({ email: 'deja@ex.fr' }, statut(400) as unknown as typeof fetch)
		).resolves.toBeUndefined();
	});

	it('propage les autres erreurs', async () => {
		await expect(
			inscrireNewsletter({ email: 'x@ex.fr' }, statut(503) as unknown as typeof fetch)
		).rejects.toBeInstanceOf(StrapiError);
	});
});
```

Run: `pnpm test:unit -- --run src/lib/server/forms.test.ts` → FAIL (`./forms` absent).

- [ ] **Step 3: Écrire `src/lib/server/forms.ts`**

```ts
/**
 * Enregistrement des soumissions de formulaires dans Strapi.
 * Mode dégradé assumé : sans STRAPI_URL, on trace en console et on confirme
 * (le site — et les e2e — doivent rester fonctionnels sans CMS).
 */
import { createEntry, isStrapiConfigured, StrapiError } from './strapi';

export async function enregistrerContact(
	data: { name: string; email: string; message: string },
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Message de contact reçu (Strapi non configuré) :', data);
		return;
	}
	await createEntry(
		'messages-contact',
		{ nom: data.name, email: data.email, message: data.message },
		fetcher
	);
}

export async function enregistrerReservation(
	data: { prestation: string; name: string; email: string; phone: string; message: string },
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Demande de rendez-vous reçue (Strapi non configuré) :', data);
		return;
	}
	await createEntry(
		'demandes-reservation',
		{
			prestation: data.prestation,
			nom: data.name,
			email: data.email,
			telephone: data.phone,
			message: data.message
		},
		fetcher
	);
}

export async function inscrireNewsletter(
	data: { email: string },
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Inscription newsletter reçue (Strapi non configuré) :', data);
		return;
	}
	try {
		await createEntry('inscrits-newsletter', { email: data.email }, fetcher);
	} catch (err) {
		// Contrainte d’unicité : une adresse déjà inscrite est un succès (idempotence).
		if (err instanceof StrapiError && err.status === 400) return;
		throw err;
	}
}
```

Run: `pnpm test:unit -- --run src/lib/server/forms.test.ts` → PASS.

- [ ] **Step 4: Brancher les 3 actions.** `src/routes/reservation/+page.server.ts` (action seulement — le load ne change pas) :

```ts
export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const form = await superValidate(request, adapter);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await enregistrerReservation(form.data, fetch);
		} catch (err) {
			console.error('Échec de l’enregistrement de la demande de rendez-vous :', err);
			return message(
				form,
				{
					type: 'erreur',
					texte: 'Votre demande n’a pas pu être enregistrée. Réessayez dans un instant.'
				},
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'succes',
			texte: 'Demande transmise. Vous recevrez une confirmation personnelle sous peu.'
		});
	}
};
```

avec l’import `import { enregistrerReservation } from '$lib/server/forms';` (le TODO et le `console.log` disparaissent).

`contact/+page.server.ts` : même motif avec `enregistrerContact(form.data, fetch)`, erreur `"Votre message n’a pas pu être envoyé. Réessayez dans un instant."`, succès `'Merci ! Votre message a bien été envoyé.'`.

`newsletter/+page.server.ts` : même motif avec `inscrireNewsletter(form.data, fetch)`, erreur `"Votre inscription n’a pas pu être enregistrée. Réessayez dans un instant."`, succès `'Inscription confirmée. À très bientôt dans votre boîte mail.'`.

- [ ] **Step 5: Adapter les 5 gabarits au message typé.**

`contact/+page.svelte` :

```svelte
{#if $message}
	<p
		role="status"
		class="mt-6 rounded-lg px-4 py-3 text-sm {$message.type === 'erreur'
			? 'bg-[color-mix(in_oklab,var(--color-ember)_12%,#fff)] text-ember'
			: 'bg-halo text-plum'}"
	>
		{$message.texte}
	</p>
{/if}
```

`reservation/+page.svelte` : même remplacement (mêmes classes conditionnelles, `{$message.texte}`).

`newsletter/+page.svelte` — le formulaire doit rester visible en cas d’erreur :

```svelte
{#if $message?.type === 'succes'}
	<p role="status" class="mt-6 rounded-lg bg-halo px-4 py-3 text-sm text-plum">
		{$message.texte}
	</p>
{:else}
	{#if $message?.type === 'erreur'}
		<p
			role="alert"
			class="mt-6 rounded-lg bg-[color-mix(in_oklab,var(--color-ember)_12%,#fff)] px-4 py-3 text-sm text-ember"
		>
			{$message.texte}
		</p>
	{/if}
	<form method="POST" use:enhance class="mt-8 space-y-6" novalidate>
		<!-- formulaire inchangé -->
	</form>
{/if}
```

`BookingModal.svelte` :

- barre de progression : `{#if !$message}` → `{#if $message?.type !== 'succes'}`
- panneau de succès : `{#if $message}` → `{#if $message?.type === 'succes'}` et `{$message}` → `{$message.texte}`
- dans la branche formulaire (step 1), juste avant le bloc récapitulatif, ajouter :

```svelte
{#if $message?.type === 'erreur'}
	<p
		role="alert"
		class="mb-4 rounded-[11px] bg-[color-mix(in_oklab,var(--color-ember)_12%,#fff)] px-4 py-3 text-sm text-ember"
	>
		{$message.texte}
	</p>
{/if}
```

`NewsletterModal.svelte` :

- `$effect(() => { if ($message) marquerInscrit(); });` → `$effect(() => { if ($message?.type === 'succes') marquerInscrit(); });`
- `onclose` : `if (!$message) snoozer();` → `if ($message?.type !== 'succes') snoozer();`
- panneau de succès : `{#if $message}` → `{#if $message?.type === 'succes'}` et `{$message}` → `{$message.texte}`
- dans la branche formulaire, après le `<p>` d’erreur de champ, ajouter le même bloc `role="alert"` que ci-dessus.

- [ ] **Step 6: Vérifier**

Run: `pnpm format && pnpm lint && pnpm check && pnpm test:unit -- --run && pnpm exec playwright test`
Expected: tout PASS sans Strapi (mode dégradé = succès, textes inchangés pour les e2e). Puis avec le CMS lancé et `.env` renseigné : soumettre les 3 formulaires en dev → entrées visibles dans l’admin ; couper le CMS → le submit affiche le message d’erreur français, le formulaire reste utilisable.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(formulaires): enregistrement Strapi des 3 formulaires, messages typés succès/erreur"
```

---

## Phase 5 — Seed

### Task 15: Export du contenu par défaut au format Strapi (site)

**Files:**

- Create: `scripts/export-defaults.ts`

**Interfaces:**

- Consumes: `defaults.ts` + `seed-format.ts` (imports relatifs, exécutables par tsx).
- Produces: `seed-data.json` — `{ pageAccueil, reglagesSite, prestations }` au format d’écriture Strapi.

- [ ] **Step 1: Écrire `scripts/export-defaults.ts`**

```ts
/**
 * Sérialise le contenu par défaut du site au format d’écriture de l’API
 * Strapi, pour le seed du CMS (dépôt olivier-hildevert-cms).
 * Usage : npx tsx scripts/export-defaults.ts [chemin/seed-data.json]
 */
import { writeFileSync } from 'node:fs';
import { defaultAccueil, defaultPrestations, defaultReglages } from '../src/lib/content/defaults';
import {
	accueilVersStrapi,
	prestationsVersStrapi,
	reglagesVersStrapi
} from '../src/lib/content/seed-format';

const cible = process.argv[2] ?? '../olivier-hildevert-cms/scripts/seed-data.json';

const seed = {
	pageAccueil: accueilVersStrapi(defaultAccueil),
	reglagesSite: reglagesVersStrapi(defaultReglages),
	prestations: prestationsVersStrapi(defaultPrestations)
};

writeFileSync(cible, JSON.stringify(seed, null, '\t') + '\n');
console.log(`Seed écrit dans ${cible}`);
```

- [ ] **Step 2: Vérifier**

Run: `mkdir -p ../olivier-hildevert-cms/scripts && npx tsx scripts/export-defaults.ts && node -e "const s=require('../olivier-hildevert-cms/scripts/seed-data.json'); console.log(Object.keys(s), s.prestations.length)"`
Expected: `[ 'pageAccueil', 'reglagesSite', 'prestations' ] 4`.

- [ ] **Step 3: Commit (site)**

```bash
git add scripts/export-defaults.ts
git commit -m "feat(seed): export du contenu par défaut au format Strapi"
```

---

### Task 16: Script de seed idempotent (CMS)

**Files (dépôt CMS):**

- Create: `scripts/seed.mjs`
- Create: `scripts/seed-data.json` (généré en Task 15 — le committer comme instantané)

- [ ] **Step 1: Écrire `scripts/seed.mjs`**

```js
/**
 * Peuple Strapi avec le contenu par défaut du site (scripts/seed-data.json,
 * généré par scripts/export-defaults.ts du dépôt du site).
 * Usage : STRAPI_SEED_TOKEN=<token full access> node scripts/seed.mjs
 * Idempotent : PUT sur les single types, upsert par `cle` pour les
 * prestations, publication directe via ?status=published.
 */
import { readFileSync } from 'node:fs';

const URL_BASE = (process.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_SEED_TOKEN;
if (!TOKEN) {
	console.error('STRAPI_SEED_TOKEN manquant (token « Full access » créé dans l’admin).');
	process.exit(1);
}

const seed = JSON.parse(readFileSync(new URL('./seed-data.json', import.meta.url), 'utf8'));

async function api(path, method = 'GET', data) {
	const res = await fetch(`${URL_BASE}/api${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${TOKEN}`,
			...(data ? { 'Content-Type': 'application/json' } : {})
		},
		body: data ? JSON.stringify({ data }) : undefined
	});
	if (!res.ok) {
		throw new Error(`${method} ${path} → ${res.status} : ${await res.text()}`);
	}
	return res.json();
}

await api('/page-accueil?status=published', 'PUT', seed.pageAccueil);
console.log('✔ page-accueil');

await api('/reglages-site?status=published', 'PUT', seed.reglagesSite);
console.log('✔ reglages-site');

for (const prestation of seed.prestations) {
	const { data: existantes } = await api(
		`/prestations?filters[cle][$eq]=${prestation.cle}&status=draft`
	);
	if (existantes.length > 0) {
		await api(`/prestations/${existantes[0].documentId}?status=published`, 'PUT', prestation);
	} else {
		await api('/prestations?status=published', 'POST', prestation);
	}
	console.log(`✔ prestation ${prestation.cle}`);
}

console.log('Seed terminé.');
```

- [ ] **Step 2: Exécuter et vérifier**

```bash
cd /home/sephi/olivier-hildevert-cms
npm run develop   # dans un terminal
# créer un token Full access dans l’admin, puis :
STRAPI_SEED_TOKEN=<token> node scripts/seed.mjs
```

Expected: `✔ page-accueil`, `✔ reglages-site`, `✔ prestation ×4`, `Seed terminé.` — relancer le script : mêmes ✔ sans doublon (vérifier dans l’admin : 4 prestations, publiées). Puis côté site (`.env` renseigné, `pnpm dev`) : la home affiche le contenu seedé — identique au fallback. Supprimer le token full access.

- [ ] **Step 3: Commit (CMS)**

```bash
cd /home/sephi/olivier-hildevert-cms
git add scripts/
git commit -m "feat: seed idempotent du contenu initial"
```

---

## Phase 6 — Bouclage

### Task 17: Documentation, sitemap/README et parcours final

**Files:**

- Modify: `README.md` (site)
- Modify: `CLAUDE.md` (site)

- [ ] **Step 1: Compléter la section Strapi du `README.md` du site** — pointer vers le dépôt CMS, décrire : `cp .env.example .env`, création du token custom (renvoi au README du CMS), seed (`npx tsx scripts/export-defaults.ts` puis `node scripts/seed.mjs` côté CMS), et le déploiement (variables `STRAPI_URL` / `STRAPI_API_TOKEN` à définir dans le projet Vercel ; sans elles le site sert son contenu par défaut).

- [ ] **Step 2: Mettre à jour `CLAUDE.md`** — dans « Architecture — points non évidents », remplacer la puce **Client Strapi** par une puce **Contenu** décrivant la chaîne réelle :

```markdown
- **Contenu administrable via Strapi** (dépôt séparé `../olivier-hildevert-cms`) : types front dans `src/lib/content/types.ts`, contenu par défaut (fallback intégral ET source du seed) dans `src/lib/content/defaults.ts` — imports relatifs uniquement dans `src/lib/content/**` (exécutés par tsx pour le seed). Lecture serveur dans `src/lib/server/content.ts` (populate explicite, validation zod, fallback tout-ou-rien par domaine, `console.warn`) ; loads dans `+layout.server.ts` (réglages + prestations) et `+page.server.ts` (accueil, ISR 300 s via `export const config`). Écriture des 3 formulaires via `src/lib/server/forms.ts` (mode dégradé sans `.env` : log + succès — c’est ce qui garde les e2e verts). Messages de formulaire typés `{ type: 'succes' | 'erreur', texte }` (`App.Superforms.Message` dans `app.d.ts`). `PRESTATION_IDS` reste statique (images, z.enum, `?prestation=`) : ajouter une prestation = code + CMS. Le client bas niveau reste `src/lib/server/strapi.ts` ($env dynamique paresseux, build sans `.env`).
```

- [ ] **Step 3: Parcours de vérification bout-en-bout complet**

1. `pnpm format && pnpm lint && pnpm check && pnpm test:unit -- --run` → tout PASS.
2. `pnpm exec playwright test` **sans `.env`** → tout PASS (fallback + mode dégradé).
3. CMS lancé + `.env` renseigné + seed joué : `pnpm dev` → home identique au fallback ; modifier/publier un texte dans l’admin → visible après rechargement ; dépublier « Page d’accueil » → fallback ; republier.
4. Soumettre les 3 formulaires → 3 entrées dans l’admin ; couper le CMS → soumission = message d’erreur français ; navigation intacte.
5. `pnpm build` sans `.env` → succès.

- [ ] **Step 4: Commit final**

```bash
git add README.md CLAUDE.md
git commit -m "docs: chaîne de contenu Strapi documentée (README, CLAUDE.md)"
```

---

## Risques et parades (rappel de la spec)

- **Populate profond Strapi v5** : figé dans `POPULATE_ACCUEIL` (content.ts) et couvert par les tests round-trip. Si une section revient vide en réel, vérifier la clé de populate correspondante en premier.
- **Dérive types front ↔ schémas CMS** : pas de génération de types ; la validation zod + fallback garantit « défauts servis, jamais de crash ». Les tests round-trip via `seed-format.ts` détectent toute divergence de nommage.
- **Titres unifiés des prestations** (« Entreprises & dirigeants », « Stages & ateliers ») : les sélecteurs e2e existants n’utilisent que « Séance individuelle » et « Programme personnalisé » (inchangés) — vérifié.
- **`+layout.server.ts` = 1 fetch Strapi par requête SSR** des pages formulaires : acceptable ; memo TTL 60 s dans content.ts en évolution si besoin.
- **Latence de publication ≤ 5 min (ISR)** : `bypassToken` en évolution future si irritant.
- **CLI create-strapi-app** : les flags exacts peuvent différer selon la version — l’invariant est Strapi 5 / TypeScript / SQLite / sans exemple.

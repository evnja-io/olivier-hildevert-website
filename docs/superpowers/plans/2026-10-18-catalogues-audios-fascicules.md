# Adhésions, catalogues Audios et Fascicules — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Un type de demande « commande / inscription » par produit qui pilote les textes du formulaire de commande, des libellés corrigés dans la boutique, et deux catalogues Strapi (Audios gratuits, Fascicules gratuits ou payants), chacun avec 4 éléments sur l'accueil et une page complète.

**Architecture :** Lot 1 : une source unique de textes (`src/lib/commande/textes.ts`) lue par la modale, la page `/commande` et l'action serveur ; le type circule du produit Strapi jusqu'à la demande enregistrée. Lot 2 : deux collections Strapi lues par `getAudios` / `getFascicules` (validation élément par élément, repli sur liste vide), une fonction pure `vitrine()` pour les 4 éléments de l'accueil, des composants de carte et une section d'accueil génériques, deux nouvelles routes ISR.

**Tech Stack :** SvelteKit 2 / Svelte 5 runes, TypeScript, Tailwind v4 (palette « Aurore » exclusive), Superforms v2 + zod v4 (adapter `zod4`), Vitest (projets `server` et `client`), Playwright, Strapi 5 (dépôt `../olivier-hildevert-cms`).

**Spec :** `docs/superpowers/specs/2026-10-18-catalogues-audios-fascicules-design.md`

## Global Constraints

- Tout le texte visible est en français ; libellés exacts : « Adhérer », « Je vous recontacte pour finaliser votre inscription. », « Votre message », « En savoir plus », « Voir tout », « Télécharger », « Gratuit », « Bientôt disponible. », « Ressources ».
- Palette Tailwind par défaut désactivée : seulement les tokens du design (`ink`, `ink-soft`, `mute`, `line`, `coral`, `coral-ink`, `ember`, `surface`, `surface-2`, `blush`, `blush-2`…) et les utilities maison (`btn`, `btn-sun`, `btn-line`, `eyebrow`, `wrap`, `reveal`).
- Liens internes via `resolve()` de `$app/paths` (règle eslint `svelte/no-navigation-without-resolve`).
- Imports **relatifs uniquement** dans `src/lib/content/**` et dans tout fichier qu'ils importent (`src/lib/commande/textes.ts`).
- Formulaires : adapter `zod4`, créé en portée module ; les parcours fonctionnent sans JavaScript.
- `pnpm build` DOIT réussir sans `.env`. En mode dégradé (sans Strapi), les catalogues sont vides.
- L'URL du `document` d'un fascicule payant n'est **jamais** incluse dans les données envoyées au navigateur.
- Le CMS est déployé **avant** le site (populate `audios` / `fascicules` inconnu → 400 → toute l'accueil retombe sur les défauts).
- Le jeton `site-web` du CMS reçoit `find` sur `audio` et `fascicule`, rien d'autre de nouveau.
- Commits : messages en français au format `type(portée): …`, terminés par `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Dans le dépôt CMS, commiter sur une branche `feat/catalogues-audios-fascicules` créée depuis `main`.

## Review Focus

1. **Plus de 25 éléments** dans une collection : la limite par défaut de Strapi (`defaultLimit: 25`) tronquerait la page complète sans rien signaler. Attendu : la requête demande `pagination[pageSize]=100` (le `maxLimit` du CMS). Test en tâche 7.
2. **Entrée créée avant l'ajout de la case** (`misEnAvant: null`) : attendu, traitée comme non mise en avant, sans écarter l'élément. Test en tâche 7.
3. **Prix fait d'espaces** (`prixTexte: '  '`) sur un fascicule : attendu, gratuit. Test en tâche 7.
4. **`/commande?type=n-importe-quoi`** : attendu, parcours « commande », sans erreur 400. Test en tâche 2 (`typeDemande()`) et e2e en tâche 4.
5. **Titre avec caractères spéciaux** (« Cœur & âme ? ») dans le lien de repli d'un fascicule payant : attendu, `href` correctement encodé et modale ouverte avec le titre exact. Test en tâche 8.

(La 7ᵉ entrée du menu à 1280 px est déjà couverte par le test e2e existant « l'en-tête ne déborde pas de la fenêtre », relancé en tâche 9.)

---

## Structure des fichiers

**Dépôt site (`olivier-hildevert-website`)**

| Fichier                                                                                      | Rôle                                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/lib/commande/textes.ts` (créer)                                                         | `TYPES_DEMANDE`, `TypeDemande`, `TEXTES_DEMANDE`, `typeDemande()`         |
| `src/lib/commande/textes.test.ts` (créer)                                                    | tests des textes et du normaliseur                                        |
| `src/lib/commande/schema.ts` / `schema.test.ts`                                              | champ `type`                                                              |
| `src/lib/commande/commande.svelte.ts`                                                        | état `type` dans la modale                                                |
| `src/lib/server/forms.ts` / `forms.test.ts`                                                  | envoi de `type` à Strapi                                                  |
| `src/routes/commande/+page.server.ts`, `+page.svelte`                                        | page de repli selon le type                                               |
| `src/lib/components/CommandeModal.svelte`                                                    | textes selon le type, « Votre message »                                   |
| `src/lib/content/types.ts`                                                                   | `typeDemande` produit, types des catalogues                               |
| `src/lib/content/defaults.ts`, `seed-format.ts`                                              | titres par défaut des sections Audios / Fascicules                        |
| `src/lib/server/content.ts` / `content.test.ts`                                              | `typeDemande` boutique, sections, `getAudios`, `getFascicules`, `vitrine` |
| `src/lib/components/home/Boutique.svelte` / `.svelte.test.ts`                                | « En savoir plus » au-dessus, type de demande                             |
| `src/lib/components/catalogue/CarteAudio.svelte` (+ test)                                    | carte audio avec lecteur                                                  |
| `src/lib/components/catalogue/CarteFascicule.svelte` (+ test)                                | carte fascicule et son action                                             |
| `src/lib/components/catalogue/CatalogueAccueil.svelte`                                       | section d'accueil générique (titres, grille, « Voir tout »)               |
| `src/routes/+page.server.ts`, `+page.svelte`                                                 | chargement et insertion des deux sections                                 |
| `src/routes/audios/+page.server.ts`, `+page.svelte` (créer)                                  | page complète des audios                                                  |
| `src/routes/fascicules/+page.server.ts`, `+page.svelte` (créer)                              | page complète des fascicules                                              |
| `src/lib/config.ts`, `src/lib/components/Footer.svelte`, `src/routes/sitemap.xml/+server.ts` | navigation, référencement                                                 |
| `e2e/home.e2e.ts`, `e2e/catalogues.e2e.ts` (créer)                                           | parcours e2e                                                              |
| `CLAUDE.md`                                                                                  | paragraphe « Catalogues »                                                 |

**Dépôt CMS (`../olivier-hildevert-cms`)**

| Fichier                                                                                | Rôle                                                |
| -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `src/components/blocs/produit.json`                                                    | `typeDemande`                                       |
| `src/api/demande-commande/content-types/demande-commande/schema.json`, `lifecycles.ts` | champ `type`, e-mail                                |
| `src/api/audio/**`, `src/api/fascicule/**` (créer)                                     | collections                                         |
| `src/components/sections/catalogue.json` (créer)                                       | titres de section, partagé par Audios et Fascicules |
| `src/api/page-accueil/content-types/page-accueil/schema.json`                          | champs `audios`, `fascicules`                       |
| `scripts/verifier-conformite.mjs`                                                      | populate et contrôles des nouvelles collections     |
| `scripts/seed-data.json`                                                               | régénéré depuis le site                             |
| `README.md`                                                                            | jeton, mode d'emploi, poids des fichiers            |

> Écart assumé avec la spec : un seul composant `sections.catalogue` au lieu de `sections.audios` + `sections.fascicules`, les deux ayant exactement les mêmes champs. Les clés de la page d'accueil restent `audios` et `fascicules`.

---

# Lot 1 — commande ou inscription, libellés

### Task 1: CMS — type de demande sur le produit et sur la demande enregistrée

**Files:**

- Modify: `../olivier-hildevert-cms/src/components/blocs/produit.json`
- Modify: `../olivier-hildevert-cms/src/api/demande-commande/content-types/demande-commande/schema.json`
- Modify: `../olivier-hildevert-cms/src/api/demande-commande/content-types/demande-commande/lifecycles.ts`

**Interfaces:**

- Produces: attribut `typeDemande` (`"commande" | "inscription"`, défaut `"commande"`) sur `blocs.produit` ; attribut `type` (mêmes valeurs) sur `api::demande-commande`. Le site (tâches 2 et 3) lit l'un et écrit l'autre.

- [ ] **Step 1: Créer la branche CMS**

```bash
cd ../olivier-hildevert-cms && git checkout main && git checkout -b feat/catalogues-audios-fascicules
```

(Le `package-lock.json` modifié qui traîne dans ce dépôt n'est pas à nous : ne pas l'ajouter aux commits.)

- [ ] **Step 2: Ajouter `typeDemande` au produit**

Dans `src/components/blocs/produit.json`, ajouter après `"boutonLabel"` :

```json
		"typeDemande": {
			"type": "enumeration",
			"enum": ["commande", "inscription"],
			"default": "commande",
			"required": false
		},
```

- [ ] **Step 3: Ajouter `type` à la demande**

Dans `schema.json` de `demande-commande`, remplacer `"displayName": "Demandes de commande"` par `"displayName": "Demandes (commandes et inscriptions)"` et ajouter en tête des `attributes` :

```json
		"type": {
			"type": "enumeration",
			"enum": ["commande", "inscription"],
			"default": "commande",
			"required": false
		},
```

- [ ] **Step 4: Adapter l'e-mail de notification**

Remplacer le contenu de `lifecycles.ts` par :

```ts
import { notifier } from '../../../../utils/notifier';

export default {
	afterCreate(event: { result: Record<string, string> }) {
		const d = event.result;
		const nature = d.type === 'inscription' ? 'inscription' : 'commande';
		// Non attendu, comme pour les demandes de rendez-vous : la réponse HTTP
		// ne dépend pas de l'envoi de l'e-mail (voir src/utils/notifier.ts).
		notifier(
			strapi,
			`Nouvelle demande d'${nature === 'inscription' ? 'inscription' : 'achat'} — ${d.produit}`,
			[
				`Type       : ${nature}`,
				`Produit    : ${d.produit}`,
				`Nom        : ${d.nom}`,
				`E-mail     : ${d.email}`,
				`Téléphone  : ${d.telephone}`,
				'',
				'Message :',
				d.message || '(aucun)'
			].join('\n'),
			d.email
		).catch(() => {});
	}
};
```

- [ ] **Step 5: Vérifier que le CMS compile**

Run: `cd ../olivier-hildevert-cms && npm run build`
Expected: build Strapi terminé sans erreur.

- [ ] **Step 6: Commit (dépôt CMS)**

```bash
cd ../olivier-hildevert-cms
git add src/components/blocs/produit.json src/api/demande-commande
git commit -m "feat(boutique): type de demande commande/inscription sur les produits et les demandes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Site — textes par type, schéma, action serveur, envoi à Strapi

**Files:**

- Create: `src/lib/commande/textes.ts`
- Create: `src/lib/commande/textes.test.ts`
- Modify: `src/lib/commande/schema.ts`
- Modify: `src/lib/commande/schema.test.ts`
- Modify: `src/lib/server/forms.ts:44-63`
- Modify: `src/lib/server/forms.test.ts`
- Modify: `src/routes/commande/+page.server.ts`

**Interfaces:**

- Produces:
  - `export const TYPES_DEMANDE = ['commande', 'inscription'] as const;`
  - `export type TypeDemande = 'commande' | 'inscription';`
  - `export const TEXTES_DEMANDE: Record<TypeDemande, { titre: string; accroche: string; confirmation: string }>;`
  - `export function typeDemande(valeur: string | null | undefined): TypeDemande;`
  - `commandeSchema` gagne `type: TypeDemande` (défaut `'commande'`).
  - `enregistrerCommande(data: { produit; name; email; phone; message; type: TypeDemande }, fetcher)` poste `type`.

- [ ] **Step 1: Écrire les tests des textes**

`src/lib/commande/textes.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { TEXTES_DEMANDE, typeDemande } from './textes';

describe('textes du parcours de commande', () => {
	it('parle d’adhésion pour une inscription', () => {
		expect(TEXTES_DEMANDE.inscription).toEqual({
			titre: 'Adhérer',
			accroche: 'Je vous recontacte pour finaliser votre inscription.',
			confirmation:
				'Demande d’inscription transmise. Je vous recontacte rapidement pour la finaliser.'
		});
	});

	it('garde les textes d’origine pour une commande', () => {
		expect(TEXTES_DEMANDE.commande.titre).toBe('Commander');
		expect(TEXTES_DEMANDE.commande.accroche).toBe(
			'Je vous recontacte pour finaliser votre commande.'
		);
		expect(TEXTES_DEMANDE.commande.confirmation).toBe(
			'Demande de commande transmise. Je vous recontacte rapidement pour la finaliser.'
		);
	});

	it('ramène toute valeur inconnue ou absente à « commande »', () => {
		expect(typeDemande('inscription')).toBe('inscription');
		expect(typeDemande('commande')).toBe('commande');
		expect(typeDemande('n-importe-quoi')).toBe('commande');
		expect(typeDemande('INSCRIPTION')).toBe('commande');
		expect(typeDemande(null)).toBe('commande');
		expect(typeDemande(undefined)).toBe('commande');
	});
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `pnpm test:unit -- --run src/lib/commande/textes.test.ts`
Expected: FAIL (module `./textes` introuvable).

- [ ] **Step 3: Créer `src/lib/commande/textes.ts`**

```ts
/**
 * Textes du parcours de commande selon le type de demande : le même formulaire
 * sert aux achats (« Commander ») et aux adhésions (« Adhérer »). Source unique
 * pour la modale, la page de repli /commande et l'action serveur.
 * Imports relatifs uniquement : importé par src/lib/content/types.ts (seed via tsx).
 */
export const TYPES_DEMANDE = ['commande', 'inscription'] as const;
export type TypeDemande = (typeof TYPES_DEMANDE)[number];

export const TEXTES_DEMANDE: Record<
	TypeDemande,
	{ titre: string; accroche: string; confirmation: string }
> = {
	commande: {
		titre: 'Commander',
		accroche: 'Je vous recontacte pour finaliser votre commande.',
		confirmation: 'Demande de commande transmise. Je vous recontacte rapidement pour la finaliser.'
	},
	inscription: {
		titre: 'Adhérer',
		accroche: 'Je vous recontacte pour finaliser votre inscription.',
		confirmation:
			'Demande d’inscription transmise. Je vous recontacte rapidement pour la finaliser.'
	}
};

/** Valeur libre (`?type=`, champ de formulaire) → type connu, « commande » par défaut. */
export function typeDemande(valeur: string | null | undefined): TypeDemande {
	return valeur === 'inscription' ? 'inscription' : 'commande';
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `pnpm test:unit -- --run src/lib/commande/textes.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Tests du schéma**

Ajouter dans `src/lib/commande/schema.test.ts`, dans le `describe` existant :

```ts
it('prend « commande » comme type par défaut et accepte « inscription »', () => {
	const parDefaut = commandeSchema.safeParse(valide);
	expect(parDefaut.success && parDefaut.data.type).toBe('commande');
	const inscription = commandeSchema.safeParse({ ...valide, type: 'inscription' });
	expect(inscription.success && inscription.data.type).toBe('inscription');
});

it('rejette un type inconnu', () => {
	expect(commandeSchema.safeParse({ ...valide, type: 'location' }).success).toBe(false);
});
```

Run: `pnpm test:unit -- --run src/lib/commande/schema.test.ts`
Expected: FAIL sur les deux nouveaux tests.

- [ ] **Step 6: Ajouter `type` au schéma**

Dans `src/lib/commande/schema.ts`, ajouter l'import et le champ :

```ts
import { z } from 'zod';
import { TYPES_DEMANDE } from './textes';
```

et, dans `z.object({ … })`, après `message` :

```ts
type: z.enum(TYPES_DEMANDE).default('commande');
```

Run: `pnpm test:unit -- --run src/lib/commande/schema.test.ts`
Expected: PASS.

- [ ] **Step 7: Test de l'envoi à Strapi**

Dans `src/lib/server/forms.test.ts`, ajouter `enregistrerCommande` à l'import depuis `./forms`, puis :

```ts
describe('enregistrerCommande', () => {
	it('poste la demande sur demandes-commande avec son type', async () => {
		const fetcher = ok();
		await enregistrerCommande(
			{
				produit: 'Adhésion annuelle',
				name: 'Jeanne Dupont',
				email: 'jeanne@example.com',
				phone: '06 12 34 56 78',
				message: 'Bonjour',
				type: 'inscription'
			},
			fetcher as unknown as typeof fetch
		);
		const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('http://cms.test/api/demandes-commande');
		expect(JSON.parse(init.body as string)).toEqual({
			data: {
				produit: 'Adhésion annuelle',
				nom: 'Jeanne Dupont',
				email: 'jeanne@example.com',
				telephone: '06 12 34 56 78',
				message: 'Bonjour',
				type: 'inscription'
			}
		});
	});
});
```

Run: `pnpm test:unit -- --run src/lib/server/forms.test.ts`
Expected: FAIL (`type` absent du corps posté ; erreur de type TS possible).

- [ ] **Step 8: Envoyer `type`**

Dans `src/lib/server/forms.ts`, ajouter `import type { TypeDemande } from '$lib/commande/textes';` en tête, puis remplacer `enregistrerCommande` par :

```ts
export async function enregistrerCommande(
	data: {
		produit: string;
		name: string;
		email: string;
		phone: string;
		message: string;
		type: TypeDemande;
	},
	fetcher: typeof fetch
): Promise<void> {
	if (!isStrapiConfigured()) {
		console.log('Demande de commande reçue (Strapi non configuré) :', data);
		return;
	}
	await createEntry(
		'demandes-commande',
		{
			produit: data.produit,
			nom: data.name,
			email: data.email,
			telephone: data.phone,
			message: data.message,
			type: data.type
		},
		fetcher
	);
}
```

Run: `pnpm test:unit -- --run src/lib/server/forms.test.ts`
Expected: PASS.

- [ ] **Step 9: Action et chargement de `/commande` selon le type**

Dans `src/routes/commande/+page.server.ts` :

- ajouter `import { TEXTES_DEMANDE, typeDemande } from '$lib/commande/textes';` ;
- remplacer le `load` par :

```ts
export const load: PageServerLoad = async ({ url }) => {
	const produit = url.searchParams.get('produit')?.slice(0, 200) ?? '';
	const type = typeDemande(url.searchParams.get('type'));
	return {
		form: await superValidate({ produit, type }, adapter, { errors: false })
	};
};
```

- remplacer le message de succès par :

```ts
return message(form, {
	type: 'succes',
	texte: TEXTES_DEMANDE[form.data.type].confirmation
});
```

- [ ] **Step 10: Vérifier types et tests**

Run: `pnpm check && pnpm test:unit -- --run --project server`
Expected: 0 erreur, tous les tests serveur passent.

- [ ] **Step 11: Commit**

```bash
git add src/lib/commande src/lib/server/forms.ts src/lib/server/forms.test.ts src/routes/commande/+page.server.ts
git commit -m "feat(commande): textes selon le type de demande (commande ou inscription)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Site — `typeDemande` du produit, boutique (« En savoir plus » au-dessus)

**Files:**

- Modify: `src/lib/content/types.ts:95-107`
- Modify: `src/lib/server/content.ts:155-188` (schéma `boutique.produits`)
- Modify: `src/lib/server/content.test.ts` (describe « produits de la boutique »)
- Modify: `src/lib/commande/commande.svelte.ts`
- Modify: `src/lib/components/home/Boutique.svelte:100-133`
- Modify: `src/lib/components/home/Boutique.svelte.test.ts`

**Interfaces:**

- Consumes: `TypeDemande`, `TYPES_DEMANDE` (tâche 2).
- Produces:
  - `ProduitBoutique.typeDemande?: TypeDemande` (présent seulement pour `'inscription'`).
  - `commande` (état) gagne `type: TypeDemande` ; `openCommande(produit: string, type: TypeDemande = 'commande')`.

- [ ] **Step 1: Test du mapping boutique**

Dans `src/lib/server/content.test.ts`, dans `describe('getPageAccueil — produits de la boutique')`, ajouter :

```ts
it('garde typeDemande « inscription », omet « commande » et null', async () => {
	const inscription = await getPageAccueil(avecProduit({ ...base, typeDemande: 'inscription' }));
	expect(inscription.boutique.produits[0]).toEqual({ ...base, typeDemande: 'inscription' });

	for (const typeDemande of ['commande', null]) {
		const accueil = await getPageAccueil(avecProduit({ ...base, typeDemande }));
		expect(accueil.boutique.produits[0]).toEqual(base);
	}
});
```

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: FAIL (`typeDemande` absent du résultat).

- [ ] **Step 2: Type front**

Dans `src/lib/content/types.ts` :

- ajouter en tête : `import type { TypeDemande } from '../commande/textes';`
- dans `ProduitBoutique`, après `boutonLabel: string;` :

```ts
	/**
	 * Nature de la demande quand « boutonLabel » ouvre le formulaire (pas de
	 * `lien`) : absent = commande, « inscription » = adhésion (textes adaptés).
	 */
	typeDemande?: TypeDemande;
```

- remplacer le commentaire de `info` par : `/** Bouton « En savoir plus » : document envoyé dans Strapi (PDF, JPEG) ou lien externe (Canva…). */`

- [ ] **Step 3: Validation et transformation**

Dans `src/lib/server/content.ts` :

- ajouter `import { TYPES_DEMANDE } from '$lib/commande/textes';`
- dans l'objet produit, après `boutonLabel: z.string(),` :

```ts
						typeDemande: z.enum(TYPES_DEMANDE).nullish(),
```

- remplacer la transformation du produit par :

```ts
					.transform(
						({ cleImage, image, lien, document, lienInfo, typeDemande, ...texte }) => {
							const info = document ?? lienInfo;
							return {
								...texte,
								...(cleImage ? { cleImage } : {}),
								...(image ? { image } : {}),
								...(lien ? { lien } : {}),
								...(info ? { info } : {}),
								// « commande » est le défaut : omis pour le round-trip avec les défauts.
								...(typeDemande === 'inscription' ? { typeDemande } : {})
							};
						}
					)
```

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: PASS (y compris le round-trip existant).

- [ ] **Step 4: État de la modale**

Remplacer `src/lib/commande/commande.svelte.ts` par :

```ts
/**
 * État global de la modale de commande (runes en portée module).
 * Mutations uniquement côté client (interactions utilisateur) — sûr en SSR.
 */
import type { TypeDemande } from './textes';

export const commande = $state<{ open: boolean; produit: string; type: TypeDemande }>({
	open: false,
	produit: '',
	type: 'commande'
});

export function openCommande(produit: string, type: TypeDemande = 'commande') {
	commande.produit = produit;
	commande.type = type;
	commande.open = true;
}

export function closeCommande() {
	commande.open = false;
}
```

- [ ] **Step 5: Tests de la boutique**

Dans `src/lib/components/home/Boutique.svelte.test.ts` :

- dans le premier test, remplacer `/^Infos/` par `/^En savoir plus/` ;
- remplacer le test « ouvre le document dans un nouvel onglet par « Infos » » par :

```ts
it('ouvre le document dans un nouvel onglet par « En savoir plus », placé avant le bouton principal', async () => {
	const screen = render(Boutique, { content: avecCreation });
	const enSavoirPlus = screen.getByRole('link', {
		name: 'En savoir plus : Cartes de méditation'
	});
	await expect
		.element(enSavoirPlus)
		.toHaveAttribute('href', 'https://cms.test/uploads/catalogue.pdf');
	await expect.element(enSavoirPlus).toHaveAttribute('target', '_blank');

	const actions = [...screen.container.querySelectorAll('article')].at(-1)!;
	const libelles = [...actions.querySelectorAll('a')].map((a) => a.textContent?.trim());
	expect(libelles[0]).toMatch(/^En savoir plus/);
	expect(libelles[1]).toMatch(/^Commander/);
});
```

- ajouter :

```ts
it('ouvre le formulaire en mode inscription pour un produit d’adhésion', async () => {
	const adhesion: BoutiqueContent = {
		...defaultAccueil.boutique,
		produits: [
			{
				tag: 'Association',
				titre: 'Adhésion annuelle',
				desc: 'Adhérer à l’association.',
				prixTexte: '30 €',
				boutonLabel: 'Adhérer',
				typeDemande: 'inscription'
			}
		]
	};
	const screen = render(Boutique, { content: adhesion });
	const lien = screen.getByRole('link', { name: 'Adhérer : Adhésion annuelle' });
	await expect
		.element(lien)
		.toHaveAttribute('href', '/commande?produit=Adh%C3%A9sion%20annuelle&type=inscription');

	await lien.click();
	expect(commande.open).toBe(true);
	expect(commande.type).toBe('inscription');
	closeCommande();
});
```

- dans le test existant « ouvre le formulaire de commande quand le produit n'a pas de lien », ajouter après `expect(commande.produit)…` : `expect(commande.type).toBe('commande');`

Run: `pnpm test:unit -- --run src/lib/components/home/Boutique.svelte.test.ts`
Expected: FAIL (libellé « Infos », ordre, `type=inscription`).

- [ ] **Step 6: Modifier `Boutique.svelte`**

Remplacer tout le bloc `<div class="flex flex-col gap-3 border-t border-line pt-4">…</div>` par :

```svelte
<div class="flex flex-col gap-3 border-t border-line pt-4">
	<!-- On se renseigne avant de s'engager : « En savoir plus » d'abord. -->
	{#if produit.info}
		<a
			class="btn btn-line justify-center"
			href={produit.info}
			target="_blank"
			rel="external noopener noreferrer"
		>
			En savoir plus<span class="sr-only">&nbsp;: {produit.titre}</span>
		</a>
	{/if}
	{#if produit.lien}
		<a
			class="btn btn-sun justify-center"
			href={produit.lien}
			target="_blank"
			rel="external noopener noreferrer"
		>
			{produit.boutonLabel}<span class="sr-only">&nbsp;: {produit.titre}</span>
		</a>
	{:else}
		<a
			class="btn btn-sun justify-center"
			href="{commande}?produit={encodeURIComponent(produit.titre)}{produit.typeDemande ===
			'inscription'
				? '&type=inscription'
				: ''}"
			onclick={(e) => {
				e.preventDefault();
				openCommande(produit.titre, produit.typeDemande);
			}}
		>
			{produit.boutonLabel}<span class="sr-only">&nbsp;: {produit.titre}</span>
		</a>
	{/if}
</div>
```

(`pnpm format` réalignera la ligne du `href`.)

Run: `pnpm test:unit -- --run src/lib/components/home/Boutique.svelte.test.ts`
Expected: PASS.

- [ ] **Step 7: Vérifier**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test:unit -- --run`
Expected: tout vert.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/types.ts src/lib/server/content.ts src/lib/server/content.test.ts src/lib/commande/commande.svelte.ts src/lib/components/home/Boutique.svelte src/lib/components/home/Boutique.svelte.test.ts
git commit -m "feat(boutique): « En savoir plus » avant le bouton principal, type de demande par produit

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Site — modale et page `/commande` selon le type, « Votre message »

**Files:**

- Modify: `src/lib/components/CommandeModal.svelte`
- Modify: `src/routes/commande/+page.svelte`
- Modify: `e2e/home.e2e.ts:157-171`

**Interfaces:**

- Consumes: `commande.type`, `TEXTES_DEMANDE`, champ `type` du schéma (tâches 2–3).

- [ ] **Step 1: Tests e2e (échouent)**

Dans `e2e/home.e2e.ts`, dans `test.describe('commande', …)`, ajouter :

```ts
test('la page /commande passe en mode inscription avec ?type=inscription', async ({ browser }) => {
	const contexte = await browser.newContext({ javaScriptEnabled: false });
	const page = await contexte.newPage();
	await page.goto('/commande?produit=Adh%C3%A9sion%20annuelle&type=inscription');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Adhérer');
	await expect(page.getByText('finaliser votre inscription')).toBeVisible();
	await page.getByLabel('Nom et prénom').fill('Jeanne Dupont');
	await page.getByLabel('Adresse e-mail').fill('jeanne@example.com');
	await page.getByLabel('Téléphone').fill('06 12 34 56 78');
	await page.getByLabel('Votre message').fill('Bonjour');
	await page.getByRole('button', { name: 'Envoyer ma demande' }).click();

	await expect(page.getByRole('status')).toContainText('Demande d’inscription transmise');
	await contexte.close();
});

test('un type inconnu retombe sur le parcours commande', async ({ page }) => {
	await page.goto('/commande?produit=X&type=n-importe-quoi');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Commander');
	await expect(page.getByLabel('Votre message')).toBeVisible();
});
```

Run: `pnpm exec playwright test e2e/home.e2e.ts -g "inscription|type inconnu"`
Expected: FAIL (titre « Commander » en dur, libellé « Quantité… »).

- [ ] **Step 2: Modale**

Dans `src/lib/components/CommandeModal.svelte` :

- dans le second `<script>`, ajouter `import { TEXTES_DEMANDE } from '$lib/commande/textes';` et, après la déclaration `superForm`, `const textes = $derived(TEXTES_DEMANDE[commande.type]);` ;
- dans l'`$effect`, remplacer `reset({ data: { produit: commande.produit } });` par `reset({ data: { produit: commande.produit, type: commande.type } });` ;
- `aria-label="Commander"` → `aria-label={textes.titre}` ;
- le contenu du `<span class="mb-5 block font-mono …">` (`Commander`) → `{textes.titre}` ;
- `Je vous recontacte pour finaliser votre commande.` → `{textes.accroche}` ;
- après `<input type="hidden" name="produit" value={$form.produit} />`, ajouter `<input type="hidden" name="type" value={$form.type} />` ;
- le libellé caché et le `placeholder` du champ `cmd-message` : `Quantité, adresse de livraison ou précisions` → `Votre message` (les deux occurrences).

- [ ] **Step 3: Page de repli**

Dans `src/routes/commande/+page.svelte` :

- ajouter `import { TEXTES_DEMANDE } from '$lib/commande/textes';` et, après `superForm`, `const textes = $derived(TEXTES_DEMANDE[$form.type]);` ;
- `<title>Commander — {site.name}</title>` → `<title>{textes.titre} — {site.name}</title>` ;
- `content="Commandez un produit…finaliser la commande."` → `content="Commande ou adhésion auprès de {site.name} : laissez vos coordonnées, vous serez recontacté pour finaliser votre demande."` ;
- `<h1 …>Commander</h1>` → `<h1 …>{textes.titre}</h1>` ;
- le paragraphe d'accroche → `Laissez-moi vos coordonnées. {textes.accroche}` ;
- dans le `<form>`, juste après l'ouverture, ajouter `<input type="hidden" name="type" value={$form.type} />` ;
- libellé du `textarea` : `Quantité, adresse de livraison ou précisions` → `Votre message`.

- [ ] **Step 4: Lancer les e2e**

Run: `pnpm exec playwright test e2e/home.e2e.ts`
Expected: PASS (dont le test existant « la page /commande fonctionne sans JavaScript »).

- [ ] **Step 5: Vérifier**

Run: `pnpm format && pnpm check && pnpm lint`
Expected: vert.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/CommandeModal.svelte src/routes/commande/+page.svelte e2e/home.e2e.ts
git commit -m "feat(commande): modale et page /commande en « Adhérer » pour une inscription, champ « Votre message »

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

# Lot 2 — catalogues Audios et Fascicules

### Task 5: CMS — collections `audio` et `fascicule`, titres de section, contrôles, README

**Files:**

- Create: `../olivier-hildevert-cms/src/api/audio/content-types/audio/schema.json`
- Create: `../olivier-hildevert-cms/src/api/audio/controllers/audio.ts`, `routes/audio.ts`, `services/audio.ts`
- Create: `../olivier-hildevert-cms/src/api/fascicule/content-types/fascicule/schema.json`
- Create: `../olivier-hildevert-cms/src/api/fascicule/controllers/fascicule.ts`, `routes/fascicule.ts`, `services/fascicule.ts`
- Create: `../olivier-hildevert-cms/src/components/sections/catalogue.json`
- Modify: `../olivier-hildevert-cms/src/api/page-accueil/content-types/page-accueil/schema.json`
- Modify: `../olivier-hildevert-cms/scripts/verifier-conformite.mjs`
- Modify: `../olivier-hildevert-cms/README.md`

**Interfaces:**

- Produces: endpoints REST `GET /api/audios`, `GET /api/fascicules` ; champs `audios` et `fascicules` (composant `sections.catalogue` : `eyebrow`, `titre`, `paragraphe`) sur `page-accueil`. Forme des entrées : voir schémas ci-dessous (consommés en tâche 7).

- [ ] **Step 1: Collection `audio`**

`src/api/audio/content-types/audio/schema.json` :

```json
{
	"kind": "collectionType",
	"collectionName": "audios",
	"info": {
		"singularName": "audio",
		"pluralName": "audios",
		"displayName": "Audios",
		"description": "Audios gratuits (mp3, ou mp4 court) écoutés directement sur le site."
	},
	"options": { "draftAndPublish": true },
	"attributes": {
		"titre": { "type": "string", "required": true },
		"description": { "type": "text", "required": false },
		"fichier": {
			"type": "media",
			"multiple": false,
			"required": true,
			"allowedTypes": ["audios", "videos"],
			"pluginOptions": {}
		},
		"visuel": {
			"type": "media",
			"multiple": false,
			"required": false,
			"allowedTypes": ["images"],
			"pluginOptions": {}
		},
		"duree": { "type": "string", "required": false },
		"misEnAvant": { "type": "boolean", "default": false }
	}
}
```

`src/api/audio/controllers/audio.ts` :

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::audio.audio');
```

`src/api/audio/routes/audio.ts` :

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::audio.audio');
```

`src/api/audio/services/audio.ts` :

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::audio.audio');
```

- [ ] **Step 2: Collection `fascicule`**

`src/api/fascicule/content-types/fascicule/schema.json` :

```json
{
	"kind": "collectionType",
	"collectionName": "fascicules",
	"info": {
		"singularName": "fascicule",
		"pluralName": "fascicules",
		"displayName": "Fascicules",
		"description": "Fascicules à thème. Prix vide = gratuit (le PDF est téléchargeable) ; prix renseigné = payant (le PDF n'est jamais transmis au site)."
	},
	"options": { "draftAndPublish": true },
	"attributes": {
		"titre": { "type": "string", "required": true },
		"description": { "type": "text", "required": false },
		"couverture": {
			"type": "media",
			"multiple": false,
			"required": false,
			"allowedTypes": ["images"],
			"pluginOptions": {}
		},
		"prixTexte": { "type": "string", "required": false },
		"document": {
			"type": "media",
			"multiple": false,
			"required": false,
			"allowedTypes": ["files"],
			"pluginOptions": {}
		},
		"lien": { "type": "string", "required": false, "regex": "^(https?://.*)?$" },
		"typeDemande": {
			"type": "enumeration",
			"enum": ["commande", "inscription"],
			"default": "commande",
			"required": false
		},
		"misEnAvant": { "type": "boolean", "default": false }
	}
}
```

Contrôleur, routes et service : mêmes fichiers que pour `audio`, avec `'api::fascicule.fascicule'`.

- [ ] **Step 3: Composant de titres et page d'accueil**

`src/components/sections/catalogue.json` :

```json
{
	"collectionName": "components_sections_catalogues",
	"info": { "displayName": "Catalogue (titres)", "icon": "layer" },
	"options": {},
	"attributes": {
		"eyebrow": { "type": "string", "required": true },
		"titre": { "type": "string", "required": true },
		"paragraphe": { "type": "text", "required": false }
	}
}
```

Dans `page-accueil/schema.json`, ajouter après `"boutique"` :

```json
		"audios": {
			"type": "component",
			"repeatable": false,
			"component": "sections.catalogue",
			"required": false
		},
		"fascicules": {
			"type": "component",
			"repeatable": false,
			"component": "sections.catalogue",
			"required": false
		},
```

- [ ] **Step 4: Script de conformité**

Dans `scripts/verifier-conformite.mjs` :

- ajouter à `POPULATE_ACCUEIL`, après la ligne `boutique` : `'populate[audios][populate]': '*',` et `'populate[fascicules][populate]': '*',` ;
- avant le `console.log(echecs === 0 …)` final, ajouter :

```js
// Catalogues : une collection vide est légitime (section masquée sur le site),
// mais chaque entrée publiée doit porter ses champs obligatoires.
console.log('\nCatalogues');
const audios = await appeler('/audios', { populate: '*', 'pagination[pageSize]': '100' });
if (audios)
	for (const a of audios) {
		const ecarts = ecartsDe(['titre'], a);
		if (!a.fichier?.url || !a.fichier?.mime) ecarts.push('fichier absent');
		verdict(`audio « ${a.titre ?? '?'} »`, ecarts);
	}
const fascicules = await appeler('/fascicules', { populate: '*', 'pagination[pageSize]': '100' });
if (fascicules)
	for (const f of fascicules) verdict(`fascicule « ${f.titre ?? '?'} »`, ecartsDe(['titre'], f));
```

- [ ] **Step 5: README**

Dans `README.md`, section « Jeton d'API `site-web` » :

- « exactement ces sept permissions » → « exactement ces neuf permissions » ;
- ajouter au tableau, après `prestation` : `| \`audio\` | \`find\` |`et`| \`fascicule\` | \`find\` |` ;
- remplacer la phrase « Aucune permission « Upload » n'est nécessaire : les médias des produits sont remontés par le `populate` de `page-accueil` » par « Aucune permission « Upload » n'est nécessaire : les médias des produits, des audios et des fascicules sont remontés par le `populate` des requêtes ».

Ajouter une section à la fin :

```markdown
## Audios et fascicules (mode d'emploi)

- **Ajouter un audio** : `Gestionnaire de contenu → Audios → Créer une entrée`. Titre et fichier
  obligatoires ; description, visuel et durée (« 12 min ») facultatifs. Publier.
- **Ajouter un fascicule** : `Fascicules → Créer une entrée`.
  - **Gratuit** : laisser « prixTexte » vide et envoyer le PDF dans « document » → bouton « Télécharger ».
  - **Payant** : renseigner « prixTexte » (« 12 € »). Avec un « lien », le bouton y mène ; sans lien,
    il ouvre le formulaire de commande (« typeDemande » choisit « Commander » ou « Adhérer »).
    Le PDF d'un fascicule payant n'est **jamais** transmis au site.
- **Accueil** : 4 éléments par catégorie. Ceux dont « misEnAvant » est coché passent d'abord,
  complétés par les plus récents. Les titres des sections se règlent dans
  `Page d'accueil → audios / fascicules` (vides : textes par défaut du site).
- **Poids des fichiers** : les médias sont servis par ce serveur (volume Railway). Préférer le mp3
  à 128 kb/s (environ 1 Mo par minute) ; éviter le mp4 au-delà de quelques minutes.
```

- [ ] **Step 6: Vérifier le CMS**

Run: `cd ../olivier-hildevert-cms && npm run build`
Expected: build sans erreur.

Puis, si un Strapi local est disponible (`npm run develop` dans un autre terminal, jeton dans `.env`) : créer un audio et un fascicule de test, ajouter `find` sur les deux collections au jeton local, lancer `npm run verifier`. Expected : section « Catalogues » au vert.

- [ ] **Step 7: Commit (dépôt CMS)**

```bash
cd ../olivier-hildevert-cms
git add src/api/audio src/api/fascicule src/components/sections/catalogue.json src/api/page-accueil scripts/verifier-conformite.mjs README.md
git commit -m "feat(catalogues): collections Audios et Fascicules, titres de section sur l'accueil

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Site — types et titres des sections Audios / Fascicules sur l'accueil

**Files:**

- Modify: `src/lib/content/types.ts`
- Modify: `src/lib/content/defaults.ts` (après `boutique`)
- Modify: `src/lib/server/content.ts` (`accueilSchema`, `POPULATE_ACCUEIL`)
- Modify: `src/lib/server/content.test.ts`
- Modify: `../olivier-hildevert-cms/scripts/seed-data.json` (régénéré)

**Interfaces:**

- Produces (dans `types.ts`) :

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

et `PageAccueilContent` gagne `audios: SectionCatalogue; fascicules: SectionCatalogue;`.

- [ ] **Step 1: Tests (échouent)**

Dans `src/lib/server/content.test.ts`, ajouter :

```ts
describe('getPageAccueil — titres des catalogues', () => {
	it('prend les titres par défaut quand le CMS n’a pas encore les sections, sans déclasser la page', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const accueil = await getPageAccueil(
			reponse({
				data: {
					...brut,
					audios: null,
					fascicules: undefined,
					hero: { ...brut.hero, eyebrow: 'Modifié' }
				}
			})
		);
		expect(accueil.hero.eyebrow).toBe('Modifié');
		expect(accueil.audios).toEqual(defaultAccueil.audios);
		expect(accueil.fascicules).toEqual(defaultAccueil.fascicules);
	});

	it('mappe les titres saisis et omet un paragraphe vide', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const accueil = await getPageAccueil(
			reponse({
				data: { ...brut, audios: { eyebrow: 'Écoute', titre: 'Méditations', paragraphe: '  ' } }
			})
		);
		expect(accueil.audios).toEqual({ eyebrow: 'Écoute', titre: 'Méditations' });
	});

	it('demande les deux sections dans le populate', async () => {
		const fetcher = reponse({ data: accueilVersStrapi(defaultAccueil) });
		await getPageAccueil(fetcher);
		const url = decodeURIComponent(
			(fetcher as unknown as { mock: { calls: [string][] } }).mock.calls[0][0]
		);
		expect(url).toContain('populate[audios][populate]=*');
		expect(url).toContain('populate[fascicules][populate]=*');
	});
});
```

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: FAIL (`audios` absent).

- [ ] **Step 2: Types**

Dans `src/lib/content/types.ts`, ajouter les interfaces de la section **Interfaces** ci-dessus (après `BoutiqueContent`) et les deux champs à `PageAccueilContent`, après `boutique: BoutiqueContent;`. L'import `TypeDemande` existe déjà (tâche 3).

- [ ] **Step 3: Défauts**

Dans `src/lib/content/defaults.ts`, ajouter après l'objet `boutique: { … },` :

```ts
	audios: {
		eyebrow: 'Audios',
		titre: 'Écouter, respirer, se relier',
		paragraphe:
			'Des méditations et des enregistrements offerts, à écouter ici même, au calme, quand vous en avez besoin.'
	},
	fascicules: {
		eyebrow: 'Fascicules',
		titre: 'Des fascicules à thème pour approfondir',
		paragraphe:
			'Des repères écrits pour prolonger le travail entre deux séances : certains sont offerts, d’autres disponibles sur commande.'
	},
```

- [ ] **Step 4: Validation et populate**

Dans `src/lib/server/content.ts` :

- ajouter avant `const accueilSchema` :

```ts
/**
 * Titres d'une section catalogue. Ajoutés après la mise en ligne : absents
 * d'une page d'accueil déjà rédigée, ils prennent les défauts SANS déclasser
 * le reste de la page (même règle que `references`).
 */
const sectionCatalogue = (parDefaut: SectionCatalogue) =>
	z
		.object({
			eyebrow: z.string(),
			titre: z.string(),
			paragraphe: z
				.string()
				.nullish()
				.transform((v) => v?.trim() || undefined)
		})
		.transform(({ paragraphe, ...titres }) => ({
			...titres,
			...(paragraphe ? { paragraphe } : {})
		}))
		.nullish()
		.transform((v) => v ?? parDefaut);
```

(ajouter `SectionCatalogue` à l'import de types depuis `$lib/content/types`) ;

- dans `accueilSchema`, après `boutique: z.object({ … }),` :

```ts
	audios: sectionCatalogue(defaultAccueil.audios),
	fascicules: sectionCatalogue(defaultAccueil.fascicules),
```

- dans `POPULATE_ACCUEIL`, après la ligne `boutique` :

```ts
	// Exigent un CMS qui connaît `audios` / `fascicules` (déployer le CMS AVANT le site).
	'populate[audios][populate]': '*',
	'populate[fascicules][populate]': '*',
```

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts src/lib/content`
Expected: PASS (dont le round-trip `accueilVersStrapi(defaultAccueil)` → `defaultAccueil`, inchangé car `seed-format` recopie les sections telles quelles).

- [ ] **Step 5: Régénérer le seed du CMS**

Run: `pnpm exec tsx scripts/export-defaults.ts`
Expected: « Seed écrit dans ../olivier-hildevert-cms/scripts/seed-data.json », avec les clés `audios` et `fascicules` dans `pageAccueil`.

- [ ] **Step 6: Vérifier**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test:unit -- --run`
Expected: vert.

- [ ] **Step 7: Commits (deux dépôts)**

```bash
git add src/lib/content src/lib/server/content.ts src/lib/server/content.test.ts
git commit -m "feat(catalogues): titres des sections Audios et Fascicules sur l'accueil

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
cd ../olivier-hildevert-cms && git add scripts/seed-data.json && git commit -m "chore(seed): titres des sections Audios et Fascicules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Site — lecture des collections, règles des fascicules, `vitrine()`

**Files:**

- Modify: `src/lib/server/content.ts` (ajout en fin de fichier)
- Modify: `src/lib/server/content.test.ts`

**Interfaces:**

- Consumes: `AudioContent`, `FasciculeContent`, `TYPES_DEMANDE`, `imageMedia`, `lienOptionnel`, `urlMedia`, `fetchEntries`.
- Produces:
  - `export type AvecMiseEnAvant<T> = T & { misEnAvant: boolean };`
  - `export async function getAudios(fetcher: typeof fetch): Promise<AvecMiseEnAvant<AudioContent>[]>`
  - `export async function getFascicules(fetcher: typeof fetch): Promise<AvecMiseEnAvant<FasciculeContent>[]>`
  - `export function vitrine<T>(items: AvecMiseEnAvant<T>[], n?: number): T[]` — mis en avant d'abord (ordre d'origine), puis les autres, coupé à `n` (4 par défaut), sans `misEnAvant`.
  - `export function sansMiseEnAvant<T>(items: AvecMiseEnAvant<T>[]): T[]` — liste complète, ordre conservé, sans `misEnAvant`.

- [ ] **Step 1: Tests (échouent)**

Dans `src/lib/server/content.test.ts`, compléter l'import : `import { getAudios, getFascicules, getPageAccueil, getPrestations, getReglages, sansMiseEnAvant, vitrine } from './content';`, puis ajouter :

```ts
const liste = (data: unknown[]) =>
	reponse({
		data,
		meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: data.length } }
	});
const premierAppel = (fetcher: typeof fetch) =>
	decodeURIComponent((fetcher as unknown as { mock: { calls: [string][] } }).mock.calls[0][0]);

describe('getAudios', () => {
	const audio = {
		titre: 'Respiration du matin',
		description: 'Dix minutes pour commencer la journée.',
		fichier: { url: '/uploads/respiration.mp3', mime: 'audio/mpeg' },
		visuel: null,
		duree: '10 min',
		misEnAvant: true
	};

	it('mappe les audios et rend les URLs absolues', async () => {
		await expect(getAudios(liste([audio]))).resolves.toEqual([
			{
				titre: 'Respiration du matin',
				description: 'Dix minutes pour commencer la journée.',
				fichier: { url: 'http://cms.test/uploads/respiration.mp3', mime: 'audio/mpeg' },
				duree: '10 min',
				misEnAvant: true
			}
		]);
	});

	it('écarte seulement l’entrée sans fichier, garde les autres', async () => {
		const res = await getAudios(liste([{ ...audio, titre: 'Cassé', fichier: null }, audio]));
		expect(res.map((a) => a.titre)).toEqual(['Respiration du matin']);
		expect(console.warn).toHaveBeenCalled();
	});

	it('traite misEnAvant null (entrée antérieure à la case) comme non mis en avant', async () => {
		const [a] = await getAudios(liste([{ ...audio, misEnAvant: null }]));
		expect(a.misEnAvant).toBe(false);
	});

	it('demande 100 entrées par page, les plus récentes d’abord, médias inclus', async () => {
		const fetcher = liste([]);
		await getAudios(fetcher);
		const url = premierAppel(fetcher);
		expect(url).toContain('/api/audios?');
		expect(url).toContain('pagination[pageSize]=100');
		expect(url).toContain('sort=publishedAt:desc');
		expect(url).toContain('populate=*');
	});

	it('renvoie une liste vide si Strapi est en erreur ou non configuré', async () => {
		await expect(getAudios(enEchec)).resolves.toEqual([]);
		vi.stubEnv('STRAPI_URL', '');
		await expect(getAudios(enEchec)).resolves.toEqual([]);
	});
});

describe('getFascicules', () => {
	const base = {
		titre: 'Les chakras',
		description: 'Un fascicule.',
		couverture: null,
		misEnAvant: false,
		lien: null,
		typeDemande: null
	};
	const pdf = { url: '/uploads/chakras.pdf' };

	it('gratuit avec PDF → télécharger ; prix fait d’espaces = gratuit', async () => {
		for (const prixTexte of [null, '', '   ']) {
			const [f] = await getFascicules(liste([{ ...base, prixTexte, document: pdf }]));
			expect(f).toEqual({
				titre: 'Les chakras',
				description: 'Un fascicule.',
				action: { kind: 'telecharger', url: 'http://cms.test/uploads/chakras.pdf' },
				misEnAvant: false
			});
		}
	});

	it('gratuit sans PDF → aucune action', async () => {
		const [f] = await getFascicules(liste([{ ...base, prixTexte: null, document: null }]));
		expect(f.action).toEqual({ kind: 'aucune' });
	});

	it('payant avec lien → lien ; le PDF n’est jamais relayé', async () => {
		const [f] = await getFascicules(
			liste([{ ...base, prixTexte: '12 €', document: pdf, lien: 'https://boutique.test/chakras' }])
		);
		expect(f.action).toEqual({ kind: 'lien', url: 'https://boutique.test/chakras' });
		expect(f.prixTexte).toBe('12 €');
		expect(JSON.stringify(f)).not.toContain('chakras.pdf');
	});

	it('payant sans lien → demande, du type choisi (commande par défaut)', async () => {
		const [commande, inscription] = await getFascicules(
			liste([
				{ ...base, prixTexte: '12 €', document: pdf },
				{ ...base, titre: 'Cycle', prixTexte: '40 €', typeDemande: 'inscription' }
			])
		);
		expect(commande.action).toEqual({ kind: 'demande', type: 'commande' });
		expect(JSON.stringify(commande)).not.toContain('chakras.pdf');
		expect(inscription.action).toEqual({ kind: 'demande', type: 'inscription' });
	});

	it('écarte un fascicule au lien non http(s), garde les autres', async () => {
		const res = await getFascicules(
			liste([
				{ ...base, titre: 'Piégé', prixTexte: '5 €', lien: 'javascript:alert(1)' },
				{ ...base, prixTexte: null, document: pdf }
			])
		);
		expect(res.map((f) => f.titre)).toEqual(['Les chakras']);
	});
});

describe('vitrine', () => {
	const el = (titre: string, misEnAvant: boolean) => ({ titre, misEnAvant });

	it('met d’abord les éléments mis en avant, complète par les autres, coupe à 4', () => {
		const items = [
			el('a', false),
			el('b', true),
			el('c', false),
			el('d', true),
			el('e', false),
			el('f', false)
		];
		expect(vitrine(items)).toEqual([
			{ titre: 'b' },
			{ titre: 'd' },
			{ titre: 'a' },
			{ titre: 'c' }
		]);
	});

	it('garde tout quand il y a moins de 4 éléments', () => {
		expect(vitrine([el('a', false), el('b', true)])).toEqual([{ titre: 'b' }, { titre: 'a' }]);
	});

	it('sansMiseEnAvant conserve l’ordre et retire le drapeau', () => {
		expect(sansMiseEnAvant([el('a', true), el('b', false)])).toEqual([
			{ titre: 'a' },
			{ titre: 'b' }
		]);
	});
});
```

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: FAIL (exports absents).

- [ ] **Step 2: Implémentation**

Dans `src/lib/server/content.ts`, compléter l'import de types avec `AudioContent, FasciculeContent`, puis ajouter en fin de fichier :

```ts
// ————— Catalogues (Audios, Fascicules) —————
// Validation ÉLÉMENT PAR ÉLÉMENT, contrairement aux autres domaines : une
// saisie ratée sur un audio ne doit pas vider tout le catalogue. Pas de
// contenu par défaut : en erreur, la liste est vide et la section masquée.

export type AvecMiseEnAvant<T> = T & { misEnAvant: boolean };

const drapeauMiseEnAvant = z
	.boolean()
	.nullish()
	.transform((v) => v ?? false);

const texteOptionnel = z
	.string()
	.nullish()
	.transform((v) => v?.trim() || undefined);

const audioSchema = z
	.object({
		titre: z.string().trim().min(1),
		description: texteOptionnel,
		fichier: z.object({ url: z.string(), mime: z.string() }),
		visuel: imageMedia,
		duree: texteOptionnel,
		misEnAvant: drapeauMiseEnAvant
	})
	.transform(
		({ fichier, visuel, description, duree, ...reste }): AvecMiseEnAvant<AudioContent> => ({
			...reste,
			...(description ? { description } : {}),
			fichier: { url: urlMedia(fichier.url), mime: fichier.mime },
			...(visuel ? { visuel } : {}),
			...(duree ? { duree } : {})
		})
	);

const fasciculeSchema = z
	.object({
		titre: z.string().trim().min(1),
		description: texteOptionnel,
		couverture: imageMedia,
		prixTexte: texteOptionnel,
		document: z.object({ url: z.string() }).nullish(),
		lien: lienOptionnel,
		typeDemande: z.enum(TYPES_DEMANDE).nullish(),
		misEnAvant: drapeauMiseEnAvant
	})
	.transform(
		({
			titre,
			description,
			couverture,
			prixTexte,
			document,
			lien,
			typeDemande,
			misEnAvant
		}): AvecMiseEnAvant<FasciculeContent> => {
			// Payant : le document n'est JAMAIS relayé (il serait public et partageable).
			const action: FasciculeContent['action'] = !prixTexte
				? document
					? { kind: 'telecharger', url: urlMedia(document.url) }
					: { kind: 'aucune' }
				: lien
					? { kind: 'lien', url: lien }
					: { kind: 'demande', type: typeDemande ?? 'commande' };
			return {
				titre,
				...(description ? { description } : {}),
				...(couverture ? { couverture } : {}),
				...(prixTexte ? { prixTexte } : {}),
				action,
				misEnAvant
			};
		}
	);

const QUERY_CATALOGUE = {
	populate: '*',
	sort: 'publishedAt:desc',
	// `maxLimit` du CMS : au-delà de 25 (défaut), la page complète serait tronquée.
	'pagination[pageSize]': '100'
};

async function lireCatalogue<T>(
	collection: string,
	schema: z.ZodType<T>,
	fetcher: typeof fetch
): Promise<T[]> {
	if (!isStrapiConfigured()) return [];
	try {
		const { items } = await fetchEntries<Record<string, unknown>>(
			collection,
			QUERY_CATALOGUE,
			fetcher
		);
		return items.flatMap((item) => {
			const res = schema.safeParse(item);
			if (res.success) return [res.data];
			console.warn(`Entrée « ${collection} » ignorée (invalide) :`, item.titre, res.error.issues);
			return [];
		});
	} catch (err) {
		console.warn(`Catalogue Strapi « ${collection} » indisponible — section masquée.`, err);
		return [];
	}
}

export const getAudios = (fetcher: typeof fetch) => lireCatalogue('audios', audioSchema, fetcher);

export const getFascicules = (fetcher: typeof fetch) =>
	lireCatalogue('fascicules', fasciculeSchema, fetcher);

/** Liste complète, ordre conservé, sans le drapeau de mise en avant. */
export function sansMiseEnAvant<T>(items: AvecMiseEnAvant<T>[]): T[] {
	return items.map(({ misEnAvant: _, ...reste }) => reste as T);
}

/** Les `n` éléments de l'accueil : mis en avant d'abord, complétés par les autres (ordre conservé). */
export function vitrine<T>(items: AvecMiseEnAvant<T>[], n = 4): T[] {
	const enAvant = items.filter((i) => i.misEnAvant);
	const autres = items.filter((i) => !i.misEnAvant);
	return sansMiseEnAvant([...enAvant, ...autres].slice(0, n));
}
```

Si eslint signale `_` inutilisé dans `sansMiseEnAvant`, remplacer par :

```ts
return items.map((item) => {
	const copie: Partial<AvecMiseEnAvant<T>> = { ...item };
	delete copie.misEnAvant;
	return copie as T;
});
```

- [ ] **Step 3: Lancer les tests**

Run: `pnpm test:unit -- --run src/lib/server/content.test.ts`
Expected: PASS.

- [ ] **Step 4: Vérifier**

Run: `pnpm format && pnpm check && pnpm lint`
Expected: vert.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/content.ts src/lib/server/content.test.ts
git commit -m "feat(catalogues): lecture des audios et fascicules, sélection de l'accueil

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Site — cartes audio et fascicule

**Files:**

- Create: `src/lib/components/catalogue/CarteAudio.svelte`
- Create: `src/lib/components/catalogue/CarteAudio.svelte.test.ts`
- Create: `src/lib/components/catalogue/CarteFascicule.svelte`
- Create: `src/lib/components/catalogue/CarteFascicule.svelte.test.ts`

**Interfaces:**

- Consumes: `AudioContent`, `FasciculeContent` (tâche 6), `openCommande(produit, type)` (tâche 3), `TEXTES_DEMANDE` (tâche 2).
- Produces: `<CarteAudio audio={AudioContent} />`, `<CarteFascicule fascicule={FasciculeContent} />` — chacune rend un `<article>` ; aucune animation interne (le parent pose `reveal`).

- [ ] **Step 1: Tests (échouent)**

`src/lib/components/catalogue/CarteAudio.svelte.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CarteAudio from './CarteAudio.svelte';

const base = { titre: 'Respiration du matin', duree: '10 min' };

describe('CarteAudio', () => {
	it('utilise un lecteur audio pour un mp3, sans préchargement', async () => {
		const screen = render(CarteAudio, {
			audio: { ...base, fichier: { url: 'https://cms.test/r.mp3', mime: 'audio/mpeg' } }
		});
		const lecteur = screen.container.querySelector('audio')!;
		expect(lecteur).not.toBeNull();
		expect(lecteur.getAttribute('src')).toBe('https://cms.test/r.mp3');
		expect(lecteur.getAttribute('preload')).toBe('none');
		expect(lecteur.getAttribute('aria-label')).toBe('Écouter : Respiration du matin');
		expect(screen.container.querySelector('video')).toBeNull();
		await expect.element(screen.getByText('10 min')).toBeVisible();
	});

	it('utilise un lecteur vidéo pour un mp4', () => {
		const screen = render(CarteAudio, {
			audio: { ...base, fichier: { url: 'https://cms.test/r.mp4', mime: 'video/mp4' } }
		});
		const lecteur = screen.container.querySelector('video')!;
		expect(lecteur).not.toBeNull();
		expect(lecteur.getAttribute('preload')).toBe('none');
		expect(screen.container.querySelector('audio')).toBeNull();
	});
});
```

`src/lib/components/catalogue/CarteFascicule.svelte.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { commande, closeCommande } from '$lib/commande/commande.svelte';
import type { FasciculeContent } from '$lib/content/types';
import CarteFascicule from './CarteFascicule.svelte';

const base = { titre: 'Les chakras', description: 'Un fascicule.' };

describe('CarteFascicule', () => {
	it('gratuit : « Gratuit » et « Télécharger » dans un nouvel onglet', async () => {
		const fascicule: FasciculeContent = {
			...base,
			action: { kind: 'telecharger', url: 'https://cms.test/chakras.pdf' }
		};
		const screen = render(CarteFascicule, { fascicule });
		await expect.element(screen.getByText('Gratuit')).toBeVisible();
		const lien = screen.getByRole('link', { name: 'Télécharger : Les chakras' });
		await expect.element(lien).toHaveAttribute('href', 'https://cms.test/chakras.pdf');
		await expect.element(lien).toHaveAttribute('target', '_blank');
	});

	it('payant avec lien : prix affiché, « Commander » vers le lien externe', async () => {
		const screen = render(CarteFascicule, {
			fascicule: {
				...base,
				prixTexte: '12 €',
				action: { kind: 'lien', url: 'https://boutique.test/c' }
			}
		});
		await expect.element(screen.getByText('12 €')).toBeVisible();
		const lien = screen.getByRole('link', { name: 'Commander : Les chakras' });
		await expect.element(lien).toHaveAttribute('href', 'https://boutique.test/c');
		await expect.element(lien).toHaveAttribute('rel', expect.stringContaining('noopener'));
	});

	it('payant sans lien : ouvre la modale, titre spécial correctement encodé', async () => {
		const screen = render(CarteFascicule, {
			fascicule: {
				titre: 'Cœur & âme ?',
				prixTexte: '40 €',
				action: { kind: 'demande', type: 'inscription' }
			}
		});
		const lien = screen.getByRole('link', { name: 'Adhérer : Cœur & âme ?' });
		await expect
			.element(lien)
			.toHaveAttribute(
				'href',
				'/commande?produit=C%C5%93ur%20%26%20%C3%A2me%20%3F&type=inscription'
			);
		await lien.click();
		expect(commande.open).toBe(true);
		expect(commande.produit).toBe('Cœur & âme ?');
		expect(commande.type).toBe('inscription');
		closeCommande();
	});

	it('gratuit sans document : aucun bouton', () => {
		const screen = render(CarteFascicule, { fascicule: { ...base, action: { kind: 'aucune' } } });
		expect(screen.container.querySelectorAll('a')).toHaveLength(0);
	});
});
```

Run: `pnpm test:unit -- --run src/lib/components/catalogue`
Expected: FAIL (composants absents).

- [ ] **Step 2: `CarteAudio.svelte`**

```svelte
<script lang="ts">
	import type { AudioContent } from '$lib/content/types';

	let { audio }: { audio: AudioContent } = $props();

	// Un mp4 peut être une vraie vidéo : lecteur vidéo pour tout `video/*`.
	const estVideo = $derived(audio.fichier.mime.startsWith('video/'));
	const SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, calc(100vw - 2.75rem)';
</script>

<article
	class="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)]"
>
	{#if audio.visuel}
		<div class="relative aspect-square bg-surface-2">
			<img
				src={audio.visuel.src}
				srcset={audio.visuel.srcset}
				sizes={SIZES}
				width={audio.visuel.largeur}
				height={audio.visuel.hauteur}
				alt={audio.visuel.alt}
				loading="lazy"
				class="absolute inset-0 h-full w-full object-contain"
			/>
		</div>
	{/if}
	<div class="flex flex-1 flex-col p-[22px_24px]">
		{#if audio.duree}
			<span class="font-mono text-xs tracking-[0.18em] text-coral-ink uppercase">{audio.duree}</span
			>
		{/if}
		<h3 class="mt-2 mb-2.5 text-2xl tracking-[0.01em]">{audio.titre}</h3>
		{#if audio.description}
			<p class="mb-4.5 flex-1 text-sm leading-[1.6] text-ink-soft">{audio.description}</p>
		{/if}
		<div class="mt-auto border-t border-line pt-4">
			{#if estVideo}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={audio.fichier.url}
					controls
					preload="none"
					playsinline
					aria-label="Écouter : {audio.titre}"
					class="w-full rounded-[11px]"
				></video>
			{:else}
				<audio
					src={audio.fichier.url}
					controls
					preload="none"
					aria-label="Écouter : {audio.titre}"
					class="w-full"
				></audio>
			{/if}
		</div>
	</div>
</article>
```

- [ ] **Step 3: `CarteFascicule.svelte`**

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { openCommande } from '$lib/commande/commande.svelte';
	import { TEXTES_DEMANDE } from '$lib/commande/textes';
	import type { FasciculeContent } from '$lib/content/types';

	let { fascicule }: { fascicule: FasciculeContent } = $props();

	const commande = resolve('/commande');
	const SIZES = '(min-width: 1280px) 290px, (min-width: 768px) 45vw, calc(100vw - 2.75rem)';
</script>

<article
	class="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_54px_-46px_color-mix(in_oklab,var(--color-ember)_40%,transparent)]"
>
	{#if fascicule.couverture}
		<div class="relative aspect-square bg-surface-2">
			<img
				src={fascicule.couverture.src}
				srcset={fascicule.couverture.srcset}
				sizes={SIZES}
				width={fascicule.couverture.largeur}
				height={fascicule.couverture.hauteur}
				alt={fascicule.couverture.alt}
				loading="lazy"
				class="absolute inset-0 h-full w-full object-contain"
			/>
		</div>
	{/if}
	<div class="flex flex-1 flex-col p-[22px_24px]">
		<h3 class="mb-2.5 text-2xl tracking-[0.01em]">{fascicule.titre}</h3>
		{#if fascicule.description}
			<p class="mb-4.5 flex-1 text-sm leading-[1.6] text-ink-soft">{fascicule.description}</p>
		{/if}
		<b class="mb-4 font-mono text-xs tracking-[0.08em] text-mute uppercase">
			{fascicule.prixTexte ?? 'Gratuit'}
		</b>
		{#if fascicule.action.kind !== 'aucune'}
			<div class="mt-auto flex flex-col gap-3 border-t border-line pt-4">
				{#if fascicule.action.kind === 'telecharger'}
					<a
						class="btn btn-sun justify-center"
						href={fascicule.action.url}
						target="_blank"
						rel="external noopener noreferrer"
					>
						Télécharger<span class="sr-only">&nbsp;: {fascicule.titre}</span>
					</a>
				{:else if fascicule.action.kind === 'lien'}
					<a
						class="btn btn-sun justify-center"
						href={fascicule.action.url}
						target="_blank"
						rel="external noopener noreferrer"
					>
						Commander<span class="sr-only">&nbsp;: {fascicule.titre}</span>
					</a>
				{:else}
					{@const type = fascicule.action.type}
					<a
						class="btn btn-sun justify-center"
						href="{commande}?produit={encodeURIComponent(fascicule.titre)}{type === 'inscription'
							? '&type=inscription'
							: ''}"
						onclick={(e) => {
							e.preventDefault();
							openCommande(fascicule.titre, type);
						}}
					>
						{TEXTES_DEMANDE[type].titre}<span class="sr-only">&nbsp;: {fascicule.titre}</span>
					</a>
				{/if}
			</div>
		{/if}
	</div>
</article>
```

- [ ] **Step 4: Lancer les tests**

Run: `pnpm test:unit -- --run src/lib/components/catalogue`
Expected: PASS (6 tests). Si le nom accessible inclut un espace insécable, aligner le test sur le rendu de `Boutique` (qui utilise le même motif `&nbsp;:` et passe avec `'Commander : …'`).

- [ ] **Step 5: Vérifier**

Run: `pnpm format && pnpm check && pnpm lint`
Expected: vert.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/catalogue
git commit -m "feat(catalogues): cartes audio (lecteur) et fascicule (télécharger, commander, adhérer)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Site — sections d'accueil, pages complètes, navigation, sitemap

**Files:**

- Create: `src/lib/components/catalogue/CatalogueAccueil.svelte`
- Modify: `src/routes/+page.server.ts`
- Modify: `src/routes/+page.svelte:60`
- Create: `src/routes/audios/+page.server.ts`, `src/routes/audios/+page.svelte`
- Create: `src/routes/fascicules/+page.server.ts`, `src/routes/fascicules/+page.svelte`
- Modify: `src/lib/config.ts`
- Modify: `src/lib/components/Footer.svelte:59-71`
- Modify: `src/routes/sitemap.xml/+server.ts`
- Modify: `e2e/header.e2e.ts:131-138`
- Create: `e2e/catalogues.e2e.ts`

**Interfaces:**

- Consumes: `getAudios`, `getFascicules`, `vitrine`, `sansMiseEnAvant`, `getPageAccueil` (tâches 6–7) ; `CarteAudio`, `CarteFascicule` (tâche 8).
- Produces: `<CatalogueAccueil id content href nombre carte>` avec `carte: Snippet<[number]>` (rend la carte d'index i) ; `data.audios: AudioContent[]` et `data.fascicules: FasciculeContent[]` sur `/`, `/audios`, `/fascicules`.

- [ ] **Step 1: Tests e2e (échouent)**

`e2e/catalogues.e2e.ts` :

```ts
import { expect, test } from '@playwright/test';

// Sans .env, Strapi n'est pas configuré : les catalogues sont vides.
test.describe('catalogues', () => {
	test('les sections vides sont absentes de l’accueil', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('#boutique')).toBeVisible();
		await expect(page.locator('#audios')).toHaveCount(0);
		await expect(page.locator('#fascicules')).toHaveCount(0);
	});

	for (const [chemin, titre] of [
		['/audios', 'Écouter, respirer, se relier'],
		['/fascicules', 'Des fascicules à thème pour approfondir']
	]) {
		test(`${chemin} répond et annonce un catalogue à venir`, async ({ page }) => {
			const res = await page.goto(chemin);
			expect(res?.status()).toBe(200);
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre);
			await expect(page.getByText('Bientôt disponible.')).toBeVisible();
			await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute(
				'href',
				'/'
			);
		});
	}

	test('le pied de page mène aux deux catalogues', async ({ page }) => {
		await page.goto('/');
		const plan = page.getByRole('navigation', { name: 'Plan du site' });
		await expect(plan.getByRole('link', { name: 'Audios', exact: true })).toHaveAttribute(
			'href',
			'/audios'
		);
		await expect(plan.getByRole('link', { name: 'Fascicules', exact: true })).toHaveAttribute(
			'href',
			'/fascicules'
		);
	});

	test('le sitemap liste les deux pages', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text();
		expect(xml).toContain('/audios</loc>');
		expect(xml).toContain('/fascicules</loc>');
	});
});
```

Dans `e2e/header.e2e.ts`, ajouter `'Ressources'` à la liste des libellés du menu mobile (entre `'Contact'` et `'Boutique'`).

Run: `pnpm exec playwright test e2e/catalogues.e2e.ts e2e/header.e2e.ts`
Expected: FAIL (routes 404, liens absents, « Ressources » absent).

- [ ] **Step 2: `CatalogueAccueil.svelte`**

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/attachments/reveal';
	import type { SectionCatalogue } from '$lib/content/types';

	let {
		id,
		content,
		href,
		nombre,
		carte
	}: {
		id: string;
		content: SectionCatalogue;
		/** Page complète du catalogue (déjà passée par resolve()). */
		href: string;
		nombre: number;
		carte: Snippet<[number]>;
	} = $props();
</script>

<!-- Catalogue vide : la section n'existe pas (ni ancre, ni titre orphelin). -->
{#if nombre > 0}
	<section {id} class="relative z-1 scroll-mt-24 bg-surface py-[clamp(86px,11vw,148px)]">
		<div class="wrap">
			<div class="reveal mb-16 max-w-[640px]" {@attach reveal()}>
				<span class="eyebrow">{content.eyebrow}</span>
				<h2 class="mt-5 mb-4.5 text-4xl tracking-[0.005em]">{content.titre}</h2>
				{#if content.paragraphe}
					<p class="text-base leading-[1.66] text-ink-soft">{content.paragraphe}</p>
				{/if}
			</div>
			<div class="grid gap-5.5 md:grid-cols-2 xl:grid-cols-4">
				{#each { length: nombre }, i (i)}
					<div class="reveal flex" {@attach reveal(i * 85)}>
						{@render carte(i)}
					</div>
				{/each}
			</div>
			<div class="mt-12 flex justify-center">
				<a class="btn btn-line" {href}>
					Voir tout<span class="sr-only">&nbsp;: {content.eyebrow}</span>
				</a>
			</div>
		</div>
	</section>
{/if}
```

Les cartes doivent remplir la cellule : dans `CarteAudio.svelte` et `CarteFascicule.svelte`, ajouter `w-full` à la classe de l'`<article>`.

Si eslint signale `href={href}` (`svelte/no-navigation-without-resolve`), passer la page à la place (`page: '/audios' | '/fascicules'`) et calculer `const href = $derived(resolve(page));` dans le composant.

- [ ] **Step 3: Chargement de l'accueil**

Remplacer `src/routes/+page.server.ts` par :

```ts
import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getAudios, getFascicules, getPageAccueil, vitrine } from '$lib/server/content';

// ISR : la home est régénérée au plus toutes les 5 minutes sur Vercel.
// (Config par route — jamais sur les routes à form actions.)
export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, audios, fascicules] = await Promise.all([
		getPageAccueil(fetch),
		getAudios(fetch),
		getFascicules(fetch)
	]);
	return { accueil, audios: vitrine(audios), fascicules: vitrine(fascicules) };
};
```

- [ ] **Step 4: Insertion sur l'accueil**

Dans `src/routes/+page.svelte` :

- imports :

```ts
import { resolve } from '$app/paths';
import CatalogueAccueil from '$lib/components/catalogue/CatalogueAccueil.svelte';
import CarteAudio from '$lib/components/catalogue/CarteAudio.svelte';
import CarteFascicule from '$lib/components/catalogue/CarteFascicule.svelte';
```

- entre `<Boutique content={data.accueil.boutique} />` et `<Tarifs …/>` :

```svelte
<CatalogueAccueil
	id="audios"
	content={data.accueil.audios}
	href={resolve('/audios')}
	nombre={data.audios.length}
>
	{#snippet carte(i)}<CarteAudio audio={data.audios[i]} />{/snippet}
</CatalogueAccueil>

<CatalogueAccueil
	id="fascicules"
	content={data.accueil.fascicules}
	href={resolve('/fascicules')}
	nombre={data.fascicules.length}
>
	{#snippet carte(i)}<CarteFascicule fascicule={data.fascicules[i]} />{/snippet}
</CatalogueAccueil>
```

- [ ] **Step 5: Page `/audios`**

`src/routes/audios/+page.server.ts` :

```ts
import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getAudios, getPageAccueil, sansMiseEnAvant } from '$lib/server/content';

export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, audios] = await Promise.all([getPageAccueil(fetch), getAudios(fetch)]);
	return { section: accueil.audios, audios: sansMiseEnAvant(audios) };
};
```

`src/routes/audios/+page.svelte` :

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import CarteAudio from '$lib/components/catalogue/CarteAudio.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Audios — {site.name}</title>
	<meta
		name="description"
		content="Audios offerts par {site.name} : méditations et enregistrements à écouter librement."
	/>
	<link rel="canonical" href="{site.url}/audios" />
</svelte:head>

<section class="wrap pt-36 pb-24">
	<span class="eyebrow">{data.section.eyebrow}</span>
	<h1 class="mt-5 text-4xl text-ink sm:text-5xl">{data.section.titre}</h1>
	{#if data.section.paragraphe}
		<p class="mt-4 max-w-2xl text-ink-soft">{data.section.paragraphe}</p>
	{/if}

	{#if data.audios.length}
		<div class="mt-14 grid gap-5.5 md:grid-cols-2 xl:grid-cols-4">
			{#each data.audios as audio, i (`${i}-${audio.titre}`)}
				<CarteAudio {audio} />
			{/each}
		</div>
	{:else}
		<p class="mt-14 text-ink-soft">Bientôt disponible.</p>
		<a class="mt-6 btn btn-line" href={resolve('/')}>Retour à l’accueil</a>
	{/if}
</section>
```

- [ ] **Step 6: Page `/fascicules`**

`src/routes/fascicules/+page.server.ts` :

```ts
import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';
import { getFascicules, getPageAccueil, sansMiseEnAvant } from '$lib/server/content';

export const config: Config = { isr: { expiration: 300 } };

export const load: PageServerLoad = async ({ fetch }) => {
	const [accueil, fascicules] = await Promise.all([getPageAccueil(fetch), getFascicules(fetch)]);
	return { section: accueil.fascicules, fascicules: sansMiseEnAvant(fascicules) };
};
```

`src/routes/fascicules/+page.svelte` :

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import CarteFascicule from '$lib/components/catalogue/CarteFascicule.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Fascicules — {site.name}</title>
	<meta
		name="description"
		content="Fascicules à thème de {site.name} : certains offerts en téléchargement, d’autres disponibles sur commande."
	/>
	<link rel="canonical" href="{site.url}/fascicules" />
</svelte:head>

<section class="wrap pt-36 pb-24">
	<span class="eyebrow">{data.section.eyebrow}</span>
	<h1 class="mt-5 text-4xl text-ink sm:text-5xl">{data.section.titre}</h1>
	{#if data.section.paragraphe}
		<p class="mt-4 max-w-2xl text-ink-soft">{data.section.paragraphe}</p>
	{/if}

	{#if data.fascicules.length}
		<div class="mt-14 grid gap-5.5 md:grid-cols-2 xl:grid-cols-4">
			{#each data.fascicules as fascicule, i (`${i}-${fascicule.titre}`)}
				<CarteFascicule {fascicule} />
			{/each}
		</div>
	{:else}
		<p class="mt-14 text-ink-soft">Bientôt disponible.</p>
		<a class="mt-6 btn btn-line" href={resolve('/')}>Retour à l’accueil</a>
	{/if}
</section>
```

- [ ] **Step 7: Menu, pied de page, sitemap**

`src/lib/config.ts` : dans `nav`, insérer avant l'entrée `Boutique` :

```ts
	{ label: 'Ressources', anchor: 'audios' },
```

`src/lib/components/Footer.svelte` : dans `<nav aria-label="Plan du site">`, après le `{#each siteLinks …}{/each}`, ajouter :

```svelte
<a
	href={resolve('/audios')}
	class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
>
	Audios
</a>
<a
	href={resolve('/fascicules')}
	class="block py-1.5 text-sm text-on-dusk-soft transition-colors hover:text-on-dusk"
>
	Fascicules
</a>
```

`src/routes/sitemap.xml/+server.ts` : dans `routes`, après `'/newsletter',` ajouter `'/audios',` et `'/fascicules',`.

- [ ] **Step 8: Lancer les e2e**

Run: `pnpm exec playwright test`
Expected: tout PASS, y compris « l'en-tête ne déborde pas de la fenêtre » avec la 7ᵉ entrée. Si ce test échoue à 1280 px : réduire l'écart du menu desktop de `gap-[30px]` à `gap-[24px]` dans `Header.svelte` et relancer.

- [ ] **Step 9: Contrôle visuel avec données**

Lancer `pnpm dev` avec un Strapi local contenant au moins 5 audios (dont 1 mis en avant, 1 mp4) et 3 fascicules (gratuit avec PDF, payant avec lien, payant sans lien en « inscription »). Vérifier sur `/` : 4 audios avec l'audio mis en avant en premier, « Voir tout » vers `/audios` qui en liste 5, lecteur vidéo pour le mp4, boutons des fascicules corrects, « Adhérer » qui ouvre la modale en mode inscription. Vérifier aussi en largeur mobile (375 px).

- [ ] **Step 10: Vérifier**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test:unit -- --run && pnpm build`
Expected: vert ; `pnpm build` réussit **sans `.env`**.

- [ ] **Step 11: Commit**

```bash
git add src/lib/components/catalogue src/routes/+page.server.ts src/routes/+page.svelte src/routes/audios src/routes/fascicules src/lib/config.ts src/lib/components/Footer.svelte src/routes/sitemap.xml/+server.ts e2e/catalogues.e2e.ts e2e/header.e2e.ts
git commit -m "feat(catalogues): sections Audios et Fascicules sur l'accueil, pages complètes, menu « Ressources »

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Documentation du projet et vérification finale

**Files:**

- Modify: `CLAUDE.md` (section « Architecture — points non évidents »)

- [ ] **Step 1: Paragraphe « Catalogues »**

Dans `CLAUDE.md`, après le point **Références**, ajouter :

```markdown
- **Catalogues Audios / Fascicules** : collections Strapi `audio` et `fascicule`, lues par `getAudios` / `getFascicules` (`src/lib/server/content.ts`) avec validation **élément par élément** (une entrée invalide est écartée, pas tout le catalogue) et repli sur liste vide — pas de contenu par défaut, section masquée. Accueil : `vitrine()` (case `misEnAvant` d'abord, puis les plus récents, 4 max) dans `CatalogueAccueil.svelte` ; pages complètes `/audios` et `/fascicules` (ISR 300 s). Titres des sections : composants facultatifs `audios` / `fascicules` de la page d'accueil (`sections.catalogue`). Fascicule : prix vide = gratuit (« Télécharger » le PDF) ; payant = lien externe ou formulaire de commande — **l'URL du PDF d'un fascicule payant n'est jamais relayée au navigateur**.
- **Type de demande** (`src/lib/commande/textes.ts`) : `commande | inscription`, porté par les produits de la boutique et les fascicules payants ; pilote les textes de la modale et de `/commande` (`?type=inscription`) et est enregistré avec la demande.
```

- [ ] **Step 2: Vérification complète**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test:unit -- --run && pnpm exec playwright test && pnpm build`
Expected: tout vert, build sans `.env`.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: catalogues Audios et Fascicules, type de demande

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Rappel de déploiement (ne pas exécuter sans accord)**

1. Pousser la branche du CMS, la fusionner, redéployer Railway ; dans l'admin de production, ajouter `find` sur `audio` et `fascicule` au jeton `site-web`.
2. Seulement ensuite, ouvrir la PR du site (lot 1 et lot 2 en commits distincts) et la fusionner.

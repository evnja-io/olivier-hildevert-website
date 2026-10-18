import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({ env: process.env }));

import { defaultAccueil, defaultPrestations, defaultReglages } from '$lib/content/defaults';
import {
	accueilVersStrapi,
	prestationsVersStrapi,
	reglagesVersStrapi
} from '$lib/content/seed-format';
import {
	getAudios,
	getFascicules,
	getPageAccueil,
	getPrestations,
	getReglages,
	sansMiseEnAvant,
	vitrine
} from './content';

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

	it('remet les strates dans l’ordre de leur numéro, quel que soit l’ordre renvoyé', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const { strates } = brut.approche;
		const melange = [
			strates[6],
			strates[2],
			strates[0],
			strates[5],
			strates[1],
			strates[4],
			strates[3]
		];
		const accueil = await getPageAccueil(
			reponse({ data: { ...brut, approche: { ...brut.approche, strates: melange } } })
		);
		expect(accueil.approche.strates.map((s) => s.num)).toEqual([
			'I',
			'II',
			'III',
			'IV',
			'V',
			'VI',
			'VII'
		]);
	});

	it('trie aussi les numéros arabes, et laisse en fin ceux qui ne sont pas des numéros', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const [a, b, c] = brut.approche.strates;
		const strates = [
			{ ...a, num: '10' },
			{ ...b, num: '?' },
			{ ...c, num: '2' }
		];
		const accueil = await getPageAccueil(
			reponse({ data: { ...brut, approche: { ...brut.approche, strates } } })
		);
		expect(accueil.approche.strates.map((s) => s.num)).toEqual(['2', '10', '?']);
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

describe('getPageAccueil — produits de la boutique', () => {
	const avecProduit = (produit: Record<string, unknown>) => {
		const brut = accueilVersStrapi(defaultAccueil);
		return reponse({
			data: { ...brut, boutique: { ...brut.boutique, produits: [produit] } }
		});
	};
	const base = {
		tag: 'Création',
		titre: 'Cartes',
		desc: 'Un jeu de cartes.',
		prixTexte: '25 €',
		boutonLabel: 'Commander'
	};

	it('garde typeDemande « inscription », omet « commande » et null', async () => {
		const inscription = await getPageAccueil(avecProduit({ ...base, typeDemande: 'inscription' }));
		expect(inscription.boutique.produits[0]).toEqual({ ...base, typeDemande: 'inscription' });

		for (const typeDemande of ['commande', null]) {
			const accueil = await getPageAccueil(avecProduit({ ...base, typeDemande }));
			expect(accueil.boutique.produits[0]).toEqual(base);
		}
	});

	it('rend absolues les URLs des médias et construit le srcset des formats plus petits', async () => {
		const accueil = await getPageAccueil(
			avecProduit({
				...base,
				cleImage: null,
				image: {
					url: '/uploads/cartes.jpg',
					alternativeText: 'Jeu de cartes',
					width: 1200,
					height: 1600,
					formats: {
						large: { url: '/uploads/large_cartes.jpg', width: 1000 },
						small: { url: '/uploads/small_cartes.jpg', width: 500 }
					}
				},
				document: { url: 'https://cdn.test/catalogue.pdf' },
				lien: null,
				lienInfo: 'https://www.canva.com/design/abc/view'
			})
		);
		expect(accueil.boutique.produits).toEqual([
			{
				...base,
				image: {
					src: 'http://cms.test/uploads/cartes.jpg',
					srcset:
						'http://cms.test/uploads/small_cartes.jpg 500w, http://cms.test/uploads/large_cartes.jpg 1000w, http://cms.test/uploads/cartes.jpg 1200w',
					largeur: 1200,
					hauteur: 1600,
					alt: 'Jeu de cartes'
				},
				// le document envoyé prime sur le lien saisi
				info: 'https://cdn.test/catalogue.pdf'
			}
		]);
	});

	it('lien vide → pas de lien (formulaire de commande) ; lienInfo seul → Infos', async () => {
		const accueil = await getPageAccueil(
			avecProduit({ ...base, lien: '  ', lienInfo: 'https://www.canva.com/x' })
		);
		expect(accueil.boutique.produits[0]).toEqual({ ...base, info: 'https://www.canva.com/x' });
	});

	it('refuse un lien qui n’est pas http(s) (javascript:…)', async () => {
		const accueil = await getPageAccueil(avecProduit({ ...base, lienInfo: 'javascript:alert(1)' }));
		expect(accueil).toEqual(defaultAccueil);
	});
});

describe('getPageAccueil — références', () => {
	it('prend les références par défaut quand le CMS n’a pas encore la section, sans déclasser la page', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const accueil = await getPageAccueil(
			reponse({ data: { ...brut, references: null, hero: { ...brut.hero, eyebrow: 'Modifié' } } })
		);
		expect(accueil.hero.eyebrow).toBe('Modifié');
		expect(accueil.references).toEqual(defaultAccueil.references);
	});

	it('garde une liste vide (section masquée) et mappe les logos envoyés', async () => {
		const brut = accueilVersStrapi(defaultAccueil);
		const vide = await getPageAccueil(
			reponse({ data: { ...brut, references: { ...brut.references, entreprises: [] } } })
		);
		expect(vide.references.entreprises).toEqual([]);

		const avecLogo = await getPageAccueil(
			reponse({
				data: {
					...brut,
					references: {
						...brut.references,
						entreprises: [
							{ nom: 'Groupe M6', logo: { url: '/uploads/m6.png', width: 300, height: 120 } },
							{ nom: 'Fiat France', logo: null }
						]
					}
				}
			})
		);
		expect(avecLogo.references.entreprises).toEqual([
			{
				nom: 'Groupe M6',
				logo: { src: 'http://cms.test/uploads/m6.png', largeur: 300, hauteur: 120, alt: '' }
			},
			{ nom: 'Fiat France' }
		]);
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

	it('sert le texte long par défaut quand Strapi ne le fournit pas, sans déclasser le domaine', async () => {
		const fetcher = reponse({
			data: [
				{ ...defaultPrestations[0], titre: 'Séance revue', descLongue: null },
				{ ...defaultPrestations[1], titre: 'Programmes revus', descLongue: '' },
				{ ...defaultPrestations[2], titre: 'Entreprises revues', descLongue: undefined },
				{ ...defaultPrestations[3], descLongue: '## Déroulé\n\nTexte **client**.' }
			],
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
		});
		const prestations = await getPrestations(fetcher);
		expect(prestations.map((p) => p.titre)).toEqual([
			'Séance revue',
			'Programmes revus',
			'Entreprises revues',
			defaultPrestations[3].titre
		]);
		expect(prestations.slice(0, 3).map((p) => p.descLongue)).toEqual([
			'Présentation détaillée à venir.',
			'Présentation détaillée à venir.',
			'Présentation détaillée à venir.'
		]);
		expect(prestations[3].descLongue).toBe('## Déroulé\n\nTexte **client**.');
	});

	it('ignore des infos pratiques vides ou faites d’espaces, garde les autres', async () => {
		const fetcher = reponse({
			data: [
				{ ...defaultPrestations[0], infosPratiques: '140 € · 1 h 30 · par téléphone' },
				{ ...defaultPrestations[1], infosPratiques: '   ' },
				{ ...defaultPrestations[2], infosPratiques: null },
				{ ...defaultPrestations[3], prixCarte: 'Sur devis · groupe' }
			],
			meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 4 } }
		});
		const prestations = await getPrestations(fetcher);
		expect(prestations[0].infosPratiques).toBe('140 € · 1 h 30 · par téléphone');
		expect(prestations[1].infosPratiques).toBeUndefined();
		expect(prestations[2].infosPratiques).toBeUndefined();
		// l'ancien champ prixCarte, encore présent en production, ne gêne pas et n'est pas repris
		expect(prestations[3]).not.toHaveProperty('prixCarte');
		expect(prestations[3].titre).toBe(defaultPrestations[3].titre);
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

/**
 * Contenu par défaut du site : fallback intégral quand Strapi est absent ou
 * indisponible, ET source canonique du seed du CMS. Texte extrait à
 * l'identique des composants d'origine — toute retouche éditoriale se fait
 * ici tant que Strapi n'est pas la source active.
 */
import type { PageAccueilContent, PrestationContent, ReglagesSite } from './types';

export const defaultAccueil: PageAccueilContent = {
	hero: {
		eyebrow: 'Sophrologie · Thérapie psycho énergétique et transpersonnelle',
		titreLigne1: 'Décoder le visible,',
		titreLigne2: "grâce à l'invisible",
		paragraphe:
			"Un accompagnement psycho-spirituel qui relie l'esprit et l'âme pour révéler le sens profond de ce que vous traversez, et faire lever en vous l'élan de la transformation.",
		ligneMono: 'Accompagnement non médical · Particuliers, groupes & entreprises',
		boutonPrincipal: 'Réserver une séance',
		boutonSecondaire: "Découvrir l'approche",
		stats: [
			{ valeur: 'Depuis 1992', legende: "Praticien en relation d'aide" },
			{ valeur: '+ de 10 000', legende: 'Séances animées' },
			// « 34 ans » est du texte, pas un calcul : à corriger dans le CMS en 2027.
			{ valeur: '34 ans', legende: "D'accompagnements individuels et collectifs" }
		]
	},
	approche: {
		eyebrow: "L'approche",
		titre: "Sept niveaux de lecture de l'être",
		paragraphe1:
			"Comprendre ne suffit pas. Chaque situation de vie se lit à plusieurs profondeurs de la surface du mental jusqu'au sens symbolique de l'expérience.",
		paragraphe2:
			"L'accompagnement parcourt cette échelle pour révéler ce qui se joue vraiment, et favoriser la réparation, la transformation et l'évolution.",
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
				desc: "Les équilibres subtils, vibratoires et fréquentiels de l'être.",
				profondeur: 'Subtil · vibratoire'
			},
			{
				num: 'VI',
				titre: 'Spirituel',
				desc: "La dimension de l'âme, sans dogme ni appartenance religieuse.",
				profondeur: 'Âme'
			},
			{
				num: 'VII',
				titre: 'Symbolique',
				desc: "Le langage des images, métaphores et signes de l'expérience.",
				profondeur: 'Profondeur · sens'
			}
		],
		legendeGauche: 'De la surface à la profondeur',
		legendeDroite: 'Sept portes — une même lumière'
	},
	espritAme: {
		eyebrow: 'Deux logiques, pour une même personne',
		titre: "États d'esprit & états d'âme",
		colonneEsprit: {
			tag: "États d'esprit",
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
			tag: "États d'âme",
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
		sousTitre: "Sophrologue · praticien en relation d'aide",
		paragraphe1:
			"Sophrologue social et praticien en relation d'aide depuis 1992, formé au Collège International de Sophrologie de Paris et membre professionnel de la Chambre Syndicale de la Sophrologie.",
		paragraphe2:
			"Initié aux techniques d'éveil énergétique, il met en évidence les interactions fondamentales entre les dimensions psychologique, émotionnelle, vibratoire, philosophique et spirituelle de l'être humain.",
		paragraphe3:
			"Conseiller en entreprise spécialisé en psycho-recrutement, préparateur mental des sportifs et des artistes, auteur d'audios de sophrologie, d'articles et de pièces de théâtre.",
		citation:
			'Révéler le sens des expériences dans lesquelles chacun est en quête de construction, de réparation et de transformation.',
		qualifications: [
			'Praticien depuis 1992',
			'Collège International de Sophrologie de Paris',
			'Chambre Syndicale de la Sophrologie',
			'Préparation mentale',
			'Psycho-recrutement'
		],
		legendePortrait: "Cabinet — relation d'aide"
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
		titre: "Prolonger le chemin de l'éveil",
		paragraphe:
			'Un roman thérapeutique pour se réaligner et des veilleuses énergétiques pour réharmoniser les lieux et les êtres.',
		produits: [
			{
				cleImage: 'livre',
				tag: 'Roman fantastique & thérapeutique',
				titre: "Angela, l'ange est là !",
				desc: "Un récit où le merveilleux soigne; premier roman d'Olivier Hildevert, paru chez BoD.",
				prixTexte: "Disponible à l'achat",
				boutonLabel: 'Commander',
				// URL de remplacement — à renseigner dans Strapi.
				lien: 'https://www.bod.fr/'
			},
			{
				cleImage: 'veilleuses',
				tag: 'Veilleuses thérapeutiques',
				titre: 'LUMINÂME',
				desc: "Inspirées de motifs sacrés, pour l'harmonisation vibratoire des lieux, le bien-être énergétique et les pratiques méditatives.",
				prixTexte: 'Catalogue en ligne',
				boutonLabel: 'Découvrir',
				// URL de remplacement — à renseigner dans Strapi.
				lien: 'https://olivierhildevert.com/'
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
			"Relier les *états d'esprit* et les *états d'âme*, pour révéler le sens des expériences où chacun se construit, se répare et se transforme."
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
		titre: 'Séance individuelle — décodage et solutions',
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
			"Parcours d'éveil et de transformation : éveil de conscience, réorientation de vie, développement intuitif et rééquilibrage psycho-énergétique.",
		prixCarte: 'Sur mesure',
		actionCarte: 'En savoir plus →'
	},
	{
		cle: 'entreprise',
		titre: 'Entreprises & dirigeants',
		metaReservation: 'Sur devis',
		descReservation: 'Psycho-recrutement, préparation mentale, cohésion.',
		descCarte:
			"Psycho-recrutement, analyse comportementale, préparation mentale, cohésion d'équipe et optimisation des ressources humaines.",
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
	tagline: "Décoder le visible grâce à l'invisible",
	descriptionSeo:
		"Accompagnement psycho-spirituel et psycho énergétique — décoder le visible grâce à l'invisible. Particuliers, groupes et entreprises.",
	mentionLegale:
		'Les accompagnements proposés ne relèvent pas de la médecine et ne se substituent en aucun cas à un avis, un diagnostic ou un traitement médical.',
	footerIntro:
		"Décoder le visible grâce à l'invisible. Accompagnement psycho-spirituel et psycho énergétique pour particuliers, groupes et entreprises.",
	sousTitreLogo: 'Consultant',
	siteExterne: 'olivierhildevert.com'
};

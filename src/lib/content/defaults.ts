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
		// Rédaction du client dans Strapi (2026-09-25), reprise ici comme repli.
		paragraphe:
			'Particuliers - Entreprises - CSE - Associations - Collectivités locales - Établissements de santé - Fédérations culturelles et sportives - Organisations sociales.'
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
				sousTexte: 'Séance individuelle de 1 h 30, par téléphone.',
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
		// Rédaction du client dans Strapi (2026-09-25), reprise ici comme repli.
		paragraphe:
			"Prenez rendez-vous pour une première séance, ou écrivez-moi pour m'expliquer votre besoin . C'est le bon moment. Je vous attends...",
		boutonLabel: 'Prendre rendez-vous'
	}
};

/**
 * Rédactions unifiées. En ajouter/retirer une = modification de code (clés
 * statiques dans booking/prestations.ts). `prixCarte` n'est plus affiché sur
 * les cartes (retours client du 2026-09-25) mais reste requis par le schéma
 * Strapi jusqu'à sa migration.
 */
export const defaultPrestations: PrestationContent[] = [
	{
		cle: 'individuelle',
		titre: 'Séance individuelle',
		metaReservation: '1 h 30 · 140 €',
		descReservation: 'Décodage et accompagnement d’une situation de vie.',
		descCarte:
			'Décodage et solution des situations de vie dans les domaines : physique, psychique, émotionnel, comportemental, amoureux, sexuel, traumatique, transitionnel, contractuel, matériel et préparatoires de projets.',
		prixCarte: '140 € · 1 h 30',
		actionCarte: 'Réserver'
	},
	{
		cle: 'programme',
		titre: "Programmes d'éveil",
		metaReservation: 'Sur mesure · plusieurs séances',
		descReservation: 'Parcours d’éveil, de réorientation et de transformation.',
		descCarte:
			"Parcours de rééducation et de transformation pour l'ouverture de conscience, la réappropriation de vie, le développement intuitif, la reconnexion spirituelle et le rééquilibrage psycho-énergétique.",
		prixCarte: 'Sur mesure',
		actionCarte: 'Découvrir'
	},
	{
		cle: 'entreprise',
		titre: 'Entreprises',
		metaReservation: 'Sur devis',
		descReservation: 'Psycho-recrutement, préparation mentale, cohésion.',
		descCarte:
			"Actions d'expertises et d'accompagnements personnalisés dédiés au psycho-recrutement, analyse comportementale, préparation mentale, cohésion d'équipe et optimisation des ressources et des talents. Organisation et animation de séances de Sophrologie de groupe.",
		prixCarte: 'Sur devis',
		actionCarte: 'Contacter'
	},
	{
		cle: 'stage',
		titre: 'Stages & ateliers',
		metaReservation: 'Sur devis · groupe',
		descReservation: 'Conférences et ateliers pratiques d’éveil énergétique.',
		descCarte:
			"Catalogue d'activités, séjours, conférences, rencontres dédiés aux outils de transformation psycho-énergétique et de spiritualité appliquée pour aider aux réalisations personnelles et collectives.",
		prixCarte: 'Sur devis · groupe',
		actionCarte: 'Participer'
	}
];

export const defaultReglages: ReglagesSite = {
	tagline: "Décoder le visible grâce à l'invisible",
	descriptionSeo:
		"Accompagnement psycho-spirituel et psycho énergétique — décoder le visible grâce à l'invisible. Particuliers, groupes et entreprises.",
	// Deux paragraphes séparés par un retour à la ligne (le titre est dans Footer.svelte).
	mentionLegale:
		'Les approches, techniques, conseils et informations proposés sur ce site relèvent d’un accompagnement non médical et ne constituent ni un diagnostic, ni un traitement, ni une prescription médicale. Ils ne se substituent en aucun cas à l’avis ou au suivi d’un professionnel de santé et peuvent être, éventuellement, envisagés comme complément de celui-ci.\n' +
		'En cas de problèmes de santé, de troubles psychologiques et/ou de comportements, de symptômes persistants ou de questions concernant votre état de santé, il est recommandé dans tous les cas de consulter un professionnel de santé qualifié et diplômé.',
	footerIntro:
		'Accompagnement sophrologique psycho énergétique et spirituel pour particuliers, groupes et entreprises.',
	sousTitreLogo: 'Consultant',
	siteExterne: 'olivierhildevert.com'
};

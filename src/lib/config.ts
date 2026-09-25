/**
 * Configuration centrale du site : source unique pour les balises <head>,
 * la navigation et le sitemap.
 */
export const site = {
	name: 'Olivier Hildevert',
	url: 'https://olivier-hildevert-website.vercel.app',
	tagline: "Décoder le visible grâce à l'invisible",
	description:
		"Accompagnement psycho-spirituel et psycho énergétique — décoder le visible grâce à l'invisible. Particuliers, groupes et entreprises."
} as const;

/** Ancres de la page d'accueil (hrefs construits avec resolve('/') + '#' + anchor). */
export type NavItem = { label: string; anchor: string; pill?: boolean };

export const nav: readonly NavItem[] = [
	{ label: "L'approche", anchor: 'approche' },
	{ label: 'À propos', anchor: 'apropos' },
	{ label: 'Prestations', anchor: 'prestations' },
	{ label: 'Tarifs', anchor: 'tarifs' },
	{ label: 'Contact', anchor: 'contact' },
	{ label: 'Boutique', anchor: 'boutique', pill: true }
] as const;

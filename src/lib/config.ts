/**
 * Configuration centrale du site : source unique pour les balises <head>,
 * la navigation et le sitemap.
 */
export const site = {
	name: 'Olivier Hildevert',
	url: 'https://olivier-hildevert.vercel.app',
	description: "Site vitrine et portfolio d'Olivier Hildevert."
} as const;

export const nav = [
	{ label: 'Accueil', href: '/' },
	{ label: 'Contact', href: '/contact' }
] as const;

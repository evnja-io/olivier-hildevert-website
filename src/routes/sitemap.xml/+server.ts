import { site } from '$lib/config';

export const prerender = true;

// Routes statiques du site. À terme, ajouter ici les slugs des contenus Strapi
// (ex. via fetchEntries dans une fonction async).
const routes = ['/', '/contact', '/reservation', '/newsletter'];

export function GET() {
	const urls = routes.map((path) => `\t<url><loc>${site.url}${path}</loc></url>`).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}

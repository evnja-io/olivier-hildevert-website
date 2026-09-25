import { site } from '$lib/config';
import { PRESTATION_IDS } from '$lib/booking/prestations';

export const prerender = true;

// Routes statiques du site, puis une page par prestation (clés statiques).
const routes = [
	'/',
	'/contact',
	'/reservation',
	'/newsletter',
	...PRESTATION_IDS.map((cle) => `/prestations/${cle}`)
];

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

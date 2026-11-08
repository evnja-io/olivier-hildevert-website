/**
 * Lien « À emporter ! » d'un audio : l'URL du média avec `?download=<nom>`.
 * Les médias sont servis par Strapi (autre origine) : l'attribut `download`
 * y est ignoré, c'est le middleware `global::telechargement` du CMS qui force
 * l'enregistrement sous ce nom. Un CMS qui ne le connaît pas ouvre le fichier.
 */
export function lienEmporter(fichierUrl: string, titre: string): string {
	const url = new URL(fichierUrl);
	const extension = /\.[a-z0-9]+$/i.exec(url.pathname)?.[0].toLowerCase() ?? '';
	const slug =
		titre
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'audio';
	url.searchParams.set('download', slug + extension);
	return url.toString();
}

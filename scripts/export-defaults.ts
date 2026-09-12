/**
 * Sérialise le contenu par défaut du site au format d'écriture de l'API
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

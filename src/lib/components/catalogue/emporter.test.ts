import { describe, expect, it } from 'vitest';
import { lienEmporter } from './emporter';

describe('lienEmporter', () => {
	it('ajoute un nom de fichier lisible tiré du titre, extension conservée', () => {
		expect(lienEmporter('https://cms.test/uploads/r_1a2b.mp3', "Respiration de l'aube")).toBe(
			'https://cms.test/uploads/r_1a2b.mp3?download=respiration-de-l-aube.mp3'
		);
	});

	it('s’ajoute à une query existante et retire les accents', () => {
		expect(lienEmporter('https://cdn.test/a.mp4?v=2', 'Éveil — corps')).toBe(
			'https://cdn.test/a.mp4?v=2&download=eveil-corps.mp4'
		);
	});

	it('retombe sur « audio » sans extension ni titre exploitable', () => {
		expect(lienEmporter('https://cms.test/uploads/x', '!!!')).toBe(
			'https://cms.test/uploads/x?download=audio'
		);
	});
});

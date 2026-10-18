import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CarteAudio from './CarteAudio.svelte';

const base = { titre: 'Respiration du matin', duree: '10 min' };

describe('CarteAudio', () => {
	it('utilise un lecteur audio pour un mp3, sans préchargement', async () => {
		const screen = render(CarteAudio, {
			audio: { ...base, fichier: { url: 'https://cms.test/r.mp3', mime: 'audio/mpeg' } }
		});
		const lecteur = screen.container.querySelector('audio')!;
		expect(lecteur).not.toBeNull();
		expect(lecteur.getAttribute('src')).toBe('https://cms.test/r.mp3');
		expect(lecteur.getAttribute('preload')).toBe('none');
		expect(lecteur.getAttribute('aria-label')).toBe('Écouter : Respiration du matin');
		expect(screen.container.querySelector('video')).toBeNull();
		await expect.element(screen.getByText('10 min')).toBeVisible();
	});

	it('utilise un lecteur vidéo pour un mp4', () => {
		const screen = render(CarteAudio, {
			audio: { ...base, fichier: { url: 'https://cms.test/r.mp4', mime: 'video/mp4' } }
		});
		const lecteur = screen.container.querySelector('video')!;
		expect(lecteur).not.toBeNull();
		expect(lecteur.getAttribute('preload')).toBe('none');
		expect(screen.container.querySelector('audio')).toBeNull();
	});
});

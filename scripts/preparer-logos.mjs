/**
 * Prépare les logos de la section « Références » pour qu'ils forment un ensemble
 * homogène : monochromes (teinte --color-mute), recadrés, et centrés dans un
 * cadre commun de 800×320 px à poids optique égal.
 *
 *   node scripts/preparer-logos.mjs <dossier-sortie> logo1.svg [logo2.png …]
 *
 * Chaque fichier produit porte le nom de sa source (extension .png) et s'envoie
 * tel quel dans la médiathèque Strapi — uniquement avec l'accord de l'entreprise.
 * Source idéale : le SVG officiel (dossier de presse ou Wikimedia Commons).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { chromium } from 'playwright';

const [sortie, ...sources] = process.argv.slice(2);
if (!sortie || sources.length === 0) {
	console.error('Usage : node scripts/preparer-logos.mjs <dossier-sortie> <logo.svg|png> …');
	process.exit(1);
}

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

for (const source of sources) {
	const ext = extname(source).toLowerCase();
	const data = `data:${MIME[ext] ?? 'image/png'};base64,${readFileSync(source).toString('base64')}`;

	const png = await page.evaluate(async (data) => {
		const TEINTE = [0x8a, 0x6a, 0x53]; // --color-mute
		const CADRE = { l: 800, h: 320 };
		const AIRE_CIBLE = CADRE.l * CADRE.h * 0.28;
		const DENSITE_REF = 0.35;

		const img = new Image();
		img.src = data;
		await img.decode();
		// Rendu haute définition pour que le recadrage garde des bords nets.
		const k = 2400 / (img.naturalWidth || 1000);
		const W = Math.round((img.naturalWidth || 1000) * k);
		const H = Math.round((img.naturalHeight || 400) * k);
		const toile = new OffscreenCanvas(W, H);
		const ctx = toile.getContext('2d');
		ctx.drawImage(img, 0, 0, W, H);

		const pixels = ctx.getImageData(0, 0, W, H);
		const px = pixels.data;
		const luminance = (i) => (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;

		// Deux couleurs qui se touchent (le 6 rouge sur le M gris de M6) se
		// fondraient en une seule teinte : on les sépare par un filet transparent,
		// comme dans les versions monochromes officielles.
		const encrePleine = (i) => px[i + 3] > 200 && luminance(i) < 0.9;
		const ecart = (i, j) =>
			Math.abs(px[i] - px[j]) + Math.abs(px[i + 1] - px[j + 1]) + Math.abs(px[i + 2] - px[j + 2]);
		const frontiere = new Uint8Array(W * H);
		for (let y = 0; y < H - 1; y++) {
			for (let x = 0; x < W - 1; x++) {
				const i = (y * W + x) * 4;
				for (const j of [i + 4, i + W * 4]) {
					if (encrePleine(i) && encrePleine(j) && ecart(i, j) > 120) frontiere[y * W + x] = 1;
				}
			}
		}
		const rayon = Math.round(W * 0.004);
		const dilater = (src, pas, n) => {
			const dst = new Uint8Array(src.length);
			for (let p = 0; p < src.length; p++) {
				if (!src[p]) continue;
				for (let d = -rayon; d <= rayon; d++) {
					const q = p + d * pas;
					if (q >= 0 && q < n && (pas !== 1 || Math.floor(q / W) === Math.floor(p / W))) dst[q] = 1;
				}
			}
			return dst;
		};
		const filet = dilater(dilater(frontiere, 1, W * H), W, W * H);

		// Monochrome : tout pixel coloré prend la teinte ; le blanc (contre-formes,
		// texte en réserve) devient transparent ; la rampe garde l'anticrénelage.
		let [x0, y0, x1, y1, encre] = [W, H, 0, 0, 0];
		for (let i = 0; i < px.length; i += 4) {
			const lum = luminance(i);
			const couverture = filet[i / 4] ? 0 : Math.min(1, Math.max(0, (0.96 - lum) / 0.08));
			const alpha = Math.round(px[i + 3] * couverture);
			[px[i], px[i + 1], px[i + 2], px[i + 3]] = [...TEINTE, alpha];
			encre += alpha / 255;
			if (alpha > 8) {
				const x = (i / 4) % W;
				const y = Math.floor(i / 4 / W);
				[x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
			}
		}
		ctx.putImageData(pixels, 0, 0);

		// Poids optique : surface constante, corrigée par la densité d'encre (un
		// logo plein réduit, un logo filaire grandit), bornée par le cadre.
		const [w, h] = [x1 - x0 + 1, y1 - y0 + 1];
		const ratio = w / h;
		let hauteur = Math.sqrt(AIRE_CIBLE / ratio) * Math.pow(DENSITE_REF / (encre / (w * h)), 0.3);
		let largeur = hauteur * ratio;
		const reduction = Math.min(1, (CADRE.l * 0.96) / largeur, (CADRE.h * 0.9) / hauteur);
		[largeur, hauteur] = [largeur * reduction, hauteur * reduction];

		const cadre = new OffscreenCanvas(CADRE.l, CADRE.h);
		const cctx = cadre.getContext('2d');
		cctx.imageSmoothingQuality = 'high';
		cctx.drawImage(
			toile,
			x0,
			y0,
			w,
			h,
			(CADRE.l - largeur) / 2,
			(CADRE.h - hauteur) / 2,
			largeur,
			hauteur
		);

		const octets = new Uint8Array(
			await (await cadre.convertToBlob({ type: 'image/png' })).arrayBuffer()
		);
		let binaire = '';
		for (const o of octets) binaire += String.fromCharCode(o);
		return btoa(binaire);
	}, data);

	const fichier = join(sortie, `${basename(source, extname(source))}.png`);
	writeFileSync(fichier, Buffer.from(png, 'base64'));
	console.log(fichier);
}

await navigateur.close();

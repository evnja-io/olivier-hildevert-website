/**
 * Bleuit la mer de la photo du hero sans toucher au ciel, au soleil ni au sable
 * (retours client du 2026-09-25). Mélange de canaux continu (moins de rouge,
 * un peu plus de bleu) plutôt qu'une rotation de teinte, qui virait au violet
 * sur les reflets chauds. Masque : fondu sous l'horizon × pixels non dominés
 * par le rouge × écume claire préservée.
 *
 * Usage : node docs/visuels/mer-bleue.mjs <force> <sortie.jpg> <source.jpg>
 *   force 1.2 → src/lib/assets/hero-mer.jpg (version retenue, « marquée »)
 *   force 0.7 → docs/visuels/hero-mer-douce.jpg (variante gardée en réserve)
 * Source : la photo d'origine, à récupérer dans l'historique git
 * (git show 2964978:src/lib/assets/hero-mer.jpg > hero-mer-origine.jpg).
 */
import sharp from 'sharp';
const [, , force, sortie] = process.argv;
const k = Number(force);
const { data, info } = await sharp(process.argv[4]).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const horizon = 0.378 * H,
	fondu = 0.07 * H;
const sm = (e0, e1, x) => {
	const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
	return t * t * (3 - 2 * t);
};
for (let y = 0; y < H; y++) {
	const wy = sm(horizon, horizon + fondu, y);
	if (!wy) continue;
	for (let x = 0; x < W; x++) {
		const i = (y * W + x) * C,
			r = data[i],
			g = data[i + 1],
			b = data[i + 2];
		// sable et reflets du soleil (rouge très dominant) exclus en fondu ; écume claire préservée
		const lum = (r + g + b) / 765;
		const w = k * wy * (1 - sm(15, 75, r - b)) * (1 - 0.6 * sm(0.7, 0.92, lum));
		if (!w) continue;
		data[i] = r * (1 - 0.3 * w);
		data[i + 1] = g * (1 - 0.1 * w);
		data[i + 2] = Math.min(255, b * (1 + 0.1 * w));
	}
}
await sharp(data, { raw: info }).jpeg({ quality: 95, mozjpeg: true }).toFile(sortie);

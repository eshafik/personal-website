// Colour-grades the source portrait into the site palette (sage duotone) and exports web sizes.
// Usage: npm run portrait   (source: assets-src/MSI_SHAFIK_HD.png)
import sharp from 'sharp';

const SRC = 'assets-src/MSI_SHAFIK_HD.png';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// Gradient map from the site palette: background -> surface -> secondary text -> primary text.
const stops = [[0, hex('#0e1110')], [0.35, hex('#26302b')], [0.7, hex('#8fa597')], [1, hex('#eef2ee')]];
const map = (t) => {
  for (let i = 1; i < stops.length; i++)
    if (t <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i], k = (t - a) / (b - a);
      return ca.map((c, j) => Math.round(c + (cb[j] - c) * k));
    }
  return stops.at(-1)[1];
};

const { data, info } = await sharp(SRC).extract({ left: 210, top: 60, width: 860, height: 860 }) /* face-centred crop of the 1254² source */.resize(800, 800).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 3);
for (let p = 0; p < data.length; p += 3) {
  let l = (0.26 * data[p] + 0.6 * data[p + 1] + 0.14 * data[p + 2]) / 255;
  l = Math.pow(Math.min(1, Math.max(0, (l - 0.02) * 1.12)), 0.92); // mild contrast, lifted shadows
  out.set(map(0.03 + l * 0.85), p); // never pure black or white
}
const graded = sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } }).sharpen({ sigma: 0.6 });
await graded.clone().resize(400).webp({ quality: 82 }).toFile('public/media/portrait-400.webp');
await graded.clone().resize(640).jpeg({ quality: 82, mozjpeg: true }).toFile('public/media/portrait-og.jpg');
console.log('wrote public/media/portrait-400.webp, public/media/portrait-og.jpg');

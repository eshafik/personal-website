// Renders scripts/og-card.html to public/og-card.jpg (1200×630 social share image).
// Usage: npm run og   — uses your installed Google Chrome via playwright-core.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL('scripts/og-card.html').href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og-card.jpg');
console.log('wrote public/og-card.jpg');

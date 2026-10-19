// Full-page pictures of each theme's demo (/themes/<slug>) for the theme
// picker on the create-event form (app/ui/theme-picker.tsx), saved as
// public/images/theme-pages/<slug>.webp, 520px wide. Re-run after changing
// a theme's look or adding a theme:
//
//   npm run dev                       # the site on http://localhost:3000
//   npm i --no-save playwright-core && npx playwright install chromium
//   node scripts/theme-page-shots.mjs [http://localhost:3000] [slug ...]
//
// Reduced motion shows every scroll-in section at once; the preview's top
// bar is removed, and any blank strip it leaves at the top cut off.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const [base = 'http://localhost:3000', ...only] = process.argv.slice(2);
const cards = readFileSync(new URL('../app/lib/marketing/theme-cards.ts', import.meta.url), 'utf8');
const slugs = only.length ? only : [...cards.matchAll(/\{ slug: '([a-z0-9-]+)'/g)].map((m) => m[1]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
for (const slug of slugs) {
  await page.goto(`${base}/themes/${slug}`, { waitUntil: 'networkidle', timeout: 180000 });
  // Scroll through once so lazy images load.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await page.evaluate(() => document.querySelector('.mg-topbar-actions')?.parentElement?.remove());
  await page.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;transition:none!important} nextjs-portal{display:none!important}' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const png = await page.screenshot({ fullPage: true });
  const out = `public/images/theme-pages/${slug}.webp`;
  const small = await sharp(png, { limitInputPixels: false }).resize({ width: 520 }).raw().toBuffer({ resolveWithObject: true });
  // A blank strip left at the top by the removed bar (Summit) is cut off.
  const { data, info } = small;
  let top = 0;
  const blank = (y) => { for (let x = 0; x < info.width; x += 7) { const i = (y * info.width + x) * info.channels; if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false; } return true; };
  while (top < 200 && blank(top)) top++;
  await sharp(data, { raw: info }).extract({ left: 0, top, width: info.width, height: info.height - top }).webp({ quality: 70, effort: 6 }).toFile(out);
  console.log(out);
}
await browser.close();

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { themeRegistry } from '@/app/ui/themes/registry';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { absoluteUrl, pageMetadata } from '@/app/lib/marketing/seo';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';

// Showcase preview of a theme, rendered from the real theme component with
// sample content (see demo-content.ts).
// Search results show ~155 characters of a description; cut at a word.
function clip(text: string, max = 155): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[,—–\s]+$/, '') + '…';
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = themeRegistry[slug];
  if (!theme || !THEME_DEMOS[slug]) return { title: 'Theme preview' };
  const card = THEME_CARDS.find((c) => c.slug === slug);
  const meta = pageMetadata(
    `${theme.label} Theme — Event Website Template`,
    clip(card ? `Live preview of the ${theme.label} event website theme. ${card.desc}` : `Live preview of the ${theme.label} event website theme on MyGala.`),
    `/themes/${slug}`,
  );
  // Shared links show the theme's own banner photo, when it has one.
  const hero = (HERO_DEFAULTS as Record<string, string>)[slug];
  if (!hero || !/\.(jpe?g|png|webp)$/i.test(hero)) return meta;
  const image = { url: absoluteUrl(hero), alt: `${theme.label} event website theme` };
  return { ...meta, openGraph: { ...meta.openGraph, images: [image] }, twitter: { ...meta.twitter, images: [image.url] } };
}

export default async function ThemePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = THEME_DEMOS[slug];
  if (!demo || !themeRegistry[slug]) notFound();
  const session = await auth();
  return <ThemeRenderer themeSlug={slug} {...demo} demo isLoggedIn={!!session?.user} />;
}

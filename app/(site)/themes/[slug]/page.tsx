import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { themeRegistry } from '@/app/ui/themes/registry';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { pageMetadata } from '@/app/lib/marketing/seo';

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
  return pageMetadata(
    `${theme.label} Theme — Event Website Template`,
    clip(card ? `Live preview of the ${theme.label} event website theme. ${card.desc}` : `Live preview of the ${theme.label} event website theme on MyGala.`),
    `/themes/${slug}`,
  );
}

export default async function ThemePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = THEME_DEMOS[slug];
  if (!demo || !themeRegistry[slug]) notFound();
  const session = await auth();
  return <ThemeRenderer themeSlug={slug} {...demo} demo isLoggedIn={!!session?.user} />;
}

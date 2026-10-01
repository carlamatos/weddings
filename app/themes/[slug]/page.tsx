import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { themeRegistry } from '@/app/ui/themes/registry';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';

// Showcase preview of a theme, rendered from the real theme component with
// sample content (see demo-content.ts).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const theme = themeRegistry[slug];
  return { title: theme && THEME_DEMOS[slug] ? `${theme.label} — MyGala theme preview` : 'Theme preview' };
}

export default async function ThemePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = THEME_DEMOS[slug];
  if (!demo || !themeRegistry[slug]) notFound();
  const session = await auth();
  return <ThemeRenderer themeSlug={slug} {...demo} demo isLoggedIn={!!session?.user} />;
}

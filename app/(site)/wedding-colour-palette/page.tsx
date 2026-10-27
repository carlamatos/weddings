import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/app/lib/marketing/blog';
import { ArticlePage, articlePageMetadata } from '@/app/ui/marketing/article-page';

// The wedding colour palette guide and generator (its content: app/lib/marketing/blog.ts).
const post = BLOG_POSTS.find((p) => p.path === '/wedding-colour-palette')!;

export const metadata: Metadata = articlePageMetadata(post);

export default function WeddingColourPalette() {
  return <ArticlePage post={post} />;
}

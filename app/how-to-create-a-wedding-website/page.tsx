import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/app/lib/marketing/blog';
import { ArticlePage, articlePageMetadata } from '@/app/ui/marketing/article-page';

// The step-by-step wedding website guide (its content: app/lib/marketing/blog.ts).
const post = BLOG_POSTS.find((p) => p.path === '/how-to-create-a-wedding-website')!;

export const metadata: Metadata = articlePageMetadata(post);

export default function HowToCreateAWeddingWebsite() {
  return <ArticlePage post={post} />;
}

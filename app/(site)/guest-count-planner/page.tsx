import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/app/lib/marketing/blog';
import { ArticlePage, articlePageMetadata } from '@/app/ui/marketing/article-page';

// The free guest count planner and its guide (its content: app/lib/marketing/blog.ts).
const post = BLOG_POSTS.find((p) => p.path === '/guest-count-planner')!;

export const metadata: Metadata = articlePageMetadata(post);

export default function GuestCountPlanner() {
  return <ArticlePage post={post} />;
}

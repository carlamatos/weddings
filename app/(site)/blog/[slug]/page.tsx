import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BLOG_POSTS, getBlogPost } from '@/app/lib/marketing/blog';
import { ArticlePage, articlePageMetadata } from '@/app/ui/marketing/article-page';

export const dynamicParams = false;

// Guides with their own path aren't served here.
export function generateStaticParams() {
  return BLOG_POSTS.filter((p) => !p.path).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  return post ? articlePageMetadata(post) : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  return <ArticlePage post={post} />;
}

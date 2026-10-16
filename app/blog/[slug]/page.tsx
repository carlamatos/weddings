import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { appHref } from '@/app/lib/app-url';
import { BLOG_POSTS, formatPostDate, getBlogPost } from '@/app/lib/marketing/blog';
import { articleMetadata, blogPostingJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/app/lib/marketing/seo';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FeatureCards, FinalCta } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { JsonLd } from '@/app/ui/marketing/json-ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  return post ? articleMetadata(post.seo, `/blog/${post.slug}`, post.published) : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.eyebrow, path },
  ];

  return (
    <MarketingShell>
      <JsonLd data={blogPostingJsonLd(post.seo, post.title, path, post.published)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqPageJsonLd(post.faqs)} />

      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">{post.eyebrow}</p>
          <h1 className="mk-h1">{post.title}</h1>
          <p className="mk-lead">{post.lead}</p>
          <p className="mk-post-meta">
            <time dateTime={post.published}>{formatPostDate(post.published)}</time> · {post.readMinutes} min read
          </p>
        </div>
      </header>

      <div className="wrap">
        <article className="mk-body">
          {post.sections.map((s) => (
            <section className="mk-block" key={s.heading}>
              <h2 className="mk-h2">{s.heading}</h2>
              {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {s.bullets && (
                <ul className={s.checklist ? 'mk-checklist' : 'mk-list'}>
                  {s.bullets.map((li) => <li key={li}>{li}</li>)}
                </ul>
              )}
            </section>
          ))}

          <section className="mk-block" id="faq">
            <h2 className="mk-h2">Frequently asked questions</h2>
            <FaqList faqs={post.faqs} />
            <p className="mk-note">
              Ready to share the details? <Link href="/events/weddings">See how MyGala works for weddings</Link> or{' '}
              <Link href={appHref('/register')}>create your free wedding website</Link>.
            </p>
          </section>
        </article>

        <section className="mk-related">
          <h2 className="mk-h2">Tools that help with your checklist</h2>
          <FeatureCards slugs={post.related} />
        </section>
      </div>

      <FinalCta title={post.cta.title} text={post.cta.text} />
    </MarketingShell>
  );
}

import type { Metadata } from 'next';
import { formatPostDate, postPath, type BlogPost } from '@/app/lib/marketing/blog';
import { articleMetadata, blogPostingJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/app/lib/marketing/seo';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FeatureCards, FinalCta } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { ArticleSections } from '@/app/ui/marketing/article-blocks';

// A blog article or guide (app/lib/marketing/blog.ts), at /blog/[slug] or at
// its own path.

export function articlePageMetadata(post: BlogPost): Metadata {
  return articleMetadata(post.seo, postPath(post), post.published, { src: post.cardImage, alt: post.title });
}

export function ArticlePage({ post }: { post: BlogPost }) {
  const path = postPath(post);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.eyebrow, path },
  ];

  return (
    <MarketingShell>
      <JsonLd data={blogPostingJsonLd(post.seo, post.title, path, post.published, post.cardImage)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {post.faqs && <JsonLd data={faqPageJsonLd(post.faqs)} />}

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
          <ArticleSections sections={post.sections} />

          {post.faqs && (
            <section className="mk-block" id="faq">
              <h2 className="mk-h2">Frequently asked questions</h2>
              <FaqList faqs={post.faqs} />
            </section>
          )}
        </article>

        <section className="mk-related">
          <h2 className="mk-h2">MyGala features that help</h2>
          <FeatureCards slugs={post.related} />
        </section>
      </div>

      <FinalCta title={post.cta.title} text={post.cta.text} />
    </MarketingShell>
  );
}

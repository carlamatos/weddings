import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { appHref } from '@/app/lib/app-url';
import type { ArticleBlock, ArticleSection } from '@/app/lib/marketing/blog';
import { startQuery } from '@/app/lib/start-intent';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { previewImage } from '@/app/ui/themes/preview-image';
import PaletteTool from './palette-tool';
import { ThemeGrid } from './theme-grid';
import { ZoomableScreenshot } from './zoomable-screenshot';

// Renders the article markup described in app/lib/marketing/blog.ts:
// [link text](/path) and **bold**.
function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      // Links can hold bold text, e.g. **[Invitations](/features/invitations)**.
      parts.push(<Link key={m.index} href={m[2]}>{m[1]}</Link>);
    } else {
      parts.push(<strong key={m.index}><Rich text={m[3]} /></strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'p':
      return <p><Rich text={block.text} /></p>;
    case 'h3':
      return <h3 className="mk-h3">{block.text}</h3>;
    case 'list':
    case 'checklist':
      return (
        <ul className={block.type === 'checklist' ? 'mk-checklist' : 'mk-list'}>
          {block.items.map((li) => <li key={li}><Rich text={li} /></li>)}
        </ul>
      );
    case 'note':
      return <p className="mk-note"><Rich text={block.text} /></p>;
    case 'image':
      return (
        <figure className="mk-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...previewImage(block.src, '(max-width: 820px) 100vw, 780px')} alt={block.alt} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case 'screenshot':
      return (
        <div className={block.narrow ? 'mk-article-shot mk-article-shot--narrow' : 'mk-article-shot'}>
          <ZoomableScreenshot shot={block} />
        </div>
      );
    case 'try':
      return (
        <p className="mk-try">
          <Link href={appHref('/register') + startQuery('website', undefined, block.occasion)} data-cta="guide-try">
            Try it free <span aria-hidden="true">→</span>
          </Link>
          <span>{block.text}</span>
        </p>
      );
    case 'templates': {
      const themes = block.slugs.map((s) => THEME_CARDS.find((t) => t.slug === s)).filter((t) => t !== undefined);
      return <div className="mk-article-templates"><ThemeGrid themes={themes} columns={2} /></div>;
    }
    case 'palette-tool':
      return <PaletteTool />;
    case 'cta':
      return (
        <div className="mk-article-cta">
          <p className="mk-article-cta-title">{block.title}</p>
          <p>{block.text}</p>
          <Link href={appHref('/register')} className="btn-primary" data-cta="blog">{block.button}</Link>
        </div>
      );
  }
}

export function ArticleSections({ sections }: { sections: ArticleSection[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <section className="mk-block" id={s.id} key={s.heading ?? i}>
          {s.heading && <h2 className="mk-h2">{s.heading}</h2>}
          {s.blocks.map((b, j) => <Block key={j} block={b} />)}
        </section>
      ))}
    </>
  );
}

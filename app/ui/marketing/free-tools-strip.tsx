import Link from 'next/link';
import { FREE_TOOLS } from '@/app/lib/marketing/blog';

// A small row of the free planning tools (/tools): on the homepage, the
// Weddings page and the wedding website landing page.
export function FreeToolsStrip({ eyebrow = 'Free planning tools', title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <section className="ft-strip" aria-labelledby="free-tools-heading">
      <p className="eyebrow ft-strip-eyebrow">{eyebrow}</p>
      <h2 className="ft-strip-title" id="free-tools-heading">{title}</h2>
      {sub && <p className="ft-strip-sub">{sub}</p>}
      <ul className="ft-strip-list">
        {FREE_TOOLS.map((t) => (
          <li key={t.path}>
            <Link href={t.path} className="ft-strip-card">
              <strong>{t.name}</strong>
              <span>{t.text}</span>
              <em>Try it free →</em>
            </Link>
          </li>
        ))}
      </ul>
      <p className="ft-strip-more"><Link href="/tools">All free tools</Link> · no sign-up needed</p>
    </section>
  );
}

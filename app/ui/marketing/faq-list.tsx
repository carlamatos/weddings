import type { Faq } from '@/app/lib/marketing/types';
import { Rich } from './rich';

// Visible FAQ list. Pair it with faqPageJsonLd(faqs) on the same page — the
// schema must match what's shown. The first "Live Party" in an answer links
// to the Live Party page (liveParty: its path, or false on that page).
export function FaqList({ faqs, liveParty }: { faqs: Faq[]; liveParty?: string | false }) {
  return (
    <div>
      {faqs.map((f) => (
        <div className="faq-item" key={f.q}>
          <h3 className="faq-q">{f.q}</h3>
          <p className="faq-a"><Rich text={f.a} liveParty={liveParty} /></p>
        </div>
      ))}
    </div>
  );
}

import type { Faq } from '@/app/lib/marketing/types';

// Visible FAQ list. Pair it with faqPageJsonLd(faqs) on the same page — the
// schema must match what's shown.
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div>
      {faqs.map((f) => (
        <div className="faq-item" key={f.q}>
          <h3 className="faq-q">{f.q}</h3>
          <p className="faq-a">{f.a}</p>
        </div>
      ))}
    </div>
  );
}

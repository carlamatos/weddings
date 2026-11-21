import Link from 'next/link';
import { newsletterConsentText, type ConsentLang } from '@/app/lib/newsletter-consent';

// The unticked newsletter checkbox on the sign-up forms, with the CASL
// details under it (app/lib/newsletter-consent.ts). newsletter_lang tells the
// server which wording was shown, to keep as the consent record.
export default function NewsletterConsent({ lang = 'en' }: { lang?: ConsentLang }) {
  const t = newsletterConsentText(lang);
  return (
    <div className="auth-consent-wrap">
      <label className="auth-consent">
        <input type="checkbox" name="newsletter" value="1" defaultChecked={false} aria-describedby="newsletter-consent-fine" />
        <span>{t.label}</span>
      </label>
      <input type="hidden" name="newsletter_lang" value={lang} />
      <p className="auth-consent-fine" id="newsletter-consent-fine">
        {t.fine} <Link href="/privacy" target="_blank">{t.privacy}</Link>
      </p>
    </div>
  );
}

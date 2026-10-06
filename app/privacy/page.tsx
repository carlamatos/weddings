import LegalLayout from '@/app/ui/legal-layout';
import Link from 'next/link';
import CompanyDetails from '@/app/ui/marketing/company-details';
import { COMPANY } from '@/app/lib/company';
import { pageMetadata } from '@/app/lib/marketing/seo';

export const metadata = pageMetadata('Privacy Policy', `How ${COMPANY.legalName} (MyGala) collects, uses, and protects personal information, in compliance with PIPEDA and PIPA.`, '/privacy');

const EFFECTIVE_DATE = 'October 4, 2026';
const CONTACT_EMAIL = COMPANY.email;
const link = { color: 'var(--rose)' };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">

      <p style={meta}>Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Applies to: {COMPANY.website} and all MyGala services</p>

      <p>
        <strong>{COMPANY.legalName}</strong> (&ldquo;MyGala,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains what personal information we collect, why we collect it, how we use it, and what rights you have over it. It is written to comply with Canada&apos;s <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) and, where applicable, British Columbia&apos;s and Alberta&apos;s <em>Personal Information Protection Act</em> (PIPA).
      </p>
      <p style={{ background: '#EAF2EC', border: '1px solid #B2D4B8', borderRadius: 10, padding: '14px 18px', fontWeight: 500, color: '#3D6B46' }}>
        We will never sell, rent, trade, or share your personal information with third parties for advertising or marketing purposes — ever.
      </p>

      <h2 style={h2}>1. Who we are and who is accountable</h2>
      <p>
        MyGala is a web application owned and operated by <strong>{COMPANY.legalName}</strong>, a Canadian corporation. It lets people create websites for their events — weddings, celebrations, business and community events — and manage their guests.
      </p>
      <p>
        {COMPANY.legalName} is responsible for the personal information under its control and has designated a <strong>{COMPANY.privacyOfficer}</strong> who is accountable for our compliance with this policy. You can reach our {COMPANY.privacyOfficer} at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a> or at the address in <a href="#contact" style={link}>section 12</a>.
      </p>

      <h2 style={h2}>2. What information we collect</h2>

      <h3 style={h3}>2.1 Account information</h3>
      <p>
        When you create an account, we collect your <strong>name</strong> and <strong>email address</strong>, and a password if you sign up with email (stored only as a one-way hash). If you sign in with Google or Facebook, we receive your name and email address from that provider; we never receive your password for those services. If you turn on two-factor authentication, we store the secret needed to check your codes.
      </p>

      <h3 style={h3}>2.2 Event page content</h3>
      <p>
        Information you add to your event page — names, event date and time, location, your description and schedule, photos, contact email and phone, registry and livestream links, and any other sections — is stored on our servers and displayed publicly at your page address, unless you protect the page with a password.
      </p>

      <h3 style={h3}>2.3 Guest information</h3>
      <p>
        We store information about the guests of each event on behalf of the event&rsquo;s host:
      </p>
      <ul style={ul}>
        <li><strong>Information guests submit</strong> on an event page — for example their name, email, phone, attendance, party size, notes, potluck entries, gift exchange sign-ups and gift ideas, song requests and photos.</li>
        <li><strong>Guest lists that hosts add</strong> — names, emails, phone numbers, party sizes and personal notes the host enters by hand or imports from a spreadsheet or their contacts.</li>
        <li><strong>Invitation and reminder history</strong> — when an invitation or reminder was emailed or texted, and whether a guest has unsubscribed.</li>
        <li><strong>Gift exchange draws</strong> — who each participant gives a gift to, kept private: each participant only sees their own match, through a private link.</li>
      </ul>
      <p>
        Guest information is visible to the event&rsquo;s host in their dashboard. Hosts are responsible for having the right to add and contact the people on their guest list. If you are a guest and want your information removed, you can ask the host or contact us.
      </p>

      <h3 style={h3}>2.4 Payment information</h3>
      <p>
        If you buy MyGala Plus, payment is processed by <strong>Stripe</strong>. We never see or store your full card details. Stripe tells us whether the payment succeeded and gives us a customer reference and the email used at checkout. Stripe&apos;s privacy practices are governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>stripe.com/privacy</a>.
      </p>

      <h3 style={h3}>2.5 Usage data and analytics</h3>
      <p>
        We use <strong>Google Analytics</strong> to understand how visitors use the website (pages viewed, session duration, general location by region). This data is aggregated and is not used to identify you. You can opt out using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={link}>Google Analytics opt-out browser add-on</a>. Our servers also keep short-lived technical logs (such as IP addresses) to keep the service secure and to limit abuse.
      </p>

      <h3 style={h3}>2.6 Cookies and local storage</h3>
      <p>
        We use cookies to keep you signed in, to remember that a guest entered an event page&rsquo;s password (for up to 30 days), and, while parts of the site are in preview, to let invited visitors past the preview password. No advertising cookies are used.
      </p>

      <h2 style={h2}>3. How we use your information</h2>
      <ul style={ul}>
        <li><strong>To provide the service</strong> — display event pages, process RSVPs and other guest submissions, manage guest lists, and manage your account.</li>
        <li><strong>To send emails you or your host asked for</strong> — account emails (such as email verification and password resets), and the invitations and reminders a host sends to their guests through MyGala.</li>
        <li><strong>To keep the service safe</strong> — check uploaded photos for explicit or violent content before they are published, block spam and abuse on guest forms, and secure accounts.</li>
        <li><strong>To process payments</strong> — confirm Plus purchases with Stripe.</li>
        <li><strong>To improve MyGala</strong> — aggregated analytics help us understand which features matter most.</li>
        <li><strong>To comply with legal obligations</strong> — where required by Canadian law.</li>
      </ul>
      <p>We do not send marketing emails without your consent, and we do not use your personal information for automated decision-making or profiling.</p>

      <h2 style={h2}>4. Service providers</h2>
      <p>We use the following service providers to run MyGala. They process personal information only on our instructions, and each has its own privacy policy:</p>
      <ul style={ul}>
        <li><strong>Vercel</strong> — hosting, and storage of uploaded photos and files (vercel.com/legal/privacy-policy)</li>
        <li><strong>Neon</strong> — PostgreSQL database hosting (neon.tech/privacy-policy)</li>
        <li><strong>Stripe</strong> — payment processing (stripe.com/privacy)</li>
        <li><strong>Resend</strong> — sending emails such as invitations, reminders and account emails (resend.com/legal/privacy-policy)</li>
        <li><strong>Google Cloud Vision</strong> — automatic safety check of uploaded photos (cloud.google.com/terms/cloud-privacy-notice)</li>
        <li><strong>Cloudflare Turnstile</strong> — spam protection on guest forms (cloudflare.com/privacypolicy)</li>
        <li><strong>Google Sign-In</strong> and <strong>Facebook Login</strong> — optional sign-in methods (policies.google.com/privacy, facebook.com/privacy/policy)</li>
        <li><strong>Google Analytics</strong> — aggregated usage analytics (policies.google.com/privacy)</li>
        <li><strong>Google Maps</strong> — address search and venue maps</li>
      </ul>
      <p>
        We do not share your personal information with any other third parties and we do not sell it under any circumstances.
      </p>

      <h2 style={h2}>5. Where your information is stored</h2>
      <p>
        Some of our service providers store or process information outside Canada, including in the United States. While it is there, it is protected by our agreements with those providers, but it may be accessible to courts, law enforcement and national security authorities of that country under its laws.
      </p>

      <h2 style={h2}>6. Data retention and deletion</h2>
      <p>
        We retain your personal information for as long as your account is active and for a reasonable period after, to allow account recovery. Specifically:
      </p>
      <ul style={ul}>
        <li><strong>Active accounts:</strong> Data is retained for the duration of your use of the service.</li>
        <li><strong>Inactive accounts:</strong> If your account shows no activity for <strong>24 consecutive months</strong>, we will delete your account and all associated data permanently.</li>
        <li><strong>Deleted accounts / data removal requests:</strong> When you request deletion, we will permanently remove your personal information within <strong>30 days</strong>. Anonymised, aggregated analytics data (which cannot identify you) may be retained longer.</li>
        <li><strong>Guest information:</strong> Kept as long as the event page it belongs to exists. When a host deletes a page or their account, its guest information is deleted as well. Hosts can also remove individual guests at any time.</li>
        <li><strong>Payment records:</strong> Records of Plus purchases may be kept for as long as Canadian tax and accounting laws require.</li>
      </ul>
      <p>
        To request deletion of your data at any time, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a>. We will confirm receipt within 5 business days and complete the deletion within 30 days.
      </p>

      <h2 style={h2}>7. Your rights under PIPEDA and PIPA</h2>
      <p>As an individual whose personal information we hold, you have the right to:</p>
      <ul style={ul}>
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
        <li><strong>Correction:</strong> Ask us to correct inaccurate or incomplete information.</li>
        <li><strong>Withdrawal of consent:</strong> Withdraw consent to our collection or use of your information, subject to legal or contractual restrictions. Withdrawing consent may mean you can no longer use some or all of our services. Every invitation and reminder email includes an unsubscribe link.</li>
        <li><strong>Deletion:</strong> Request that we delete your personal information (subject to any legal obligations to retain it).</li>
        <li><strong>Complaint:</strong> Lodge a complaint with the <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" style={link}>Office of the Privacy Commissioner of Canada</a> (or, where applicable, your provincial privacy commissioner) if you believe we have not handled your information appropriately.</li>
      </ul>
      <p>
        To exercise any of these rights, contact our {COMPANY.privacyOfficer} at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={h2}>8. Security</h2>
      <p>
        We use industry-standard security measures, including HTTPS encryption in transit, encrypted database storage, hashed passwords, optional two-factor authentication, and access controls limited to authorised personnel. No system is completely secure; if you believe your account has been compromised, contact us immediately.
      </p>

      <h2 style={h2}>9. Children&apos;s privacy</h2>
      <p>
        MyGala is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If you believe we have inadvertently done so, please contact us and we will delete the information promptly.
      </p>

      <h2 style={h2}>10. Public content</h2>
      <p>
        Event pages (names, event details, photos, and guest forms) are <strong>publicly accessible</strong> by default at their page address. Plus pages can be protected with a password. Do not include information on a public page that you wish to keep private. Guest RSVPs and guest lists are visible only to the host, in their dashboard — unless the host chooses to show certain entries on the page (for example, a potluck list showing first names and last initials).
      </p>

      <h2 style={h2}>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will notify registered users of material changes by email. The effective date at the top of this page always shows when it was last updated. Continued use of the service after a change constitutes acceptance of the updated policy.
      </p>

      <h2 id="contact" style={h2}>12. Contact</h2>
      <p>Questions, concerns, or requests about this privacy policy or your personal information should be directed to:</p>
      <CompanyDetails attention={`${COMPANY.privacyOfficer}`} />

      <p style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-soft)' }}>
        See also: <Link href="/terms" style={link}>Terms of Service</Link> &nbsp;·&nbsp; <Link href="/company" style={link}>Company Information</Link> &nbsp;·&nbsp; <Link href="/about" style={link}>About MyGala</Link>
      </p>

    </LegalLayout>
  );
}

const h2: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 700,
  color: '#241F2B',
  margin: '44px 0 12px',
};

const h3: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#241F2B',
  margin: '28px 0 8px',
};

const ul: React.CSSProperties = {
  paddingLeft: 22,
  margin: '0 0 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const meta: React.CSSProperties = {
  fontSize: 13,
  color: '#6B6470',
  marginBottom: 24,
};

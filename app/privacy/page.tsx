import LegalLayout from '@/app/ui/legal-layout';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — MyGala',
  description: 'How MyGala collects, uses, and protects your personal information, in compliance with PIPEDA and PIPA.',
};

const EFFECTIVE_DATE = 'June 26, 2026';
const CONTACT_EMAIL = 'info@mygala.ca';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">

      <p style={meta}>Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Applies to: mygala.ca and all MyGala services</p>

      <p>
        MyGala (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains what personal information we collect, why we collect it, how we use it, and what rights you have over it. It is written to comply with Canada&apos;s <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) and, where applicable, British Columbia&apos;s and Alberta&apos;s <em>Personal Information Protection Act</em> (PIPA).
      </p>
      <p style={{ background: '#EAF2EC', border: '1px solid #B2D4B8', borderRadius: 10, padding: '14px 18px', fontWeight: 500, color: '#3D6B46' }}>
        We will never sell, rent, trade, or share your personal information with third parties for advertising or marketing purposes — ever.
      </p>

      <h2 style={h2}>1. Who we are</h2>
      <p>
        MyGala is a web application operated in Canada. Our primary service allows couples to create personalised wedding websites. You can reach our privacy contact at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={h2}>2. What information we collect</h2>

      <h3 style={h3}>2.1 Account information</h3>
      <p>
        When you create an account using Google, Apple, or Facebook Sign-In, we receive your <strong>name</strong> and <strong>email address</strong> from that provider. We do not receive or store your passwords for those services.
      </p>

      <h3 style={h3}>2.2 Wedding page content</h3>
      <p>
        Information you add to your wedding page — couple names, event date, location, your story, photos, registry links, and livestream URLs — is stored on our servers and displayed publicly on your page URL.
      </p>

      <h3 style={h3}>2.3 Guest RSVPs</h3>
      <p>
        When guests RSVP through your wedding page, we collect the information they submit (typically name, attendance status, dietary notes, and plus-one details). This information is visible to the page owner in their dashboard.
      </p>

      <h3 style={h3}>2.4 Payment information</h3>
      <p>
        If you subscribe to the Plus plan, payments are processed by <strong>Stripe</strong>. We never see or store your full credit card details. Stripe provides us with a customer token and subscription status only. Stripe&apos;s privacy practices are governed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rose)' }}>stripe.com/privacy</a>.
      </p>

      <h3 style={h3}>2.5 Usage data and analytics</h3>
      <p>
        We use <strong>Google Analytics</strong> to understand how visitors interact with the platform (pages viewed, session duration, general location by region). This data is aggregated and does not identify you personally. You can opt out using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rose)' }}>Google Analytics opt-out browser add-on</a>.
      </p>

      <h3 style={h3}>2.6 Cookies and local storage</h3>
      <p>
        We use session cookies for authentication. No third-party advertising cookies are used. A &ldquo;site bypass&rdquo; cookie may be set if you access a page protected by a construction-mode password.
      </p>

      <h2 style={h2}>3. How we use your information</h2>
      <ul style={ul}>
        <li><strong>To provide and maintain the service</strong> — display your wedding page, process RSVPs, and manage your account.</li>
        <li><strong>To process payments</strong> — verify subscription status with Stripe and send receipts.</li>
        <li><strong>To improve MyGala</strong> — aggregate analytics help us understand what features matter most.</li>
        <li><strong>To communicate with you</strong> — transactional emails such as account confirmation or payment receipts. We do not send marketing emails without your explicit consent.</li>
        <li><strong>To comply with legal obligations</strong> — where required by Canadian law.</li>
      </ul>
      <p>We do not use your personal information for automated decision-making or profiling.</p>

      <h2 style={h2}>4. Third-party services</h2>
      <p>We use the following sub-processors. Each has its own privacy policy:</p>
      <ul style={ul}>
        <li><strong>Vercel</strong> — hosting and edge delivery (vercel.com/legal/privacy-policy)</li>
        <li><strong>Neon / PostgreSQL</strong> — database storage</li>
        <li><strong>Stripe</strong> — payment processing (stripe.com/privacy)</li>
        <li><strong>Google OAuth</strong> — optional sign-in method (policies.google.com/privacy)</li>
        <li><strong>Apple Sign In</strong> — optional sign-in method (apple.com/legal/privacy)</li>
        <li><strong>Facebook Login</strong> — optional sign-in method (facebook.com/privacy/explanation)</li>
        <li><strong>Google Analytics</strong> — anonymised usage analytics (policies.google.com/privacy)</li>
        <li><strong>Google Maps</strong> — optional venue location display</li>
      </ul>
      <p>
        We do not share your personal information with any other third parties and we do not sell it under any circumstances.
      </p>

      <h2 style={h2}>5. Data retention and deletion</h2>
      <p>
        We retain your personal information for as long as your account is active and for a reasonable period after, to allow account recovery. Specifically:
      </p>
      <ul style={ul}>
        <li><strong>Active accounts:</strong> Data is retained for the duration of your use of the service.</li>
        <li><strong>Inactive accounts:</strong> If your account shows no activity for <strong>24 consecutive months</strong>, we will delete your account and all associated data permanently.</li>
        <li><strong>Deleted accounts / data removal requests:</strong> When you request deletion, we will permanently remove your personal information within <strong>30 days</strong>. Anonymised, aggregated analytics data (which cannot identify you) may be retained longer.</li>
        <li><strong>RSVP data:</strong> Guest RSVPs are retained as long as the associated wedding page exists. When you delete your page or account, RSVP data is deleted as well.</li>
      </ul>
      <p>
        To request deletion of your data at any time, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a>. We will confirm receipt within 5 business days and complete the deletion within 30 days.
      </p>

      <h2 style={h2}>6. Your rights under PIPEDA and PIPA</h2>
      <p>As an individual whose personal information we hold, you have the right to:</p>
      <ul style={ul}>
        <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
        <li><strong>Correction:</strong> Ask us to correct inaccurate or incomplete information.</li>
        <li><strong>Withdrawal of consent:</strong> Withdraw consent to our collection or use of your information, subject to legal or contractual restrictions. Withdrawing consent may mean you can no longer use some or all of our services.</li>
        <li><strong>Deletion:</strong> Request that we delete your personal information (subject to any legal obligations to retain it).</li>
        <li><strong>Complaint:</strong> Lodge a complaint with the <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rose)' }}>Office of the Privacy Commissioner of Canada</a> if you believe we have not handled your information appropriately.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={h2}>7. Security</h2>
      <p>
        We implement industry-standard security measures including HTTPS encryption in transit, encrypted database storage, and access controls limited to authorised personnel. No system is completely secure; if you believe your account has been compromised, contact us immediately.
      </p>

      <h2 style={h2}>8. Children&apos;s privacy</h2>
      <p>
        MyGala is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If you believe we have inadvertently done so, please contact us and we will delete the information promptly.
      </p>

      <h2 style={h2}>9. Public content</h2>
      <p>
        Your wedding page (names, event details, photos, and RSVP form) is <strong>publicly accessible</strong> by default via your page URL. Do not include information on your public page that you wish to keep private. Guest RSVP submissions are visible only to you in your dashboard.
      </p>

      <h2 style={h2}>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will notify registered users of material changes by email. The effective date at the top of this page will always reflect when it was last updated. Continued use of the service after a change constitutes acceptance of the updated policy.
      </p>

      <h2 style={h2}>11. Contact</h2>
      <p>
        Questions, concerns, or requests regarding this privacy policy should be directed to:<br />
        <strong>MyGala Privacy</strong><br />
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a><br />
        mygala.ca, Canada
      </p>

      <p style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-soft)' }}>
        See also: <Link href="/terms" style={{ color: 'var(--rose)' }}>Terms of Service</Link> &nbsp;·&nbsp; <Link href="/about" style={{ color: 'var(--rose)' }}>About MyGala</Link>
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

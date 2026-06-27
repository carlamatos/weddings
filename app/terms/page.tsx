import LegalLayout from '@/app/ui/legal-layout';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — MyGala',
  description: 'The terms governing your use of MyGala, the Canadian wedding website platform.',
};

const EFFECTIVE_DATE = 'June 26, 2026';
const CONTACT_EMAIL = 'info@mygala.ca';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">

      <p style={meta}>Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Governing law: Canada (Province of British Columbia)</p>

      <p>
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using MyGala (&ldquo;the Service&rdquo;). By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree, do not use MyGala.
      </p>

      <h2 style={h2}>1. Who we are</h2>
      <p>
        MyGala is a web application operated in Canada at <strong>mygala.ca</strong>. References to &ldquo;MyGala,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo; in these Terms refer to the operators of the MyGala platform. You can contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={h2}>2. Eligibility</h2>
      <p>
        You must be at least 13 years old to use MyGala. By using the Service, you represent that you meet this requirement and that the information you provide is accurate.
      </p>

      <h2 style={h2}>3. Your account</h2>
      <p>
        You may create an account using Google, Apple, or Facebook Sign-In. You are responsible for maintaining the security of your account and for all activity that occurs under it. Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a> if you believe your account has been compromised.
      </p>
      <p>
        Each account may create one wedding page. You may not create multiple accounts to circumvent plan limits.
      </p>

      <h2 style={h2}>4. The Service</h2>
      <p>
        MyGala allows you to create a publicly accessible wedding website, collect RSVPs from guests, upload photos, share event details, and optionally connect a custom domain. The Service is provided on a free tier and a paid &ldquo;Plus&rdquo; tier. Feature availability is described on the <Link href="/#pricing" style={{ color: 'var(--rose)' }}>pricing page</Link>.
      </p>

      <h2 style={h2}>5. Acceptable use</h2>
      <p>You agree <strong>not</strong> to use MyGala to:</p>
      <ul style={ul}>
        <li>Post content that is unlawful, defamatory, harassing, obscene, or fraudulent.</li>
        <li>Infringe the intellectual property rights of others, including uploading photos you do not own or have permission to publish.</li>
        <li>Attempt to gain unauthorised access to our systems or another user&apos;s account.</li>
        <li>Use the Service for any commercial purpose other than your own event website.</li>
        <li>Upload malware, viruses, or any code designed to disrupt or damage systems.</li>
        <li>Scrape or harvest data from the platform using automated means.</li>
      </ul>
      <p>
        We reserve the right to remove content or suspend accounts that violate these rules, without notice and without refund.
      </p>

      <h2 style={h2}>6. Your content</h2>
      <p>
        You retain ownership of all content you upload or submit to MyGala (photos, text, wedding details, etc.). By uploading content, you grant MyGala a limited, non-exclusive, royalty-free licence to store, display, and deliver that content solely for the purpose of operating your wedding page and providing the Service to you.
      </p>
      <p>
        We do not use your content for advertising, AI training, or any purpose other than operating the Service.
      </p>
      <p>
        You are solely responsible for the content you publish. Ensure you have the right to share all photos, names, and other information on your public page, including on behalf of any guests named there.
      </p>

      <h2 style={h2}>7. Guest RSVPs</h2>
      <p>
        When guests submit an RSVP on your page, they provide personal information (name, attendance, dietary preferences, etc.). As the page owner, you are responsible for handling that guest data appropriately, including in compliance with applicable privacy laws. MyGala stores RSVP data on your behalf and does not use it for any other purpose.
      </p>

      <h2 style={h2}>8. Paid plans and billing</h2>
      <p>
        The Plus plan is billed monthly via <strong>Stripe</strong>. By subscribing, you authorise us to charge your payment method on a recurring basis until you cancel.
      </p>
      <ul style={ul}>
        <li><strong>Cancellation:</strong> You may cancel at any time through your account dashboard. Cancellation takes effect at the end of the current billing period; you will not be charged again after that.</li>
        <li><strong>Refunds:</strong> We do not offer pro-rated refunds for partial billing periods unless required by law. If you believe a charge was made in error, contact us within 14 days.</li>
        <li><strong>Price changes:</strong> We will provide at least 30 days&apos; notice before changing subscription prices. Continued use after the change constitutes acceptance of the new price.</li>
        <li><strong>Failed payments:</strong> If a payment fails, we will notify you and attempt to charge again. Continued failure may result in downgrade to the free plan.</li>
      </ul>

      <h2 style={h2}>9. Custom domains</h2>
      <p>
        Plus plan subscribers may connect a custom domain they own to their MyGala page. You are responsible for purchasing and maintaining the domain name, and for configuring DNS correctly. MyGala is not responsible for domain registration, renewal, or expiry. If your domain expires, your event page will no longer be accessible via that domain.
      </p>

      <h2 style={h2}>10. Service availability</h2>
      <p>
        We aim to provide a reliable service but do not guarantee 100% uptime. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We may perform maintenance, introduce changes, or experience outages. We will make reasonable efforts to notify users of planned downtime.
      </p>

      <h2 style={h2}>11. Intellectual property</h2>
      <p>
        All MyGala themes, designs, code, branding, and written content (excluding user-generated content) are the intellectual property of MyGala and are protected by Canadian and international copyright law. You may not copy, reverse-engineer, or redistribute any part of the Service without written permission.
      </p>

      <h2 style={h2}>12. Privacy</h2>
      <p>
        Our collection and use of your personal information is described in our <Link href="/privacy" style={{ color: 'var(--rose)' }}>Privacy Policy</Link>, which forms part of these Terms. By using MyGala, you consent to the practices described there.
      </p>

      <h2 style={h2}>13. Disclaimer of warranties</h2>
      <p>
        To the maximum extent permitted by Canadian law, MyGala is provided without warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be error-free or uninterrupted.
      </p>

      <h2 style={h2}>14. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, MyGala and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages. Our total liability for any claim arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.
      </p>

      <h2 style={h2}>15. Account termination</h2>
      <p>
        You may delete your account at any time by contacting us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a>. We may suspend or terminate accounts that violate these Terms. Accounts with no activity for 24 consecutive months may be deleted in accordance with our <Link href="/privacy" style={{ color: 'var(--rose)' }}>Privacy Policy</Link>.
      </p>
      <p>
        Upon termination, your public wedding page will no longer be accessible. Your personal data will be deleted in accordance with our Privacy Policy.
      </p>

      <h2 style={h2}>16. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify registered users of material changes by email at least 14 days before the change takes effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
      </p>

      <h2 style={h2}>17. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable therein. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts of British Columbia, Canada. Nothing in this clause limits your rights as a consumer under applicable Canadian law.
      </p>

      <h2 style={h2}>18. Contact</h2>
      <p>
        Questions about these Terms? Contact us at:<br />
        <strong>MyGala</strong><br />
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--rose)' }}>{CONTACT_EMAIL}</a><br />
        mygala.ca, Canada
      </p>

      <p style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-soft)' }}>
        See also: <Link href="/privacy" style={{ color: 'var(--rose)' }}>Privacy Policy</Link> &nbsp;·&nbsp; <Link href="/about" style={{ color: 'var(--rose)' }}>About MyGala</Link>
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

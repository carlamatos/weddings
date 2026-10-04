import LegalLayout from '@/app/ui/legal-layout';
import Link from 'next/link';
import CompanyDetails from '@/app/ui/marketing/company-details';
import { COMPANY } from '@/app/lib/company';
import { PLAN_ONE_TIME_PRICE_USD, PLAN_TERM_MONTHS } from '@/app/lib/plans';

export const metadata = {
  title: 'Terms of Service — MyGala',
  description: `The terms governing your use of MyGala, the Canadian event website platform operated by ${COMPANY.legalName}`,
};

const EFFECTIVE_DATE = 'October 4, 2026';
const CONTACT_EMAIL = COMPANY.email;
const link = { color: 'var(--rose)' };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">

      <p style={meta}>Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Governing law: Canada (Province of British Columbia)</p>

      <p>
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using MyGala (&ldquo;the Service&rdquo;). These Terms are an agreement between you and <strong>{COMPANY.legalName}</strong>. By creating an account or using the Service, you agree to be bound by these Terms. If you do not agree, do not use MyGala.
      </p>

      <h2 style={h2}>1. Who we are</h2>
      <p>
        The Service and the website <strong>{COMPANY.website}</strong> are owned and operated by <strong>{COMPANY.legalName}</strong>{COMPANY.incorporatedUnder ? <>, a corporation incorporated under {COMPANY.incorporatedUnder}</> : <>, a Canadian corporation</>}, which provides the Service under the name &ldquo;MyGala.&rdquo; References to &ldquo;MyGala,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo; in these Terms mean {COMPANY.legalName} Our contact details are in <a href="#contact" style={link}>section 18</a> and on our <Link href="/company" style={link}>Company Information</Link> page.
      </p>

      <h2 style={h2}>2. Eligibility</h2>
      <p>
        You must be at least 13 years old to use MyGala, and at least the age of majority in your province or territory to buy MyGala Plus. By using the Service, you represent that you meet these requirements and that the information you provide is accurate.
      </p>

      <h2 style={h2}>3. Your account</h2>
      <p>
        You can create an account with an email address and password, or sign in with Google or Facebook. You are responsible for keeping your account secure and for all activity that occurs under it. Notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a> if you believe your account has been compromised.
      </p>
      <p>
        One account can create several event pages, up to the limit shown in your dashboard. Each page is on the free plan or on Plus on its own. You may not create multiple accounts to get around plan limits.
      </p>

      <h2 style={h2}>4. The Service</h2>
      <p>
        MyGala lets you create a publicly accessible website for your event — such as a wedding, celebration, business or community event — collect RSVPs, keep a guest list, send invitations, share photos and event details, and, with Plus, use additional features such as guest photo uploads, reminders, invitations by email and a custom domain. The Service is offered on a free plan and a paid &ldquo;Plus&rdquo; plan. What each plan includes is described on our <Link href="/#pricing" style={link}>pricing page</Link>.
      </p>

      <h2 style={h2}>5. Acceptable use</h2>
      <p>You agree <strong>not</strong> to use MyGala to:</p>
      <ul style={ul}>
        <li>Post content that is unlawful, defamatory, harassing, hateful, obscene, or fraudulent.</li>
        <li>Infringe the intellectual property rights of others, including uploading photos you do not own or have permission to publish.</li>
        <li>Send invitations or other messages to people who have not agreed to hear from you, or otherwise send spam.</li>
        <li>Attempt to gain unauthorised access to our systems or another user&apos;s account.</li>
        <li>Use the Service for any commercial purpose other than your own event website.</li>
        <li>Upload malware, viruses, or any code designed to disrupt or damage systems.</li>
        <li>Scrape or harvest data from the platform using automated means.</li>
      </ul>
      <p>
        We may remove content, deactivate or suspend event pages, or suspend accounts that break these rules. Where a page is suspended for a breach of these Terms, any Plus payment for it is not refunded, except where the law requires otherwise.
      </p>

      <h2 style={h2}>6. Your content</h2>
      <p>
        You retain ownership of all content you upload or submit to MyGala (photos, text, event details, etc.). By uploading content, you grant {COMPANY.legalName} a limited, non-exclusive, royalty-free licence to store, display, and deliver that content solely for the purpose of operating your event page and providing the Service to you.
      </p>
      <p>
        We do not use your content for advertising, AI training, or any purpose other than operating the Service. Photos that guests upload to your page are checked automatically for explicit or violent content before they are published.
      </p>
      <p>
        You are solely responsible for the content you publish. Make sure you have the right to share all photos, names, and other information on your public page, including on behalf of any guests named there.
      </p>

      <h2 style={h2}>7. Your guests&rsquo; information</h2>
      <p>
        Your event page may collect information from your guests (such as their names, contact details, attendance, party size, notes, photos and song requests), and you may add guests to your guest list yourself — by hand, from a spreadsheet, or from your contacts. You are responsible for having the right to collect and use that information, and for only adding and contacting people you are actually inviting.
      </p>
      <p>
        When you send invitations through MyGala — by email, or as a text or WhatsApp message from your own phone — they are sent on your behalf and in your name. Guests can unsubscribe from emails about your event at any time. MyGala stores your guests&rsquo; information on your behalf, uses it only to provide the Service, and handles it as described in our <Link href="/privacy" style={link}>Privacy Policy</Link>.
      </p>

      <h2 id="billing" style={h2}>8. MyGala Plus: price, payment and refunds</h2>
      <p>
        MyGala Plus is sold by {COMPANY.legalName} It is a <strong>one-time payment of US${PLAN_ONE_TIME_PRICE_USD} per event page</strong>, charged in <strong>US dollars</strong>, that unlocks that page&rsquo;s Plus features for <strong>{PLAN_TERM_MONTHS} months</strong> from the date of purchase. It is <strong>not a subscription</strong>: you are not charged again, and nothing renews automatically.
      </p>
      <ul style={ul}>
        <li><strong>Payment:</strong> Payments are processed securely by <strong>Stripe</strong>. We never see or store your full card details. Your card issuer may charge a currency conversion fee if your card is not in US dollars.</li>
        <li><strong>Receipt:</strong> After your payment, a receipt is emailed to the address you used at checkout. Keep it as your record of the purchase.</li>
        <li><strong>When Plus ends:</strong> After {PLAN_TERM_MONTHS} months, your event page stays live on the free plan, without the Plus-only features. You can extend Plus for another {PLAN_TERM_MONTHS} months with another one-time payment at any time.</li>
        <li><strong>Refunds:</strong> Because Plus features are available as soon as payment is complete, payments are non-refundable, except where required by law. If you believe you were charged in error, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a> within 14 days of the charge and we will review it.</li>
        <li><strong>Price changes:</strong> We may change the price of Plus for future purchases. The price that applies to you is the one shown at checkout when you buy.</li>
      </ul>
      <p>
        Nothing in these Terms limits any right you have under the consumer protection laws of your province or territory.
      </p>

      <h2 style={h2}>9. Custom domains</h2>
      <p>
        Plus pages may connect a custom domain that you own. You are responsible for buying and renewing the domain name and for setting up its DNS records correctly. {COMPANY.legalName} is not responsible for domain registration, renewal, or expiry. If your domain expires, your event page will no longer be reachable at that domain, but it stays available at its {COMPANY.website} address.
      </p>

      <h2 style={h2}>10. Service availability</h2>
      <p>
        We aim to provide a reliable service but do not guarantee 100% uptime. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We may perform maintenance, introduce changes, or experience outages. We will make reasonable efforts to notify users of planned downtime.
      </p>

      <h2 style={h2}>11. Intellectual property</h2>
      <p>
        The MyGala name and logo, and all MyGala themes, designs, software, and written content (excluding user-generated content and the open-source software listed on our <Link href="/open-source" style={link}>Open-Source Licences</Link> page) are the property of {COMPANY.legalName} and are protected by Canadian and international copyright law. You may not copy, reverse-engineer, or redistribute any part of the Service without our written permission.
      </p>

      <h2 style={h2}>12. Privacy</h2>
      <p>
        Our collection and use of personal information is described in our <Link href="/privacy" style={link}>Privacy Policy</Link>, which forms part of these Terms.
      </p>

      <h2 style={h2}>13. Disclaimer of warranties</h2>
      <p>
        To the maximum extent permitted by law, MyGala is provided without warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be error-free or uninterrupted. Some provinces do not allow certain warranties to be excluded; in those provinces, these exclusions apply only to the extent permitted.
      </p>

      <h2 style={h2}>14. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {COMPANY.legalName} and its directors, officers, employees and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages. Our total liability for any claim arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.
      </p>

      <h2 style={h2}>15. Account termination</h2>
      <p>
        You may delete your account at any time by contacting us at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a>. We may suspend or terminate accounts that violate these Terms. Accounts with no activity for 24 consecutive months may be deleted in accordance with our <Link href="/privacy" style={link}>Privacy Policy</Link>.
      </p>
      <p>
        When an account is terminated, its public event pages are no longer accessible, and personal data is deleted in accordance with our Privacy Policy.
      </p>

      <h2 style={h2}>16. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify registered users of material changes by email at least 14 days before the change takes effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
      </p>

      <h2 style={h2}>17. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable therein. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts of British Columbia, Canada. Nothing in this clause limits your rights as a consumer under the laws of the province or territory where you live.
      </p>

      <h2 id="contact" style={h2}>18. Contact</h2>
      <p>Questions about these Terms? Contact us at:</p>
      <CompanyDetails />

      <p style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-soft)' }}>
        See also: <Link href="/privacy" style={link}>Privacy Policy</Link> &nbsp;·&nbsp; <Link href="/company" style={link}>Company Information</Link> &nbsp;·&nbsp; <Link href="/about" style={link}>About MyGala</Link>
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

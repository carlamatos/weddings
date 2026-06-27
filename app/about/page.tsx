import LegalLayout from '@/app/ui/legal-layout';
import Link from 'next/link';

export const metadata = {
  title: 'About — MyGala',
  description: 'MyGala helps couples create beautiful, personalised wedding pages in minutes. Learn about what we do and why we built it.',
};

export default function AboutPage() {
  return (
    <LegalLayout title="About MyGala">

      <h2 style={h2}>What is MyGala?</h2>
      <p>
        MyGala is a Canadian web platform that lets couples create a beautiful, personalised wedding website in minutes — no coding, no design experience, and no expensive agencies required. You pick a theme, fill in your details, and share one clean link with everyone you love.
      </p>
      <p>
        Every page includes everything a wedding website needs: your story, the event details, an RSVP form, a photo gallery, a livestream link, a registry section, a countdown, and more — all in one place your guests will actually find easy to use.
      </p>

      <h2 style={h2}>Why we built it</h2>
      <p>
        Planning a wedding is already a full-time job. We found that most couples were either spending too much on custom websites they barely used, or settling for generic platforms that didn&apos;t reflect their day at all. MyGala sits in between: thoughtfully designed themes with real personality, paired with tools that do the heavy lifting.
      </p>
      <p>
        We believe your wedding page should be as considered as the wedding itself — not an afterthought, and not a chore.
      </p>

      <h2 style={h2}>What you can do with MyGala</h2>
      <ul style={ul}>
        <li><strong>Choose a theme</strong> — Three handcrafted themes (Terracotta Harvest, Midnight Botanical, Quiet Coastal) with more on the way. Switching is instant and never loses your content.</li>
        <li><strong>Collect RSVPs</strong> — Guests RSVP directly on your page. No account required for them, no spreadsheet management for you.</li>
        <li><strong>Share a photo gallery</strong> — Upload up to 8 photos on the free plan; unlimited on Plus. Guests can browse them all in a lightbox.</li>
        <li><strong>Add a registry and livestream link</strong> — Everything in one place so guests aren&apos;t hunting through five different tabs.</li>
        <li><strong>Use your own domain</strong> — Plus plan members can point a custom domain (e.g. sarah-and-john.com) directly to their event page, so the link in your invitation looks exactly right.</li>
        <li><strong>Keep it after the wedding</strong> — Your page stays live as a keepsake. Free pages remain viewable; Plus pages keep every feature active for as long as you&apos;re subscribed.</li>
      </ul>

      <h2 style={h2}>Pricing</h2>
      <p>
        MyGala is free to start. The free plan gives you a full-featured wedding page on a <em>yourname.mygala.ca</em> subdomain. The <strong>Plus plan</strong> ($29.99/month) adds unlimited photo uploads, a custom domain, no Gala branding, priority support, and more. Cancel any time — no contracts, no penalties.
      </p>

      <h2 style={h2}>Privacy and your data</h2>
      <p>
        We take your privacy seriously. We never sell your information, never share it with advertisers, and we delete it when you ask. Read our full <Link href="/privacy" style={{ color: 'var(--rose)' }}>Privacy Policy</Link> for the details.
      </p>

      <h2 style={h2}>Contact us</h2>
      <p>
        Questions, feedback, or partnership inquiries — reach us at{' '}
        <a href="mailto:info@mygala.ca" style={{ color: 'var(--rose)' }}>info@mygala.ca</a>.
        We&apos;re a small team and we read every message.
      </p>

    </LegalLayout>
  );
}

const h2: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#241F2B',
  margin: '40px 0 12px',
};

const ul: React.CSSProperties = {
  paddingLeft: 22,
  margin: '0 0 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

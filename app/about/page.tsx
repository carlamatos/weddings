import LegalLayout from '@/app/ui/legal-layout';
import Link from 'next/link';
import { COMPANY } from '@/app/lib/company';

export const metadata = {
  title: 'About — MyGala',
  description: 'MyGala helps you create a beautiful, personalised page for any event in minutes. Learn about what we do and why we built it.',
};

export default function AboutPage() {
  return (
    <LegalLayout title="About MyGala">

      <h2 style={h2}>What is MyGala?</h2>
      <p>
        MyGala is a Canadian web platform that lets you create a beautiful, personalised page for any event in minutes — no coding, no design experience, and no expensive agencies required. Weddings, celebrations, business events, general events — pick a theme built for your kind of event, fill in your details, and share one clean link with everyone you&apos;ve invited.
      </p>
      <p>
        Every page includes everything an event website needs: your story, the event details, an RSVP form, a photo gallery, an event program, a registry or resources section, a countdown, and more — all in one place your guests will actually find easy to use.
      </p>

      <h2 style={h2}>Why we built it</h2>
      <p>
        Planning an event is already a full-time job, whatever the occasion. We found that most hosts were either spending too much on custom websites they barely used, or settling for generic platforms that didn&apos;t reflect their event at all. MyGala sits in between: thoughtfully designed themes with real personality for weddings, celebrations, business events, and general events alike — paired with tools that do the heavy lifting.
      </p>
      <p>
        We believe your event page should be as considered as the event itself — not an afterthought, and not a chore.
      </p>

      <h2 style={h2}>What you can do with MyGala</h2>
      <ul style={ul}>
        <li><strong>Choose a theme</strong> — Handcrafted themes across weddings, celebrations, business events, and general events, with more on the way. Switching is instant and never loses your content.</li>
        <li><strong>Collect RSVPs</strong> — Guests RSVP directly on your page. No account required for them, no spreadsheet management for you.</li>
        <li><strong>Publish an event program</strong> — Lay out your schedule, however many days or sessions it runs, right on the page.</li>
        <li><strong>Share a photo gallery</strong> — Upload up to 8 photos on the free plan and up to 100 on Plus. Guests can browse them all in a lightbox.</li>
        <li><strong>Add a registry, resources, or a livestream link</strong> — Everything in one place so guests aren&apos;t hunting through five different tabs.</li>
        <li><strong>Use your own domain</strong> — Plus members can point a custom domain (e.g. sarah-and-john.com) directly to their event page, so the link in your invitation looks exactly right.</li>
        <li><strong>Keep it after the event</strong> — Your page stays live as a keepsake. Free pages remain viewable indefinitely; Plus pages keep every feature active for 15 months, with the option to extend.</li>
      </ul>

      <h2 style={h2}>Pricing</h2>
      <p>
        MyGala is free to start. The free plan gives you full-featured event pages at <em>mygala.ca/yourname</em> — as many events as you need. The <strong>Plus plan</strong> ($49.99, one-time, per event) adds unlimited photo uploads, a custom domain, no Gala branding, priority support, and more — for 15 months, no subscription or recurring charge.
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

      <h2 style={h2}>Who we are</h2>
      <p>
        MyGala is owned and operated by <strong>{COMPANY.legalName}</strong>, a Canadian company. See our{' '}
        <Link href="/company" style={{ color: 'var(--rose)' }}>Company Information</Link> page for our full details.
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

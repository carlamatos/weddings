import { ADMIN_EMAIL_COOLDOWN_DAYS, audiencePage, blockedReason, fetchAdminEmailCandidates, fetchAdminEmailLog } from '@/app/lib/admin-email';
import { ADMIN_EMAIL_AUDIENCES, type AdminEmailAudience } from '@/app/lib/admin-email-templates';
import EmailComposer, { type ComposerPerson } from '@/app/ui/admin/email-composer';
import { formatDateTime } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';
import { COMPANY } from '@/app/lib/company';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Email users' };

export default async function AdminEmailPage() {
  let people: ComposerPerson[] = [];
  let log: Awaited<ReturnType<typeof fetchAdminEmailLog>> = [];
  let error: string | null = null;
  try {
    const [candidates, recent] = await Promise.all([fetchAdminEmailCandidates(), fetchAdminEmailLog()]);
    log = recent;
    people = candidates.map((p) => {
      const audiences: ComposerPerson['audiences'] = {};
      for (const a of Object.keys(ADMIN_EMAIL_AUDIENCES) as AdminEmailAudience[]) {
        const page = audiencePage(p, a);
        if (page !== undefined) audiences[a] = page ? { heading: page.heading, slug: page.slug, guests: page.guests, eventDate: page.event_date } : null;
      }
      return { id: p.id, email: p.email, name: p.name, joined: p.joined, blocked: blockedReason(p), sentTemplates: p.sentTemplates, audiences };
    });
  } catch (err) {
    error = err instanceof Error ? err.message : 'unknown error';
  }

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Email users</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6, maxWidth: 760 }}>
        Pick a template, choose who gets it, and edit the text before sending. Each email is filled in with the person&apos;s name and
        page. Replies go to {COMPANY.email}. Everyone gets an unsubscribe link, and to protect your email reputation, people who
        unsubscribed, unverified addresses and anyone emailed in the last {ADMIN_EMAIL_COOLDOWN_DAYS} days are skipped.
      </p>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>Couldn&apos;t load users: {error}.</div>
      )}

      <EmailComposer people={people} />

      <h2 style={{ fontSize: 17, margin: '40px 0 10px' }}>Recently sent</h2>
      {log.length === 0 ? (
        <p style={{ fontSize: 13, color: c.soft }}>Nothing sent yet.</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr><th style={th}>Sent</th><th style={th}>To</th><th style={th}>Subject</th></tr>
            </thead>
            <tbody>
              {log.map((l) => (
                <tr key={l.id}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatDateTime(l.sent_at)}</td>
                  <td style={td}>{l.email}</td>
                  <td style={td}>{l.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

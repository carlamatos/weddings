import { NextResponse } from 'next/server';
import { getSuperAdmin } from '@/app/lib/admin';
import {
  audiencePage, fetchAdminEmailCandidates, renderAdminEmail, sendAdminEmail, sendAdminEmailTest,
  type AdminEmailCandidate, type AdminEmailDraft,
} from '@/app/lib/admin-email';
import {
  ADMIN_EMAIL_BODY_MAX, ADMIN_EMAIL_BUTTON_MAX, ADMIN_EMAIL_MAX_RECIPIENTS, ADMIN_EMAIL_SIGNATURE_MAX, ADMIN_EMAIL_SUBJECT_MAX,
  ADMIN_EMAIL_TEMPLATES, isAdminEmailAudience, isAdminEmailButtonLink,
} from '@/app/lib/admin-email-templates';

// The admin email sender (/admin/email):
//   preview → the email as one person would see it ({ html, subject })
//   test    → that email, sent to the admin's own inbox
//   send    → sent to the chosen people (skipping anyone blocked)
type Body = {
  action?: unknown;
  draft?: Record<string, unknown>;
  audience?: unknown;
  userIds?: unknown;
  previewUserId?: unknown;
};

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length <= max ? v : null;
}

function parseDraft(d: Record<string, unknown> | undefined): AdminEmailDraft | string {
  if (!d) return 'Missing email.';
  const template = ADMIN_EMAIL_TEMPLATES.find((t) => t.id === d.template)?.id;
  const subject = str(d.subject, ADMIN_EMAIL_SUBJECT_MAX);
  const body = str(d.body, ADMIN_EMAIL_BODY_MAX);
  const buttonLabel = str(d.buttonLabel, ADMIN_EMAIL_BUTTON_MAX);
  const signature = str(d.signature, ADMIN_EMAIL_SIGNATURE_MAX);
  if (!template) return 'Unknown template.';
  if (subject === null || !subject.trim()) return 'Please write a subject.';
  if (body === null || !body.trim()) return 'Please write the email.';
  if (buttonLabel === null || signature === null || !isAdminEmailButtonLink(d.buttonLink)) return 'Invalid email.';
  return { template, subject, body, buttonLabel, buttonLink: d.buttonLink, signature };
}

// A stand-in for previews when nobody is chosen.
const SAMPLE: AdminEmailCandidate = {
  id: '00000000-0000-0000-0000-000000000000', email: 'guest@example.com', name: 'Alex', firstName: 'Alex', verified: true,
  joined: null, optedOut: false, lastSentAt: null, sentTemplates: {},
  pages: [{ id: 0, heading: 'Alex & Sam’s Wedding', slug: 'alex-and-sam', status: 'active', plan_type: 'free', event_date: new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10), guests: 0 }],
};

export async function POST(req: Request) {
  const admin = await getSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Body | null;
  const draft = parseDraft(body?.draft);
  if (typeof draft === 'string') return NextResponse.json({ error: draft }, { status: 400 });
  if (!isAdminEmailAudience(body?.audience)) return NextResponse.json({ error: 'Unknown audience.' }, { status: 400 });
  const audience = body.audience;

  try {
    const candidates = await fetchAdminEmailCandidates();
    const byId = new Map(candidates.map((c) => [c.id, c]));
    // The person and page the email is filled in with (preview and test).
    const pick = () => {
      const c = typeof body.previewUserId === 'string' ? byId.get(body.previewUserId) : undefined;
      const page = c ? audiencePage(c, audience) : undefined;
      return c && page !== undefined ? { c, page } : { c: SAMPLE, page: SAMPLE.pages[0] };
    };

    if (body.action === 'preview') {
      const { c, page } = pick();
      return NextResponse.json(renderAdminEmail(draft, c, page));
    }

    if (body.action === 'test') {
      const { c, page } = pick();
      await sendAdminEmailTest(draft, c, page, admin.email);
      return NextResponse.json({ ok: true, to: admin.email });
    }

    if (body.action === 'send') {
      const ids = Array.isArray(body.userIds) ? [...new Set(body.userIds.filter((v): v is string => typeof v === 'string'))] : [];
      if (!ids.length) return NextResponse.json({ error: 'Choose at least one person.' }, { status: 400 });
      if (ids.length > ADMIN_EMAIL_MAX_RECIPIENTS) {
        return NextResponse.json({ error: `You can send to up to ${ADMIN_EMAIL_MAX_RECIPIENTS} people at a time.` }, { status: 400 });
      }
      const recipients = [];
      for (const id of ids) {
        const c = byId.get(id);
        const page = c ? audiencePage(c, audience) : undefined;
        if (c && page !== undefined) recipients.push({ candidate: c, page });
      }
      const result = await sendAdminEmail(draft, recipients, admin.email);
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    console.error('Admin email failed:', err);
    return NextResponse.json({ error: `Couldn’t send (${err instanceof Error ? err.message : 'unknown error'}).` }, { status: 500 });
  }
}

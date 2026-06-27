import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: 'MyGala Contact <no-reply@mygala.ca>',
      to: 'info@mygala.ca',
      replyTo: email,
      subject: subject?.trim() ? `[Contact] ${subject.trim()}` : `[Contact] Message from ${name.trim()}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #241F2B;">
          <h2 style="margin: 0 0 24px; font-size: 20px;">New contact form submission</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3; font-weight: 600; width: 100px; vertical-align: top;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3;">${escHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3; font-weight: 600; vertical-align: top;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3;"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td>
            </tr>
            ${subject?.trim() ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3; font-weight: 600; vertical-align: top;">Subject</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #EDE8E3;">${escHtml(subject)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; white-space: pre-wrap;">${escHtml(message)}</td>
            </tr>
          </table>
          <p style="margin: 32px 0 0; font-size: 12px; color: #9A8F8C;">Sent via mygala.ca/contact</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}

function escHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

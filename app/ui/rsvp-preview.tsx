import { INVITATION_FONTS, readableAccent, type InvitationDesign, type InvitationFont } from '@/app/lib/invitation';

// A picture of the RSVP form guests fill in on the event page, in the
// theme's fonts and colours (its starting invitation design): for the
// /wedding-website and /party-celebrations banners and the party try page.
// Nothing here is a real control, so it needs no JavaScript and can't be
// submitted. Sized with container query units (cqw), like InvitationCard.
// fonts: see InvitationCard.
export function RsvpPreview({ design, name, date, fonts }: {
  design: InvitationDesign; name: string; date?: string; fonts?: Partial<Record<InvitationFont, string>>;
}) {
  const heading = fonts?.[design.headingFont] ?? INVITATION_FONTS[design.headingFont].family;
  const body = fonts?.[design.bodyFont] ?? INVITATION_FONTS[design.bodyFont].family;
  const accent = readableAccent({ ...design, background: { ...design.background, kind: 'color', overlay: false } });
  const label = { margin: '0 0 1.4cqw', fontSize: '3.3cqw', fontWeight: 600, letterSpacing: '0.15cqw', textTransform: 'uppercase' as const, opacity: 0.85 };
  const field = { padding: '2.6cqw 3.2cqw', borderRadius: '1.6cqw', background: 'rgba(255,255,255,0.9)', color: '#241F2B', border: '0.3cqw solid rgba(36,31,43,0.14)', fontSize: '3.8cqw' };
  const radio = (on: boolean) => ({ flex: 'none', width: '3.6cqw', height: '3.6cqw', borderRadius: '50%', border: `0.5cqw solid ${on ? accent : 'currentColor'}`, boxShadow: on ? `inset 0 0 0 0.8cqw ${design.background.color}` : undefined, background: on ? accent : 'transparent', opacity: on ? 1 : 0.6 });

  return (
    <div className="rsvp-preview" style={{ containerType: 'inline-size', width: '100%', boxSizing: 'border-box', borderRadius: 14, background: design.background.color, color: design.textColor, fontFamily: body, boxShadow: '0 18px 40px -18px rgba(36,31,43,0.35)' }}>
      <div style={{ padding: '8cqw 8cqw 9cqw', display: 'flex', flexDirection: 'column', gap: '3.6cqw' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '3.3cqw', letterSpacing: '0.3cqw', textTransform: 'uppercase' }}>Kindly respond</p>
          <p style={{ margin: '1cqw 0 0', fontFamily: heading, fontSize: '12cqw', lineHeight: 1.05, color: accent }}>RSVP</p>
          <p style={{ margin: '1.6cqw 0 0', fontSize: '3.8cqw', fontWeight: 600, overflowWrap: 'anywhere' }}>{name}</p>
          {date && <p style={{ margin: '0.6cqw 0 0', fontSize: '3.4cqw', opacity: 0.85 }}>{date}</p>}
        </div>
        <div>
          <p style={label}>Full name</p>
          <div style={field}>Jane Doe</div>
        </div>
        <div>
          <p style={label}>Email</p>
          <div style={field}>jane@email.com</div>
        </div>
        <div>
          <p style={label}>Will you attend?</p>
          <div style={{ display: 'grid', gap: '2cqw', fontSize: '3.8cqw' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2.4cqw' }}><span style={radio(true)} />Joyfully accepts</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2.4cqw' }}><span style={radio(false)} />Regretfully declines</span>
          </div>
        </div>
        <div>
          <p style={label}>Number of guests</p>
          <div style={{ ...field, display: 'flex', justifyContent: 'space-between' }}><span>2 guests</span><span aria-hidden="true">▾</span></div>
        </div>
        <div style={{ alignSelf: 'center', marginTop: '1.6cqw', padding: '3cqw 9cqw', borderRadius: '999px', background: accent, color: design.background.color, fontSize: '3.8cqw', fontWeight: 700, letterSpacing: '0.2cqw', textTransform: 'uppercase' }}>
          Send RSVP
        </div>
      </div>
    </div>
  );
}

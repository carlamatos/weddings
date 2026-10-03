import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { timingSafeStringEqual } from '@/app/lib/timing-safe-equal';

// One-time migration endpoint. Protected by MIGRATION_SECRET env var.
// Call: POST /api/migrate  with header Authorization: Bearer <MIGRATION_SECRET>
export async function POST(request: Request) {
  const secret = process.env.MIGRATION_SECRET;
  const provided = request.headers.get('Authorization') ?? '';
  if (!secret || !timingSafeStringEqual(provided, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Antique Cars theme (General Events category, key 'community'). Theme rows are looked up by
  // slug, so insert it only once.
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Antique Cars',
           'Teal, deep purple, and golden yellow with checkered flags, wire wheels, and a classic car cruising the page. Built for antique and classic car shows.',
           'antique-cars'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'antique-cars')
  `;

  // Girl Baby Shower theme (Celebrations category, key 'birthdays').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Girl Baby Shower',
           'Soft greys and blush pinks with a baby elephant, a flying stork, rising balloons and hearts. Built for baby showers welcoming a little girl.',
           'baby-shower-girl'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'baby-shower-girl')
  `;

  // Neutral Baby Shower theme (Celebrations category, key 'birthdays').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Neutral Baby Shower',
           'Whitewashed wood, soft blues and lavender with a baby elephant, a swinging crib mobile, hopping ABC blocks and little footprints. Built for baby showers before the big reveal.',
           'baby-shower-neutral'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'baby-shower-neutral')
  `;

  // Boy Baby Shower theme (Celebrations category, key 'birthdays').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Boy Baby Shower',
           'Sky blues and warm caramel with a swimming whale, rising balloons, a flying bird, rocking sailboats and rolling waves. Built for baby showers welcoming a little boy.',
           'baby-shower-boy'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'baby-shower-boy')
  `;

  // The Day theme (Wedding category).
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'The Day',
           'Ivory peonies, linen and a white bouquet with sage-to-evergreen greenery and buttery gold accents. Classic invitation framing, fine botanical line art and drifting petals.',
           'the-day'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'the-day')
  `;

  // Love theme (Wedding category).
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Love',
           'Blush, rose and raspberry with peach, cream and olive greens. Romantic script names, arched cards, interlocking rings and softly rising hearts.',
           'love'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'love')
  `;

  // Christmas Party theme (General Events category, key 'community').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Christmas Party',
           'Forest green, bauble red and warm golden light with falling snow, twinkling string lights, swinging bauble countdown and kraft gift-tag cards. Cozy and cute for holiday parties.',
           'christmas-party'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'christmas-party')
  `;

  // White Christmas theme (General Events category, key 'community').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'White Christmas',
           'Icy winter blues with gold stars, silver and pine. Classic serif type, gold-framed cards and gently falling snow for an elegant holiday celebration.',
           'white-christmas'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'white-christmas')
  `;

  // Día de los Muertos theme (General Events category, key 'community').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Día de los Muertos',
           'Deep plum nights lit with marigold, hot pink and teal. Swaying papel picado, falling cempasúchil petals and dancing sugar skulls for a joyful celebration of remembrance.',
           'dia-de-los-muertos'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'dia-de-los-muertos')
  `;

  // Halloween Party theme (General Events category, key 'community').
  await sql`
    INSERT INTO event_themes (name, description, slug)
    SELECT 'Halloween Party',
           'Midnight charcoal and pumpkin orange with witch green and blood red. Flying bats, dangling spiders, drifting fog and a creeping witch''s hand — scary, but fun.',
           'halloween-party'
    WHERE NOT EXISTS (SELECT 1 FROM event_themes WHERE slug = 'halloween-party')
  `;

  // Plus: up to three owner-written sections per page (optional title plus a
  // JSON list of text/image blocks) and a sponsors list.
  await sql`
    CREATE TABLE IF NOT EXISTS page_custom_sections (
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
      title TEXT NOT NULL DEFAULT '',
      blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_page_id, position)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS page_sponsors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      image_url TEXT,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_page_sponsors_page ON page_sponsors (user_page_id, position)`;
  // Optional '#RRGGBB' shown behind a sponsor's image (transparent logos).
  await sql`ALTER TABLE page_sponsors ADD COLUMN IF NOT EXISTS image_bg TEXT`;

  // Plus: Potluck — what each guest is bringing, one entry per email per page.
  await sql`
    CREATE TABLE IF NOT EXISTS page_potluck (
      id SERIAL PRIMARY KEY,
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      items TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_page_potluck_email ON page_potluck (user_page_id, (lower(email)))`;

  // Sponsors became off-by-default on 2026-10-02: keep them showing on pages
  // that already had sponsors then and never touched the switch. Limited to
  // sponsors added before that date, so re-running this never switches on
  // sponsors a host added later but left hidden.
  await sql`
    INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
    SELECT DISTINCT user_page_id, 'show_sponsors', 'true' FROM page_sponsors
    WHERE created_at < '2026-10-03'
    ON CONFLICT (user_page_id, setting_name) DO NOTHING
  `;

  // Add user_phone to user_page
  await sql`ALTER TABLE user_page ADD COLUMN IF NOT EXISTS user_phone TEXT`;

  // Optional end of the event (multi-day events, or an end time on the day).
  // Same types as event_date / event_time.
  await sql`ALTER TABLE user_page ADD COLUMN IF NOT EXISTS event_end_date DATE`;
  await sql`ALTER TABLE user_page ADD COLUMN IF NOT EXISTS event_end_time VARCHAR(5)`;

  // Event Reminders: one row per guest per reminder per event date, written
  // before the email is sent so a guest can never get the same one twice.
  // Keyed on event_date so moving the event re-arms the reminders.
  await sql`
    CREATE TABLE IF NOT EXISTS event_reminder_deliveries (
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      guest_id UUID NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      reminder_key TEXT NOT NULL,
      event_date DATE NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_page_id, guest_id, reminder_key, event_date)
    )
  `;
  // Invitations (Plus): when each guest was last emailed their invitation,
  // and whether they've unsubscribed from this event's emails (which also
  // stops further invitations).
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN NOT NULL DEFAULT FALSE`;
  // The host's personal note for one guest, added to that guest's invitation email.
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS invitation_note TEXT`;
  // When the host last opened a pre-filled text to this guest from the guest
  // list, and with what ('sms' or 'whatsapp'). The text itself goes from the
  // host's own phone, so this records the tap, not delivery.
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS texted_at TIMESTAMPTZ`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS texted_via TEXT`;

  await sql`CREATE INDEX IF NOT EXISTS idx_reminder_deliveries_email ON event_reminder_deliveries (user_page_id, lower(email), reminder_key, event_date)`;

  // Email verification / password reset / 2FA. This endpoint accumulates
  // statements and gets re-run for later, unrelated migrations, so the
  // one-time backfill below is guarded on whether the column already existed
  // *before* this ALTER — an unconditional `WHERE email_verified_at IS NULL`
  // would silently re-verify every future not-yet-verified user the next
  // time this endpoint is invoked for something else.
  const hadEmailVerifiedColumn = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email_verified_at'
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`;
  if (hadEmailVerifiedColumn.rows.length === 0) {
    // Existing accounts pre-date the verification requirement — grandfather
    // them in rather than locking everyone out on deploy.
    await sql`UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL`;
  }

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled_at TIMESTAMPTZ`;
  // Sessions that signed in before this are signed out (app/lib/session-revocation.ts).
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ`;

  await sql`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_evt_user ON email_verification_tokens(user_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens(user_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS totp_backup_codes (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_backup_user ON totp_backup_codes(user_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      rl_key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at TIMESTAMPTZ NOT NULL
    )
  `;

  // One-time-payment paid plans expire 15 months after purchase instead of
  // renewing — tracked per page, and mirrored on user_plans for purchases
  // made before a page exists yet (see createUserPage).
  await sql`ALTER TABLE user_page ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP`;
  await sql`ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP`;

  // Create page settings table
  await sql`
    CREATE TABLE IF NOT EXISTS user_page_settings (
      id SERIAL PRIMARY KEY,
      user_page_id INTEGER NOT NULL,
      setting_name TEXT NOT NULL,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_page_id, setting_name)
    )
  `;

  // Create event program table (schedule of phases: rehearsal dinner, ceremony, etc.)
  await sql`
    CREATE TABLE IF NOT EXISTS event_program (
      id SERIAL PRIMARY KEY,
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      event_date DATE NOT NULL,
      name TEXT NOT NULL,
      start_time TIME,
      end_time TIME,
      location TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create unified table
  await sql`
    CREATE TABLE IF NOT EXISTS event_guests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_page_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'attending', 'not_attending')),
      guests INTEGER NOT NULL DEFAULT 1,
      message TEXT,
      receive_updates BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      responded_at TIMESTAMP
    )
  `;

  let rsvpsMigrated = 0;
  let inviteesMigrated = 0;

  // Migrate from event_rsvp
  try {
    const rsvps = await sql`SELECT * FROM event_rsvp`;
    for (const r of rsvps.rows) {
      const exists = await sql`SELECT id FROM event_guests WHERE id = ${r.id} LIMIT 1`;
      if (exists.rows[0]) continue;
      await sql`
        INSERT INTO event_guests (id, user_page_id, name, email, phone, status, guests, message, receive_updates, created_at, responded_at)
        VALUES (${r.id}, ${r.user_page_id}, ${r.name}, ${r.email}, ${r.phone}, ${r.status}, ${r.guests}, ${r.message}, ${r.receive_updates}, ${r.created_at}, ${r.created_at})
      `;
      rsvpsMigrated++;
    }
  } catch {
    // event_rsvp table may not exist on fresh deployments
  }

  // Migrate from event_invitees
  try {
    const invitees = await sql`SELECT * FROM event_invitees`;
    for (const inv of invitees.rows) {
      // Skip if email already in guest list (may have since RSVP'd)
      if (inv.email) {
        const exists = await sql`
          SELECT id FROM event_guests WHERE user_page_id = ${inv.user_page_id} AND email = ${inv.email} LIMIT 1
        `;
        if (exists.rows[0]) continue;
      }
      await sql`
        INSERT INTO event_guests (id, user_page_id, name, email, phone, status, created_at)
        VALUES (${inv.id}, ${inv.user_page_id}, ${inv.name}, ${inv.email}, ${inv.phone}, 'invited', ${inv.created_at})
      `;
      inviteesMigrated++;
    }
  } catch {
    // event_invitees table may not exist on fresh deployments
  }

  return NextResponse.json({ success: true, rsvpsMigrated, inviteesMigrated });
}

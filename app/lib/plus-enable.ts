import { sql } from '@vercel/postgres';
import { PLUS_ENABLE_SETTINGS } from './plus-features';

// After a Plus purchase started from a section's "turn on", switch that
// section on, so paying finishes what the host set up. Run by both the
// checkout return (/api/stripe/confirm) and the webhook; it's idempotent.
// Password protection only turns on once a password has been saved.
export async function enablePlusSetting(pageId: number, userId: string, setting: string | undefined): Promise<void> {
  if (!setting || !PLUS_ENABLE_SETTINGS.has(setting)) return;
  try {
    if (setting === 'password_protect') {
      const hash = await sql`
        SELECT 1 FROM user_page_settings s JOIN user_page p ON p.id = s.user_page_id
        WHERE p.id = ${pageId} AND p.user_id = ${userId} AND s.setting_name = 'page_password_hash' AND s.setting_value <> ''
      `;
      if (!hash.rows.length) return;
    }
    // The SELECT only returns a row when the page belongs to this user.
    await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      SELECT id, ${setting}::text, 'true' FROM user_page WHERE id = ${pageId} AND user_id = ${userId}
      ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = 'true', updated_at = NOW()
    `;
  } catch (error) {
    console.error('Failed to switch on a Plus feature after checkout:', error);
  }
}

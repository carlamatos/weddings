"use server"

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { pagePath } from './dashboard';
import { normalizeHashtag } from './hashtag';
import { isSectionTextKey, sectionTextSettingName, SECTION_TEXT_MAX_LENGTH } from './section-text';
import { parseReminderSchedule, REMINDER_MESSAGE_MAX_LENGTH } from './reminders';
import { reminderEmail } from './reminder-email';
import { redirect } from 'next/navigation';

import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

import { headers } from 'next/headers';
import { signIn } from '@/auth';
import { isRateLimited, clearRateLimit, recordAttempt, overRateLimit, clientIp } from './rate-limit';

import { EventProgramItem, CustomSection, CustomSectionBlock, Sponsor } from './definitions';
import {
  CUSTOM_SECTION_TITLE_MAX, SPONSOR_DESCRIPTION_MAX, SPONSOR_MAX_COUNT,
  isHexColor, isUploadedImageUrl, isValidSectionPosition, normalizeBlocks,
} from './custom-sections';
import { normalizeRegistryLink, isRegistryLink, REGISTRY_BUTTON_TEXT_MAX, REGISTRY_MESSAGE_MAX } from './registry';
import { normalizeLivestreamInput, isLivestreamLink, LIVESTREAM_SETTINGS, LIVESTREAM_BUTTON_TEXT_MAX, LIVESTREAM_MESSAGE_MAX, type LivestreamDisplay } from './livestream';
import { auth } from '@/auth';
import { fetchUserPage, fetchOwnedPage, parsePageId, fetchPageQuota, hasPrepaidPlus, normalizeEventProgramItem } from './data';
import { createPlusCheckout } from './plus-checkout';
import { safeHttpUrl } from './safe-url';
import { PAGE_PASSWORD_MAX, PAGE_PASSWORD_MIN } from './page-password';
import { AuthError } from 'next-auth';
import { createToken } from './tokens';
import { sendMail, verificationEmailHtml } from './mail';
import { siteUrl } from './site-url';
import { passwordRule } from './password-schema';

const MAX_LOGIN_ATTEMPTS = 5;
const EMAIL_VERIFICATION_TTL_MS = 48 * 60 * 60 * 1000;


  const UserPageSchema = z.object({
    id: z.string(),
    event_name: z.string(),
    description: z.string(),
    event_date: z.string(),
    event_time: z.string().min(1, { message: 'Event time is required.' }),
    event_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid end date.' }).optional(),
    event_end_time: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Invalid end time.' }).optional(),
    event_type: z.enum(['wedding', 'birthdays', 'business', 'community'], { invalid_type_error: 'Please select an event type.' }),
    theme_slug: z.string({ invalid_type_error: 'Please select a theme.' }),
    location: z.string(),
    slug: z.string({
      invalid_type_error: 'Please specify a slug (page URL).',
    }),
    email: z.string()
      .email({ message: 'Invalid email address. Please enter a valid email.'}),

    url: z.string(),
    street_address: z.string(),
    unit_number: z.string(),
    postal_code: z.string(),
    city: z.string(),
    country: z.string(),
    place_id: z.string().optional(),
    formatted_address: z.string().optional(),

    create_at: z.date(),
  });


const CreateUserPage = UserPageSchema.omit({ id: true, create_at: true }).refine(
  (d) => !d.event_end_date || !d.event_date || d.event_end_date >= d.event_date,
  { message: 'The end date can’t be before the start date.', path: ['event_end_date'] },
);
export type UserPageState = {
    errors?: {
      event_name?: string[];
      description?: string[];
      event_date?: string[];
      event_time?: string[];
      event_end_date?: string[];
      event_end_time?: string[];
      event_type?: string[];
      theme_slug?: string[];
      location?: string[];
      slug?: string[];
      email?: string[];
      url?: string[];
      unit_number?: string[];
      street_address?: string[];
      postal_code?: string[];
      city?: string[];
      country?: string[];
    };
    message?: string | null;
  };


  export async function createUserPage(prevState: UserPageState, formData: FormData){

    const session = await auth();

    // Enforce the plan's page limit on the server. (The setup page also
    // redirects, but that is only a UI courtesy — this action can be called directly.)
    const limitUserId = session?.user?.id;
    if (!limitUserId) return { message: 'Please sign in to create an event page.' };
    {
      const quota = await fetchPageQuota(limitUserId);
      if (quota.count >= quota.limit) {
        return { message: `You've reached the maximum of ${quota.limit} event pages for one account. Contact us if you need more.` };
      }
    }

    const formSlug = formData.get('slug');

    // Addresses used by the site's own pages (mygala.ca/faq, /features, …)
    // would hide the event page, so they can't be claimed.
    if (typeof formSlug === 'string' && RESERVED_SLUGS.has(formSlug.trim().toLowerCase())) {
      return {
        errors: { slug: [`The URL '${formSlug}' is reserved, please choose another`] },
        message: `The URL '${formSlug}' is reserved, please choose another`,
      };
    }

    // Check if slug is already taken — guarded so a DB error doesn't crash the action
    if (typeof formSlug === 'string' && formSlug.trim() !== '') {
      try {
        const userPage = await fetchUserPage(formSlug);
        if (userPage !== undefined) {
          return {
            errors: { slug: [`The URL '${formSlug}' is already in use, please choose another`] },
            message: `The URL '${formSlug}' is already in use, please choose another`,
          };
        }
      } catch {
        // If the slug check fails (e.g. DB not yet migrated) just continue
      }
    }

    const validatedFields = CreateUserPage.safeParse({
      event_name: formData.get('eventName'),
      event_date: formData.get('eventDate'),
      event_time: formData.get('eventTime'),
      event_end_date: (formData.get('eventEndDate') as string) || undefined,
      event_end_time: (formData.get('eventEndTime') as string) || undefined,
      event_type: formData.get('eventType'),
      theme_slug: formData.get('themeSlug'),
      location: formData.get('location'),
      email: formData.get('email'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      url: (formData.get('url') as string) ?? '',
      street_address: (formData.get('streetAddress') as string) ?? '',
      unit_number: (formData.get('unitNumber') as string) ?? '',
      postal_code: (formData.get('postalCode') as string) ?? '',
      city: (formData.get('city') as string) ?? '',
      country: (formData.get('country') as string) ?? '',
      place_id: formData.get('placeId') as string || undefined,
      formatted_address: formData.get('formattedAddress') as string || undefined,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Page.',
      };
    }

    const { event_name, description, event_date, event_time, event_end_date, event_end_time, event_type, theme_slug, location, email, slug, url: rawUrl, street_address, unit_number, postal_code, city, country, place_id, formatted_address } = validatedFields.data;
    const url = safeHttpUrl(rawUrl);
    const venue_name = (formData.get('venueName') as string) || null;
    const user_phone = (formData.get('phone') as string)?.trim() || null;

    const user_id = session?.user?.id;

    const wantsPlus = formData.get('plan') === 'plus';
    let prepaid = false;
    let newPageId: number | string | undefined;
    try {
      // Resolve theme slug → theme_id
      const themeRow = await sql`SELECT theme_id FROM event_themes WHERE slug = ${theme_slug} LIMIT 1`;
      const theme_id = themeRow.rows[0]?.theme_id ?? null;

      // Plus is bought per page after it's created (below). The one exception
      // is a purchase made before the account had any page, which carries
      // over to this first page.
      prepaid = user_id ? await hasPrepaidPlus(user_id) : false;
      const planRow = prepaid ? await sql`SELECT plan_expires_at FROM user_plans WHERE user_id = ${user_id} LIMIT 1` : null;
      const plan_type = prepaid ? 'paid' : 'free';
      const plan_expires_at = planRow?.rows[0]?.plan_expires_at ?? null;

      const inserted = await sql`
        INSERT INTO user_page (
          user_id, heading, main_content, description, event_date, event_time, event_end_date, event_end_time, event_type, theme_id,
          location, user_email, user_phone, slug, url, street_address, unit_number, postal_code, city, country,
          place_id, formatted_address, venue_name, plan_type, plan_expires_at
        ) VALUES (
          ${user_id}, ${event_name}, ${description}, ${description}, ${event_date}, ${event_time}, ${event_end_date ?? null}, ${event_end_time ?? null}, ${event_type}, ${theme_id},
          ${location}, ${email}, ${user_phone}, ${slug}, ${url}, ${street_address}, ${unit_number}, ${postal_code}, ${city}, ${country},
          ${place_id ?? null}, ${formatted_address ?? null}, ${venue_name}, ${plan_type}, ${plan_expires_at}
        )
        RETURNING id
      `;

      // New pages start with the Event Program section hidden until the
      // owner adds phases and turns it on; every other section defaults on.
      newPageId = inserted.rows[0]?.id;
      if (newPageId) {
        await sql`
          INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
          VALUES (${newPageId}, 'show_event_program', 'false')
          ON CONFLICT (user_page_id, setting_name) DO NOTHING
        `;
      }
    } catch (error) {
      console.error('Database Error:', error);
      return {
        message: 'Something went wrong creating your page. Please try again.',
      };
    }

    revalidatePath(`/${slug}`);

    // Chose Plus for this event: the page exists (free) now, so pay for it.
    // Cancelling checkout leaves it free, upgradeable from the dashboard.
    if (wantsPlus && !prepaid && newPageId && user_id) {
      let checkoutUrl: string | null = null;
      try {
        const h = await headers();
        const origin = h.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
        checkoutUrl = await createPlusCheckout({ userId: user_id, email: session?.user?.email ?? undefined, pageId: Number(newPageId), origin });
      } catch (error) {
        console.error('Failed to start Plus checkout for new page:', error);
      }
      if (checkoutUrl) redirect(checkoutUrl);
    }

    // Straight into the editor for the new page; the event pages list is
    // the fallback if the id somehow didn't come back.
    redirect(newPageId ? pagePath(newPageId) : '/dashboard');
  }

export async function updateLocation(pageId: number, data: {
  location: string;
  streetAddress?: string;
  unitNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  placeId?: string;
  formattedAddress?: string;
  url?: string;
  venueName?: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`
      UPDATE user_page SET
        location          = ${data.location},
        street_address    = ${data.streetAddress ?? null},
        unit_number       = ${data.unitNumber ?? null},
        postal_code       = ${data.postalCode ?? null},
        city              = ${data.city ?? null},
        country           = ${data.country ?? null},
        place_id          = ${data.placeId ?? null},
        formatted_address = ${data.formattedAddress ?? null},
        url               = ${safeHttpUrl(data.url) || null},
        venue_name        = ${data.venueName ?? null}
      WHERE id = ${pid} AND user_id = ${userId}
    `;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update location:', error);
  }
}

export async function updateLanguage(pageId: number, language: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`UPDATE user_page SET language = ${language} WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update language:', error);
  }
}

export async function updateHeading(pageId: number, heading: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`UPDATE user_page SET heading = ${heading} WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update heading:', error);
  }
}

export async function updateDescription(pageId: number, description: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`UPDATE user_page SET description = ${description} WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update description:', error);
  }
}

// What updatePageSetting may write: the show/hide switches and the banner fit.
// Everything else (livestream, reminders, hashtag, headings…) has its own
// validating action, so a crafted call can't store arbitrary settings.
function isWritableSetting(name: string, value: string): boolean {
  if (/^show_[a-z_]{1,40}$/.test(name)) return value === 'true' || value === 'false';
  if (name === 'hero_object_fit') return value === 'cover' || value === 'contain';
  return false;
}

export async function updatePageSetting(pageId: number, settingName: string, settingValue: string) {
  if (typeof settingName !== 'string' || typeof settingValue !== 'string' || !isWritableSetting(settingName, settingValue)) return;
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    // The SELECT only returns a row when the page belongs to this user.
    await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      SELECT id, ${settingName}::text, ${settingValue}::text FROM user_page WHERE id = ${pid} AND user_id = ${userId}
      ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = ${settingValue}, updated_at = NOW()
    `;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update page setting:', error);
  }
}

// Saves the hashtag shown in the page's "Tag your posts" section. Stored
// normalized (no '#', no spaces); an empty value means "feature the page link
// instead". Returns what was saved so the form can show the cleaned-up tag.
export async function updateShareHashtag(pageId: number, raw: string): Promise<string | null> {
  const hashtag = normalizeHashtag(raw);
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return null;
  try {
    const res = await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      SELECT id, 'share_hashtag', ${hashtag}::text FROM user_page WHERE id = ${pid} AND user_id = ${userId}
      ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = ${hashtag}, updated_at = NOW()
    `;
    if (!res.rowCount) return null;
    revalidatePath('/', 'layout');
    return hashtag;
  } catch (error) {
    console.error('Failed to update share hashtag:', error);
    return null;
  }
}

// ─── Custom sections & sponsors (Plus) ─────────────────────
// Every action checks, in the same query, that the page belongs to the
// signed-in user and is on a paid plan.

// Top-level paths the site uses itself; event pages can't take these slugs.
const RESERVED_SLUGS = new Set([
  'about', 'admin', 'api', 'check-email', 'construction', 'contact', 'dashboard', 'email-verified', 'events',
  'faq', 'features', 'forgot-password', 'login', 'pricing', 'privacy', 'register', 'reset-password', 'robots.txt',
  'site', 'sitemap.xml', 'terms', 'themes', 'unsubscribe', 'verify-2fa', 'verify-email-pending',
]);

type PlusResult<T> = { ok: true; value: T } | { ok: false; error: string };

const PLUS_ONLY_ERROR = 'This is a Plus feature.';
const GENERIC_PLUS_ERROR = 'Couldn’t save. Please try again.';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The page id when the signed-in user owns this page and it's paid, else an error.
async function ownedPlusPageId(pageId: number): Promise<PlusResult<number>> {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return { ok: false, error: 'Not signed in.' };
  const page = await sql`SELECT id, plan_type FROM user_page WHERE id = ${pid} AND user_id = ${userId}`;
  if (!page.rows[0]) return { ok: false, error: 'Page not found.' };
  if (page.rows[0].plan_type !== 'paid') return { ok: false, error: PLUS_ONLY_ERROR };
  return { ok: true, value: pid };
}

// Saves one of the three custom sections. Saving it empty (no title, no
// blocks) removes it, which hides it from the page.
export async function saveCustomSection(
  pageId: number,
  position: number,
  data: { title: string; blocks: CustomSectionBlock[] },
): Promise<PlusResult<CustomSection>> {
  if (!isValidSectionPosition(position)) return { ok: false, error: 'Unknown section.' };
  const title = (typeof data?.title === 'string' ? data.title : '').replace(/\s+/g, ' ').trim().slice(0, CUSTOM_SECTION_TITLE_MAX);
  const blocks = normalizeBlocks(data?.blocks);
  if (!blocks) return { ok: false, error: 'Some of the content couldn’t be saved. Please check it and try again.' };
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    if (!title && !blocks.length) {
      await sql`DELETE FROM page_custom_sections WHERE user_page_id = ${owned.value} AND position = ${position}`;
    } else {
      await sql`
        INSERT INTO page_custom_sections (user_page_id, position, title, blocks)
        VALUES (${owned.value}, ${position}, ${title}, ${JSON.stringify(blocks)}::jsonb)
        ON CONFLICT (user_page_id, position)
        DO UPDATE SET title = EXCLUDED.title, blocks = EXCLUDED.blocks, updated_at = NOW()
      `;
    }
    revalidatePath('/', 'layout');
    return { ok: true, value: { position, title, blocks } };
  } catch (error) {
    console.error('Failed to save custom section:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

type SponsorInput = { imageUrl?: string | null; imageBg?: string | null; description?: string | null };

function cleanSponsorInput(data: SponsorInput): PlusResult<{ imageUrl: string | null; imageBg: string | null; description: string | null }> {
  const imageUrl = data?.imageUrl || null;
  if (imageUrl !== null && !isUploadedImageUrl(imageUrl)) return { ok: false, error: 'That image couldn’t be used. Please upload it again.' };
  const imageBg = data?.imageBg || null;
  if (imageBg !== null && !isHexColor(imageBg)) return { ok: false, error: 'That background colour isn’t valid.' };
  const description = (typeof data?.description === 'string' ? data.description : '').replace(/\r\n/g, '\n').trim().slice(0, SPONSOR_DESCRIPTION_MAX) || null;
  if (!imageUrl && !description) return { ok: false, error: 'Add an image or a short description.' };
  return { ok: true, value: { imageUrl, imageBg: imageUrl ? imageBg : null, description } };
}

export async function addSponsor(
  pageId: number,
  data: SponsorInput,
): Promise<PlusResult<Sponsor>> {
  const input = cleanSponsorInput(data);
  if (!input.ok) return input;
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    const count = await sql`SELECT COUNT(*)::int AS n, COALESCE(MAX(position), 0)::int AS last FROM page_sponsors WHERE user_page_id = ${owned.value}`;
    if (count.rows[0].n >= SPONSOR_MAX_COUNT) return { ok: false, error: `You can add up to ${SPONSOR_MAX_COUNT} sponsors.` };
    const result = await sql<Sponsor>`
      INSERT INTO page_sponsors (user_page_id, image_url, image_bg, description, position)
      VALUES (${owned.value}, ${input.value.imageUrl}, ${input.value.imageBg}, ${input.value.description}, ${count.rows[0].last + 1})
      RETURNING id, user_page_id, image_url, image_bg, description, position
    `;
    revalidatePath('/', 'layout');
    return { ok: true, value: result.rows[0] };
  } catch (error) {
    console.error('Failed to add sponsor:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

export async function updateSponsor(
  pageId: number,
  sponsorId: string,
  data: SponsorInput,
): Promise<PlusResult<Sponsor>> {
  if (typeof sponsorId !== 'string' || !UUID_RE.test(sponsorId)) return { ok: false, error: 'Sponsor not found.' };
  const input = cleanSponsorInput(data);
  if (!input.ok) return input;
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    const result = await sql<Sponsor>`
      UPDATE page_sponsors SET image_url = ${input.value.imageUrl}, image_bg = ${input.value.imageBg}, description = ${input.value.description}
      WHERE id = ${sponsorId} AND user_page_id = ${owned.value}
      RETURNING id, user_page_id, image_url, image_bg, description, position
    `;
    if (!result.rows[0]) return { ok: false, error: 'Sponsor not found.' };
    revalidatePath('/', 'layout');
    return { ok: true, value: result.rows[0] };
  } catch (error) {
    console.error('Failed to update sponsor:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

export async function deleteSponsor(pageId: number, sponsorId: string): Promise<PlusResult<null>> {
  if (typeof sponsorId !== 'string' || !UUID_RE.test(sponsorId)) return { ok: false, error: 'Sponsor not found.' };
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    await sql`DELETE FROM page_sponsors WHERE id = ${sponsorId} AND user_page_id = ${owned.value}`;
    revalidatePath('/', 'layout');
    return { ok: true, value: null };
  } catch (error) {
    console.error('Failed to delete sponsor:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

// Saves a new sponsor order: `orderedIds` is every sponsor id, first to last.
export async function reorderSponsors(pageId: number, orderedIds: string[]): Promise<PlusResult<null>> {
  if (!Array.isArray(orderedIds) || orderedIds.length > SPONSOR_MAX_COUNT || !orderedIds.every((id) => typeof id === 'string' && UUID_RE.test(id))) {
    return { ok: false, error: 'Couldn’t reorder the sponsors.' };
  }
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    await sql.query(
      `UPDATE page_sponsors s SET position = o.ord
       FROM unnest($1::uuid[]) WITH ORDINALITY AS o(id, ord)
       WHERE s.id = o.id AND s.user_page_id = $2`,
      [orderedIds, owned.value],
    );
    revalidatePath('/', 'layout');
    return { ok: true, value: null };
  } catch (error) {
    console.error('Failed to reorder sponsors:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

// Saves the registry section (Plus): the registry link, an optional button
// label and a free-text message. Empty fields are cleared.
export async function saveRegistry(
  pageId: number,
  data: { link: string; buttonText: string; message: string },
): Promise<PlusResult<{ link: string; buttonText: string; message: string }>> {
  const link = normalizeRegistryLink(typeof data?.link === 'string' ? data.link : '');
  if (link && !isRegistryLink(link)) return { ok: false, error: 'Please enter a valid link, starting with https://' };
  const buttonText = (typeof data?.buttonText === 'string' ? data.buttonText : '').replace(/\s+/g, ' ').trim().slice(0, REGISTRY_BUTTON_TEXT_MAX);
  const message = (typeof data?.message === 'string' ? data.message : '').replace(/\r\n/g, '\n').trim().slice(0, REGISTRY_MESSAGE_MAX);
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    await sql`
      UPDATE user_page SET
        section_2_button_link = ${link || null},
        section_2_button_text = ${buttonText || null},
        section_2_description = ${message || null}
      WHERE id = ${owned.value}
    `;
    revalidatePath('/', 'layout');
    return { ok: true, value: { link, buttonText, message } };
  } catch (error) {
    console.error('Failed to save registry:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

// Plus: the live stream section. The link (or embed code, of which only the
// iframe src is kept), how to show it, an optional button label and message —
// each stored as a page setting. Empty values remove the setting.
export async function saveLivestream(
  pageId: number,
  data: { url: string; display: LivestreamDisplay; buttonText: string; message: string },
): Promise<PlusResult<{ url: string; display: LivestreamDisplay; buttonText: string; message: string }>> {
  const url = normalizeLivestreamInput(typeof data?.url === 'string' ? data.url : '');
  if (url && !isLivestreamLink(url)) return { ok: false, error: 'Please enter a valid link, starting with https://' };
  const display: LivestreamDisplay = data?.display === 'link' ? 'link' : 'embed';
  const buttonText = (typeof data?.buttonText === 'string' ? data.buttonText : '').replace(/\s+/g, ' ').trim().slice(0, LIVESTREAM_BUTTON_TEXT_MAX);
  const message = (typeof data?.message === 'string' ? data.message : '').replace(/\r\n/g, '\n').trim().slice(0, LIVESTREAM_MESSAGE_MAX);
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    const values: [string, string][] = [
      [LIVESTREAM_SETTINGS.url, url],
      [LIVESTREAM_SETTINGS.display, display],
      [LIVESTREAM_SETTINGS.buttonText, buttonText],
      [LIVESTREAM_SETTINGS.message, message],
    ];
    for (const [name, value] of values) {
      if (value) {
        await sql`
          INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
          VALUES (${owned.value}, ${name}, ${value})
          ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = ${value}, updated_at = NOW()
        `;
      } else {
        await sql`DELETE FROM user_page_settings WHERE user_page_id = ${owned.value} AND setting_name = ${name}`;
      }
    }
    revalidatePath('/', 'layout');
    return { ok: true, value: { url, display, buttonText, message } };
  } catch (error) {
    console.error('Failed to save live stream:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

// Plus: password protection for an event page. Turning it on needs a
// password (a new one, or one saved before); changing the password signs
// every guest out of the page (their access cookie is tied to the hash).
export async function savePagePassword(
  pageId: number,
  data: { enabled: boolean; password?: string },
): Promise<PlusResult<{ enabled: boolean; hasPassword: boolean }>> {
  const password = typeof data?.password === 'string' ? data.password : '';
  if (password && (password.length < PAGE_PASSWORD_MIN || password.length > PAGE_PASSWORD_MAX)) {
    return { ok: false, error: `Use a password of ${PAGE_PASSWORD_MIN} to ${PAGE_PASSWORD_MAX} characters.` };
  }
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    const upsert = (name: string, value: string) => sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      VALUES (${owned.value}, ${name}, ${value})
      ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = ${value}, updated_at = NOW()
    `;
    if (password) await upsert('page_password_hash', await bcrypt.hash(password, 10));
    const existing = await sql`SELECT 1 FROM user_page_settings WHERE user_page_id = ${owned.value} AND setting_name = 'page_password_hash' AND setting_value <> ''`;
    const hasPassword = existing.rows.length > 0;
    if (data?.enabled && !hasPassword) return { ok: false, error: 'Set a password to turn protection on.' };
    await upsert('password_protect', data?.enabled ? 'true' : 'false');
    revalidatePath('/', 'layout');
    return { ok: true, value: { enabled: !!data?.enabled, hasPassword } };
  } catch (error) {
    console.error('Failed to save page password:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

// Plus: the host removes one potluck entry.
export async function deletePotluckEntry(pageId: number, entryId: number): Promise<PlusResult<null>> {
  if (!Number.isInteger(entryId) || entryId <= 0) return { ok: false, error: 'Entry not found.' };
  try {
    const owned = await ownedPlusPageId(pageId);
    if (!owned.ok) return owned;
    await sql`DELETE FROM page_potluck WHERE id = ${entryId} AND user_page_id = ${owned.value}`;
    revalidatePath('/', 'layout');
    return { ok: true, value: null };
  } catch (error) {
    console.error('Failed to delete potluck entry:', error);
    return { ok: false, error: GENERIC_PLUS_ERROR };
  }
}

// Saves the owner's own text for one section heading (see section-text.ts).
// An empty value removes it so the theme's default shows again. Returns what
// was saved, or null when nothing was.
export async function updateSectionText(pageId: number, key: string, raw: string): Promise<string | null> {
  if (!isSectionTextKey(key)) return null;
  const value = raw.replace(/\s+/g, ' ').trim().slice(0, SECTION_TEXT_MAX_LENGTH);
  const settingName = sectionTextSettingName(key);
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return null;
  try {
    if (value) {
      const res = await sql`
        INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
        SELECT id, ${settingName}::text, ${value}::text FROM user_page WHERE id = ${pid} AND user_id = ${userId}
        ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = ${value}, updated_at = NOW()
      `;
      if (!res.rowCount) return null;
    } else {
      await sql`
        DELETE FROM user_page_settings
        WHERE setting_name = ${settingName}
          AND user_page_id IN (SELECT id FROM user_page WHERE id = ${pid} AND user_id = ${userId})
      `;
    }
    revalidatePath('/', 'layout');
    return value;
  } catch (error) {
    console.error('Failed to update section text:', error);
    return null;
  }
}

// Event Reminders (Plus). Saves which lead times are ticked and the owner's
// personal note; the daily cron job (app/lib/reminder-send.ts) does the sending.
export async function saveReminderSettings(
  pageId: number,
  data: { schedule: string[]; message: string },
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return { ok: false, error: 'Not signed in.' };
  const schedule = parseReminderSchedule(data.schedule.join(',')).join(',');
  const message = (data.message ?? '').trim().slice(0, REMINDER_MESSAGE_MAX_LENGTH);
  try {
    const page = await sql`SELECT id, plan_type FROM user_page WHERE id = ${pid} AND user_id = ${userId}`;
    if (!page.rows[0]) return { ok: false, error: 'Page not found.' };
    if (page.rows[0].plan_type !== 'paid') return { ok: false, error: 'Event Reminders are a Plus feature.' };
    await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      VALUES (${pid}, 'reminder_schedule', ${schedule}), (${pid}, 'reminder_message', ${message})
      ON CONFLICT (user_page_id, setting_name) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
    `;
    return { ok: true };
  } catch (error) {
    console.error('Failed to save reminder settings:', error);
    return { ok: false, error: 'Couldn’t save. Please try again.' };
  }
}

// Sends one sample reminder to the signed-in owner, using the unsaved note
// from the form so they can check it before saving. Limited to 5 an hour.
export async function sendTestReminder(pageId: number, message: string): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  const pid = parsePageId(pageId);
  if (!userId || !email || pid === null) return { ok: false, message: 'Not signed in.' };
  const limitKey = `reminder-test:${userId}`;
  if (await isRateLimited(limitKey, 5)) return { ok: false, message: 'You’ve sent 5 tests in the last hour. Please try again later.' };
  const page = await fetchOwnedPage(userId, pid);
  if (!page) return { ok: false, message: 'Page not found.' };
  if (page.plan_type !== 'paid') return { ok: false, message: 'Event Reminders are a Plus feature.' };
  await recordAttempt(limitKey, 60 * 60 * 1000);
  const { subject, html } = reminderEmail({
    page,
    reminderKey: '1w',
    message: message.slice(0, REMINDER_MESSAGE_MAX_LENGTH),
    guestName: session.user?.name?.split(/\s+/)[0],
    unsubscribeLink: `${siteUrl()}/unsubscribe`,
  });
  try {
    await sendMail({ to: email, subject: `[Test] ${subject}`, html });
    return { ok: true, message: `Test sent to ${email}.` };
  } catch (error) {
    console.error('Failed to send test reminder:', error);
    return { ok: false, message: 'Couldn’t send the test. Please try again.' };
  }
}

export type EventProgramItemInput = {
  eventDate: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
};

// HTML time/text inputs send "" when left blank, not null — and Postgres
// rejects "" for a TIME column ("invalid input syntax for type time").
// Treat any blank string as "no value" everywhere we touch these columns.
function emptyToNull(value?: string | null): string | null {
  return value && value.trim() !== '' ? value : null;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function addEventProgramItem(pageId: number, data: EventProgramItemInput): Promise<EventProgramItem | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  const name = data.name?.trim();
  // Validate at the trust boundary — this is a server action, reachable
  // directly by any authenticated client, not just our own form.
  if (!userId || pid === null || !name || !ISO_DATE_RE.test(data.eventDate)) return null;
  try {
    // The SELECT only returns a row when the page belongs to this user.
    const result = await sql<EventProgramItem>`
      INSERT INTO event_program (user_page_id, event_date, name, start_time, end_time, location)
      SELECT id, ${data.eventDate}::date, ${name}, ${emptyToNull(data.startTime)}, ${emptyToNull(data.endTime)}, ${emptyToNull(data.location)}
      FROM user_page WHERE id = ${pid} AND user_id = ${userId}
      RETURNING *
    `;
    revalidatePath('/', 'layout');
    return result.rows[0] ? normalizeEventProgramItem(result.rows[0]) : null;
  } catch (error) {
    console.error('Failed to add event program item:', error);
    return null;
  }
}

export async function updateEventProgramItem(id: number, pageId: number, data: EventProgramItemInput): Promise<EventProgramItem | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  const name = data.name?.trim();
  if (!userId || pid === null || !name || !ISO_DATE_RE.test(data.eventDate)) return null;
  try {
    const result = await sql<EventProgramItem>`
      UPDATE event_program SET
        event_date = ${data.eventDate}::date,
        name       = ${name},
        start_time = ${emptyToNull(data.startTime)},
        end_time   = ${emptyToNull(data.endTime)},
        location   = ${emptyToNull(data.location)}
      WHERE id = ${id} AND user_page_id IN (SELECT id FROM user_page WHERE id = ${pid} AND user_id = ${userId})
      RETURNING *
    `;
    revalidatePath('/', 'layout');
    return result.rows[0] ? normalizeEventProgramItem(result.rows[0]) : null;
  } catch (error) {
    console.error('Failed to update event program item:', error);
    return null;
  }
}

export async function deleteEventProgramItem(id: number, pageId: number): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return false;
  try {
    const result = await sql`
      DELETE FROM event_program
      WHERE id = ${id} AND user_page_id IN (SELECT id FROM user_page WHERE id = ${pid} AND user_id = ${userId})
    `;
    revalidatePath('/', 'layout');
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Failed to delete event program item:', error);
    return false;
  }
}

export async function updateBannerImage(pageId: number, url: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`UPDATE user_page SET banner_image = ${url} WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update banner image:', error);
  }
}

// Clears the uploaded banner so the page shows its theme's default hero again.
export async function resetBannerImage(pageId: number): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return false;
  try {
    const res = await sql`UPDATE user_page SET banner_image = NULL WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
    return !!res.rowCount;
  } catch (error) {
    console.error('Failed to reset banner image:', error);
    return false;
  }
}

export async function updateEventDateTime(pageId: number, data: {
  date?: string;
  time?: string;
  city?: string;
  country?: string;
  // Optional fields the owner can also clear: undefined = leave as is,
  // '' = remove, otherwise the new value.
  endDate?: string;
  endTime?: string;
  // The venue's full address from the editor. When present it replaces all of
  // these fields (a blank one is cleared); undefined leaves the address alone.
  address?: {
    venueName: string;
    streetAddress: string;
    unitNumber: string;
    postalCode: string;
    placeId: string;
    formattedAddress: string;
  };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  if (data.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) return;
  if (data.endTime && !/^\d{2}:\d{2}$/.test(data.endTime)) return;
  const setEndDate = data.endDate !== undefined;
  const setEndTime = data.endTime !== undefined;
  const endDate = data.endDate || null;
  const endTime = data.endTime || null;
  const setAddress = data.address !== undefined;
  const addr = (v: string | undefined) => v?.trim() || null;
  try {
    // The end-date check sits in WHERE so an end before the (new or existing)
    // start date rejects the whole save rather than storing a bad range.
    await sql`
      UPDATE user_page SET
        event_date     = COALESCE(${data.date ?? null}, event_date),
        event_time     = COALESCE(${data.time ?? null}, event_time),
        city           = COALESCE(${data.city ?? null}, city),
        country        = COALESCE(${data.country ?? null}, country),
        event_end_date = CASE WHEN ${setEndDate} THEN ${endDate}::date ELSE event_end_date END,
        event_end_time = CASE WHEN ${setEndTime} THEN ${endTime} ELSE event_end_time END,
        venue_name        = CASE WHEN ${setAddress} THEN ${addr(data.address?.venueName)} ELSE venue_name END,
        street_address    = CASE WHEN ${setAddress} THEN ${addr(data.address?.streetAddress)} ELSE street_address END,
        unit_number       = CASE WHEN ${setAddress} THEN ${addr(data.address?.unitNumber)} ELSE unit_number END,
        postal_code       = CASE WHEN ${setAddress} THEN ${addr(data.address?.postalCode)} ELSE postal_code END,
        place_id          = CASE WHEN ${setAddress} THEN ${addr(data.address?.placeId)} ELSE place_id END,
        formatted_address = CASE WHEN ${setAddress} THEN ${addr(data.address?.formattedAddress)} ELSE formatted_address END
      WHERE id = ${pid} AND user_id = ${userId}
        AND (${endDate}::date IS NULL OR ${endDate}::date >= COALESCE(${data.date ?? null}::date, event_date))
    `;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update event date/time:', error);
  }
}

export async function addGalleryImage(pageId: number, data: { imagePath: string; imageName: string; imageType: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    const page = await sql`SELECT id, plan_type FROM user_page WHERE id = ${pid} AND user_id = ${userId}`;
    const ownedPageId = page.rows[0]?.id;
    if (!ownedPageId) return;
    const maxImages = page.rows[0]?.plan_type === 'paid' ? 100 : 8;
    const count = await sql`SELECT COUNT(*) FROM event_gallery WHERE user_page_id = ${ownedPageId}`;
    if (Number(count.rows[0].count) >= maxImages) return;
    await sql`
      INSERT INTO event_gallery (user_page_id, image_path, image_name, image_type)
      VALUES (${ownedPageId}, ${data.imagePath}, ${data.imageName}, ${data.imageType})
    `;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to add gallery image:', error);
  }
}

export async function deleteGalleryImage(imageId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  try {
    await sql`
      DELETE FROM event_gallery
      WHERE id = ${imageId}
      AND user_page_id IN (SELECT id FROM user_page WHERE user_id = ${userId})
    `;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to delete gallery image:', error);
  }
}

export async function saveDomain(pageId: number, domain: string): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Not authenticated.' };
  const pid = parsePageId(pageId);
  if (pid === null) return { error: 'Invalid page.' };

  // Confirm the page is theirs before touching the Vercel project.
  const owned = await sql`SELECT id FROM user_page WHERE id = ${pid} AND user_id = ${userId}`;
  if (!owned.rows[0]) return { error: 'Page not found.' };

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(clean)) {
    return { error: 'Invalid domain format.' };
  }

  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!projectId || !token) return { error: 'Vercel API not configured.' };

  const qs = teamId ? `?teamId=${teamId}` : '';
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains${qs}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: clean }),
  });
  if (!res.ok && res.status !== 409) {
    const body = await res.json().catch(() => ({}));
    return { error: body?.error?.message || 'Failed to add domain to Vercel.' };
  }

  try {
    await sql`
      UPDATE user_page
      SET custom_domain = ${clean}, domain_status = 'pending'
      WHERE id = ${pid} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Failed to save domain:', error);
    return { error: 'Could not save the domain. Please try again.' };
  }

  revalidatePath('/dashboard/domain');
  return {};
}

// Owner-facing deactivate/reactivate — separate from the admin version
// (api/admin/pages/[id]/status), which any super admin can use on any page.
// This one only ever touches a page the signed-in user owns.
export async function setPageStatus(pageId: number, status: 'active' | 'inactive'): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Not authenticated.' };
  const pid = parsePageId(pageId);
  if (pid === null) return { error: 'Invalid page.' };

  const result = await sql`
    UPDATE user_page SET status = ${status}, status_changed_at = NOW()
    WHERE id = ${pid} AND user_id = ${userId}
    RETURNING id
  `;
  if (!result.rows[0]) return { error: 'Page not found.' };
  revalidatePath(`/dashboard/pages/${pid}`);
  return {};
}

export async function removeDomain(pageId: number): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Not authenticated.' };
  const pid = parsePageId(pageId);
  if (pid === null) return { error: 'Invalid page.' };

  const result = await sql`SELECT custom_domain FROM user_page WHERE id = ${pid} AND user_id = ${userId}`;
  const domain = result.rows[0]?.custom_domain;
  if (!domain) return {};

  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!projectId || !token) return { error: 'Vercel API not configured.' };

  const qs = teamId ? `?teamId=${teamId}` : '';
  await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains/${domain}${qs}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  await sql`UPDATE user_page SET custom_domain = NULL, domain_status = 'pending' WHERE id = ${pid} AND user_id = ${userId}`;
  revalidatePath('/dashboard/domain');
  return {};
}

export async function updateHeroEyebrow(pageId: number, eyebrow: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`UPDATE user_page SET hero_eyebrow = ${eyebrow} WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update hero eyebrow:', error);
  }
}

export async function updateContactInfo(pageId: number, email: string, phone: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`
      UPDATE user_page
      SET user_email = ${email.trim() || null}, user_phone = ${phone.trim() || null}
      WHERE id = ${pid} AND user_id = ${userId}
    `;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update contact info:', error);
  }
}

export async function updateTheme(pageId: number, themeId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const pid = parsePageId(pageId);
  if (!userId || pid === null) return;
  try {
    await sql`UPDATE user_page SET theme_id = ${themeId} WHERE id = ${pid} AND user_id = ${userId}`;
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to update theme:', error);
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    '127.0.0.1';
  const rateLimitKey = `login:${ip}`;

  // Read-only here — the real increment happens once, inside auth.ts's
  // authorize(), which is also reachable directly via the NextAuth API route
  // and so is the actual enforcement point. This check only gives a nicer
  // message for the form path without double-counting the attempt.
  if (await isRateLimited(rateLimitKey, MAX_LOGIN_ATTEMPTS)) {
    return 'Too many login attempts. Please try again in 15 minutes.';
  }

  try {
    await signIn('credentials', { ...Object.fromEntries(formData), redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // Successful login triggers a redirect — clear the attempt counter
    await clearRateLimit(rateLimitKey);
    throw error;
  }
}


export async function GoogleSignIn() {
  await signIn("google", { redirectTo: '/dashboard' });
}

export async function AppleSignIn() {
  await signIn("apple", { redirectTo: '/dashboard' });
}

export async function FacebookSignIn() {
  await signIn("facebook", { redirectTo: '/dashboard' });
}





const RegisterSchema = z.object({
  given_name: z.string().min(1, { message: 'Please enter your first name.' }),
  family_name: z.string().min(1, { message: 'Please enter your last name.' }),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: passwordRule,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export type RegisterState = {
  errors?: {
    given_name?: string[];
    family_name?: string[];
    phone?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

export async function registerUser(prevState: RegisterState, formData: FormData) {
  // Mass sign-ups (and the verification emails they send) are capped per IP.
  if (await overRateLimit(`register:${clientIp(await headers())}`, 5, 60 * 60 * 1000)) {
    return { message: 'Too many sign-ups from this connection. Please try again later.' };
  }
  const validatedFields = RegisterSchema.safeParse({
    given_name: formData.get('given_name'),
    family_name: formData.get('family_name'),
    phone: (formData.get('phone') as string) || undefined,
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    };
  }

  const { given_name, family_name, phone, email, password } = validatedFields.data;

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.rows.length > 0) {
      return {
        errors: { email: ['An account with this email already exists.'] },
        message: 'An account with this email already exists.',
      };
    }
  } catch (error) {
    console.error('Sign-up lookup failed:', error);
    return { message: 'Something went wrong. Please try again.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const name = `${given_name} ${family_name}`;
  const date = new Date().toISOString().split('T')[0];

  let newUserId: string | undefined;
  try {
    const result = await sql`
      INSERT INTO users (name, email, password, date, given_name, family_name, provider, provider_id, picture, phone)
      VALUES (${name}, ${email}, ${hashedPassword}, ${date}, ${given_name}, ${family_name}, 'credentials', '', '', ${phone || ''})
      RETURNING id
    `;
    newUserId = result.rows[0]?.id;
  } catch (error) {
    console.error('Failed to create account:', error);
    return { message: 'Something went wrong creating your account. Please try again.' };
  }

  if (newUserId) {
    try {
      const token = await createToken('email_verification_tokens', newUserId, EMAIL_VERIFICATION_TTL_MS);
      const link = `${siteUrl()}/api/verify-email?token=${token}`;
      await sendMail({ to: email, subject: 'Confirm your email address for MyGala', html: verificationEmailHtml(link, given_name) });
    } catch (error) {
      // Don't block account creation on a mail failure — the dashboard
      // banner's resend button covers this.
      console.error('Failed to send verification email:', error);
    }
  }

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}
export type EventTheme = {
  theme_id: string;
  name: string;
  description: string;
  slug: string;
};

export type UserPage = {
  id: string;
  user_id: string;
  slug: string;
  banner_image: string;
  heading: string;
  main_content: string;
  event_date: string;
  location: string;
  user_email: string;
  description: string;
  created_at: string;
  url: string;
  street_address: string;
  unit_number: string;
  postal_code: string;
  city: string;
  country: string;
  place_id?: string;
  formatted_address?: string;
  event_time?: string;
  event_end_date?: string; // optional; YYYY-MM-DD
  event_end_time?: string; // optional; HH:MM
  event_type?: string;
  theme_id?: string;
  theme_slug?: string;
  section_2_image?: string;
  section_2_description?: string;
  section_2_button_text?: string;
  section_2_button_link?: string;
  custom_domain?: string;
  domain_status?: string;
  plan_type?: string;
  plan_expires_at?: string; // one-time-payment paid pages: 15 months from purchase; null = no expiry (legacy/multi-page)
  status?: string; // 'active' | 'inactive' — inactive pages are hidden from guests
  status_changed_at?: string; // when status last changed (starts the offline-retention clock)
  stripe_customer_id?: string;
  hero_eyebrow?: string;
  venue_name?: string;
  language?: string;
  user_phone?: string;
};

export type DBUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  given_name: string;
  family_name: string;
  provider: string;
  provider_id: string;
  picture: string;
  phone?: string;
  email_verified_at?: string | null;
  totp_enabled_at?: string | null;
  password_changed_at?: string | null;
};

export type GalleryImage = {
  id: string;
  user_page_id: number;
  image_path: string;
  image_name: string;
  image_type: string;
  created_at: string;
};

export type Guest = {
  id: string;
  user_page_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  status: 'invited' | 'attending' | 'not_attending';
  guests: number;
  receive_updates: boolean;
  message: string | null;
  created_at: string;
  responded_at: string | null;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type Slugs = {
  slug: string;
}

export type GuestPhoto = {
  id: string;
  user_page_id: number;
  photo: string;
  ip_address: string | null;
  uploaded_at: string;
};

export type GuestSong = {
  id: string;
  user_page_id: number;
  requester_name: string;
  song_title: string;
  artist: string;
  ip_address: string | null;
  created_at: string;
};

export type EventProgramItem = {
  id: string;
  user_page_id: number;
  event_date: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
};

// Plus: owner-written sections (see app/lib/custom-sections.ts).
export type CustomSectionBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string };

export type CustomSection = {
  position: number; // 1..3, the order on the page
  title: string; // optional; '' hides the heading
  blocks: CustomSectionBlock[];
};

export type Sponsor = {
  id: string;
  user_page_id: number;
  image_url: string | null;
  image_bg: string | null; // '#RRGGBB' behind the image (for transparent logos), or none
  description: string | null;
  position: number;
};

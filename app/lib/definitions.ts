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
  stripe_customer_id?: string;
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
};

export type GalleryImage = {
  id: string;
  user_page_id: number;
  image_path: string;
  image_name: string;
  image_type: string;
  created_at: string;
};

export type Rsvp = {
  id: string;
  user_page_id: number;
  name: string;
  email: string;
  phone: string | null;
  guests: number;
  status: 'attending' | 'not_attending';
  receive_updates: boolean;
  message: string | null;
  created_at: string;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type Slugs = {
  slug: string;
}

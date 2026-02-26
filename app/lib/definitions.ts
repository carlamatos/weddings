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

export type Revenue = {
  month: string;
  revenue: number;
};

export type Slugs = {
  slug: string;
}

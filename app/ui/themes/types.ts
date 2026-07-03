export interface ThemePreviewProps {
  heading: string;
  eventDate?: string;
  city?: string;
  country?: string;
  bannerImage?: string;
}

export interface ThemeSlots {
  heroBg?: React.ReactNode;
  heroEyebrow?: React.ReactNode;
  heroName?: React.ReactNode;
  heroDate?: React.ReactNode;
  description?: React.ReactNode;
  gallery?: React.ReactNode;
}

export interface ThemeProps {
  heading: string;
  userPageId?: string;
  galleryImages?: import('@/app/lib/definitions').GalleryImage[];
  editSlots?: ThemeSlots;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  city?: string;
  country?: string;
  streetAddress?: string;
  unitNumber?: string;
  postalCode?: string;
  formattedAddress?: string;
  placeId?: string;
  url?: string;
  bannerImage?: string;
  userEmail?: string;
  mapsKey?: string;
  registryImage?: string;
  registryDescription?: string;
  registryButtonText?: string;
  registryButtonLink?: string;
  heroEyebrow?: string;
}

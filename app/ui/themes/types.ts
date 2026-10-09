export type EventCategory = 'wedding' | 'birthdays' | 'business' | 'community';

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
  footerContact?: React.ReactNode;
}

export interface ThemeProps {
  heading: string;
  userPageId?: string;
  galleryToken?: string;
  galleryImages?: import('@/app/lib/definitions').GalleryImage[];
  editSlots?: ThemeSlots;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
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
  venueName?: string;
  language?: string;
  isPaid?: boolean;
  guestPhotos?: import('@/app/lib/definitions').GuestPhoto[];
  guestPhotosHasMore?: boolean;
  guestSongs?: import('@/app/lib/definitions').GuestSong[];
  guestSongsHasMore?: boolean;
  heroObjectFit?: 'cover' | 'contain';
  heroObjectPosition?: 'top' | 'center' | 'bottom'; // banner's vertical alignment; unset = theme default
  heroOverlay?: import('./hero-overlay').HeroOverlaySettings; // colour wash between banner photo and text; unset = none
  userPhone?: string;
  eventProgram?: import('@/app/lib/definitions').EventProgramItem[];
  showEventProgram?: boolean;
  showSongRequests?: boolean;
  showGuestPhotos?: boolean;
  showRsvp?: boolean;
  showShare?: boolean;
  shareHashtag?: string; // normalized, no leading '#'
  shareUrl?: string; // public URL the share buttons send
  sectionText?: import('@/app/lib/section-text').SectionText; // owner's custom section eyebrows/titles
  // Plus only, already filtered by the page: switched on and non-empty.
  customSections?: import('@/app/lib/definitions').CustomSection[];
  sponsors?: import('@/app/lib/definitions').Sponsor[];
  livestream?: import('@/app/lib/livestream').Livestream;
  potluck?: import('@/app/lib/potluck').PotluckProps; // Plus, off by default
  giftExchange?: import('@/app/lib/gift-exchange').GiftExchangeProps; // Plus, off by default
  sectionTextPageId?: number; // editor only: makes those headings editable in place

  isLoggedIn?: boolean;
  // Showcase preview (/themes/<slug>): sample content, forms shown but not
  // submittable, and a "Back to themes" link in the top bar.
  demo?: boolean;
}

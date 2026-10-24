import {
  Cinzel, Cormorant_Garamond, Creepster, Dancing_Script, Fredoka, Josefin_Sans, Lato,
  Libre_Baskerville, Montserrat, Parisienne, Playfair_Display, Poppins, Space_Grotesk,
} from 'next/font/google';
import type { InvitationFont } from '@/app/lib/invitation';
import { greatVibes } from '@/app/ui/fonts';

// The invitation fonts for the invitation landing pages, served from our own
// domain by next/font instead of Google Fonts: no render-blocking stylesheet
// from another site, and the font files are cached for a year. The banner
// invitations' fonts are preloaded, so the first card shows in its own
// letters from the start instead of jumping from a stand-in font: Cormorant
// and Lato (weddings), Great Vibes (the logo's own, already preloaded) and
// Cormorant (Christmas). The rest download once the page's first layout shows
// text in them, well before the gallery scrolls into view. The card uses
// these names in place of the Google family names (InvitationCard's `fonts`).
// Variable fonts take no weight list.
// Each call's options are written out: next/font reads them at build time.

const parisienne = Parisienne({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
const dancingScript = Dancing_Script({ subsets: ['latin'], display: 'swap', preload: false });
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', preload: false });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', preload: true, weight: ['400', '600'] });
const cinzel = Cinzel({ subsets: ['latin'], display: 'swap', preload: false });
const libreBaskerville = Libre_Baskerville({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '700'] });
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', preload: false });
const josefin = Josefin_Sans({ subsets: ['latin'], display: 'swap', preload: false });
const lato = Lato({ subsets: ['latin'], display: 'swap', preload: true, weight: ['400', '700'] });
const poppins = Poppins({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '600'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', preload: false });
const fredoka = Fredoka({ subsets: ['latin'], display: 'swap', preload: false });
const creepster = Creepster({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });

export const LANDING_INVITATION_FONTS: Record<InvitationFont, string> = {
  'great-vibes': greatVibes.style.fontFamily,
  'parisienne': parisienne.style.fontFamily,
  'dancing-script': dancingScript.style.fontFamily,
  'playfair': playfair.style.fontFamily,
  'cormorant': cormorant.style.fontFamily,
  'cinzel': cinzel.style.fontFamily,
  'libre-baskerville': libreBaskerville.style.fontFamily,
  'montserrat': montserrat.style.fontFamily,
  'josefin': josefin.style.fontFamily,
  'lato': lato.style.fontFamily,
  'poppins': poppins.style.fontFamily,
  'space-grotesk': spaceGrotesk.style.fontFamily,
  'fredoka': fredoka.style.fontFamily,
  'creepster': creepster.style.fontFamily,
};

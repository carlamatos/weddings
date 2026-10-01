import type { ComponentType } from 'react';
import type { ThemeProps, ThemePreviewProps, EventCategory } from './types';

import QuietCoastal, { HeroPreview as QCPreview } from './QuietCoastal';
import MidnightBotanical, { HeroPreview as MBPreview } from './MidnightBotanical';
import TerracottaHarvest, { HeroPreview as TCPreview, TerracottaDefaultHero } from './TerracottaHarvest';
import Vilma, { HeroPreview as VLPreview } from './Vilma';
import Summit, { HeroPreview as SummitPreview } from './Summit';
import Alegria, { HeroPreview as AlegriaPreview } from './Alegria';
import FunParty, { HeroPreview as FunPartyPreview } from './FunParty';
import Nexus, { HeroPreview as NexusPreview } from './Nexus';
import Balloons, { HeroPreview as BalloonsPreview } from './Balloons';
import DinnerGala, { HeroPreview as DinnerGalaPreview } from './DinnerGala';
import Community, { HeroPreview as CommunityPreview } from './Community';
import AntiqueCars, { HeroPreview as AntiqueCarsPreview } from './AntiqueCars';
import BabyShowerGirl, { HeroPreview as BabyShowerGirlPreview } from './BabyShowerGirl';
import BabyShowerNeutral, { HeroPreview as BabyShowerNeutralPreview } from './BabyShowerNeutral';
import BabyShowerBoy, { HeroPreview as BabyShowerBoyPreview } from './BabyShowerBoy';
import TheDay, { HeroPreview as TheDayPreview } from './TheDay';
import Love, { HeroPreview as LovePreview } from './Love';

// ─────────────────────────────────────────────────────────
// Theme registry — to add a new theme:
//   1. Create app/ui/themes/YourTheme.tsx
//      - default export: full-page component (ThemeProps)
//      - named export `HeroPreview`: dashboard card preview (ThemePreviewProps)
//      - optional named export `YourThemeDefaultHero`: hero background shown
//        when there's no uploaded banner AND no entry in hero-defaults.ts
//   2. Add one entry below with its category (drives the setup wizard's
//      category picker — see app/ui/subscribe-form.tsx) and display label
// ─────────────────────────────────────────────────────────

export interface ThemeEntry {
  Page: ComponentType<ThemeProps>;
  Preview: ComponentType<ThemePreviewProps>;
  category: EventCategory;
  label: string;
  FallbackHero?: ComponentType;
}

export const themeRegistry: Record<string, ThemeEntry> = {
  'quiet-coastal':      { Page: QuietCoastal,      Preview: QCPreview,      category: 'wedding',     label: 'Quiet Coastal' },
  'midnight-botanical': { Page: MidnightBotanical, Preview: MBPreview,      category: 'wedding',     label: 'Midnight Botanical' },
  'terracotta-harvest': { Page: TerracottaHarvest, Preview: TCPreview,      category: 'wedding',     label: 'Terracotta Harvest', FallbackHero: TerracottaDefaultHero },
  'vilma':              { Page: Vilma,             Preview: VLPreview,     category: 'wedding',     label: 'Vilma' },
  'the-day':            { Page: TheDay,            Preview: TheDayPreview, category: 'wedding',     label: 'The Day' },
  'love':               { Page: Love,              Preview: LovePreview,   category: 'wedding',     label: 'Love' },
  'summit':             { Page: Summit,            Preview: SummitPreview, category: 'business',    label: 'Summit' },
  'alegria':            { Page: Alegria,           Preview: AlegriaPreview, category: 'birthdays',   label: 'Alegría' },
  'fun-party':          { Page: FunParty,          Preview: FunPartyPreview, category: 'birthdays',  label: 'Fun Party' },
  'nexus':              { Page: Nexus,             Preview: NexusPreview,  category: 'business',    label: 'Nexus' },
  'balloons':           { Page: Balloons,          Preview: BalloonsPreview, category: 'birthdays', label: 'Balloons' },
  'dinner-gala':        { Page: DinnerGala,        Preview: DinnerGalaPreview, category: 'business', label: 'Dinner Gala' },
  'community':          { Page: Community,         Preview: CommunityPreview, category: 'community', label: 'Community Day' },
  'antique-cars':       { Page: AntiqueCars,       Preview: AntiqueCarsPreview, category: 'community', label: 'Antique Cars' },
  'baby-shower-girl':   { Page: BabyShowerGirl,    Preview: BabyShowerGirlPreview, category: 'birthdays', label: 'Girl Baby Shower' },
  'baby-shower-neutral': { Page: BabyShowerNeutral, Preview: BabyShowerNeutralPreview, category: 'birthdays', label: 'Neutral Baby Shower' },
  'baby-shower-boy':    { Page: BabyShowerBoy,     Preview: BabyShowerBoyPreview, category: 'birthdays', label: 'Boy Baby Shower' },
};

export const DEFAULT_THEME = 'quiet-coastal';

export function getTheme(slug?: string): ThemeEntry {
  return themeRegistry[slug ?? ''] ?? themeRegistry[DEFAULT_THEME];
}

export function themesByCategory(category: EventCategory): Array<{ slug: string } & ThemeEntry> {
  return Object.entries(themeRegistry)
    .filter(([, entry]) => entry.category === category)
    .map(([slug, entry]) => ({ slug, ...entry }));
}

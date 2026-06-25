import type { ComponentType } from 'react';
import type { ThemeProps, ThemePreviewProps } from './types';

import QuietCoastal, { HeroPreview as QCPreview } from './QuietCoastal';
import MidnightBotanical, { HeroPreview as MBPreview } from './MidnightBotanical';
import TerracottaHarvest, { HeroPreview as TCPreview } from './TerracottaHarvest';

// ─────────────────────────────────────────────────────────
// Theme registry — to add a new theme:
//   1. Create app/ui/themes/YourTheme.tsx
//      - default export: full-page component (ThemeProps)
//      - named export `HeroPreview`: dashboard card preview (ThemePreviewProps)
//   2. Add one entry below
// ─────────────────────────────────────────────────────────

export interface ThemeEntry {
  Page: ComponentType<ThemeProps>;
  Preview: ComponentType<ThemePreviewProps>;
}

export const themeRegistry: Record<string, ThemeEntry> = {
  'quiet-coastal':    { Page: QuietCoastal,    Preview: QCPreview },
  'midnight-botanical': { Page: MidnightBotanical, Preview: MBPreview },
  'terracotta-harvest': { Page: TerracottaHarvest,  Preview: TCPreview },
};

export const DEFAULT_THEME = 'quiet-coastal';

export function getTheme(slug?: string): ThemeEntry {
  return themeRegistry[slug ?? ''] ?? themeRegistry[DEFAULT_THEME];
}

import { getTheme } from './registry';
import type { ThemeProps } from './types';
import { RsvpOptionsProvider } from './rsvp-options';
import SectionBackgrounds from './SectionBackgrounds';
import type { SectionBackgrounds as SectionBgValues } from '@/app/lib/section-background';

interface ThemeRendererProps extends ThemeProps {
  themeSlug?: string;
  // Only guests on the guest list can RSVP (the form says so).
  rsvpGuestListOnly?: boolean;
  // The page's own section backgrounds (app/lib/section-background.ts).
  sectionBackgrounds?: SectionBgValues;
}

export default function ThemeRenderer({ themeSlug, rsvpGuestListOnly = false, sectionBackgrounds, ...props }: ThemeRendererProps) {
  const { Page } = getTheme(themeSlug);
  return (
    <RsvpOptionsProvider guestListOnly={rsvpGuestListOnly}>
      {/* The theme is the first element in here: SectionBackgrounds finds it from its own place, right after. */}
      <div data-mg-theme style={{ display: 'contents' }}>
        <Page {...props} />
      </div>
      {/* Section backgrounds: applied when the page has any; in the editor, also the "Change background" buttons. */}
      {(props.sectionTextPageId || (sectionBackgrounds && Object.keys(sectionBackgrounds).length > 0)) && (
        <SectionBackgrounds values={sectionBackgrounds} pageId={props.sectionTextPageId} />
      )}
    </RsvpOptionsProvider>
  );
}

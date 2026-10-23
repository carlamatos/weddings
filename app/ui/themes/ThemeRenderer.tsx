import { getTheme } from './registry';
import type { ThemeProps } from './types';
import { RsvpOptionsProvider } from './rsvp-options';
import SectionBackgrounds from './SectionBackgrounds';
import { EARLY_STYLE_ID, sectionBackgroundsScript } from './section-backgrounds-early';
import type { SectionBackgrounds as SectionBgValues } from '@/app/lib/section-background';

interface ThemeRendererProps extends ThemeProps {
  themeSlug?: string;
  // Only guests on the guest list can RSVP (the form says so).
  rsvpGuestListOnly?: boolean;
  // The page's own section backgrounds (app/lib/section-background.ts).
  sectionBackgrounds?: SectionBgValues;
  // The owner's colour for the story text (#rrggbb); unset = the theme's.
  storyTextColor?: string;
}

export default function ThemeRenderer({ themeSlug, rsvpGuestListOnly = false, sectionBackgrounds, storyTextColor, ...props }: ThemeRendererProps) {
  const { Page } = getTheme(themeSlug);
  const hasBackgrounds = !!sectionBackgrounds && Object.keys(sectionBackgrounds).length > 0;
  // On the guests' page the backgrounds go on as the page is read (before
  // it's first painted), not after it loads; the editor does it in React.
  const early = hasBackgrounds && !props.sectionTextPageId;
  return (
    <RsvpOptionsProvider guestListOnly={rsvpGuestListOnly}>
      {/* The story text's colour: every theme marks its story paragraph (the editor colours its own). */}
      {storyTextColor && /^#[0-9a-f]{6}$/i.test(storyTextColor) && !props.sectionTextPageId && (
        <style>{`[data-mg-theme] [data-story-text]{color:${storyTextColor}!important;-webkit-text-fill-color:${storyTextColor}!important}`}</style>
      )}
      {/* Filled by the early script below; emptied once SectionBackgrounds has taken over. */}
      {early && <style id={EARLY_STYLE_ID} dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning />}
      {/* The theme is the first element in here: the script and SectionBackgrounds find it from their place, right after. */}
      <div data-mg-theme style={{ display: 'contents' }}>
        <Page {...props} />
      </div>
      {early && <script dangerouslySetInnerHTML={{ __html: sectionBackgroundsScript(sectionBackgrounds!) }} />}
      {/* Section backgrounds: applied when the page has any; in the editor, also the "Change background" buttons. */}
      {(props.sectionTextPageId || hasBackgrounds) && (
        <SectionBackgrounds values={sectionBackgrounds} pageId={props.sectionTextPageId} />
      )}
    </RsvpOptionsProvider>
  );
}

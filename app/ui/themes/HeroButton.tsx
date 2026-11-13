'use client';

import { heroButtonStyle, type HeroButtonKey, type HeroStyle } from './hero-style';
import EditableHeroButton from './EditableHeroButton';
import { useLiveOptions } from './live-options';
import { getTranslations } from '@/app/lib/translations';

// One of the top banner's buttons (RSVP, Our story, Share your photo), with
// the owner's label and colours when set. In the editor (editPageId set) it
// becomes editable in place. On a Live Party page with the messages wall on,
// the photos button's default (when the owner hasn't renamed it) is "Share a
// photo or message", since guests can do both from the photo section.
export default function HeroButton({
  id,
  href,
  className,
  label,
  heroStyle,
  editPageId,
}: {
  id: HeroButtonKey;
  href: string;
  className: string;
  label: string; // the theme's own label, used when the owner hasn't set one
  heroStyle?: HeroStyle;
  editPageId?: number;
}) {
  const { messagesOn, language } = useLiveOptions();
  if (id === 'photos' && messagesOn) label = getTranslations(language).heroPhotosOrMessage;
  const custom = heroStyle?.buttons[id];
  if (editPageId) {
    return <EditableHeroButton pageId={editPageId} id={id} href={href} className={className} defaultLabel={label} initial={custom} />;
  }
  return <a href={href} className={className} style={heroButtonStyle(custom)}>{custom?.label || label}</a>;
}

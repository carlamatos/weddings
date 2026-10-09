import { heroButtonStyle, type HeroButtonKey, type HeroStyle } from './hero-style';
import EditableHeroButton from './EditableHeroButton';

// One of the top banner's buttons (RSVP, Our story, Share your photo), with
// the owner's label and colours when set. In the editor (editPageId set) it
// becomes editable in place.
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
  const custom = heroStyle?.buttons[id];
  if (editPageId) {
    return <EditableHeroButton pageId={editPageId} id={id} href={href} className={className} defaultLabel={label} initial={custom} />;
  }
  return <a href={href} className={className} style={heroButtonStyle(custom)}>{custom?.label || label}</a>;
}

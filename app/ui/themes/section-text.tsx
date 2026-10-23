import type { SectionText as SectionTextValues, SectionTextKey } from '@/app/lib/section-text';
import { EditableSectionText } from './slots';
import { heroTextStyle } from './hero-style';

// What a theme passes to every <SectionText>: the page's custom heading text
// and, in the editor only, the page id that turns each heading into an
// in-place editable field.
export type SectionTextContext = {
  values?: SectionTextValues;
  pageId?: number;
};

// A section eyebrow (<p>), title (<h2>) or other short line that shows the owner's custom text,
// or the theme's default when there is none.
export function SectionText({
  ctx,
  k,
  as = 'p',
  fallback,
  className,
  style,
  icon,
}: {
  ctx?: SectionTextContext;
  k: SectionTextKey;
  as?: 'p' | 'h2';
  fallback: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode; // Nexus puts a small icon before its eyebrows
}) {
  const value = ctx?.values?.[k] ?? '';
  const color = ctx?.values?.colors?.[k] ?? '';
  // Section titles name their section, for the page's own section
  // backgrounds (SectionBackgrounds.tsx finds each section by its title).
  const section = k.endsWith('.title') ? k.slice(0, -'.title'.length) : undefined;
  if (ctx?.pageId) {
    return (
      <EditableSectionText
        pageId={ctx.pageId}
        k={k}
        as={as}
        value={value}
        initialColor={color}
        fallback={fallback}
        className={className}
        style={style}
        icon={icon}
        section={section}
      />
    );
  }
  const Tag = as;
  return <Tag className={className} style={color ? { ...style, ...heroTextStyle(color) } : style} data-section-heading={section}>{icon}{value || fallback}</Tag>;
}

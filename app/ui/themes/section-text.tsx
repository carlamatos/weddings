import type { SectionText as SectionTextValues, SectionTextKey } from '@/app/lib/section-text';
import { EditableSectionText } from './slots';

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
  defaultContent,
}: {
  ctx?: SectionTextContext;
  k: SectionTextKey;
  as?: 'p' | 'h2';
  fallback: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode; // Nexus puts a small icon before its eyebrows
  // Rich default (e.g. text with a link) shown instead of `fallback` while no
  // custom text is set; `fallback` is still what the editor starts from.
  defaultContent?: React.ReactNode;
}) {
  const value = ctx?.values?.[k] ?? '';
  if (ctx?.pageId) {
    return (
      <EditableSectionText
        pageId={ctx.pageId}
        k={k}
        as={as}
        value={value}
        fallback={fallback}
        className={className}
        style={style}
        icon={icon}
        defaultContent={defaultContent}
      />
    );
  }
  const Tag = as;
  return <Tag className={className} style={style}>{icon}{value || (defaultContent ?? fallback)}</Tag>;
}

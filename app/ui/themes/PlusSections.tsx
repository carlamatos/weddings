import type { CustomSection, Sponsor } from '@/app/lib/definitions';

// Rendering for the Plus-only custom sections and sponsors. Each theme wraps
// these in its own section markup and passes its own title class and text
// style, so they pick up the theme's typography and colours.

// The optional title and the text/image blocks of one custom section.
export function CustomSectionContent({
  section,
  titleClassName,
  textStyle,
  textClassName,
  align = 'center',
}: {
  section: CustomSection;
  titleClassName: string;
  textStyle?: React.CSSProperties;
  textClassName?: string;
  align?: 'center' | 'left';
}) {
  const centered = align === 'center';
  return (
    <>
      {section.title && <h2 className={titleClassName}>{section.title}</h2>}
      {section.blocks.map((block, i) =>
        block.type === 'text' ? (
          <p
            key={i}
            className={textClassName}
            style={{
              whiteSpace: 'pre-line',
              maxWidth: 620,
              margin: centered ? '0 auto' : 0,
              ...textStyle,
              ...(i < section.blocks.length - 1 ? { marginBottom: 22 } : {}),
            }}
          >
            {block.text}
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={block.url}
            alt={block.alt ?? ''}
            loading="lazy"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 720,
              height: 'auto',
              borderRadius: 8,
              margin: centered ? '0 auto' : 0,
              marginBottom: i < section.blocks.length - 1 ? 26 : 0,
            }}
          />
        ),
      )}
    </>
  );
}

// A grid of sponsor cards: the logo or photo, then the short description.
export function SponsorGrid({
  sponsors,
  cardStyle,
  textStyle,
  align = 'center',
}: {
  sponsors: Sponsor[];
  cardStyle?: React.CSSProperties; // dark themes pass a translucent card
  textStyle?: React.CSSProperties;
  align?: 'center' | 'left';
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: 18,
        maxWidth: 920,
        margin: align === 'center' ? '8px auto 0' : '8px 0 0',
      }}
    >
      {sponsors.map((s) => (
        <div
          key={s.id}
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 12,
            padding: '22px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            ...cardStyle,
          }}
        >
          {s.image_url && (
            // The owner's background colour sits behind transparent logos.
            <div style={{ width: '100%', borderRadius: 8, background: s.image_bg ?? undefined, padding: s.image_bg ? 14 : 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image_url}
                alt=""
                loading="lazy"
                style={{ display: 'block', width: '100%', height: 110, objectFit: 'contain' }}
              />
            </div>
          )}
          {s.description && (
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line', ...textStyle }}>
              {s.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

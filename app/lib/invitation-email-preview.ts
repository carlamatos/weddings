import { envelopeSvg, isEnvelopeSeal } from './invitation-envelope';
import { findOrnament, ornamentSvg } from './invitation-ornaments';

// The email's envelope and decoration pictures (/api/invitation-envelope,
// /api/invitation-ornament) as SVG drawn into the page, for the preview.
export function inlineEmailPictures(html: string): string {
  const dataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return html.replace(/src="[^"]*\/api\/invitation-(envelope|ornament)\?([^"]*)"/g, (whole, kind: string, query: string) => {
    const p = new URLSearchParams(query.replace(/&amp;/g, '&'));
    const hex = (v: string | null) => (v && /^[0-9a-fA-F]{6}$/.test(v) ? `#${v}` : null);
    if (kind === 'envelope') {
      const color = hex(p.get('c')), sealColor = hex(p.get('s')), seal = p.get('e');
      return color && sealColor && isEnvelopeSeal(seal) ? `src="${dataUri(envelopeSvg({ color, sealColor, seal }, 880))}"` : whole;
    }
    const k = p.get('kind'), color = hex(p.get('color'));
    const ornament = (k === 'divider' || k === 'frame') && color ? findOrnament(k, p.get('id')) : null;
    return ornament && color ? `src="${dataUri(ornamentSvg(k as 'divider' | 'frame', ornament, color, k === 'divider' ? 480 : 1000))}"` : whole;
  });
}

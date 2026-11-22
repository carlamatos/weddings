// The envelope the invitation arrives in (Invitations → Envelope). The email
// shows it sealed (a PNG from /api/invitation-envelope); the guest taps it
// and the opening page (/i/…) breaks the seal, lifts the flap to show the
// liner and slides the card out. Drawn here as SVG so the email picture, the
// opening page and the designer's preview all match. Client-safe: no server
// imports.

export const ENVELOPE_LINERS = ['plain', 'stripes', 'dots', 'confetti', 'leaves'] as const;
export type EnvelopeLiner = (typeof ENVELOPE_LINERS)[number];
export const ENVELOPE_SEALS = ['heart', 'star', 'flower', 'balloon', 'plain'] as const;
export type EnvelopeSeal = (typeof ENVELOPE_SEALS)[number];

export type InvitationEnvelope = {
  on: boolean; // the email shows the sealed envelope; guests open it on MyGala
  color: string; // the envelope paper
  liner: EnvelopeLiner;
  linerColor: string;
  seal: EnvelopeSeal; // the wax seal's emblem
  sealColor: string;
};

export const isEnvelopeLiner = (v: unknown): v is EnvelopeLiner => typeof v === 'string' && (ENVELOPE_LINERS as readonly string[]).includes(v);
export const isEnvelopeSeal = (v: unknown): v is EnvelopeSeal => typeof v === 'string' && (ENVELOPE_SEALS as readonly string[]).includes(v);

// ─── Colour helpers ─────────────────────────────────────

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;

// Towards black (amount < 0) or white (amount > 0), 0–1.
export function shade(hex: string, amount: number): string {
  const target = amount < 0 ? 0 : 255;
  const a = Math.abs(amount);
  return toHex(rgb(hex).map((v) => v + (target - v) * a));
}

export function mix(a: string, b: string, t: number): string {
  const x = rgb(a), y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

export function lightness(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Dark ink on a light colour, white on a dark one.
export const inkOn = (hex: string) => (lightness(hex) > 0.4 ? '#241F2B' : '#FFFFFF');

// ─── The pieces ─────────────────────────────────────────

// The liner: a pattern in the liner colour on a pale tint of it. The tile is
// 40×40 user units, times scale.
export function linerPattern(id: string, liner: EnvelopeLiner, color: string, scale = 1): string {
  const paper = liner === 'plain' ? color : mix(color, '#FFFFFF', 0.82);
  const deep = shade(color, -0.18);
  const tile = (inner: string, size = 40, rotate = 0) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" patternTransform="${rotate ? `rotate(${rotate}) ` : ''}scale(${scale})"><rect width="${size}" height="${size}" fill="${paper}"/>${inner}</pattern>`;
  switch (liner) {
    case 'stripes':
      return tile(`<rect width="10" height="20" fill="${color}"/>`, 20, 35);
    case 'dots':
      return tile(`<circle cx="10" cy="10" r="4" fill="${color}"/><circle cx="30" cy="30" r="4" fill="${color}"/>`);
    case 'confetti':
      return tile(
        `<rect x="5" y="6" width="7" height="3" rx="1" fill="${color}" transform="rotate(30 8 7)"/>`
        + `<circle cx="28" cy="10" r="2.6" fill="${deep}"/>`
        + `<rect x="22" y="27" width="7" height="3" rx="1" fill="${deep}" transform="rotate(-40 25 28)"/>`
        + `<circle cx="9" cy="31" r="2.2" fill="${color}"/>`
        + `<rect x="33" y="20" width="5" height="2.4" rx="1" fill="${color}" transform="rotate(70 35 21)"/>`,
      );
    case 'leaves':
      return tile(
        `<g fill="${color}"><path d="M10 26 C 6 18, 10 11, 18 8 C 19 16, 16 23, 10 26 Z"/><path d="M30 38 C 26 30, 30 23, 38 20 C 39 28, 36 35, 30 38 Z" opacity="0.75"/></g>`
        + `<g stroke="${deep}" stroke-width="0.8" fill="none" opacity="0.6"><path d="M10 26 L 17 10"/><path d="M30 38 L 37 22"/></g>`,
      );
    default:
      return tile('');
  }
}

// The emblem pressed into the wax, in a 100×100 box centred on 50,50.
function emblem(seal: EnvelopeSeal, fill: string): string {
  switch (seal) {
    case 'heart':
      return `<path d="M50 70 C 31 57, 27 44, 34 37 C 40 31, 47 34, 50 40 C 53 34, 60 31, 66 37 C 73 44, 69 57, 50 70 Z" fill="${fill}"/>`;
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? 9 : 21;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${(50 + r * Math.cos(a)).toFixed(1)},${(51 + r * Math.sin(a)).toFixed(1)}`;
      });
      return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
    }
    case 'flower':
      return Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `<ellipse cx="${(50 + 10 * Math.cos(a)).toFixed(1)}" cy="${(50 + 10 * Math.sin(a)).toFixed(1)}" rx="8" ry="5.5" transform="rotate(${(i * 60).toFixed(0)} ${(50 + 10 * Math.cos(a)).toFixed(1)} ${(50 + 10 * Math.sin(a)).toFixed(1)})" fill="${fill}"/>`;
      }).join('') + `<circle cx="50" cy="50" r="5" fill="${shade(fill, -0.25)}"/>`;
    case 'balloon':
      // A balloon with its knot and a curl of string, a little shine top left.
      return `<path d="M50 26 C 62 26, 68 36, 67 45 C 66 55, 57 62, 50 63 C 43 62, 34 55, 33 45 C 32 36, 38 26, 50 26 Z" fill="${fill}"/>`
        + `<path d="M47.4 66.4 L 50 62.6 L 52.6 66.4 Z" fill="${fill}"/>`
        + `<path d="M50 66.4 C 46.5 69.5, 53.5 72, 50 76" fill="none" stroke="${fill}" stroke-width="1.8" stroke-linecap="round"/>`
        + `<ellipse cx="43" cy="38" rx="2.6" ry="5" transform="rotate(-28 43 38)" fill="${shade(fill, 0.35)}"/>`;
    default:
      return '';
  }
}

// The wax seal on its own, in a 100×100 viewBox (with a little room for its
// shadow), drawn like real sealing wax: an uneven poured edge, a glossy
// raised rim where the wax was squeezed out, a flat stamped disc pressed into
// the middle, and the emblem debossed in it (shadow on the edges away from
// the light, top left; a lit edge opposite). uid keeps the ids apart when
// several are on one page.
export function sealSvgInner(seal: EnvelopeSeal, color: string, uid = 's'): string {
  // The poured edge: a smooth, irregular blob (a closed curve through
  // uneven points), a little wider at the bottom right where the wax ran.
  const n = 36;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n;
    const r = 40.5 + 1.5 * Math.sin(a * 3 + 0.7) + 1.1 * Math.sin(a * 5 + 2.1) + 0.7 * Math.sin(a * 9 + 0.3) + 1.6 * Math.max(0, Math.cos(a - 0.8)) ** 6;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });
  const f = (v: number) => v.toFixed(2);
  let edge = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    edge += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  edge += 'Z';
  const deep = shade(color, -0.42), dark = shade(color, -0.24), lit = shade(color, 0.3), face = shade(color, -0.06);
  const id = (k: string) => `${uid}-${k}`;
  // The emblem debossed: its dark wall top left, its lit wall bottom right,
  // the floor a touch darker than the disc.
  const pressed = `<g transform="translate(-0.9 -0.9)">${emblem(seal, deep)}</g>`
    + `<g transform="translate(0.8 0.8)" opacity="0.8">${emblem(seal, lit)}</g>`
    + emblem(seal, shade(color, -0.14));
  return `<defs>`
    + `<radialGradient id="${id('wax')}" cx="36%" cy="32%" r="75%"><stop offset="0" stop-color="${shade(color, 0.18)}"/><stop offset="0.5" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.3)}"/></radialGradient>`
    + `<radialGradient id="${id('disc')}" cx="60%" cy="62%" r="70%"><stop offset="0" stop-color="${face}"/><stop offset="1" stop-color="${shade(color, -0.16)}"/></radialGradient>`
    + `<filter id="${id('soft')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>`
    + `<filter id="${id('blur')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.7"/></filter>`
    + `<clipPath id="${id('in')}"><path d="${edge}"/></clipPath>`
    + `</defs>`
    // Its shadow on the paper.
    + `<path d="${edge}" fill="#000" opacity="0.32" transform="translate(1.2 2.6)" filter="url(#${id('soft')})"/>`
    // The wax, with its rounded rim: dark round the outside, light inside the top left.
    + `<path d="${edge}" fill="url(#${id('wax')})"/>`
    + `<g clip-path="url(#${id('in')})">`
    + `<path d="${edge}" fill="none" stroke="${deep}" stroke-width="3" opacity="0.45" filter="url(#${id('blur')})"/>`
    // Soft gloss on the rim, top left, and a small glint bottom right.
    + `<path d="M17.5 47 A33 33 0 0 1 42 17.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity="0.38" filter="url(#${id('blur')})"/>`
    + `<path d="M76 70 A33 33 0 0 1 66 79" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.25" filter="url(#${id('blur')})"/>`
    + `</g>`
    // The stamped disc: pressed down, so its wall is dark top left and lit bottom right.
    + `<circle cx="50" cy="50" r="28.5" fill="${lit}" opacity="0.55" transform="translate(0.9 0.9)"/>`
    + `<circle cx="50" cy="50" r="28.5" fill="${dark}" transform="translate(-0.8 -0.8)"/>`
    + `<circle cx="50" cy="50" r="28" fill="url(#${id('disc')})"/>`
    + `<circle cx="50" cy="50" r="25.5" fill="none" stroke="${shade(color, -0.2)}" stroke-width="0.6" opacity="0.7"/>`
    + `<circle cx="50" cy="50" r="25.5" fill="none" stroke="${lit}" stroke-width="0.5" opacity="0.5" transform="translate(0.5 0.5)"/>`
    + pressed;
}

export const ENVELOPE_RATIO = 5 / 7; // height / width, like an A7 envelope

// The sealed envelope, seen from the back, as a whole SVG: for the email
// picture and the designer's preview. width is in px; the drawing is in a
// 700×(500 + margin) box with room for a soft shadow.
export function envelopeSvg(env: Pick<InvitationEnvelope, 'color' | 'seal' | 'sealColor'>, width = 700): string {
  const W = 700, H = 500, M = 24;
  const c = env.color;
  const flapTip = H * 0.6;
  const seal = 128;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.round((width * (H + M * 2)) / (W + M * 2))}" viewBox="${-M} ${-M} ${W + M * 2} ${H + M * 2}">`
    + `<defs><filter id="e-sh" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="9"/></filter>`
    + `<linearGradient id="e-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, 0.05)}"/><stop offset="1" stop-color="${shade(c, -0.05)}"/></linearGradient>`
    + `<linearGradient id="e-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, 0.08)}"/><stop offset="1" stop-color="${shade(c, -0.02)}"/></linearGradient></defs>`
    + `<rect x="6" y="14" width="${W - 12}" height="${H - 6}" rx="8" fill="#241F2B" opacity="0.22" filter="url(#e-sh)"/>`
    + `<rect width="${W}" height="${H}" rx="8" fill="url(#e-body)"/>`
    // The side and bottom folds.
    + `<path d="M0 ${H} L ${W * 0.5} ${H * 0.5} L ${W} ${H}" fill="none" stroke="${shade(c, -0.12)}" stroke-width="2" opacity="0.7"/>`
    + `<path d="M0 0 L ${W * 0.42} ${H * 0.55} M ${W} 0 L ${W * 0.58} ${H * 0.55}" fill="none" stroke="${shade(c, -0.1)}" stroke-width="1.5" opacity="0.5"/>`
    // The flap, with a shadow along its edge.
    + `<path d="M0 0 L ${W / 2} ${flapTip} L ${W} 0 Z" fill="${shade(c, -0.35)}" opacity="0.18" transform="translate(0 5)"/>`
    + `<path d="M0 0 L ${W / 2} ${flapTip} L ${W} 0 Z" fill="url(#e-flap)" stroke="${shade(c, -0.1)}" stroke-width="1.5" stroke-linejoin="round"/>`
    + `<svg x="${W / 2 - seal / 2}" y="${flapTip - seal / 2 - 6}" width="${seal}" height="${seal}" viewBox="0 0 100 100">${sealSvgInner(env.seal, env.sealColor, 'e')}</svg>`
    + `</svg>`;
}

// ─── The opening page's words ───────────────────────────

type Lang = 'en' | 'fr' | 'es';
export const ENVELOPE_COPY: Record<Lang, {
  forGuest: (name: string) => string;
  youreInvited: string;
  tapToOpen: string;
  openYourInvitation: string;
  personalNote: string;
  yourEvents: string;
  rsvp: string;
  viewPage: string;
  openAgain: string;
  fromHost: (host: string) => string;
  opening: string;
  continue: string;
  // The email
  emailLead: (host: string) => string;
  emailButton: string;
}> = {
  en: {
    forGuest: (name) => `For ${name}`,
    youreInvited: 'You’re invited',
    tapToOpen: 'Tap the envelope to open it',
    openYourInvitation: 'Open your invitation',
    personalNote: 'A personal note',
    yourEvents: 'You’re invited to',
    rsvp: 'RSVP',
    viewPage: 'View the event page',
    openAgain: 'Open it again',
    fromHost: (host) => `From ${host}`,
    opening: 'Opening your invitation…',
    continue: 'Continue',
    emailLead: (host) => `${host} sent you an invitation.`,
    emailButton: 'Open your invitation',
  },
  fr: {
    forGuest: (name) => `Pour ${name}`,
    youreInvited: 'Vous êtes invités',
    tapToOpen: 'Touchez l’enveloppe pour l’ouvrir',
    openYourInvitation: 'Ouvrir votre invitation',
    personalNote: 'Un mot pour vous',
    yourEvents: 'Vous êtes invités à',
    rsvp: 'Répondre',
    viewPage: 'Voir la page de l’événement',
    openAgain: 'L’ouvrir de nouveau',
    fromHost: (host) => `De la part de ${host}`,
    opening: 'Ouverture de votre invitation…',
    continue: 'Continuer',
    emailLead: (host) => `${host} vous a envoyé une invitation.`,
    emailButton: 'Ouvrir votre invitation',
  },
  es: {
    forGuest: (name) => `Para ${name}`,
    youreInvited: 'Estás invitado',
    tapToOpen: 'Toca el sobre para abrirlo',
    openYourInvitation: 'Abrir tu invitación',
    personalNote: 'Una nota para ti',
    yourEvents: 'Estás invitado a',
    rsvp: 'Confirmar asistencia',
    viewPage: 'Ver la página del evento',
    openAgain: 'Abrirlo de nuevo',
    fromHost: (host) => `De parte de ${host}`,
    opening: 'Abriendo tu invitación…',
    continue: 'Continuar',
    emailLead: (host) => `${host} te envió una invitación.`,
    emailButton: 'Abrir tu invitación',
  },
};
export const envelopeCopy = (language?: string | null) => ENVELOPE_COPY[language === 'fr' || language === 'es' ? language : 'en'];

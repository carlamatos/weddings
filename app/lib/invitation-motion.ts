// The birthday papers that move on the card (not in the email, which shows
// the still paper): the candle flames flicker, the bunting's flags swing in
// the wind, and confetti bursts from the middle. Pieces are cut from the same
// artwork (an atlas of sprites, each [x, y, w, h, atlasX, atlasY] in the
// paper's 1000 x 1400 pixels); the card shows the base paper (the pieces
// removed) under them. Client-safe: no imports.

export type PaperMotion =
  | { kind: 'flames' | 'flags'; base: string; atlas: string; size: [number, number]; pieces: [number, number, number, number, number, number][] }
  | { kind: 'confetti' };

const I = '/images/invitations/';
export const PAPER_MOTION: Record<string, PaperMotion> = {
  [`${I}birthday-candles.jpeg`]: { kind: 'flames', base: `${I}birthday-candles-base.jpeg`, atlas: `${I}birthday-candles-flames.webp`, size: [58, 83], pieces: [[501, 862, 23, 72, 0, 0], [802, 862, 29, 83, 29, 0]] },
  [`${I}birthday-cake.jpeg`]: { kind: 'flames', base: `${I}birthday-cake-base.jpeg`, atlas: `${I}birthday-cake-flames.webp`, size: [282, 95], pieces: [[495, 851, 22, 88, 0, 0], [546, 859, 27, 95, 28, 0], [423, 884, 37, 74, 61, 0], [617, 889, 20, 77, 104, 0], [477, 896, 23, 72, 130, 0], [398, 896, 19, 64, 159, 0], [328, 904, 18, 66, 184, 0], [598, 905, 17, 59, 208, 0], [648, 913, 24, 54, 231, 0], [356, 916, 21, 60, 261, 0]] },
  [`${I}birthday-bunting.jpeg`]: { kind: 'flags', base: `${I}birthday-bunting-base.jpeg`, atlas: `${I}birthday-bunting-flags.webp`, size: [1193, 249], pieces: [[963, -20, 65, 69, 0, 0], [920, 11, 64, 69, 71, 0], [875, 40, 64, 70, 141, 0], [-82, 56, 64, 72, 211, 0], [830, 66, 63, 71, 281, 0], [-33, 79, 64, 70, 350, 0], [783, 91, 63, 72, 420, 0], [17, 98, 65, 70, 489, 0], [1016, 110, 66, 70, 560, 0], [68, 116, 65, 70, 632, 0], [736, 116, 63, 71, 703, 0], [966, 126, 65, 71, 772, 0], [119, 133, 65, 69, 843, 0], [688, 138, 63, 71, 914, 0], [914, 143, 65, 69, 983, 0], [170, 146, 66, 72, 1054, 0], [861, 155, 67, 70, 1126, 0], [223, 160, 67, 69, 0, 78], [640, 159, 76, 98, 73, 78], [809, 167, 66, 70, 155, 78], [275, 171, 66, 68, 227, 78], [755, 177, 67, 68, 299, 78], [328, 180, 67, 68, 372, 78], [591, 178, 71, 83, 445, 78], [702, 184, 67, 68, 522, 78], [381, 187, 67, 67, 595, 78], [435, 192, 66, 63, 668, 78], [489, 195, 66, 84, 740, 78], [541, 196, 69, 69, 812, 78], [439, 224, 65, 69, 887, 78], [388, 237, 65, 68, 958, 78], [337, 248, 66, 66, 1029, 78], [284, 255, 66, 67, 1101, 78], [-80, 258, 65, 66, 0, 182], [232, 262, 66, 67, 71, 182], [-28, 264, 65, 66, 143, 182], [23, 268, 67, 65, 214, 182], [180, 267, 66, 66, 287, 182], [129, 269, 65, 66, 359, 182], [76, 270, 65, 65, 430, 182]] },
  [`${I}birthday-confetti.jpeg`]: { kind: 'confetti' },
};

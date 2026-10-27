const LIKELIHOOD_RANK: Record<string, number> = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5,
};

const MODERATION_UNAVAILABLE = {
  safe: false,
  reason: 'Photo moderation is temporarily unavailable. Please try again shortly.',
};

// Photo formats uploads may be, told apart by their first bytes (the
// browser's file type is whatever the sender says): ones the moderation
// check can read. Anything else, SVG above all, never reaches the image
// library. The upload forms already convert photos to JPEG or WebP.
const UNSUPPORTED_FORMAT = { safe: false, reason: 'Please upload a JPEG, PNG, WebP or GIF photo.' };

function isPhotoFormat(b: Buffer): boolean {
  const ascii = (start: number, end: number) => b.subarray(start, end).toString('latin1');
  return (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) // JPEG
    || ascii(0, 8) === '\x89PNG\r\n\x1a\n'
    || ascii(0, 4) === 'GIF8'
    || (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP');
}

// Pixels the image library will decode, so a tiny file that unpacks into a
// huge picture can't use up the server's memory (a 48 MP phone photo fits).
const MAX_INPUT_PIXELS = 60_000_000;

export async function isSafeImage(buffer: Buffer): Promise<{ safe: boolean; reason?: string }> {
  if (!isPhotoFormat(buffer)) return UNSUPPORTED_FORMAT;
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_VISION_API_KEY is not set; rejecting upload (fail closed)');
    return MODERATION_UNAVAILABLE;
  }

  const base64 = buffer.toString('base64');
  let res: Response;
  try {
    res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{ image: { content: base64 }, features: [{ type: 'SAFE_SEARCH_DETECTION' }] }],
        }),
      }
    );
  } catch (err) {
    console.error('Vision API request failed:', err);
    return MODERATION_UNAVAILABLE; // fail closed
  }

  if (!res.ok) {
    console.error('Vision API error:', await res.text());
    return MODERATION_UNAVAILABLE; // fail closed
  }

  const data = await res.json();
  const annotation = data.responses?.[0]?.safeSearchAnnotation;
  // No verdict (e.g. Vision couldn't read the picture): not checked, so not allowed.
  if (!annotation) {
    console.error('Vision API gave no verdict:', data.responses?.[0]?.error);
    return { safe: false, reason: 'We couldn’t read this photo. Please try another one, as a JPEG or PNG.' };
  }
  const { adult, violence, racy } = annotation;

  if (LIKELIHOOD_RANK[adult] >= LIKELIHOOD_RANK['LIKELY'])
    return { safe: false, reason: 'Image contains explicit content and cannot be uploaded.' };
  if (LIKELIHOOD_RANK[violence] >= LIKELIHOOD_RANK['LIKELY'])
    return { safe: false, reason: 'Image contains violent content and cannot be uploaded.' };
  if (LIKELIHOOD_RANK[racy] >= LIKELIHOOD_RANK['VERY_LIKELY'])
    return { safe: false, reason: 'Image contains inappropriate content and cannot be uploaded.' };

  return { safe: true };
}

export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  if (!isPhotoFormat(buffer)) throw new Error('Unsupported image format');
  return sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

// The server's image library can't read HEIC, so the browser converts HEIC
// photos to WebP before uploading (app/lib/compress-image.ts). One that still
// arrives as HEIC couldn't be converted there — say so clearly.
export const HEIC_NOT_CONVERTED_ERROR =
  'We couldn’t convert this HEIC photo. Please try again, or upload it as a JPEG or PNG.';

export function isHeicUpload(file: File): boolean {
  return /^image\/hei[cf](-sequence)?$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

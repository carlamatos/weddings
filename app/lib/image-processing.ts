const LIKELIHOOD_RANK: Record<string, number> = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5,
};

export async function isSafeImage(buffer: Buffer): Promise<{ safe: boolean; reason?: string }> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) return { safe: true };

  const base64 = buffer.toString('base64');
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{ image: { content: base64 }, features: [{ type: 'SAFE_SEARCH_DETECTION' }] }],
      }),
    }
  );

  if (!res.ok) {
    console.error('Vision API error:', await res.text());
    return { safe: true }; // fail open
  }

  const data = await res.json();
  const { adult, violence, racy } = data.responses?.[0]?.safeSearchAnnotation ?? {};

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
  return sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

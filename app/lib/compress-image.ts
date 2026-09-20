// Client-side compression so guest photo uploads stay under Vercel's
// non-configurable 4.5MB request body limit for serverless functions.
// Falls back to the original file whenever the browser can't decode it
// (the server will simply reject it as before in that case).
export async function compressImageFile(
  file: File,
  { maxDimension = 2000, quality = 0.85, maxBytes = 4 * 1024 * 1024 } = {}
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  if (!bitmap) return file;

  let { width, height } = bitmap;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let currentQuality = quality;
  for (let attempt = 0; attempt < 4; attempt++) {
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', currentQuality));
    if (!blob) return file;
    if (blob.size <= maxBytes || currentQuality <= 0.4) {
      return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
    }
    currentQuality -= 0.15;
  }

  return file;
}

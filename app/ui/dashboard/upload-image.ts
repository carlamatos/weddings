import { compressImageFile, isImageFile } from '@/app/lib/compress-image';

// Uploads one image through /api/upload (safety check + optimisation) and
// returns its public URL. Throws with a readable message on failure.
export async function uploadImage(file: File): Promise<string> {
  if (!isImageFile(file)) throw new Error('Please choose an image file.');
  const compressed = await compressImageFile(file);
  const formData = new FormData();
  formData.append('file', compressed);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const text = await res.text();
  let data: { url?: string; error?: string };
  try { data = JSON.parse(text); } catch { data = { error: text || res.statusText }; }
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed. Please try again.');
  return data.url;
}

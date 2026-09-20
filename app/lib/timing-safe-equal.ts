import { createHash, timingSafeEqual } from 'crypto';

// Constant-time string comparison for secrets (bypass passwords, bearer
// tokens). Hashing first sidesteps timingSafeEqual's requirement that both
// buffers be the same length, which would otherwise leak the secret's length.
export function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

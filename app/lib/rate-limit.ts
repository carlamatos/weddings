const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15-minute window
const MAX_ATTEMPTS = 5;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = store.get(ip);
  if (!record || now > record.resetAt) return false;
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = store.get(ip);
  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count++;
  }
}

export function clearLoginAttempts(ip: string): void {
  store.delete(ip);
}

import { generateSecret as otpGenerateSecret, generateURI, verify as otpVerify } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const ISSUER = 'MyGala';
const BACKUP_CODE_COUNT = 10;

export function generateSecret(): string {
  return otpGenerateSecret();
}

export function totpUri(secret: string, accountEmail: string): string {
  return generateURI({ issuer: ISSUER, label: accountEmail, secret });
}

export async function qrCodeDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri);
}

// 30s tolerance each way (the default period) — RFC 6238's recommended ±1
// step window, generous enough for clock drift without weakening the code
// meaningfully (6-digit codes still only live for ~90s total).
export async function verifyTotp(secret: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false;
  const result = await otpVerify({ secret, token, epochTolerance: 30 });
  return result.valid;
}

export function generateBackupCodes(count = BACKUP_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString('hex'); // 40 bits, 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

// AES-256-GCM, keyed by a dedicated secret — not AUTH_SECRET, which is a
// different primitive (JWT/cookie signing) and shouldn't be reused here.
function getEncryptionKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (!raw) throw new Error('TOTP_ENCRYPTION_KEY is not set');
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('TOTP_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  return key;
}

export function encryptSecret(plain: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((b) => b.toString('base64')).join('.');
}

export function decryptSecret(stored: string): string {
  const key = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = stored.split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

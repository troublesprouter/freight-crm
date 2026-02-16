import crypto from 'crypto';

export function nanoid(length: number = 12): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

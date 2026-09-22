// Elpino Node.js identity helper. SERVER ONLY: never bundle your secret for a browser.
import { createHmac, randomUUID } from 'node:crypto';

/**
 * Sign the user from your authenticated session, never a request body.
 * @param {string} secret Workspace identity secret from server configuration.
 * @param {{ id: string | number, email?: string | null, emailVerified?: boolean, phone?: string | null, phoneVerified?: boolean, name?: string | null }} user
 */
export function createIdentityToken(secret, user) {
  if (typeof secret !== 'string' || !secret.startsWith('elid_') || secret.length < 32) {
    throw new Error('Set your Elpino workspace identity secret on the server');
  }
  if (!user || !['string', 'number'].includes(typeof user.id) ||
      (typeof user.id === 'number' && !Number.isSafeInteger(user.id)) ||
      !/^[\x21-\x7E]{1,255}$/.test(String(user.id))) {
    throw new Error('A stable authenticated user ID is required');
  }
  const now = Math.floor(Date.now() / 1000);
  const claims = { sub: String(user.id), aud: 'elpino-widget', jti: randomUUID(), iat: now, exp: now + 300 };
  if (user.email) Object.assign(claims, { email: user.email, email_verified: user.emailVerified === true });
  if (user.phone) Object.assign(claims, { phone: user.phone, phone_verified: user.phoneVerified === true });
  if (user.name) Object.assign(claims, { name: user.name });
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const payload = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}`;
  const token = `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
  if (token.length > 4096) throw new Error('Identity exceeds the maximum token size');
  return token;
}

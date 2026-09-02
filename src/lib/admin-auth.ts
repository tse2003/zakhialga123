import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE = 'aquablue_admin_session';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET тохируулаагүй байна.');
  return value;
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createAdminSession() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_AGE_SECONDS * 1000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token?: string) {
  if (!token) return false;

  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = sign(payload);
    const givenBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (givenBuffer.length !== expectedBuffer.length) return false;
    if (!timingSafeEqual(givenBuffer, expectedBuffer)) return false;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function validAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;

  const usernameBuffer = Buffer.from(username);
  const expectedUsernameBuffer = Buffer.from(expectedUsername);
  const passwordBuffer = Buffer.from(password);
  const expectedPasswordBuffer = Buffer.from(expectedPassword);

  return usernameBuffer.length === expectedUsernameBuffer.length &&
    passwordBuffer.length === expectedPasswordBuffer.length &&
    timingSafeEqual(usernameBuffer, expectedUsernameBuffer) &&
    timingSafeEqual(passwordBuffer, expectedPasswordBuffer);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_AGE_SECONDS,
};

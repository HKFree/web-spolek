import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

// AUTH_MODE: dev = jméno a e-mail (výchozí v npm run dev), password = navíc ADMIN_PASSWORD,
// oidc = hkfree účty (zatím chybí). Jinak je redakce zavřená. Jméno a e-mail = autor commitu.

export type Redaktor = { name: string; email: string };
type Session = Redaktor & { expires: number };
export type AuthMode = 'dev' | 'password' | 'oidc' | 'off';

export const SESSION_COOKIE = 'hkfree_redakce';
const MAX_AGE = 8 * 60 * 60;
const sessions = new Map<string, Session>();

export function authMode(): AuthMode {
  const mode = process.env.AUTH_MODE;
  if (mode === 'password') return process.env.ADMIN_PASSWORD ? 'password' : 'off';
  if (mode === 'oidc') return 'oidc';
  if (mode === 'dev') return 'dev';
  if (import.meta.env.DEV && !mode) return 'dev';
  return 'off';
}

const digest = (value: string) => createHash('sha256').update(value).digest();
export function validPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && timingSafeEqual(digest(password), digest(expected));
}

export function currentUser(cookies: AstroCookies): Redaktor | undefined {
  const id = cookies.get(SESSION_COOKIE)?.value;
  const session = id ? sessions.get(id) : undefined;
  if (!session) return undefined;
  if (session.expires < Date.now()) {
    sessions.delete(id!);
    return undefined;
  }
  return { name: session.name, email: session.email };
}

export function login(cookies: AstroCookies, user: Redaktor, secure: boolean) {
  const id = randomBytes(32).toString('base64url');
  sessions.set(id, { ...user, expires: Date.now() + MAX_AGE * 1000 });
  cookies.set(SESSION_COOKIE, id, { path: '/', httpOnly: true, sameSite: 'lax', secure, maxAge: MAX_AGE });
}

export function logout(cookies: AstroCookies) {
  const id = cookies.get(SESSION_COOKIE)?.value;
  if (id) sessions.delete(id);
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function isEditorPath(path: string) {
  return /^\/(api\/)?keystatic(\/|$)/.test(path) || path === '/api/redakce/status';
}

/** Návratová adresa po přihlášení, jen do redakce. */
export function safeReturnTo(value: string | null | undefined) {
  return value && /^\/keystatic(\/|$)/.test(value) ? value : '/keystatic';
}

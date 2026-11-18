import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

// Přihlášení do redakce. Režim určuje proměnná AUTH_MODE:
//   dev      stačí jméno a e-mail, nic se neověřuje (výchozí v npm run dev;
//            na serveru jen výslovně a jen tam, kam se nedostane nikdo cizí)
//   password jméno, e-mail a sdílené heslo ADMIN_PASSWORD
//   oidc     přihlášení hkfree účtem (zatím nedodělané, redakce je zavřená)
// Bez platného nastavení je redakce zavřená. Ve všech režimech vzniká stejná relace
// a jméno s e-mailem se použijí jako autor commitu.

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

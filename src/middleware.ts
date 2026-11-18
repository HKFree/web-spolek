import { defineMiddleware } from 'astro:middleware';
import { authMode, currentUser, isEditorPath } from './redakce/auth';

// Chrání redakci a její API, ostatní stránky jen propouští.
export const onRequest = defineMiddleware(async (context, next) => {
  let path: string;
  try {
    path = decodeURIComponent(context.url.pathname);
  } catch {
    return new Response('Stránka nebyla nalezena.', { status: 404 });
  }
  if (!isEditorPath(path)) return next();

  const noStore = { 'Cache-Control': 'no-store' };
  if (authMode() === 'off') {
    return new Response('Redakce je zavřená: přihlášení není nastavené (AUTH_MODE).', { status: 503, headers: noStore });
  }
  const user = currentUser(context.cookies);
  if (!user) {
    if (path.startsWith('/api/')) {
      return Response.json({ error: 'Přihlášení vypršelo. Znovu otevři redakci.' }, { status: 401, headers: noStore });
    }
    const target = new URLSearchParams({ returnTo: context.url.pathname + context.url.search });
    return context.redirect(`/auth/login?${target}`, 302);
  }
  if (!['GET', 'HEAD'].includes(context.request.method) && context.request.headers.get('origin') !== context.url.origin) {
    return new Response('Nepovolený původ požadavku.', { status: 403 });
  }
  context.locals.redaktor = user;

  const response = await next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
});

import type { APIRoute } from 'astro';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import config from '../../keystatic.config';
import { notifyChange } from './publish';

export const prerender = false;

// Keystatic v lokálním režimu zapisuje přímo do pracovního adresáře (process.cwd()).
// Přístup hlídá src/middleware.ts.
const handler = makeGenericAPIRouteHandler({ config });

export const ALL: APIRoute = async ({ request, locals }) => {
  const { body, headers, status } = await handler(request);
  if (request.method !== 'GET' && status < 400) notifyChange(locals.redaktor);
  return new Response(body instanceof Uint8Array ? new Uint8Array(body) : body, { headers, status });
};

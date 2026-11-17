import type { APIRoute } from 'astro';
import { publishStatus } from './publish';

export const prerender = false;

export const GET: APIRoute = () => Response.json(publishStatus(), { headers: { 'Cache-Control': 'no-store' } });

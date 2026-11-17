import type { APIRoute } from 'astro';
import { logout } from './auth';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  logout(cookies);
  return redirect('/', 303);
};

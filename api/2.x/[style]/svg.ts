// Vercel's edge function for /api/2.x/<style>/svg. The rules are in server/avatar.ts.
import { avatarResponse } from '../../../server/avatar.js';

export const config = { runtime: 'edge' };

// The project's lib has no DOM types, so the little of Request and Response used here.
declare const Response: new (body: string | null, init: { status: number; headers: Record<string, string> }) => object;

/**
 * Vercel passes the `[style]` path segment on by appending `style=<segment>` to the query.
 * The path already says it, so that last parameter is dropped; a `style` the caller sent
 * stays, and is refused like any other unknown option.
 *
 * @param url - The request URL as Vercel hands it over
 * @returns The URL the caller asked for
 */
export function withoutVercelStyle(url: string): string {
  const style = /\/api\/2\.x\/([^/?]+)\//.exec(url)?.[1];
  if (style === undefined) return url;
  const added = `style=${style}`;
  if (url.endsWith(`&${added}`)) return url.slice(0, -added.length - 1);
  if (url.endsWith(`?${added}`)) return url.slice(0, -added.length - 1);
  return url;
}

/**
 * Serves one avatar request.
 *
 * @param request - The incoming request
 * @returns The SVG, or a plain-text reason it was refused
 */
export default function handler(request: { method: string; url: string }): object {
  const { status, headers, body } = avatarResponse(request.method, withoutVercelStyle(request.url));
  return new Response(body, { status, headers });
}

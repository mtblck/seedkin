// Vercel's edge function for /api/2.x/<style>/svg. The rules are in server/avatar.ts.
import { avatarResponse } from '../../../server/avatar.js';

export const config = { runtime: 'edge' };

// The project's lib has no DOM types, so the little of Request and Response used here.
declare const Response: new (body: string | null, init: { status: number; headers: Record<string, string> }) => object;

/**
 * Serves one avatar request.
 *
 * @param request - The incoming request
 * @returns The SVG, or a plain-text reason it was refused
 */
export default function handler(request: { method: string; url: string }): object {
  const { status, headers, body } = avatarResponse(request.method, request.url);
  return new Response(body, { status, headers });
}

// npm run serve: serves dist-site/ on http://localhost:4173 with vercel.json's headers,
// so the CSP is tested locally exactly as Vercel will send it. The avatar API under /api/2.x/
// runs from its TypeScript source, as the edge function does (hence tsx).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { avatarResponse } from '../server/avatar.ts';

const root = path.resolve('dist-site');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};
const port = Number(process.env.PORT ?? 4173);

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      try {
        const { status, headers, body } = avatarResponse(req.method ?? 'GET', req.url ?? '/');
        return res.writeHead(status, headers).end(body ?? undefined);
      } catch (err) {
        // As on Vercel, an unexpected error is a 500, not a crashed server.
        console.error(err);
        return res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('internal error\n');
      }
    }
    let file;
    try {
      file = path.join(root, decodeURIComponent(url.pathname));
    } catch {
      return res.writeHead(400).end('bad path');
    }
    if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
    // vercel.json's same-host redirects, such as /docs to /docs/.
    const redirect = config.redirects?.find((r) => !r.has && r.source === url.pathname);
    if (redirect) return res.writeHead(redirect.permanent ? 308 : 307, { Location: redirect.destination }).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    // Like Vercel, an unknown path gets the site's 404 page.
    let status = 200;
    if (!fs.existsSync(file)) {
      file = path.join(root, '404.html');
      status = 404;
      if (!fs.existsSync(file)) return res.writeHead(404).end('not found');
    }
    for (const rule of config.headers) {
      if (new RegExp(`^${rule.source}$`).test(url.pathname))
        for (const h of rule.headers) res.setHeader(h.key, h.value);
    }
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`serving dist-site on http://localhost:${port}`));

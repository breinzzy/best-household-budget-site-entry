// Hearth — a tiny static server for app/, standard library only.
// Run `node serve.ts` and open http://localhost:8080 (or --port <n>).
// It serves only files inside app/ and answers with the right MIME type.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'app');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const args = process.argv.slice(2);
let port = 8080;
const at = args.indexOf('--port');
if (at !== -1 && args[at + 1]) port = Number(args[at + 1]) || 8080;

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const rel = normalize(path === '/' ? 'index.html' : path.replace(/^\/+/, ''));
  const file = join(root, rel);
  // Refuse anything that escapes app/ (including `..` tricks).
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});

server.listen(port, () => {
  console.log(`Hearth is serving app/ at http://localhost:${port}`);
});

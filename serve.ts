// Hearth — serve.ts. A tiny static server for looking at the site while
// it is built. Serves app/ at http://localhost:8080 (or --port N), with
// app/index.html as the root. No build step, no network, nothing else.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "app");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const portArg = process.argv.indexOf("--port");
const port = portArg === -1 ? 8080 : Number(process.argv[portArg + 1]) || 8080;

createServer(async (req, res) => {
  try {
    const path = normalize(join(root, decodeURIComponent(req.url.split("?")[0])));
    if (!path.startsWith(root)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const file = path.endsWith("/") ? join(path, "index.html") : path;
    const body = await readFile(file === root ? join(root, "index.html") : file);
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(port, () => {
  console.log("Hearth serves app/ at http://localhost:" + port);
});

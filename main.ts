// Hearth — the hand-in program for the Alvarez family budget site.
// Node 22, standard library only. The site itself is plain static files
// under app/ (ES modules, CSS, no build step, nothing loaded over the
// network), with its screenshots under screenshots/. This program copies
// both into the output directory and writes dossier.json there with the
// vendored make.fun library — the summary the judge reads (screenshots,
// first-load files and bytes, and the site's source). Leave
// vendor/makefun-frontend.ts untouched: the scorer rebuilds the dossier
// with its own copy and requires a byte-for-byte match.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes;
// the others refuse an entry the scorer would refuse anyway (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files — app/ counts beside /output's own cap of
// 1,000 entries, which its screenshots/ and dossier.json share).
import { writeFileSync } from 'node:fs';
import { buildDossier } from './vendor/makefun-frontend.ts';

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

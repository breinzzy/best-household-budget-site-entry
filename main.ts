// Hearth — main.ts. The hand-in program (Node 22, standard library only).
// It copies the site (app/) and its screenshots (screenshots/) beside this
// file into the output directory and writes dossier.json there, using the
// vendored make.fun library — the summary the judge reads. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function handIn() {
  const shotDir = join(repoRoot, "screenshots");
  if (!existsSync(shotDir) || readdirSync(shotDir).filter((f) => !f.startsWith(".")).length === 0) {
    throw new Error("No screenshots found in screenshots/ — take them before handing in.");
  }
  mkdirSync(outDir, { recursive: true });
  cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
  mkdirSync(join(outDir, "screenshots"), { recursive: true });
  if (existsSync(join(repoRoot, "screenshots"))) {
    cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });
  }
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
  return {
    appFiles: readdirSync(join(outDir, "app")).length,
    shots: readdirSync(join(outDir, "screenshots")).length,
    dossierBytes: Buffer.byteLength(dossier),
  };
}

const result = handIn();
console.log(
  "Hearth handed in: " + result.appFiles + " app entries, " + result.shots +
  " screenshots, dossier " + result.dossierBytes + " bytes."
);

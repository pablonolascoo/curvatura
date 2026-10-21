#!/usr/bin/env bun
// Copia las figuras de library/papers/<id>/figures a public/library/<id>/figures para la web.
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(import.meta.dir, "../../../library/papers");
const DST = path.resolve(import.meta.dir, "../public/library");

rmSync(DST, { recursive: true, force: true });
let n = 0;
for (const id of readdirSync(SRC)) {
  const fig = path.join(SRC, id, "figures");
  if (!existsSync(fig)) continue;
  cpSync(fig, path.join(DST, id, "figures"), { recursive: true });
  n++;
}
console.log(`sync-library: figuras de ${n} papers copiadas`);

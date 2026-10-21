#!/usr/bin/env bun
/**
 * Despliegue versionado (receta _docs-bim/deploy-versionado-codename.md, variante Cloudflare Workers).
 *
 *   bun run deploy          # patch
 *   bun run deploy minor
 *   bun run deploy major
 *
 * Sube la versión en version.json, commitea, etiqueta vX.Y.Z, construye la web estática
 * y la publica con wrangler. Si algo falla, deshace commit, etiqueta y versión.
 * Requiere .cloudflare.env (CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN), nunca en git.
 */
import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const VERSION_FILE = "version.json";
type Level = "patch" | "minor" | "major";

function bump(v: string, level: Level): string {
  let [a, b, c] = v.split(".").map(Number);
  if (level === "major") { a++; b = 0; c = 0; }
  else if (level === "minor") { b++; c = 0; }
  else { c++; }
  return `${a}.${b}.${c}`;
}

const level = (process.argv[2] ?? "patch") as Level;
if (!["patch", "minor", "major"].includes(level)) { console.error(`Nivel inválido: ${level}`); process.exit(1); }
if (!existsSync(VERSION_FILE) || !existsSync(".cloudflare.env")) { console.error("Falta version.json o .cloudflare.env"); process.exit(1); }

const branch = (await $`git branch --show-current`.text()).trim();
if (branch !== "main") { console.error(`Hay que desplegar desde main (estás en ${branch})`); process.exit(1); }
if ((await $`git status --porcelain`.text()).trim()) { console.error("Hay cambios sin commitear. Commitea antes de desplegar."); process.exit(1); }

const meta = JSON.parse(readFileSync(VERSION_FILE, "utf8")) as { codename: string; version: string; released?: boolean };
const nextVersion = meta.released ? bump(meta.version, level) : meta.version;
const label = `${meta.codename} v${nextVersion}`;
const tag = `v${nextVersion}`;

console.log(`\nDesplegando ${label}\n`);
writeFileSync(VERSION_FILE, JSON.stringify({ codename: meta.codename, version: nextVersion, released: true }, null, 2) + "\n");
await $`git add ${VERSION_FILE}`;
await $`git commit -m ${`deploy: ${label}`}`.nothrow();
await $`git tag ${tag}`.nothrow();

const result = await $`bash -c 'set -a && source .cloudflare.env && set +a && cd apps/web && bun run build && bunx wrangler deploy'`.nothrow();

if (result.exitCode === 0) {
  await $`git push origin main`.nothrow();
  await $`git push origin ${tag}`.nothrow();
  console.log(`\n${label} desplegada y subida.`);
} else {
  console.error(`\nEl despliegue falló. Revirtiendo commit y versión.`);
  await $`git tag -d ${tag}`.nothrow();
  await $`git reset --soft HEAD~1`.nothrow();
  await $`git checkout HEAD -- ${VERSION_FILE}`.nothrow();
  await $`git reset`.nothrow();
  process.exit(1);
}

#!/usr/bin/env bun
/**
 * Despliegue versionado (receta _docs-bim/deploy-versionado-codename.md, variante Cloudflare Workers).
 *
 *   bun run deploy          # patch
 *   bun run deploy minor
 *   bun run deploy major
 *   bun run deploy patch --obligatoria   # la app no deja posponer esta actualización
 *
 * 1. Sube la versión en version.json (codename + semver) y fecha la sección «Sin publicar» del CHANGELOG.
 * 2. Commit «deploy: <Codename vX.Y.Z>» y etiqueta vX.Y.Z.
 * 3. Construye la web estática y la publica en Cloudflare Workers (sesión de wrangler o .cloudflare.env).
 * 4. Si todo va bien, empuja main y la etiqueta: GitHub Actions compila, firma y publica las apps de
 *    macOS, Windows y Linux con su latest.json, y las apps instaladas se actualizan solas.
 * Si algo falla, deshace commit, etiqueta y versión. Producción se queda en la última buena.
 */
import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const VERSION_FILE = "version.json";
const CHANGELOG = "CHANGELOG.md";
type Level = "patch" | "minor" | "major";

function bump(v: string, level: Level): string {
  let [a, b, c] = v.split(".").map(Number);
  if (level === "major") { a++; b = 0; c = 0; }
  else if (level === "minor") { b++; c = 0; }
  else { c++; }
  return `${a}.${b}.${c}`;
}

const level = (process.argv.find((a) => ["patch", "minor", "major"].includes(a)) ?? "patch") as Level;
const obligatoria = process.argv.includes("--obligatoria");

const branch = (await $`git branch --show-current`.text()).trim();
if (branch !== "main") { console.error(`Hay que desplegar desde main (estás en ${branch})`); process.exit(1); }
// La biblioteca crece en segundo plano (recolector, traducciones): no bloquea el despliegue.
const sucio = (await $`git status --porcelain`.text()).split("\n").filter((l) => l.trim() && !l.slice(3).startsWith("library/"));
if (sucio.length) { console.error(`Hay cambios sin commitear fuera de library/:\n${sucio.join("\n")}`); process.exit(1); }

const meta = JSON.parse(readFileSync(VERSION_FILE, "utf8")) as { codename: string; version: string; released?: boolean };
const nextVersion = meta.released ? bump(meta.version, level) : meta.version;
const label = `${meta.codename} v${nextVersion}`;
const tag = `v${nextVersion}`;
const hoy = new Date().toISOString().slice(0, 10);

console.log(`\nDesplegando ${label}${obligatoria ? " (obligatoria)" : ""}\n`);
writeFileSync(VERSION_FILE, JSON.stringify({ codename: meta.codename, version: nextVersion, released: true }, null, 2) + "\n");
if (existsSync(CHANGELOG)) {
  const log = readFileSync(CHANGELOG, "utf8");
  if (log.includes("## Sin publicar")) {
    const titulo = `## ${label} · ${hoy}${obligatoria ? "\n\n[obligatoria]" : ""}`;
    writeFileSync(CHANGELOG, log.replace("## Sin publicar", `## Sin publicar\n\n${titulo}`));
  }
}
await $`git add ${VERSION_FILE} ${CHANGELOG}`;
await $`git commit -m ${`deploy: ${label}`}`;
await $`git tag -a ${tag} -m ${label}${obligatoria ? " [obligatoria]" : ""}`;

const envFile = existsSync(".cloudflare.env") ? "set -a && source .cloudflare.env && set +a && " : "";
const result = await $`bash -c ${`${envFile}cd apps/web && bun run build && bunx wrangler deploy`}`.nothrow();

if (result.exitCode !== 0) {
  console.error(`\nEl despliegue falló. Revirtiendo commit, etiqueta y versión.`);
  await $`git tag -d ${tag}`.nothrow();
  await $`git reset --soft HEAD~1`.nothrow();
  await $`git checkout HEAD -- ${VERSION_FILE} ${CHANGELOG}`.nothrow();
  await $`git reset -q`.nothrow();
  process.exit(1);
}

const remoto = (await $`git remote`.text()).includes("origin");
if (remoto) {
  await $`git push origin main`;
  await $`git push origin ${tag}`;
  console.log(`\n${label}: web publicada; apps compilándose en GitHub Actions (release ${tag}).`);
} else {
  console.log(`\n${label}: web publicada. Falta el remoto «origin»: crea el repo y empuja main y ${tag} para publicar las apps.`);
}

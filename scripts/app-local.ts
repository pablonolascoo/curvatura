#!/usr/bin/env bun
/**
 * App de macOS en este Mac con firma estable (receta de bim-storage/scripts/empaquetar-macos.ts).
 *
 * Tauri solo firma con identidades de confianza del sistema (Developer ID). Sin cuenta de Apple:
 *   1. compila sin firmar (con la clave del actualizador),
 *   2. firma con la identidad fija de scripts/firma.ts desde un llavero propio (codesign --keychain),
 *   3. rehace el DMG y el paquete de actualización (.app.tar.gz + .sig) con la app ya firmada.
 * La huella no cambia entre versiones. Con Developer ID en el llavero se usa ese y no hace falta este paso.
 */
import { $ } from "bun";
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { identidad } from "./firma";

const raiz = join(import.meta.dir, "..");
const desktop = join(raiz, "apps/desktop");
const bundle = join(desktop, "src-tauri/target/release/bundle");
const app = join(bundle, "macos/Curvatura.app");
const firma = join(homedir(), "Library/Application Support/Curvatura/firma");
const llavero = join(firma, "curvatura.keychain-db");
const version = JSON.parse(readFileSync(join(raiz, "version.json"), "utf8")).version as string;

const env = await identidad();
const clave = readFileSync(join(firma, "curvatura.pass"), "utf8").trim();

// 1. Compilar (sin variables APPLE_*: Tauri no firma; sí genera el paquete de actualización).
console.log("▸ Compilando");
await $`bunx tauri build --bundles app`.cwd(desktop).env({
  ...process.env,
  TAURI_SIGNING_PRIVATE_KEY: env.TAURI_SIGNING_PRIVATE_KEY,
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD,
});

// 2. Llavero propio con la identidad fija (no toca el llavero de inicio de sesión ni la lista de búsqueda).
if (!existsSync(llavero)) {
  await $`security create-keychain -p ${clave} ${llavero}`.quiet();
  await $`security set-keychain-settings ${llavero}`.quiet();
  await $`security import ${join(firma, "curvatura.p12")} -k ${llavero} -P ${clave} -T /usr/bin/codesign`.quiet();
  await $`security set-key-partition-list -S apple-tool:,apple: -s -k ${clave} ${llavero}`.quiet();
}
await $`security unlock-keychain -p ${clave} ${llavero}`.quiet();
const huella = (await $`security find-identity -p codesigning ${llavero}`.text()).match(/([0-9A-F]{40}) "Curvatura/)?.[1];
if (!huella) throw new Error("No se encontró la identidad de firma de Curvatura en su llavero.");

console.log("▸ Firmando con la identidad fija");
await $`codesign --force --deep --options runtime --timestamp=none --keychain ${llavero} --sign ${huella} ${app}`;
await $`codesign --verify --deep --strict ${app}`;

// 3. Paquete de actualización y DMG con la app firmada.
console.log("▸ Paquete de actualización firmado");
const tgz = join(bundle, "macos/Curvatura.app.tar.gz");
rmSync(tgz, { force: true });
await $`tar -czf ${tgz} -C ${join(bundle, "macos")} Curvatura.app`;
await $`bunx tauri signer sign -k ${env.TAURI_SIGNING_PRIVATE_KEY} -p ${env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD} ${tgz}`.cwd(desktop).quiet();

console.log("▸ DMG");
const dmgDir = join(bundle, "dmg");
const staging = join(dmgDir, "staging");
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });
await $`ditto ${app} ${join(staging, "Curvatura.app")}`;
symlinkSync("/Applications", join(staging, "Applications"));
const dmg = join(dmgDir, `Curvatura_${version}_aarch64.dmg`);
rmSync(dmg, { force: true });
// hdiutil calcula mal el tamaño con muchos ficheros pequeños (Pyodide, uv): se reserva un 30 % de margen.
const megas = Math.ceil(Number((await $`du -sm ${staging}`.text()).split("\t")[0]) * 1.3) + 50;
await $`hdiutil create -volname Curvatura -srcfolder ${staging} -size ${`${megas}m`} -ov -format UDZO ${dmg}`.quiet();
rmSync(staging, { recursive: true, force: true });
await $`codesign --force --timestamp=none --keychain ${llavero} --sign ${huella} ${dmg}`;

console.log(`\n✓ ${app}\n✓ ${dmg}\n✓ ${tgz} (+ .sig)\nIdentidad: ${huella}`);

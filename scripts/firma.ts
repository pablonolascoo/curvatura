#!/usr/bin/env bun
/**
 * Firma estable de Curvatura (receta de bim-storage/scripts/firma-estable.ts).
 *
 * Por qué: firmada «ad hoc», la huella de la app cambia en cada versión y macOS la trata como
 * otra app (vuelve a pedir permisos y el actualizador no puede sustituirla limpiamente). Con una
 * identidad propia y fija, la «exigencia designada» no cambia entre versiones.
 *
 * Además genera (si falta) la clave del actualizador: firma cada paquete de actualización y la
 * app solo instala lo que verifica con la clave pública de tauri.conf.json.
 *
 * Todo vive fuera del repo, en ~/Library/Application Support/Curvatura/firma/ (solo esta cuenta).
 * Cuando haya certificado «Developer ID» de Apple, basta con exportar APPLE_SIGNING_IDENTITY con él
 * (y APPLE_ID, APPLE_PASSWORD, APPLE_TEAM_ID para notarizar): este script deja de usarse.
 *
 *   bun scripts/firma.ts           → crea lo que falte e imprime las variables para tauri build
 *   bun scripts/firma.ts --github  → imprime los comandos `gh secret set` para el flujo de release
 */
import { $ } from "bun";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const NOMBRE = "Curvatura · Pablo Nolasco";
const dir = join(homedir(), "Library/Application Support/Curvatura/firma");
const p12 = join(dir, "curvatura.p12");
const pass = join(dir, "curvatura.pass");
const updKey = join(dir, "updater.key");
const updPass = join(dir, "updater.pass");

function secreto(path: string): string {
  if (!existsSync(path)) {
    writeFileSync(path, randomBytes(24).toString("hex"));
    chmodSync(path, 0o600);
  }
  return readFileSync(path, "utf8").trim();
}

export async function identidad() {
  mkdirSync(dir, { recursive: true });
  chmodSync(dir, 0o700);
  const clave = secreto(pass);
  if (!existsSync(p12)) {
    const tmp = join(dir, "tmp");
    mkdirSync(tmp, { recursive: true });
    const conf = `[req]\ndistinguished_name=dn\nprompt=no\nstring_mask=utf8only\n[dn]\nCN=${NOMBRE}\nO=Curvatura\n[ext]\nbasicConstraints=critical,CA:false\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=critical,codeSigning\n`;
    writeFileSync(join(tmp, "conf"), conf);
    await $`openssl req -utf8 -x509 -newkey rsa:2048 -nodes -days 7300 -keyout ${join(tmp, "k.pem")} -out ${join(tmp, "c.pem")} -config ${join(tmp, "conf")} -extensions ext`.quiet();
    const legacy = await $`openssl pkcs12 -export -legacy -inkey ${join(tmp, "k.pem")} -in ${join(tmp, "c.pem")} -out ${p12} -passout pass:${clave} -name ${NOMBRE}`.quiet().nothrow();
    if (legacy.exitCode !== 0) await $`openssl pkcs12 -export -inkey ${join(tmp, "k.pem")} -in ${join(tmp, "c.pem")} -out ${p12} -passout pass:${clave} -name ${NOMBRE}`.quiet();
    chmodSync(p12, 0o600);
    await $`rm -rf ${tmp}`.quiet();
  }
  if (!existsSync(updKey)) {
    const up = secreto(updPass);
    await $`bunx tauri signer generate --ci -p ${up} -w ${updKey}`.cwd(join(import.meta.dir, "../apps/desktop")).quiet();
  }
  return {
    APPLE_CERTIFICATE: readFileSync(p12).toString("base64"),
    APPLE_CERTIFICATE_PASSWORD: clave,
    APPLE_SIGNING_IDENTITY: NOMBRE,
    TAURI_SIGNING_PRIVATE_KEY: readFileSync(updKey, "utf8").trim(),
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: secreto(updPass),
  };
}

if (import.meta.main) {
  const env = await identidad();
  if (process.argv.includes("--github")) {
    // Se imprimen los comandos, no los valores: cada uno lee el archivo local al ejecutarse.
    // En GitHub solo van las claves del actualizador. La identidad fija no es de confianza para
    // Tauri en CI; allí macOS se firma con Developer ID cuando exista (secretos APPLE_*).
    console.log(`gh secret set TAURI_SIGNING_PRIVATE_KEY --repo pablonolascoo/curvatura < "${updKey}"`);
    console.log(`gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo pablonolascoo/curvatura < "${updPass}"`);
  } else {
    console.log(`Firma lista en ${dir}`);
    console.log(`Identidad: ${env.APPLE_SIGNING_IDENTITY}`);
  }
}

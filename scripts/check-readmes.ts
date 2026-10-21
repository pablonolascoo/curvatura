#!/usr/bin/env bun
/**
 * Comprueba que los README de todos los idiomas van parejos con el español (README.md).
 *
 * Compara, idioma por idioma:
 *   - la estructura de títulos (nivel y numeración),
 *   - el número de filas de cada tabla,
 *   - los comandos de los bloques de código (sin los comentarios, que sí se traducen),
 *   - los enlaces a archivos y webs,
 *   - las cifras (si cambia un número en uno, tiene que cambiar en todos).
 *
 *   bun scripts/check-readmes.ts     → sale con error si alguno se ha quedado atrás
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const raiz = join(import.meta.dir, "..");
const base = "README.md";
const otros = ["README.en.md", "README.fr.md", "README.zh.md"];

type Huella = { titulos: string[]; tablas: number[]; codigo: string[]; enlaces: string[]; cifras: string[] };

function huella(texto: string): Huella {
  const lineas = texto.split("\n");
  const titulos: string[] = [];
  const tablas: number[] = [];
  const codigo: string[] = [];
  let enCodigo = false;
  let filas = 0;
  const prosa: string[] = [];
  for (const l of lineas) {
    if (l.startsWith("```")) {
      enCodigo = !enCodigo;
      continue;
    }
    if (enCodigo) {
      const cmd = l.replace(/\s+#.*$/, "").trim();
      if (cmd) codigo.push(cmd);
      continue;
    }
    if (l.startsWith("|")) filas++;
    else if (filas) {
      tablas.push(filas);
      filas = 0;
    }
    const t = l.match(/^(#{1,6})\s+(\d+(?:\.\d+)*\.?)?/);
    if (t) titulos.push(`${t[1]} ${t[2] ?? ""}`.trim());
    prosa.push(l);
  }
  if (filas) tablas.push(filas);
  const cuerpo = prosa.join("\n");
  const enlaces = [...cuerpo.matchAll(/\]\(([^)]+)\)|<(https?:[^>]+)>/g)]
    .map((m) => m[1] ?? m[2])
    .filter((u) => !/^README(\.\w+)?\.md$/.test(u))
    .sort();
  // Cifras de la prosa, sin las de títulos numerados, rutas, versiones de licencia ni enlaces.
  const limpio = cuerpo
    .replace(/^#{1,6}\s+[\d.]+/gm, "")
    .replace(/\]\([^)]*\)|<https?:[^>]+>|`[^`]*`/g, "")
    .replace(/^\d+\.\s/gm, "");
  const cifras = [...limpio.matchAll(/\d+/g)].map((m) => m[0]).sort();
  return { titulos, tablas, codigo, enlaces, cifras };
}

function diferencia(a: string[], b: string[]): string {
  const faltan = a.filter((x) => !b.includes(x));
  const sobran = b.filter((x) => !a.includes(x));
  return [faltan.length ? `faltan ${faltan.join(", ")}` : "", sobran.length ? `sobran ${sobran.join(", ")}` : ""]
    .filter(Boolean)
    .join("; ");
}

const ref = huella(readFileSync(join(raiz, base), "utf8"));
let fallos = 0;
for (const f of otros) {
  let h: Huella;
  try {
    h = huella(readFileSync(join(raiz, f), "utf8"));
  } catch {
    console.error(`✗ ${f}: no existe`);
    fallos++;
    continue;
  }
  const errores: string[] = [];
  const cmp = (nombre: keyof Huella) => {
    const a = ref[nombre].map(String);
    const b = h[nombre].map(String);
    if (a.join("\n") !== b.join("\n")) errores.push(`${nombre}: ${diferencia(a, b) || "distinto orden o cantidad"}`);
  };
  (["titulos", "tablas", "codigo", "enlaces", "cifras"] as const).forEach(cmp);
  if (errores.length) {
    fallos++;
    console.error(`✗ ${f} no va parejo con ${base}:\n  - ${errores.join("\n  - ")}`);
  } else console.log(`✓ ${f}`);
}
if (fallos) {
  console.error(`\nActualiza los README de todos los idiomas a la vez (ver README.md, sección 5.1).`);
  process.exit(1);
}

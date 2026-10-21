#!/usr/bin/env bun
/**
 * Copia en public/pyodide/ solo lo que el laboratorio necesita de Pyodide: el intérprete y
 * numpy, sympy, scipy con sus dependencias. Lo usa la app de escritorio para funcionar sin red.
 * La web pública lo carga del CDN y no necesita este paso.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const VERSION = "0.27.7";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
const OUT = path.resolve(import.meta.dir, "../public/pyodide");
const WANT = ["numpy", "sympy", "scipy"];
const CORE = ["pyodide.js", "pyodide.mjs", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

async function get(file: string): Promise<ArrayBuffer> {
  const r = await fetch(CDN + file);
  if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
  return r.arrayBuffer();
}

mkdirSync(OUT, { recursive: true });
const lock = JSON.parse(new TextDecoder().decode(await get("pyodide-lock.json"))) as { packages: Record<string, { file_name: string; depends: string[] }> };

const need = new Set<string>();
const visit = (n: string) => {
  const key = n.toLowerCase();
  if (need.has(key)) return;
  const pkg = lock.packages[key];
  if (!pkg) throw new Error(`Paquete desconocido en Pyodide ${VERSION}: ${n}`);
  need.add(key);
  pkg.depends.forEach(visit);
};
WANT.forEach(visit);

const files = [...CORE, ...[...need].map((k) => lock.packages[k].file_name)];
let bytes = 0;
for (const f of files) {
  const dst = path.join(OUT, f);
  if (existsSync(dst)) continue;
  const data = await get(f);
  writeFileSync(dst, Buffer.from(data));
  bytes += data.byteLength;
}
console.log(`fetch-pyodide: ${files.length} ficheros (${[...need].join(", ")}), ${(bytes / 1e6).toFixed(1)} MB nuevos`);

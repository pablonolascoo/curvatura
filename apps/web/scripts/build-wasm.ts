#!/usr/bin/env bun
// Compila solvers/rust a WebAssembly y lo deja en public/wasm/. Si no hay cargo, usa el .wasm existente.
import { $ } from "bun";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const crate = path.resolve(import.meta.dir, "../../../solvers/rust");
const out = path.resolve(import.meta.dir, "../public/wasm");
const wasm = path.join(crate, "target/wasm32-unknown-unknown/release/curvatura_core.wasm");

const hasCargo = (await $`which cargo`.nothrow().quiet()).exitCode === 0;
if (hasCargo) {
  await $`cargo build --release --target wasm32-unknown-unknown --manifest-path ${path.join(crate, "Cargo.toml")}`;
} else if (!existsSync(path.join(out, "curvatura_core.wasm"))) {
  console.error("build-wasm: falta cargo y no hay núcleo precompilado. Instala Rust: https://rustup.rs");
  process.exit(1);
}
if (existsSync(wasm)) {
  mkdirSync(out, { recursive: true });
  copyFileSync(wasm, path.join(out, "curvatura_core.wasm"));
  console.log("build-wasm: public/wasm/curvatura_core.wasm actualizado");
}

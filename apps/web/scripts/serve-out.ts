#!/usr/bin/env bun
// Sirve apps/web/out como lo haría Cloudflare o la app de escritorio (carpeta/ → carpeta/index.html).
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "../out");
const port = Number(process.argv[2] ?? 3218);

Bun.serve({
  port,
  async fetch(req) {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p.includes("..")) return new Response("Bad request", { status: 400 });
    if (p.endsWith("/")) p += "index.html";
    let file = Bun.file(path.join(ROOT, p));
    if (!(await file.exists())) file = Bun.file(path.join(ROOT, p, "index.html"));
    if (!(await file.exists())) return new Response(Bun.file(path.join(ROOT, "404.html")), { status: 404, headers: { "content-type": "text/html" } });
    return new Response(file);
  },
});
console.log(`out/ en http://localhost:${port}`);

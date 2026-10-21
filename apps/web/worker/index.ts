/**
 * Curvatura · API de valoraciones (Cloudflare Worker).
 *
 * Los estáticos (apps/web/out) los sirve el binding ASSETS; aquí solo llega /api/* (run_worker_first).
 *
 * Identidad: inicio de sesión con ORCID (identificador verificado de investigador).
 *   - Valorar (1 a 5 estrellas): cualquier usuario con sesión ORCID.
 *   - Mención de honor: usuarios con estudios (grado, máster, posgrado, doctorado) o trabajo en el ámbito
 *     verificados. Verificación:
 *       1. Automática si su registro ORCID público tiene una afiliación del área validada por la propia
 *          institución (fuente distinta del usuario).
 *       2. Si no, sube su documento (PDF o imagen) y un administrador lo revisa. El documento se borra
 *          de KV al cerrarse la revisión; solo se guarda su huella SHA-256.
 */

type Usuario = { id: string; nombre: string; mencion: string; mencion_base: string | null };

const COOKIE = "cv_sesion";
const DIAS_SESION = 30;
const MAX_DOC = 5 * 1024 * 1024;
const AREA = /(physi|f[ií]sic|physique|relativ|gravit|cosmolog|astro|aerospace|aeroespacial|a[eé]ronaut|propuls|quantum|cu[aá]ntic|quantique|spacetime|espaciotiempo|espace-temps|mathemat|matem[aá]tic|ingenier|engineer|ing[eé]nieur)/i;

// ── utilidades ──────────────────────────────────────────────────────────────

const json = (data: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

const error = (status: number, mensaje: string) => json({ error: mensaje }, status);

function log(event: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ...data }));
}

async function sha256(data: ArrayBuffer | string): Promise<string> {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const h = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function token(bytes = 32): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function cookie(req: Request, name: string): string | null {
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

const setCookie = (name: string, value: string, maxAge: number, secure: boolean) =>
  `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;

const esAdmin = (env: Env, u: Usuario | null) => !!u && (env.ADMIN_ORCIDS ?? "").split(",").map((s) => s.trim()).filter(Boolean).includes(u.id);

/** Rutas de retorno solo internas (evita redirecciones abiertas). */
function retornoSeguro(v: string | null): string {
  return v && /^\/(es|en|fr)\/[^\s]*$/.test(v) && !v.startsWith("//") ? v : "/es/cuenta/";
}

/** Las peticiones que cambian algo deben venir del propio sitio (CSRF). */
function mismoOrigen(req: Request, env: Env): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const u = new URL(req.url);
  return origin === u.origin || origin === env.SITE_URL;
}

async function usuarioDeSesion(req: Request, env: Env): Promise<Usuario | null> {
  const t = cookie(req, COOKIE);
  if (!t) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.nombre, u.mencion, u.mencion_base FROM sesiones s JOIN usuarios u ON u.id = s.usuario
     WHERE s.hash = ?1 AND s.caduca > datetime('now')`,
  ).bind(await sha256(t)).first<Usuario>();
  return row ?? null;
}

async function abrirSesion(env: Env, orcid: string, nombre: string, secure: boolean): Promise<string> {
  await env.DB.prepare(`INSERT INTO usuarios (id, nombre) VALUES (?1, ?2) ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre`)
    .bind(orcid, nombre.slice(0, 200)).run();
  const t = token();
  await env.DB.prepare(`INSERT INTO sesiones (hash, usuario, caduca) VALUES (?1, ?2, datetime('now', ?3))`)
    .bind(await sha256(t), orcid, `+${DIAS_SESION} days`).run();
  return setCookie(COOKIE, t, DIAS_SESION * 86400, secure);
}

// ── ORCID ───────────────────────────────────────────────────────────────────

async function evidenciaOrcid(env: Env, orcid: string) {
  const base = env.ORCID_BASE.includes("sandbox") ? "https://pub.sandbox.orcid.org" : "https://pub.orcid.org";
  const tipos = ["educations", "qualifications", "employments"] as const;
  const out: { tipo: string; organizacion: string; puesto: string; departamento: string; validada: boolean; fuente: string }[] = [];
  for (const tipo of tipos) {
    const r = await fetch(`${base}/v3.0/${orcid}/${tipo}`, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(`ORCID ${tipo}: HTTP ${r.status}`);
    const data = (await r.json()) as { "affiliation-group"?: { summaries?: Record<string, Record<string, unknown>>[] }[] };
    for (const g of data["affiliation-group"] ?? []) {
      for (const s of g.summaries ?? []) {
        const a = Object.values(s)[0] as Record<string, any>;
        const src = a?.source ?? {};
        // Validada: la registró un cliente institucional (no el propio titular desde su perfil).
        const propia = src["source-orcid"]?.path === orcid && !src["assertion-origin-orcid"];
        const fuente = src["source-name"]?.value ?? "";
        out.push({
          tipo,
          organizacion: a?.organization?.name ?? "",
          puesto: a?.["role-title"] ?? "",
          departamento: a?.["department-name"] ?? "",
          validada: !propia && !!src["source-client-id"],
          fuente,
        });
      }
    }
  }
  return out;
}

// ── manejadores ─────────────────────────────────────────────────────────────

async function api(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);
  const p = url.pathname;
  const secure = url.protocol === "https:";

  // Sesión
  if (p === "/api/auth/orcid/login" && req.method === "GET") {
    if (!env.ORCID_CLIENT_ID || !env.ORCID_CLIENT_SECRET) return error(503, "El inicio de sesión con ORCID aún no está configurado.");
    const state = token(16);
    const retorno = retornoSeguro(url.searchParams.get("volver"));
    const auth = new URL("/oauth/authorize", env.ORCID_BASE);
    auth.searchParams.set("client_id", env.ORCID_CLIENT_ID);
    auth.searchParams.set("response_type", "code");
    auth.searchParams.set("scope", "/authenticate");
    auth.searchParams.set("redirect_uri", `${url.origin}/api/auth/orcid/callback`);
    auth.searchParams.set("state", state);
    return new Response(null, {
      status: 302,
      headers: [
        ["location", auth.toString()],
        ["set-cookie", setCookie("cv_state", `${state}|${retorno}`, 600, secure)],
      ],
    });
  }

  if (p === "/api/auth/orcid/callback" && req.method === "GET") {
    const [esperado, retorno] = (cookie(req, "cv_state") ?? "|").split("|");
    const code = url.searchParams.get("code");
    if (!code || !esperado || url.searchParams.get("state") !== esperado) return error(400, "Estado de inicio de sesión no válido. Vuelve a intentarlo.");
    const r = await fetch(new URL("/oauth/token", env.ORCID_BASE), {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.ORCID_CLIENT_ID ?? "", client_secret: env.ORCID_CLIENT_SECRET ?? "",
        grant_type: "authorization_code", code, redirect_uri: `${url.origin}/api/auth/orcid/callback`,
      }),
    });
    if (!r.ok) {
      log("orcid_token_error", { status: r.status });
      return error(502, "ORCID no confirmó el inicio de sesión.");
    }
    const t = (await r.json()) as { orcid?: string; name?: string };
    if (!t.orcid || !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(t.orcid)) return error(502, "Respuesta de ORCID sin iD válido.");
    const c = await abrirSesion(env, t.orcid, t.name || t.orcid, secure);
    log("login", { orcid: t.orcid });
    return new Response(null, { status: 302, headers: [["location", retornoSeguro(retorno)], ["set-cookie", c], ["set-cookie", setCookie("cv_state", "", 0, secure)]] });
  }

  // Inicio de sesión de pruebas: solo en local y con DEV_LOGIN=1.
  if (p === "/api/auth/dev-login" && env.DEV_LOGIN === "1" && ["localhost", "127.0.0.1"].includes(url.hostname)) {
    const orcid = url.searchParams.get("orcid") ?? "0000-0000-0000-0001";
    const c = await abrirSesion(env, orcid, url.searchParams.get("nombre") ?? "Usuario de prueba", false);
    return new Response(null, { status: 302, headers: { location: retornoSeguro(url.searchParams.get("volver")), "set-cookie": c } });
  }

  if (p === "/api/auth/logout" && req.method === "POST") {
    if (!mismoOrigen(req, env)) return error(403, "Origen no permitido.");
    const t = cookie(req, COOKIE);
    if (t) await env.DB.prepare(`DELETE FROM sesiones WHERE hash = ?1`).bind(await sha256(t)).run();
    return json({ ok: true }, 200, { "set-cookie": setCookie(COOKIE, "", 0, secure) });
  }

  const yo = await usuarioDeSesion(req, env);

  if (p === "/api/yo" && req.method === "GET") {
    const ver = yo
      ? await env.DB.prepare(`SELECT id, tipo, titulo, institucion, anio, area, estado, nota, creada, revisada FROM verificaciones WHERE usuario = ?1 ORDER BY creada DESC`).bind(yo.id).all()
      : null;
    return json({ usuario: yo, admin: esAdmin(env, yo), verificaciones: ver?.results ?? [], orcid: !!(env.ORCID_CLIENT_ID && env.ORCID_CLIENT_SECRET) });
  }

  // Valoraciones de un paper
  if (p === "/api/valoraciones" && req.method === "GET") {
    const paper = url.searchParams.get("paper") ?? "";
    if (!/^[a-z0-9-]{1,80}$/.test(paper)) return error(400, "Paper no válido.");
    const [agg, menciones, mia] = await env.DB.batch([
      env.DB.prepare(`SELECT COUNT(*) AS n, AVG(estrellas) AS media, SUM(estrellas = 5) AS e5, SUM(estrellas = 4) AS e4, SUM(estrellas = 3) AS e3, SUM(estrellas = 2) AS e2, SUM(estrellas = 1) AS e1 FROM valoraciones WHERE paper = ?1`).bind(paper),
      env.DB.prepare(`SELECT u.nombre, u.id AS orcid, u.mencion_base AS base FROM valoraciones v JOIN usuarios u ON u.id = v.usuario WHERE v.paper = ?1 AND v.mencion = 1 AND u.mencion = 'aprobada' ORDER BY v.fecha`).bind(paper),
      env.DB.prepare(`SELECT estrellas, mencion FROM valoraciones WHERE paper = ?1 AND usuario = ?2`).bind(paper, yo?.id ?? ""),
    ]);
    return json({ resumen: agg.results[0], menciones: menciones.results, mia: mia.results[0] ?? null, usuario: yo ? { nombre: yo.nombre, mencion: yo.mencion } : null, orcid: !!(env.ORCID_CLIENT_ID && env.ORCID_CLIENT_SECRET) });
  }

  if (p === "/api/valoraciones" && req.method === "POST") {
    if (!mismoOrigen(req, env)) return error(403, "Origen no permitido.");
    if (!yo) return error(401, "Inicia sesión con ORCID para valorar.");
    const b = (await req.json().catch(() => null)) as { paper?: string; estrellas?: number; mencion?: boolean } | null;
    if (!b || !/^[a-z0-9-]{1,80}$/.test(b.paper ?? "")) return error(400, "Paper no válido.");
    const estrellas = Number(b.estrellas);
    if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) return error(400, "La valoración va de 1 a 5 estrellas.");
    if (b.mencion && yo.mencion !== "aprobada") return error(403, "La Mención de honor requiere estudios o trabajo verificados en el ámbito.");
    await env.DB.prepare(
      `INSERT INTO valoraciones (paper, usuario, estrellas, mencion) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(paper, usuario) DO UPDATE SET estrellas = excluded.estrellas, mencion = excluded.mencion, fecha = datetime('now')`,
    ).bind(b.paper, yo.id, estrellas, b.mencion ? 1 : 0).run();
    return json({ ok: true });
  }

  // Verificación de estudios o trabajo
  if (p === "/api/verificacion" && req.method === "POST") {
    if (!mismoOrigen(req, env)) return error(403, "Origen no permitido.");
    if (!yo) return error(401, "Inicia sesión con ORCID.");
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_DOC + 64 * 1024) return error(413, "El documento supera 5 MB.");
    const f = await req.formData();
    const campo = (k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
    const tipo = campo("tipo");
    if (!["grado", "master", "postgrado", "doctorado", "trabajo"].includes(tipo)) return error(400, "Tipo no válido.");
    const [titulo, institucion, area] = [campo("titulo"), campo("institucion"), campo("area")];
    if (!titulo || !institucion || !area) return error(400, "Faltan el título, la institución o el área.");
    const anio = Number(campo("anio", 4)) || null;

    let evidencia: Awaited<ReturnType<typeof evidenciaOrcid>> = [];
    try {
      evidencia = await evidenciaOrcid(env, yo.id);
    } catch (e) {
      log("orcid_evidencia_error", { orcid: yo.id, error: String(e) });
    }
    const valida = evidencia.filter((a) => a.validada && AREA.test(`${a.puesto} ${a.departamento} ${a.organizacion}`));

    let documento: string | null = null, huella: string | null = null, docTipo: string | null = null;
    const doc = f.get("documento");
    if (doc && typeof doc !== "string" && doc.size > 0) {
      if (doc.size > MAX_DOC) return error(413, "El documento supera 5 MB.");
      const buf = await doc.arrayBuffer();
      const cab = new Uint8Array(buf.slice(0, 8));
      const pdf = cab[0] === 0x25 && cab[1] === 0x50 && cab[2] === 0x44 && cab[3] === 0x46;
      const png = cab[0] === 0x89 && cab[1] === 0x50 && cab[2] === 0x4e && cab[3] === 0x47;
      const jpg = cab[0] === 0xff && cab[1] === 0xd8;
      if (!pdf && !png && !jpg) return error(415, "Solo PDF, PNG o JPG.");
      docTipo = pdf ? "application/pdf" : png ? "image/png" : "image/jpeg";
      huella = await sha256(buf);
      documento = `doc:${crypto.randomUUID()}`;
      await env.DOCS.put(documento, buf, { metadata: { tipo: docTipo, usuario: yo.id }, expirationTtl: 60 * 60 * 24 * 90 });
    }
    if (!valida.length && !documento) return error(400, "Sin afiliación validada en ORCID: adjunta tu título o contrato.");

    const id = crypto.randomUUID();
    const estado = valida.length ? "aprobada" : "pendiente";
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO verificaciones (id, usuario, tipo, titulo, institucion, anio, area, documento, doc_sha256, doc_tipo, evidencia, estado, revisor, revisada)
                      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`)
        .bind(id, yo.id, tipo, titulo, institucion, anio, area, valida.length ? null : documento, huella, docTipo, JSON.stringify(evidencia), estado,
          valida.length ? "ORCID" : null, valida.length ? new Date().toISOString() : null),
      env.DB.prepare(`UPDATE usuarios SET mencion = ?2, mencion_base = COALESCE(?3, mencion_base) WHERE id = ?1 AND mencion != 'aprobada'`)
        .bind(yo.id, estado, valida.length ? `${titulo} · ${institucion}` : null),
    ]);
    if (valida.length && documento) ctx.waitUntil(env.DOCS.delete(documento)); // no hace falta el documento
    log("verificacion", { orcid: yo.id, estado, validadas: valida.length });
    return json({ ok: true, estado, validadas: valida.length });
  }

  // Revisión (administradores)
  if (p.startsWith("/api/admin/")) {
    if (!esAdmin(env, yo)) return error(403, "Solo administradores.");
    if (p === "/api/admin/verificaciones" && req.method === "GET") {
      const r = await env.DB.prepare(
        `SELECT v.*, u.nombre FROM verificaciones v JOIN usuarios u ON u.id = v.usuario WHERE v.estado = 'pendiente' ORDER BY v.creada`,
      ).all();
      return json({ pendientes: r.results });
    }
    const docM = p.match(/^\/api\/admin\/documento\/([0-9a-f-]{36})$/);
    if (docM && req.method === "GET") {
      const v = await env.DB.prepare(`SELECT documento, doc_tipo FROM verificaciones WHERE id = ?1`).bind(docM[1]).first<{ documento: string | null; doc_tipo: string }>();
      if (!v?.documento) return error(404, "Documento no disponible.");
      const body = await env.DOCS.get(v.documento, "stream");
      if (!body) return error(404, "Documento caducado.");
      return new Response(body, { headers: { "content-type": v.doc_tipo, "cache-control": "no-store", "content-disposition": "inline", "x-content-type-options": "nosniff" } });
    }
    const revM = p.match(/^\/api\/admin\/verificaciones\/([0-9a-f-]{36})$/);
    if (revM && req.method === "POST") {
      if (!mismoOrigen(req, env)) return error(403, "Origen no permitido.");
      const b = (await req.json().catch(() => null)) as { decision?: string; nota?: string } | null;
      if (!b || !["aprobada", "rechazada"].includes(b.decision ?? "")) return error(400, "Decisión no válida.");
      const v = await env.DB.prepare(`SELECT usuario, documento, titulo, institucion FROM verificaciones WHERE id = ?1 AND estado = 'pendiente'`).bind(revM[1])
        .first<{ usuario: string; documento: string | null; titulo: string; institucion: string }>();
      if (!v) return error(404, "No existe o ya está revisada.");
      await env.DB.batch([
        env.DB.prepare(`UPDATE verificaciones SET estado = ?2, nota = ?3, revisor = ?4, revisada = datetime('now'), documento = NULL WHERE id = ?1`)
          .bind(revM[1], b.decision, (b.nota ?? "").slice(0, 500), yo!.id),
        env.DB.prepare(`UPDATE usuarios SET mencion = ?2, mencion_base = CASE WHEN ?2 = 'aprobada' THEN ?3 ELSE mencion_base END WHERE id = ?1 AND mencion != 'aprobada'`)
          .bind(v.usuario, b.decision, `${v.titulo} · ${v.institucion}`),
      ]);
      if (v.documento) ctx.waitUntil(env.DOCS.delete(v.documento)); // el documento no se conserva tras revisar
      log("revision", { id: revM[1], decision: b.decision, revisor: yo!.id });
      return json({ ok: true });
    }
  }

  return error(404, "Ruta no encontrada.");
}

/** La app de escritorio (origen tauri) puede leer valoraciones; las acciones se hacen en la web. */
const ORIGENES_APP = new Set(["tauri://localhost", "http://tauri.localhost", "https://tauri.localhost"]);

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    try {
      const res = await api(req, env, ctx);
      const origin = req.headers.get("origin") ?? "";
      if (req.method === "GET" && url.pathname === "/api/valoraciones" && ORIGENES_APP.has(origin)) {
        const h = new Headers(res.headers);
        h.set("access-control-allow-origin", origin);
        h.set("vary", "origin");
        return new Response(res.body, { status: res.status, headers: h });
      }
      return res;
    } catch (e) {
      log("api_error", { path: url.pathname, error: e instanceof Error ? e.message : String(e) });
      return error(500, "Error interno. Inténtalo de nuevo.");
    }
  },
} satisfies ExportedHandler<Env>;

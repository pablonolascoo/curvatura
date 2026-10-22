"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Crosshair } from "@phosphor-icons/react";

/**
 * Mapa semántico 3D de la biblioteca. Cada punto es un paper, colocado según el significado de su
 * título, resumen y ficha (vectores multilingual-e5-large → UMAP 3D). Una malla fina une cada paper
 * con sus dos vecinos más parecidos; al pasar el ratón se dibujan sus ocho vecinos.
 *
 * Los nombres de los grupos flotan dentro del propio mapa, sobre su zona. Al buscar o al elegir un grupo,
 * la cámara viaja hasta esa región y ajusta el zoom a su tamaño. Se dibuja solo cuando hace falta
 * y se pausa fuera de pantalla.
 */
export type Mapa = {
  modelo: string;
  grupos: { id: number; n: number; es: string; en: string; fr: string }[];
  ids: string[];
  p: number[];
  g: number[];
  v: number[][];
};

type Props = {
  mapa: Mapa;
  titulos: (i: number) => string;
  activos: Set<number> | null; // resultados del filtro o la búsqueda (null = todos)
  relacionados: Set<number>; // vecinos por IA de los mejores resultados
  foco: number[] | null; // puntos a los que debe viajar la cámara (null = vista general)
  grupoActivo: number | null;
  lang: string;
  onAbrir: (i: number) => void;
  onGrupo: (g: number | null) => void;
  etiqueta: string;
  textos: { volver: string; papers: string; grupos: string };
};

const ESCALA = 2.2;
const ZOOM_GENERAL = 6.2;

/** Paleta categórica apagada, coherente con el monocromo cálido (misma luminosidad, poca saturación). */
const tono = (i: number) => (i * 137.508) % 360;
function colorGrupo(i: number, oscuro: boolean): THREE.Color {
  return new THREE.Color().setHSL(tono(i) / 360, oscuro ? 0.45 : 0.38, oscuro ? 0.68 : 0.46);
}

const VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aPeso;
  uniform float uPx;
  varying vec3 vColor;
  varying float vPeso;
  void main() {
    vColor = aColor;
    vPeso = aPeso;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Tamaño con perspectiva suave y acotada: al acercarse no se convierten en manchas.
    gl_PointSize = uPx * (0.65 + 0.9 * aPeso) * clamp(3.2 / -mv.z, 0.55, 1.35);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vPeso;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.36, d) * (0.18 + 0.82 * vPeso);
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

/** Suavizado exponencial independiente de los fotogramas: τ en segundos (movimiento con «masa»). */
const acercar = (a: number, b: number, dt: number, tau: number) => a + (b - a) * (1 - Math.exp(-dt / tau));

export function MapaBiblioteca({ mapa, titulos, activos, relacionados, foco, grupoActivo, lang, onAbrir, onGrupo, etiqueta, textos }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const capas = useRef<(HTMLButtonElement | null)[]>([]);
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const api = useRef<{ pesos: (a: Set<number> | null, r: Set<number>, g: number | null) => void; volar: (ix: number[] | null) => void } | null>(null);
  const cb = useRef({ onAbrir, onGrupo });
  cb.current = { onAbrir, onGrupo };
  const grupoRef = useRef(grupoActivo);
  grupoRef.current = grupoActivo;

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const n = mapa.ids.length;
    const css = getComputedStyle(document.documentElement);
    const oscuro = matchMedia("(prefers-color-scheme: dark)").matches;
    const tinta = new THREE.Color(css.getPropertyValue("--ink").trim() || "#111");
    const azul = new THREE.Color(css.getPropertyValue("--blue").trim() || "#1f6c9f");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.prepend(renderer.domElement);
    const c = renderer.domElement;
    c.style.touchAction = "pan-y";
    c.style.cursor = "grab";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, ZOOM_GENERAL);
    const grupo = new THREE.Group();
    scene.add(grupo);

    // Puntos
    const pos = new Float32Array(mapa.p.map((x) => x * ESCALA));
    const base = mapa.g.map((g) => colorGrupo(g, oscuro));
    const col = new Float32Array(n * 3);
    const peso = new Float32Array(n).fill(0.55);
    base.forEach((k, i) => k.toArray(col, i * 3));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aPeso", new THREE.BufferAttribute(peso, 1));
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      uniforms: { uPx: { value: 6 * renderer.getPixelRatio() } } });
    const puntos = new THREE.Points(geo, mat);
    grupo.add(puntos);

    // Malla de similitud: cada paper con sus 2 vecinos más parecidos.
    const seg: number[] = [];
    mapa.v.forEach((vs, i) => vs.slice(0, 2).forEach((j) => {
      if (i < j || !mapa.v[j]?.slice(0, 2).includes(i)) seg.push(...pos.subarray(i * 3, i * 3 + 3), ...pos.subarray(j * 3, j * 3 + 3));
    }));
    const malla = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(seg, 3)),
      new THREE.LineBasicMaterial({ color: tinta, transparent: true, opacity: oscuro ? 0.1 : 0.07, depthWrite: false }));
    grupo.add(malla);

    // Vecinos del punto señalado
    const vecGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(16 * 3), 3));
    const vecinos = new THREE.LineSegments(vecGeo, new THREE.LineBasicMaterial({ color: tinta, transparent: true, opacity: 0.55 }));
    vecinos.visible = false;
    grupo.add(vecinos);

    // Centro de cada grupo (para su etiqueta flotante y para viajar hasta él)
    const centros = mapa.grupos.map((gr) => {
      const v = new THREE.Vector3();
      let k = 0;
      for (let i = 0; i < n; i++) if (mapa.g[i] === gr.id) { v.x += pos[i * 3]; v.y += pos[i * 3 + 1]; v.z += pos[i * 3 + 2]; k++; }
      return v.multiplyScalar(1 / Math.max(1, k));
    });

    // Estado de cámara: rotación del conjunto, punto enfocado (espacio del modelo) y zoom.
    const objetivo = { rx: 0.35, ry: 0, zoom: ZOOM_GENERAL, centro: new THREE.Vector3() };
    const actual = { rx: 0.35, ry: 0, zoom: ZOOM_GENERAL, centro: new THREE.Vector3() };
    let girando = true;
    let visible = true;
    let raf = 0;
    let ultimo = performance.now();
    let pendiente = true;
    const proy = new THREE.Vector3();

    // Etiquetas flotantes: proyectadas cada fotograma; las más cercanas se colocan primero y las que
    // chocarían con otra se ocultan (la del grupo activo siempre se ve). Al girar van apareciendo.
    const anchos: number[] = [];
    const etiquetas = () => {
      const { width, height } = el.getBoundingClientRect();
      const ga = grupoRef.current;
      const items = centros.map((ct, k) => {
        proy.copy(ct).applyMatrix4(grupo.matrixWorld).project(camera);
        const b = capas.current[k];
        if (b && !anchos[k]) anchos[k] = b.offsetWidth;
        return { k, x: ((proy.x + 1) / 2) * width, y: ((1 - proy.y) / 2) * height, z: proy.z,
          dentro: proy.z < 1 && Math.abs(proy.x) < 1.05 && Math.abs(proy.y) < 1.05 };
      });
      items.sort((a, b2) => (mapa.grupos[b2.k].id === ga ? 1 : 0) - (mapa.grupos[a.k].id === ga ? 1 : 0) || a.z - b2.z);
      const puestas: { x0: number; x1: number; y0: number; y1: number }[] = [];
      for (const it of items) {
        const b = capas.current[it.k];
        if (!b) continue;
        const w = (anchos[it.k] || 120) / 2 + 4, h = 12;
        const r = { x0: it.x - w, x1: it.x + w, y0: it.y - h, y1: it.y + h };
        const choca = puestas.some((q) => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0);
        const activa = ga === mapa.grupos[it.k].id;
        const ver = it.dentro && (!choca || activa);
        if (ver) puestas.push(r);
        const profundidad = THREE.MathUtils.clamp(1.15 - (it.z - 0.9) * 6, 0.35, 1);
        b.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) translate(-50%, -50%)`;
        b.style.opacity = ver ? String(ga === null || activa ? profundidad : 0.22) : "0";
        b.style.pointerEvents = ver ? "auto" : "none";
      }
    };

    const frame = (t: number) => {
      raf = 0;
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      if (girando) objetivo.ry += dt * 0.07;
      actual.rx = acercar(actual.rx, objetivo.rx, dt, 0.12);
      actual.ry = acercar(actual.ry, objetivo.ry, dt, 0.12);
      actual.zoom = acercar(actual.zoom, objetivo.zoom, dt, 0.45);
      actual.centro.set(acercar(actual.centro.x, objetivo.centro.x, dt, 0.45), acercar(actual.centro.y, objetivo.centro.y, dt, 0.45),
        acercar(actual.centro.z, objetivo.centro.z, dt, 0.45));
      grupo.rotation.set(actual.rx, actual.ry, 0);
      // El punto enfocado queda en el centro de la pantalla aunque el conjunto gire.
      grupo.position.copy(actual.centro).applyEuler(grupo.rotation).negate();
      camera.position.z = actual.zoom;
      grupo.updateMatrixWorld();
      renderer.render(scene, camera);
      etiquetas();
      const resto = Math.abs(objetivo.rx - actual.rx) + Math.abs(objetivo.ry - actual.ry) + Math.abs(objetivo.zoom - actual.zoom)
        + actual.centro.distanceTo(objetivo.centro);
      if (visible && !document.hidden && (girando || resto > 1e-4 || pendiente)) raf = requestAnimationFrame(frame);
      pendiente = false;
    };
    const pedir = () => { pendiente = true; if (!raf && visible) { ultimo = performance.now(); raf = requestAnimationFrame(frame); } };

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      c.style.width = "100%";
      c.style.height = "100%";
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      pedir();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // Interacción: arrastrar gira, Ctrl/⌘ + rueda acerca, clic abre el paper.
    const ray = new THREE.Raycaster();
    ray.params.Points = { threshold: 0.045 };
    const ptr = new THREE.Vector2();
    let arrastre: { x: number; y: number; ox: number; oy: number; movido: boolean } | null = null;
    const elegir = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      return ray.intersectObject(puntos)[0]?.index ?? null;
    };
    const mostrarVecinos = (i: number | null) => {
      if (i === null) { vecinos.visible = false; return pedir(); }
      const a = vecGeo.getAttribute("position") as THREE.BufferAttribute;
      const vs = mapa.v[i].slice(0, 8);
      vs.forEach((j, k) => { a.setXYZ(2 * k, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); a.setXYZ(2 * k + 1, pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]); });
      a.needsUpdate = true;
      vecGeo.setDrawRange(0, vs.length * 2);
      vecinos.visible = true;
      pedir();
    };
    const onDown = (e: PointerEvent) => { arrastre = { x: e.clientX, y: e.clientY, ox: objetivo.rx, oy: objetivo.ry, movido: false }; girando = false; c.style.cursor = "grabbing"; };
    const onMove = (e: PointerEvent) => {
      if (arrastre) {
        const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) arrastre.movido = true;
        objetivo.ry = arrastre.oy + dx * 0.006;
        objetivo.rx = Math.max(-1.2, Math.min(1.2, arrastre.ox + dy * 0.006));
        setTip(null);
        return pedir();
      }
      const i = elegir(e);
      const r = el.getBoundingClientRect();
      setTip(i === null ? null : { i, x: e.clientX - r.left, y: e.clientY - r.top });
      c.style.cursor = i === null ? "grab" : "pointer";
      mostrarVecinos(i);
    };
    const onUp = (e: PointerEvent) => {
      if (arrastre && !arrastre.movido) {
        const i = elegir(e);
        if (i !== null) cb.current.onAbrir(i);
      }
      if (arrastre) c.style.cursor = "grab";
      arrastre = null;
    };
    const onLeave = () => { arrastre = null; setTip(null); mostrarVecinos(null); girando = true; pedir(); };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // la rueda normal sigue desplazando la página
      e.preventDefault();
      objetivo.zoom = Math.max(1.6, Math.min(9, objetivo.zoom * (1 + e.deltaY * 0.0015)));
      pedir();
    };
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    c.addEventListener("pointerleave", onLeave);
    c.addEventListener("wheel", onWheel, { passive: false });

    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) pedir(); }, { rootMargin: "100% 0px" });
    io.observe(el);

    api.current = {
      pesos: (act, rel, g) => {
        const filtrando = act !== null || g !== null;
        for (let i = 0; i < n; i++) {
          const enGrupo = g === null || mapa.g[i] === g;
          const on = (act === null || act.has(i)) && enGrupo;
          peso[i] = rel.has(i) ? 0.95 : on ? (filtrando ? 1 : 0.55) : 0.06;
          (rel.has(i) ? azul : on && act !== null ? tinta : base[i]).toArray(col, i * 3);
        }
        geo.getAttribute("aPeso").needsUpdate = true;
        geo.getAttribute("aColor").needsUpdate = true;
        pedir();
      },
      // Viaja al centro de los puntos dados y ajusta el zoom a su dispersión (robusta: percentil 80).
      volar: (ix) => {
        if (!ix || ix.length === 0) {
          objetivo.centro.set(0, 0, 0);
          objetivo.zoom = ZOOM_GENERAL;
        } else {
          const m = new THREE.Vector3();
          ix.forEach((i) => m.add(new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])));
          m.multiplyScalar(1 / ix.length);
          const d = ix.map((i) => m.distanceTo(new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]))).sort((a, b) => a - b);
          const r = d[Math.floor(d.length * 0.8)] ?? 0.4;
          objetivo.centro.copy(m);
          objetivo.zoom = THREE.MathUtils.clamp(2.6 + r * 2.6, 3.0, ZOOM_GENERAL);
        }
        pedir();
      },
    };
    pedir();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointerup", onUp);
      geo.dispose(); mat.dispose(); malla.geometry.dispose(); vecGeo.dispose();
      renderer.dispose();
      c.remove();
      api.current = null;
    };
  }, [mapa]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => api.current?.pesos(activos, relacionados, grupoActivo), [activos, relacionados, grupoActivo]);
  useEffect(() => api.current?.volar(foco), [foco]);

  const nombre = (g: Mapa["grupos"][number]) => g[lang as "es" | "en" | "fr"] ?? g.es;
  const gTip = tip ? mapa.grupos[mapa.g[tip.i]] : null;
  const fmt = new Intl.NumberFormat(lang);
  return (
    // Doble bisel: carcasa fina con anillo de 1 px y núcleo con radio concéntrico.
    <div className="rounded-[18px] bg-[var(--line)]/40 p-1.5 ring-1 ring-[var(--line)]">
      <div ref={caja} className="relative h-[380px] w-full overflow-hidden rounded-[12px] bg-surface md:h-[560px]" role="img" aria-label={etiqueta}>
        {/* Nombres de los grupos dentro del mapa, sobre su zona */}
        {mapa.grupos.map((g, k) => (
          <button key={g.id} type="button" ref={(b) => { capas.current[k] = b; }}
            onClick={() => cb.current.onGrupo(grupoActivo === g.id ? null : g.id)}
            className={`absolute left-0 top-0 z-[1] flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] leading-tight opacity-0 transition-[opacity,background-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:text-xs ${grupoActivo === g.id ? "bg-[var(--ink)] text-[var(--bg)]" : "bg-surface/80 text-fg-2 hover:bg-surface hover:text-fg"}`}
            aria-pressed={grupoActivo === g.id}>
            <span className="size-1.5 rounded-full" style={{ background: `hsl(${tono(g.id)} 38% 46%)` }} aria-hidden />
            {nombre(g)}
          </button>
        ))}
        {/* Pie del mapa: recuento y volver a la vista general */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-3 p-3">
          <span className="rounded-full bg-surface/85 px-3 py-1 font-mono text-[11px] text-muted tabular-nums">
            {fmt.format(mapa.ids.length)} {textos.papers} · {mapa.grupos.length} {textos.grupos}
          </span>
          <button type="button" onClick={() => { cb.current.onGrupo(null); api.current?.volar(null); }}
            className="pointer-events-auto inline-flex size-9 items-center justify-center rounded-full bg-surface/85 text-fg-2 ring-1 ring-[var(--line)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-fg active:scale-[0.96]"
            aria-label={textos.volver} title={textos.volver}>
            <Crosshair size={16} weight="bold" aria-hidden />
          </button>
        </div>
        {tip && (
          <div className="pointer-events-none absolute z-[3] max-w-xs rounded-md border border-line bg-surface px-3 py-2 text-sm shadow-[0_2px_8px_rgb(0_0_0/0.06)]"
            style={{ left: Math.min(tip.x + 14, (caja.current?.clientWidth ?? 400) - 300), top: tip.y + 14 }}>
            <span className="block text-fg">{titulos(tip.i)}</span>
            {gTip && <span className="mt-1 block font-mono text-xs text-muted">{nombre(gTip)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

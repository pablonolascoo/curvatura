"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Vista 3D del prototipo con despiece. Cada pieza es una forma de línea fina (como un plano técnico) con
 * relleno pastel: línea continua si está calculada, discontinua si es boceto y en rojo si una ley la bloquea.
 * Las cáscaras se muestran en corte para ver lo que hay dentro. El deslizador separa las piezas.
 */
export type Pieza3D = {
  id: string;
  nombre: string;
  tipo: string;
  radio?: number;
  dim?: number[];
  pos?: number[];
  color?: string;
  estado: "calculado" | "boceto" | "abierto";
};

type Props = { piezas: Pieza3D[]; seleccion: string | null; despiece: number; onElegir: (id: string | null) => void; etiqueta: string };

const acercar = (a: number, b: number, dt: number, tau: number) => a + (b - a) * (1 - Math.exp(-dt / tau));

function geometria(p: Pieza3D, s: number): THREE.BufferGeometry {
  const r = (p.radio ?? 1) * s;
  const [dx, dy, dz] = (p.dim ?? [1, 1, 1]).map((d) => Math.max(d * s, 0.02));
  switch (p.tipo) {
    case "cascara":
      // Corte: falta un cuarto para ver el interior.
      return new THREE.SphereGeometry(r, 26, 12, 0, Math.PI * 1.5);
    case "anillo":
      return new THREE.TorusGeometry(r, Math.max(r * 0.08, 0.03), 12, 64);
    case "celosia":
      return new THREE.CylinderGeometry(r, r, dy || r * 1.6, 12, 4, true);
    case "cilindro":
      return new THREE.CylinderGeometry(dx / 2 || r, dx / 2 || r, dy || r * 2, 32, 1);
    case "modulo":
      return new THREE.CapsuleGeometry(Math.min(dx, dz) / 2 || r, Math.max(dy - Math.min(dx, dz), 0.05) || r, 6, 16);
    case "placa":
      return new THREE.BoxGeometry(dx, Math.max(dy * 0.1, 0.01), dz || dy);
    case "cable": {
      const L = dx || r * 2;
      const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(-L / 2, 0, 0), new THREE.Vector3(-L / 6, L * 0.12, 0), new THREE.Vector3(L / 6, -L * 0.12, 0), new THREE.Vector3(L / 2, 0, 0)]);
      return new THREE.TubeGeometry(curva, 48, Math.max(L * 0.01, 0.01), 8);
    }
    default:
      return new THREE.BoxGeometry(dx, dy, dz);
  }
}

export function Prototipo3D({ piezas, seleccion, despiece, onElegir, etiqueta }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const estado = useRef({ seleccion, despiece });
  estado.current = { seleccion, despiece };
  const cb = useRef(onElegir);
  cb.current = onElegir;
  const pedirRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = caja.current;
    if (!el || !piezas.length) return;
    const css = getComputedStyle(document.documentElement);
    const v = (n: string, d: string) => new THREE.Color(css.getPropertyValue(n).trim() || d);
    const COL: Record<string, [THREE.Color, THREE.Color]> = {
      ink: [v("--ink", "#111"), v("--gray-bg", "#f1f1ef")],
      red: [v("--red", "#9f2f2d"), v("--red-bg", "#fdebec")],
      blue: [v("--blue", "#1f6c9f"), v("--blue-bg", "#e1f3fe")],
      green: [v("--green", "#346538"), v("--green-bg", "#edf3ec")],
      yellow: [v("--yellow", "#956400"), v("--yellow-bg", "#fbf3db")],
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.prepend(renderer.domElement);
    const c = renderer.domElement;
    c.style.touchAction = "pan-y";
    c.style.cursor = "grab";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);
    const raiz = new THREE.Group();
    scene.add(raiz);

    // Escala común: el conjunto cabe en una esfera de radio ~1,6 (deja sitio al despiece).
    const extension = Math.max(...piezas.map((p) => {
      const pos = p.pos ?? [0, 0, 0];
      const tam = Math.max(p.radio ?? 0, ...(p.dim ?? [0]).map((d) => d / 2));
      return Math.hypot(pos[0], pos[1], pos[2]) + tam;
    }), 1e-6);
    const s = 1.6 / extension;

    type Obj = { id: string; grupo: THREE.Group; relleno: THREE.Mesh; lineas: THREE.LineSegments; base: THREE.Vector3; dir: THREE.Vector3; color: THREE.Color };
    const objs: Obj[] = piezas.map((p, i) => {
      const [linea, fondo] = p.estado === "abierto" ? COL.red : COL[p.color ?? "ink"] ?? COL.ink;
      const geo = geometria(p, s);
      const relleno = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: fondo, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      const aristas = p.tipo === "cascara" || p.tipo === "celosia" ? new THREE.WireframeGeometry(geo) : new THREE.EdgesGeometry(geo, 25);
      const mat = p.estado === "boceto"
        ? new THREE.LineDashedMaterial({ color: linea, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0.8 })
        : new THREE.LineBasicMaterial({ color: linea, transparent: true, opacity: p.tipo === "cascara" ? 0.35 : 0.85 });
      const lineas = new THREE.LineSegments(aristas, mat);
      if (p.estado === "boceto") lineas.computeLineDistances();
      const grupo = new THREE.Group();
      grupo.add(relleno, lineas);
      const base = new THREE.Vector3(...(p.pos ?? [0, 0, 0]).map((x) => x * s));
      // Dirección de despiece: radial si la pieza está fuera del centro; si no, una espiral para separar las anidadas.
      const dir = base.lengthSq() > 1e-6 ? base.clone().normalize() : new THREE.Vector3(Math.cos(i * 2.4), 0.35 + (i % 3) * 0.25, Math.sin(i * 2.4)).normalize();
      grupo.position.copy(base);
      grupo.userData.id = p.id;
      relleno.userData.id = p.id;
      raiz.add(grupo);
      return { id: p.id, grupo, relleno, lineas, base, dir, color: linea };
    });

    const rot = { x: -0.45, y: 0.6 }, obj = { x: -0.45, y: 0.6 };
    let zoom = 6.2;
    let girando = true;
    let visible = true;
    let raf = 0;
    let ultimo = performance.now();
    let pendiente = true;
    let encima: string | null = null;
    let exp = estado.current.despiece;

    const frame = (t: number) => {
      raf = 0;
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      if (girando) obj.y += dt * 0.12;
      rot.x = acercar(rot.x, obj.x, dt, 0.12);
      rot.y = acercar(rot.y, obj.y, dt, 0.12);
      raiz.rotation.set(rot.x, rot.y, 0);
      exp = acercar(exp, estado.current.despiece, dt, 0.25);
      const sel = estado.current.seleccion;
      for (const o of objs) {
        o.grupo.position.copy(o.base).addScaledVector(o.dir, exp * 1.6);
        const activo = !sel || sel === o.id || encima === o.id;
        (o.relleno.material as THREE.MeshBasicMaterial).opacity = acercar((o.relleno.material as THREE.MeshBasicMaterial).opacity, activo ? (sel === o.id ? 0.6 : 0.32) : 0.05, dt, 0.15);
        (o.lineas.material as THREE.LineBasicMaterial).opacity = acercar((o.lineas.material as THREE.LineBasicMaterial).opacity, activo ? 0.9 : 0.12, dt, 0.15);
      }
      camera.position.set(0, 0, zoom);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      const resto = Math.abs(obj.x - rot.x) + Math.abs(obj.y - rot.y) + Math.abs(exp - estado.current.despiece);
      if (visible && !document.hidden && (girando || resto > 1e-4 || pendiente)) raf = requestAnimationFrame(frame);
      pendiente = false;
    };
    const pedir = () => { pendiente = true; if (!raf && visible) { ultimo = performance.now(); raf = requestAnimationFrame(frame); } };
    pedirRef.current = pedir;

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

    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const elegir = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      return (ray.intersectObjects(objs.map((o) => o.relleno))[0]?.object.userData.id as string | undefined) ?? null;
    };
    let arrastre: { x: number; y: number; ox: number; oy: number; movido: boolean } | null = null;
    const onDown = (e: PointerEvent) => { arrastre = { x: e.clientX, y: e.clientY, ox: obj.x, oy: obj.y, movido: false }; girando = false; c.style.cursor = "grabbing"; };
    const onMove = (e: PointerEvent) => {
      if (arrastre) {
        const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) arrastre.movido = true;
        obj.y = arrastre.oy + dx * 0.007;
        obj.x = Math.max(-1.3, Math.min(1.3, arrastre.ox + dy * 0.007));
        return pedir();
      }
      const id = elegir(e);
      if (id !== encima) { encima = id; c.style.cursor = id ? "pointer" : "grab"; pedir(); }
    };
    const onUp = (e: PointerEvent) => {
      if (arrastre && !arrastre.movido) cb.current(elegir(e));
      if (arrastre) c.style.cursor = "grab";
      arrastre = null;
    };
    const onLeave = () => { encima = null; arrastre = null; girando = true; pedir(); };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoom = Math.max(2.4, Math.min(12, zoom * (1 + e.deltaY * 0.0015)));
      pedir();
    };
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    c.addEventListener("pointerleave", onLeave);
    c.addEventListener("wheel", onWheel, { passive: false });
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) pedir(); }, { rootMargin: "100% 0px" });
    io.observe(el);
    pedir();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointerup", onUp);
      for (const o of objs) { o.relleno.geometry.dispose(); (o.relleno.material as THREE.Material).dispose(); o.lineas.geometry.dispose(); (o.lineas.material as THREE.Material).dispose(); }
      renderer.dispose();
      c.remove();
    };
  }, [piezas]);

  useEffect(() => pedirRef.current(), [seleccion, despiece]);

  return (
    <div className="rounded-[18px] bg-[var(--line)]/40 p-1.5 ring-1 ring-[var(--line)]">
      <div ref={caja} className="relative h-[420px] w-full overflow-hidden rounded-[12px] bg-surface md:h-[600px]" role="img" aria-label={etiqueta} />
    </div>
  );
}

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
      return new THREE.CylinderGeometry(p.radio ? r : dx / 2, p.radio ? r : dx / 2, dy || r * 1.6, 12, 4, true);
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

/** Trazo de plano técnico: pocas líneas que describen la forma, no la malla de triángulos. */
function trazo(p: Pieza3D, geo: THREE.BufferGeometry, s: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const seg = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const curva = (f: (t: number) => THREE.Vector3, n = 64) => { for (let i = 0; i < n; i++) seg(f(i / n), f((i + 1) / n)); };
  if (p.tipo === "cascara") {
    const r = (p.radio ?? 1) * s, barrido = Math.PI * 1.5;
    // Meridianos cada 30° (incluye los dos bordes del corte) y cinco paralelos.
    for (let k = 0; k <= 9; k++) {
      const phi = (k / 9) * barrido;
      curva((t) => new THREE.Vector3(-r * Math.cos(phi) * Math.sin(t * Math.PI), r * Math.cos(t * Math.PI), r * Math.sin(phi) * Math.sin(t * Math.PI)), 32);
    }
    for (const lat of [-0.66, -0.33, 0, 0.33, 0.66]) {
      const y = r * Math.sin(lat * Math.PI / 2), rr = r * Math.cos(lat * Math.PI / 2);
      curva((t) => new THREE.Vector3(-rr * Math.cos(t * barrido), y, rr * Math.sin(t * barrido)), 48);
    }
  } else if (p.tipo === "anillo") {
    const r = (p.radio ?? 1) * s, tubo = Math.max(r * 0.08, 0.03);
    // Torus de three.js: en el plano XY. Cuatro circunferencias y doce secciones del tubo.
    for (const [rr, z] of [[r + tubo, 0], [r - tubo, 0], [r, tubo], [r, -tubo]] as const)
      curva((t) => new THREE.Vector3(rr * Math.cos(t * 2 * Math.PI), rr * Math.sin(t * 2 * Math.PI), z), 96);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * 2 * Math.PI, c = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      curva((t) => c.clone().multiplyScalar(r + tubo * Math.cos(t * 2 * Math.PI)).add(new THREE.Vector3(0, 0, tubo * Math.sin(t * 2 * Math.PI))), 12);
    }
  } else if (p.tipo === "celosia") {
    return new THREE.WireframeGeometry(geo);
  } else {
    return new THREE.EdgesGeometry(geo, 25);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
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
      relleno.userData.base = p.tipo === "cascara" ? 0.1 : 0.32; // las cáscaras grandes no deben tapar lo de dentro
      const aristas = trazo(p, geo, s);
      const mat = p.estado === "boceto"
        ? new THREE.LineDashedMaterial({ color: linea, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0.8 })
        : new THREE.LineBasicMaterial({ color: linea, transparent: true, opacity: p.tipo === "cascara" ? 0.35 : 0.85 });
      const lineas = new THREE.LineSegments(aristas, mat);
      lineas.userData.base = p.tipo === "cascara" ? 0.45 : 0.9;
      if (p.estado === "boceto") lineas.computeLineDistances();
      const grupo = new THREE.Group();
      grupo.add(relleno, lineas);
      const base = new THREE.Vector3(...(p.pos ?? [0, 0, 0]).map((x) => x * s));
      // Dirección de despiece: radial si la pieza está fuera del centro; si no, una espiral para separar las anidadas.
      // Las piezas centradas se reparten en corona (las grandes se quedan; las pequeñas salen más lejos).
      const centradas = piezas.filter((q) => !q.pos || Math.hypot(q.pos[0], q.pos[1], q.pos[2]) < 1e-9);
      const k = centradas.indexOf(p);
      const dir = base.lengthSq() > 1e-6
        ? base.clone().normalize()
        : new THREE.Vector3(Math.cos((k / Math.max(1, centradas.length)) * 2 * Math.PI), (k % 2 ? 0.45 : -0.2), Math.sin((k / Math.max(1, centradas.length)) * 2 * Math.PI)).normalize()
            .multiplyScalar(p.tipo === "cascara" ? 0.35 : 1 + 0.15 * (k % 3));
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
    let distancia = zoom;
    const mira = new THREE.Vector3();
    const objetivoMira = new THREE.Vector3();

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
        o.grupo.position.copy(o.base).addScaledVector(o.dir, exp * 2.2);
        const activo = !sel || sel === o.id || encima === o.id;
        const base = o.relleno.userData.base as number;
        (o.relleno.material as THREE.MeshBasicMaterial).opacity = acercar((o.relleno.material as THREE.MeshBasicMaterial).opacity, activo ? (sel === o.id ? Math.max(0.5, base) : base) : 0.03, dt, 0.15);
        (o.lineas.material as THREE.LineBasicMaterial).opacity = acercar((o.lineas.material as THREE.LineBasicMaterial).opacity, activo ? (sel === o.id ? 1 : (o.lineas.userData.base as number)) : 0.1, dt, 0.15);
      }
      // La cámara se aleja con el despiece y viaja hacia la pieza elegida (sin perder el conjunto).
      const elegida = sel ? objs.find((o) => o.id === sel) : undefined;
      raiz.updateMatrixWorld();
      if (elegida) elegida.grupo.getWorldPosition(objetivoMira).multiplyScalar(0.6);
      else objetivoMira.set(0, 0, 0);
      const objetivoDist = zoom * (1 + 0.55 * exp) * (elegida ? 0.85 : 1);
      distancia = acercar(distancia, objetivoDist, dt, 0.3);
      mira.x = acercar(mira.x, objetivoMira.x, dt, 0.3);
      mira.y = acercar(mira.y, objetivoMira.y, dt, 0.3);
      mira.z = acercar(mira.z, objetivoMira.z, dt, 0.3);
      camera.position.set(mira.x, mira.y, mira.z + distancia);
      camera.lookAt(mira);
      renderer.render(scene, camera);
      const resto = Math.abs(obj.x - rot.x) + Math.abs(obj.y - rot.y) + Math.abs(exp - estado.current.despiece) + Math.abs(distancia - objetivoDist) + mira.distanceTo(objetivoMira);
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

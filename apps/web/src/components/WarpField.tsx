"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Superficie θ(x, ρ) de Alcubierre: expansión de los elementos de volumen.
 * Contracción delante de la burbuja, expansión detrás. Cálculo en el vertex shader,
 * misma fórmula que physics/curvatura/metrics/alcubierre.py.
 */
export type WarpParams = { v: number; R: number; sigma: number };

type Props = {
  params?: WarpParams;
  /** Desplazamiento de la burbuja en pantalla (≥ 768 px), en unidades de la escena. */
  offset?: [number, number];
  /** Escala vertical de la superficie (adimensional). */
  amplitude?: number;
  /** Deriva de cámara y oscilación de la burbuja. */
  drift?: boolean;
  label: string;
  className?: string;
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uV;
  uniform float uR;
  uniform float uSigma;
  uniform float uAmp;
  uniform float uXs;
  varying float vH;
  varying float vDist;

  float sech2(float u) {
    float e = exp(-2.0 * abs(u));
    return 4.0 * e / ((1.0 + e) * (1.0 + e));
  }

  float theta(vec2 p) {
    float dx = p.x - uXs;
    float r = length(vec2(dx, p.y));
    if (r < 1e-4) return 0.0;
    float df = uSigma * (sech2(uSigma * (r + uR)) - sech2(uSigma * (r - uR))) / (2.0 * tanh(uSigma * uR));
    return uV * (dx / r) * df;
  }

  void main() {
    vec3 p = position;
    float h = theta(p.xy);
    p.z = uAmp * h;
    vH = h;
    vDist = length(p.xy) / 3.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uFg;
  uniform vec3 uRed;
  uniform vec3 uBlue;
  uniform float uPeak;
  uniform float uBase;
  uniform float uFill;
  varying float vH;
  varying float vDist;

  void main() {
    // Rojo: contracción (θ < 0, delante). Azul: expansión (θ > 0, detrás).
    float k = smoothstep(0.08, 0.85, abs(vH) / uPeak);
    vec3 col = mix(uFg, vH < 0.0 ? uRed : uBlue, k);
    float fade = 1.0 - smoothstep(0.55, 1.0, vDist);
    float a = mix(uBase, 1.0, k) * fade;
    // Relleno: solo los lóbulos, en pastel (alfa bajo); la malla de tinta va encima.
    if (uFill > 0.5) { col = vH < 0.0 ? uRed : uBlue; a = 0.16 * k * fade; }
    gl_FragColor = vec4(col, a);
  }
`;

function gridGeometry(L: number, lines: number, segs: number): THREE.BufferGeometry {
  const pos: number[] = [];
  for (let i = 0; i < lines; i++) {
    const c = -L + (2 * L * i) / (lines - 1);
    for (let j = 0; j < segs; j++) {
      const a = -L + (2 * L * j) / segs;
      const b = -L + (2 * L * (j + 1)) / segs;
      pos.push(a, c, 0, b, c, 0); // líneas a lo largo de x
      pos.push(c, a, 0, c, b, 0); // líneas a lo largo de ρ
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

function cssColor(name: string, fallback: string): THREE.Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

export function WarpField({ params = { v: 1, R: 1, sigma: 4 }, offset = [0, 0], amplitude = 0.32, drift = true, label, className }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const uniforms = useRef<Record<string, THREE.IUniform> | null>(null);
  const requestRender = useRef<() => void>(() => {});

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (err) {
      // Sin WebGL el lienzo se queda vacío; la página sigue siendo legible.
      console.error("[WarpField] WebGL no disponible:", err);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.up.set(0, 0, 1);
    camera.position.set(0, -6.4, 3.1);
    camera.lookAt(0, 0, 0);

    const u: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uV: { value: params.v },
      uR: { value: params.R },
      uSigma: { value: params.sigma },
      uAmp: { value: amplitude },
      uXs: { value: 0 },
      uPeak: { value: Math.max(0.2, (params.v * params.sigma) / 2) },
      uBase: { value: 0.16 },
      uFill: { value: 0 },
      uFg: { value: cssColor("--ink", "#111111") },
      uRed: { value: cssColor("--red", "#9f2f2d") },
      uBlue: { value: cssColor("--blue", "#1f6c9f") },
    };
    uniforms.current = u;

    const material = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    });
    const geometry = gridGeometry(3.2, 72, 220);
    const mesh = new THREE.LineSegments(geometry, material);
    // Superficie de relleno con los mismos uniformes (salvo uFill).
    const fillMaterial = material.clone();
    fillMaterial.uniforms = { ...u, uFill: { value: 1 } };
    fillMaterial.side = THREE.DoubleSide;
    const fillGeometry = new THREE.PlaneGeometry(6.4, 6.4, 220, 220);
    const fill = new THREE.Mesh(fillGeometry, fillMaterial);
    fill.renderOrder = -1;
    const group = new THREE.Group();
    group.add(fill, mesh);
    scene.add(group);

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.fov = width < 768 ? 44 : 32;
      const wide = width >= 768;
      mesh.position.set(wide ? offset[0] : 0, wide ? offset[1] : 0, 0);
      fill.position.copy(mesh.position);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Paralaje: el puntero inclina el plano unos grados, interpolado con amortiguación.
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (!reduce) el.addEventListener("pointermove", onPointer, { passive: true });

    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      u.uBase.value = scheme.matches ? 0.14 : 0.16;
      u.uFg.value = cssColor("--ink", "#111111");
      u.uRed.value = cssColor("--red", "#9f2f2d");
      u.uBlue.value = cssColor("--blue", "#1f6c9f");
      renderer.render(scene, camera);
    };
    scheme.addEventListener("change", onScheme);

    let visible = true;
    let raf = 0;
    const clock = new THREE.Clock();
    const frame = () => {
      raf = 0;
      const t = clock.getElapsedTime();
      u.uTime.value = t;
      if (drift) u.uXs.value = Math.sin(t * 0.18) * 0.35;
      group.rotation.z += ((drift ? Math.sin(t * 0.05) * 0.25 : 0) + target.x * 0.12 - group.rotation.z) * 0.04;
      group.rotation.x += (target.y * 0.06 - group.rotation.x) * 0.04;
      renderer.render(scene, camera);
      if (visible && !reduce && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    requestRender.current = () => (reduce ? renderer.render(scene, camera) : start());

    // Margen amplio: la escena ya está dibujando cuando entra en pantalla (y se pausa lejos de ella).
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }, { rootMargin: "100% 0px" });
    io.observe(el);
    const onVisibility = () => !document.hidden && visible && start();
    document.addEventListener("visibilitychange", onVisibility);

    onScheme();
    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onPointer);
      scheme.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      fillGeometry.dispose();
      fillMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      uniforms.current = null;
    };
    // Los parámetros se actualizan en el efecto siguiente sin recrear la escena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drift]);

  useEffect(() => {
    const u = uniforms.current;
    if (!u) return;
    u.uV.value = params.v;
    u.uR.value = params.R;
    u.uSigma.value = params.sigma;
    u.uAmp.value = amplitude;
    u.uPeak.value = Math.max(0.2, (params.v * params.sigma) / 2);
    requestRender.current();
  }, [params.v, params.R, params.sigma, amplitude]);

  return <div ref={host} role="img" aria-label={label} className={className} />;
}

"use client";

/** Puente con la app de escritorio (Tauri, API global). En la web no existe y todo devuelve null. */
type CanalTauri<T> = { onmessage: (m: T) => void };
type Core = { invoke: <R>(cmd: string, args?: Record<string, unknown>) => Promise<R>; Channel: new <T>() => CanalTauri<T> };

const core = (): Core | null =>
  typeof window === "undefined" ? null : ((window as unknown as { __TAURI__?: { core?: Core } }).__TAURI__?.core ?? null);

export const esNativo = () => !!core();

export async function invocar<R>(cmd: string, args?: Record<string, unknown>): Promise<R> {
  const c = core();
  if (!c) throw new Error("Solo disponible en la app de escritorio.");
  return c.invoke<R>(cmd, args);
}

/** Canal de Rust a la página: cada mensaje llama a `fn` según llega. */
export function canal<T>(fn: (m: T) => void): CanalTauri<T> {
  const c = core();
  if (!c) throw new Error("Solo disponible en la app de escritorio.");
  const ch = new c.Channel<T>();
  ch.onmessage = fn;
  return ch;
}

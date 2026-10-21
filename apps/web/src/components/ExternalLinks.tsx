"use client";

import { useEffect } from "react";

type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

/**
 * En la app de escritorio, los enlaces a otras webs se abren en el navegador predeterminado del
 * sistema (plugin opener de Tauri). En la web no hace nada: el navegador ya se encarga.
 */
export function ExternalLinks() {
  useEffect(() => {
    const invoke = (window as unknown as { __TAURI__?: { core?: { invoke: Invoke } } }).__TAURI__?.core?.invoke;
    if (!invoke) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      const externo = /^(https?|mailto):$/.test(url.protocol) && url.host !== location.host;
      if (!externo) return;
      e.preventDefault();
      invoke("plugin:opener|open_url", { url: url.href }).catch((err) => console.error("[enlaces] no se pudo abrir", url.href, err));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

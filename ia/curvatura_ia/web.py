"""Interfaz web local de la IA (http://localhost:8765). Sin dependencias: servidor de la biblioteca estándar.

  Buscar     → búsqueda directa en la base (no necesita modelo de lenguaje)
  Preguntar  → agente con RAG, laboratorio y subagentes (necesita ANTHROPIC_API_KEY o CURVATURA_LLM_URL)
  Lluvia     → lluvia de ideas multiagente
Los pasos del agente llegan en vivo (Server-Sent Events). Las figuras se sirven solo desde datos/.
"""

from __future__ import annotations

import json
import mimetypes
import queue
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .rutas import DATOS

PAGINA = (Path(__file__).parent / "web.html")
_historiales: dict[str, list] = {}


class Manejador(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, d, codigo=200):
        b = json.dumps(d, ensure_ascii=False, default=str).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        if u.path == "/":
            b = PAGINA.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
        elif u.path == "/api/estado":
            import os

            from .buscar import estado
            self._json({**estado(), "modelo": bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("CURVATURA_LLM_URL"))})
        elif u.path == "/api/buscar":
            from .buscar import buscar, buscar_imagenes
            texto = q.get("q", [""])[0]
            tipo = q.get("tipo", [""])[0]
            if tipo == "imagen":
                self._json({"imagenes": buscar_imagenes(texto, 12)})
            else:
                self._json({"resultados": buscar(texto, 15, [tipo] if tipo else None)})
        elif u.path == "/figura":
            ruta = Path(q.get("ruta", [""])[0]).resolve()
            if DATOS.resolve() not in ruta.parents or not ruta.is_file():
                self.send_error(404)
                return
            b = ruta.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(ruta.name)[0] or "image/png")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path != "/api/preguntar":
            self.send_error(404)
            return
        n = int(self.headers.get("Content-Length") or 0)
        d = json.loads(self.rfile.read(n) or b"{}")
        cola: queue.Queue = queue.Queue()

        def on(tipo, datos):
            cola.put({"tipo": tipo, **datos})

        def trabajo():
            try:
                if d.get("modo") == "lluvia":
                    from .agente import lluvia
                    r = lluvia(d["pregunta"], on=on)
                else:
                    from .agente import Agente
                    hist = _historiales.setdefault(d.get("conversacion", "x"), [])
                    r = Agente(on=on).correr(d["pregunta"], historial=hist)
                cola.put({"tipo": "final", "texto": r})
            except Exception as exc:
                cola.put({"tipo": "error", "texto": str(exc)})
            cola.put(None)

        threading.Thread(target=trabajo, daemon=True).start()
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        while True:
            ev = cola.get()
            if ev is None:
                break
            try:
                self.wfile.write(f"data: {json.dumps(ev, ensure_ascii=False, default=str)}\n\n".encode())
                self.wfile.flush()
            except BrokenPipeError:
                break


def servir(puerto: int = 8765) -> None:
    srv = ThreadingHTTPServer(("127.0.0.1", puerto), Manejador)
    print(f"Curvatura IA en http://localhost:{puerto}  (Ctrl+C para parar)", flush=True)
    srv.serve_forever()

"""Servidor MCP de Curvatura: toda la base y el laboratorio como herramientas para Claude Code / Claude Desktop.

Configuración (.mcp.json en la raíz del repo; ver .mcp.json.example):
  {"mcpServers": {"curvatura": {"command": "uv", "args": ["run", "--project", "ia", "curvatura-ia", "mcp"]}}}
"""

from __future__ import annotations

import base64
from pathlib import Path

import anyio
import mcp.types as types
from mcp.server.lowlevel import Server
from mcp.server.stdio import stdio_server

from .herramientas import REGISTRO, ejecutar

async def listar(ctx, params) -> types.ListToolsResult:
    return types.ListToolsResult(tools=[types.Tool(name=h.nombre, description=h.descripcion, inputSchema=h.esquema())
                                        for h in REGISTRO.values()])


async def llamar(ctx, params) -> types.CallToolResult:
    texto, imgs = await anyio.to_thread.run_sync(ejecutar, params.name, params.arguments or {})
    out: list = [types.TextContent(type="text", text=texto)]
    for r in imgs:
        out.append(types.ImageContent(type="image", data=base64.b64encode(Path(r).read_bytes()).decode(), mimeType="image/png"))
    return types.CallToolResult(content=out, isError=texto.startswith('{"error"'))


server = Server("curvatura", on_list_tools=listar, on_call_tool=llamar)


async def _main() -> None:
    async with stdio_server() as (lectura, escritura):
        await server.run(lectura, escritura, server.create_initialization_options())


def main() -> None:
    anyio.run(_main)


if __name__ == "__main__":
    main()

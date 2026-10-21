# Publicar y actualizar

| Qué | Cómo |
|---|---|
| Web | `bun run deploy [patch|minor|major]` → sube la versión, fecha el CHANGELOG, publica en Cloudflare Workers y empuja la etiqueta. |
| Apps (macOS, Windows, Linux) | La etiqueta `vX.Y.Z` dispara `.github/workflows/release.yml`: compila, firma las actualizaciones y publica la release con `latest.json`. |
| App de Mac en local | `bun run app:mac` → firma estable, DMG y paquete de actualización firmado. |
| Actualización obligatoria | `bun run deploy patch --obligatoria` → la app no deja posponerla. |

## Actualizaciones automáticas

La app comprueba al arrancar y cada 6 h `releases/latest/download/latest.json`. Cada paquete va firmado con la clave del actualizador (minisign) y la app solo instala lo que verifica con la clave pública de `tauri.conf.json`. Pregunta antes de instalar y se reinicia sola.

## Firma

| Plataforma | Hoy | Para que no avise al instalar |
|---|---|---|
| macOS | Identidad propia y fija («Curvatura · Pablo Nolasco») en builds locales; ad hoc en CI. La primera vez: clic derecho → Abrir. | Apple Developer Program (99 $/año): certificado «Developer ID» + notarización. Secretos `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`. |
| Windows | Sin firmar. SmartScreen avisa: «Más información» → «Ejecutar de todas formas». | Azure Trusted Signing o certificado de firma de código. |
| Linux | AppImage y .deb sin firma (lo habitual). | No hace falta. |

Las claves viven en `~/Library/Application Support/Curvatura/firma/` y nunca entran en git. Copia de seguridad recomendada: sin la clave del actualizador, las apps instaladas no aceptarían versiones nuevas.

## Primera vez (una sola vez)

```bash
gh repo create pablonolascoo/curvatura --public --source=. --remote=origin --push
bun scripts/firma.ts --github   # imprime los comandos gh secret set
git push origin --tags
```

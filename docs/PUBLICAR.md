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
gh auth login                      # si no hay sesión de GitHub
bash scripts/publicar-github.sh    # repo público, temas, secretos de firma y apps de la última versión
```

El script crea el repo, sube `main`, pone descripción, web y temas para que se encuentre en GitHub, guarda las
claves del actualizador como secretos y sube la etiqueta de la última versión, que compila las apps.

## Valoraciones (ORCID)

La API de valoraciones vive en el mismo Worker (`apps/web/worker/`) con D1 (`curvatura`) y KV (`DOCS`, documentos de verificación). `bun run deploy` aplica las migraciones de `apps/web/migrations/` antes de publicar.

Para activar el inicio de sesión (una sola vez):

1. En <https://orcid.org/developer-tools>, registra una aplicación de la API pública.
   - Nombre: Curvatura. Web: `https://curvatura.consultora-bim.workers.dev`.
   - URI de redirección: `https://curvatura.consultora-bim.workers.dev/api/auth/orcid/callback`.
2. Guarda las credenciales como secretos del Worker (no van al repo):
   ```bash
   cd apps/web
   bunx wrangler secret put ORCID_CLIENT_ID
   bunx wrangler secret put ORCID_CLIENT_SECRET
   ```
3. Pon tu ORCID en `ADMIN_ORCIDS` (`apps/web/wrangler.jsonc`, separados por comas) para revisar solicitudes en **Cuenta**.
4. Si cambias de dominio, actualiza `SITE_URL` y la URI de redirección en ORCID.

Mientras no haya credenciales, la web muestra «El inicio de sesión con ORCID se activará en breve» y las medias de estrellas se ven igual.

En local: `.dev.vars` con `DEV_LOGIN=1` permite entrar sin ORCID solo en `localhost`.

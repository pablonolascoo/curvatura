# Contribuir

## Reglas

1. **Toda afirmación cuantitativa lleva cita o test.** Sin excepción.
2. **Un cambio, una rama, un pull request.** Título corto en imperativo.
3. **Cada cambio de comportamiento entra en [`CHANGELOG.md`](CHANGELOG.md)**, sección `Sin publicar`.
4. **Los papers de terceros conservan su licencia.** Texto completo solo con CC BY, CC BY-SA, CC0 o dominio público.

## Añadir un paper

1. Crea `library/papers/<apellido>-<año>/meta.yaml` copiando una ficha existente.
2. `python3 -I library/tools/verify.py --write` para verificarla contra arXiv.
3. `python3 -I library/tools/extract.py <id>` para el resumen y, si la licencia lo permite, la fuente.
4. Traducciones: `abstract.<lang>.md` y, con licencia abierta, `text.<lang>.md`. Cabecera con fuente, licencia y la línea de traducción.

## Añadir una métrica

1. Módulo en `physics/curvatura/metrics/`.
2. Test que compare el tensor de Einstein calculado con el resultado publicado.
3. Si se publica en la web, misma fórmula en el DSL de `@curvatura/formula`.

## Convenciones

| Tema | Regla |
|---|---|
| Unidades | `G = c = 1` salvo indicación. Signatura `(-,+,+,+)`. |
| Commits | `tipo(ámbito): resumen`. Tipos: `feat`, `fix`, `docs`, `library`, `physics`, `chore`. |
| Paquetes JS | Solo Bun. |
| Python | `uv`, tests con `pytest`. |
| Iconos web | Solo Phosphor. |
| Versiones | `version.json` con codename y semver; `bun run deploy [patch|minor|major]`. |

# Biblioteca

Una carpeta por paper: `papers/<apellido>-<año>/`.

| Fichero | Contenido | Cuándo existe |
|---|---|---|
| `meta.yaml` | Cita, DOI, arXiv, subsistemas, tipo, licencia, estado de verificación | Siempre |
| `abstract.<lang>.md` | Resumen original (metadatos arXiv, CC0) y traducciones | Si hay arXiv |
| `source/` | Fuente LaTeX, bibliografía y figuras originales | Solo licencia abierta |
| `text.<lang>.md` | Texto completo en Markdown con LaTeX, original y traducciones | Solo licencia abierta |
| `figures/` | Figuras en PNG para la web | Solo licencia abierta |

Clasificación en [`taxonomy.yaml`](taxonomy.yaml).

## Herramientas

```bash
python3 -I library/tools/verify.py --write   # título y licencia contra arXiv
python3 -I library/tools/extract.py [id]     # resúmenes; fuente si la licencia lo permite
```

## Licencias

`fulltext` solo puede ser `true` con `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC0-1.0` o `public-domain`. La web lo comprueba y no muestra texto completo en ningún otro caso.

Pendiente de verificar a mano (sin arXiv): `casimir-1948`, `morris-thorne-1988`, `unruh-1981`.

# Sistema visual

| Elemento | Regla |
|---|---|
| Lectura | Sitio de investigación para ingenieros y físicos. Lujo frío, editorial técnico. |
| Diales | Variación 7, movimiento 6, densidad 4. |
| Tema | Oscuro y claro según el sistema. Tokens en `apps/web/src/app/globals.css`. |
| Fondo / texto | `#0b0c0e` / `#ecebe6` en oscuro; `#f3f4f2` / `#121316` en claro. |
| Acento único | Línea D del sodio: `#f2a33a` en oscuro, `#9a5205` en claro. Nunca otro color de acento. |
| Tipografía | Geist (texto y titulares) y Geist Mono (cifras, códigos, años). Titulares con tracking negativo. |
| Matemáticas | MathML nativo desde `@curvatura/formula` (DSL propio) y Temml (LaTeX de los papers). |
| Iconos | Phosphor, peso `light`. Ninguna otra librería. |
| Radios | Botones en píldora. Superficies 28 px con núcleo concéntrico (`calc(2rem - 0.375rem)`). Chips en píldora. |
| Movimiento | Curva `cubic-bezier(0.32, 0.72, 0, 1)`. Revelado por IntersectionObserver. GSAP solo para el texto con scrub y el desplazamiento horizontal del motor. Todo se desactiva con `prefers-reduced-motion`. |
| 3D | Three.js sin capas intermedias. La superficie es la expansión θ calculada en el shader, no una ilustración. |
| Texto | Frases cortas. Sin guiones largos. Sin etiquetas de sección numeradas. Una etiqueta pequeña como máximo cada tres secciones. |
| CTA | Una etiqueta por intención: «Ver el motor», «Abrir la biblioteca», «Contribuir en GitHub». |

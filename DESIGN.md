# Sistema visual

Principios de `minimalist-ui`: monocromo cálido, contraste tipográfico, bordes de 1 px y color solo con significado.

| Elemento | Regla |
|---|---|
| Lienzo | `#FBFBFA` (claro) / `#191919` (oscuro). Superficie `#FFFFFF` / `#202020`. |
| Texto | `#111111` titulares, `#2F3437` cuerpo, `#787774` secundario. Interlineado 1,6. |
| Bordes | `1px solid #EAEAEA`. Tarjetas con radio de 12 px. Botones con radio de 6 px. Nada en píldora salvo las etiquetas. |
| Tipografía | Newsreader (titulares y citas), Geist (interfaz y texto), Geist Mono (cifras, códigos, metadatos). |
| Color con significado | Rojo `#9F2F2D` sobre `#FDEBEC`: contracción, energía negativa, violación. Azul `#1F6C9F` sobre `#E1F3FE`: expansión, geometría. Verde `#346538` sobre `#EDF3EC`: energía positiva, verificado. Amarillo `#956400` sobre `#FBF3DB`: abierto, parámetros libres. |
| Ecuaciones | Cada símbolo lleva el color de su grupo (`library/equations/*.yaml`). Entrada escalonada de términos, resaltado de todas las apariciones al pasar el ratón, resultado calculado con interpolación logarítmica. |
| Iconos | Phosphor, pesos `bold` y `fill`. Ninguna otra librería. |
| Sombras | Casi ninguna: `0 2px 8px rgb(0 0 0 / 0.04)` al pasar sobre una tarjeta. |
| Movimiento | Entrada `translateY(12px)` + opacidad en 600 ms, `cubic-bezier(0.16, 1, 0.3, 1)`, escalonado de 80 ms. Todo se desactiva con `prefers-reduced-motion`. |
| 3D | Three.js: malla de tinta fina con relleno pastel en los lóbulos. Es la expansión θ calculada en el shader. |
| Texto | Frases cortas, sin guiones largos ni clichés. Etiquetas en mayúsculas pequeñas solo para estado. |

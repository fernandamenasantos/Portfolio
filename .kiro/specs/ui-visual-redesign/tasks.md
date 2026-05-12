# Tasks

## Task List

- [x] 1. Design System — tokens CSS y tipografía
  - [x] 1.1 Definir tokens CSS en `globals.css`: paleta oscura, acento violeta, texto, bordes
  - [x] 1.2 Cargar Space Grotesk via `next/font/google` en `app/layout.tsx` y exponer como `--font-display`
  - [x] 1.3 Aplicar estilos de scrollbar y range inputs usando los nuevos tokens
  - [x] 1.4 Escribir test de contraste WCAG AA para todos los tokens de texto contra `--bg-base`

- [x] 2. Gallery — header y fondo
  - [x] 2.1 Rediseñar el header: nombre `"Fer."` con fuente display ≥ 3rem, punto en `--accent` con glow
  - [x] 2.2 Añadir subtítulo personal debajo del nombre
  - [x] 2.3 Añadir separador visual entre header y grid
  - [x] 2.4 Aplicar gradiente radial sutil como fondo de la galería

- [x] 3. Gallery — filtros de categoría
  - [x] 3.1 Rediseñar filtros como pills: borde sutil en estado inactivo, fondo sólido + borde en activo
  - [x] 3.2 Escribir property test: para cualquier filtro activo/inactivo, verificar estilos correctos

- [x] 4. Gallery — grid con featured card
  - [x] 4.1 Añadir prop `featured?: boolean` a `ProjectCard`
  - [x] 4.2 Implementar aspect ratio 16:9 y tipografía mayor cuando `featured={true}`
  - [x] 4.3 Pasar `featured={true}` al primer `ProjectCard` en `Gallery`

- [x] 5. ProjectCard — overlay hover y badges
  - [x] 5.1 Rediseñar overlay hover: gradiente más rico, título + descripción con mejor jerarquía tipográfica
  - [x] 5.2 Rediseñar badge "3D" con estilo técnico/editorial
  - [x] 5.3 Rediseñar badge de categoría: borde + texto en lugar de fondo violeta sólido
  - [x] 5.4 Añadir separador sutil debajo del área de thumbnail
  - [x] 5.5 Escribir property test: para cualquier proyecto, overlay oculto sin hover y visible con hover

- [x] 6. ViewerPage — header y sidebar
  - [x] 6.1 Mejorar jerarquía tipográfica del título del proyecto (heading prominente)
  - [x] 6.2 Estilizar breadcrumb "Portfolio ←" como sutil pero legible
  - [x] 6.3 Añadir separadores visuales entre secciones del sidebar
  - [x] 6.4 Rediseñar tags con estilo refinado y contraste suficiente

- [x] 7. DisplayModeSelector — rediseño visual y accesibilidad
  - [x] 7.1 Implementar estado activo con glow violeta (`--accent-glow` + `--accent`)
  - [x] 7.2 Reemplazar iconos por SVGs mejorados para cada modo (Shaded, Wire, Clay)
  - [x] 7.3 Añadir `aria-label` y `title` accesibles a cada botón
  - [x] 7.4 Escribir property test: para cualquier modo activo, solo ese botón tiene el glow style
  - [x] 7.5 Escribir property test: click en cualquier botón llama `setDisplayMode` con el valor correcto

- [x] 8. buildQuadWireframe — color violeta y memoización
  - [x] 8.1 Cambiar `WIRE_COLOR` de `0x5577ff` a `0x7c6af7` en `QUAD_WIRE_CONFIG`
  - [x] 8.2 Implementar memoización por `geometry.uuid` en `InteractiveModel`
  - [x] 8.3 Evictar entrada del cache cuando el mesh es eliminado de la escena
  - [x] 8.4 Escribir property test: para cualquier geometría indexada, el resultado solo contiene aristas de borde y feature (diedro > 30°)
  - [x] 8.5 Escribir property test: el resultado de `buildQuadWireframe` no comparte referencias con la geometría de entrada
  - [x] 8.6 Escribir property test: llamar dos veces con el mismo `uuid` retorna la misma instancia cacheada

- [x] 9. Gestión de memoria — display mode
  - [x] 9.1 Verificar que el cleanup del `useEffect` llama `dispose()` en todas las geometrías y materiales de wireframe
  - [x] 9.2 Verificar que todos los `LineSegments` son eliminados de su mesh padre al cambiar de modo
  - [x] 9.3 Escribir property test: para cualquier secuencia de cambios de modo, no quedan recursos sin dispose

- [x] 10. Restauración de materiales — modo shaded
  - [x] 10.1 Verificar que `originalProps` se popula antes de aplicar cualquier modo
  - [x] 10.2 Escribir property test: aplicar cualquier modo y volver a shaded restaura exactamente `color`, `roughness`, `metalness` y `visible=true`

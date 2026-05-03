# ROADMAP — Fer Portfolio

Documento de referencia técnica para sesiones de desarrollo futuras.
Última actualización: 2026-05-02

---

## Estado actual del proyecto

### Stack
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.4 |
| UI | React | 19.2.4 |
| 3D | React Three Fiber + Drei | 9.6.1 / 10.7.7 |
| 3D engine | Three.js | 0.184.0 |
| Estado global | Zustand | 5.0.12 |
| Animaciones UI | Framer Motion | 12.38.0 |
| Estilos | Tailwind CSS v4 | 4.x |
| Lenguaje | TypeScript | 5.x |
| Hosting target | Vercel (plan free) | — |

### Funcionalidades implementadas
- [x] Galería con grid responsivo (1 / 2 / 3 columnas)
- [x] Filtro por categoría con animación
- [x] `ProjectCard` con hover effect, badge 3D, tag de categoría
- [x] Página de proyecto (`/project/[id]`) con layout visor + sidebar
- [x] Canvas R3F con `OrbitControls` (rotate, zoom, pan)
- [x] Carga de modelos GLB vía `useGLTF`
- [x] Clonado de escena para no mutar el caché de GLTF
- [x] Raycasting: hover (glow suave) + click (glow intenso + panel de info)
- [x] `MeshInfoPanel` flotante posicionado en coordenadas de pantalla
- [x] `EnvironmentSelector` con 10 presets HDRI + sliders de iluminación + toggle de fondo
- [x] `LoadingOverlay` con spinner durante la carga del GLB
- [x] `defaultScene` configurable por proyecto
- [x] Tipado completo con TypeScript
- [x] Zustand store para estado del visor
- [x] Build de producción funcional (`npm run build` ✓)

### Archivos clave
```
components/viewer/InteractiveModel.tsx  — raycasting y highlight de mallas
components/viewer/Scene.tsx             — luces, environment, OrbitControls
components/viewer/ModelViewer.tsx       — Canvas wrapper + UI overlays
components/viewer/MeshInfoPanel.tsx     — panel flotante de info por malla
components/viewer/EnvironmentSelector.tsx — panel de configuración de escena
components/gallery/Gallery.tsx          — grid con filtros
components/gallery/ProjectCard.tsx      — tarjeta individual
store/viewerStore.ts                    — estado global del visor (Zustand)
data/projects.ts                        — catálogo de proyectos (fuente de verdad)
types/index.ts                          — tipos: Project, MeshInfo, SceneConfig
```

---

## Bugs resueltos

### ~~CRÍTICO — InteractiveModel nunca renderiza el modelo~~ ✅ FIXED
**Archivo:** `components/viewer/InteractiveModel.tsx`

`clonedScene` se cambió de `useRef` a `useState`. Ahora `setClonedScene(clone)` dispara un re-render y el modelo se renderiza correctamente.

---

### ~~MEDIO — Hydration mismatch en MeshInfoPanel~~ ✅ FIXED
**Archivo:** `components/viewer/MeshInfoPanel.tsx`

Se eliminó el acceso directo a `window.innerWidth` del JSX. Ahora la posición se calcula en un `useEffect` y se guarda en `panelPos` con `useState`.

---

### ~~MEDIO — Flash del hint antes del spinner de carga~~ ✅ FIXED
**Archivo:** `store/viewerStore.ts`

`isLoading` ahora inicializa en `true`. El spinner se muestra inmediatamente al abrir la página de proyecto; solo se oculta cuando el modelo termina de cargar.

---

### ~~MENOR — Memory leak: materiales clonados no se disposen~~ ✅ FIXED
**Archivo:** `components/viewer/InteractiveModel.tsx`

El cleanup del `useEffect` de clonado ahora llama `.dispose()` en todos los materiales del clon, tanto arrays como instancias únicas.

---

### ~~MENOR — `cardRef` declarado pero no utilizado~~ ✅ FIXED
**Archivo:** `components/gallery/ProjectCard.tsx`

Se eliminó `useRef`, la declaración de `cardRef` y el `ref={cardRef}` del `motion.div`.

---

### ~~MENOR — Asunción de tipo de material no segura~~ ✅ FIXED
**Archivo:** `components/viewer/InteractiveModel.tsx`

Se agregó la función `getMat(mesh)` que verifica `.isMeshStandardMaterial` antes del cast y maneja arrays de materiales. Todos los accesos a materiales ahora pasan por este guard.

---

### ~~NUEVO-MEDIO — `hoveredMesh` no se reseteaba al cambiar de proyecto~~ ✅ FIXED
**Archivo:** `components/viewer/ModelViewer.tsx`

El `useEffect` que inicializa la vista al cambiar de proyecto ahora también llama `setHoveredMesh(null)`, evitando que el estado de hover de un proyecto anterior persista en el siguiente.

---

### ~~MENOR — Tipo débil en `getProjectsByCategory`~~ ✅ FIXED
**Archivo:** `data/projects.ts`

El parámetro `category` cambió de `string` a `Category`, reforzando el tipado end-to-end desde `Gallery.tsx` hasta el filtro.

---

## Bugs conocidos (pendientes)

### ~~MENOR — Sin manejo de error si el modelo 404 o está corrupto~~ ✅ FIXED
**Archivos:** `components/viewer/ViewerErrorBoundary.tsx` (nuevo), `components/viewer/ModelViewer.tsx`

Se creó `ViewerErrorBoundary` (class component) que envuelve el `<Canvas>`. Captura el error de `useGLTF` cuando el `.glb` da 404, llama `setLoading(false)` en `componentDidCatch` y muestra un mensaje de error en el área del visor en lugar de crashear la página.

---

### MENOR — Archivos de ejemplo inexistentes en `public/`
**Descripción:** `data/projects.ts` referencia 4 modelos `.glb` y 6 thumbnails que no existen en `public/`. Al correr el sitio todas las imágenes están rotas y los visores 3D fallan.

**Fix:** Crear las carpetas y agregar placeholders:
```
public/models/     ← crear carpeta
public/thumbnails/ ← crear carpeta + imágenes placeholder
```
O limpiar `data/projects.ts` y dejar solo un proyecto de ejemplo con archivos reales.

---

### MENOR — Mallas sin nombre rompen el reset de color
**Archivo:** `components/viewer/InteractiveModel.tsx`

**Descripción:** Si un GLB contiene mallas con `name: ''` (sin nombre), `originalColors.current.get('')` puede devolver el color de otra malla sin nombre, corrompiendo el reset de highlight.

**Fix:** Ignorar mallas sin nombre en el traverse del clone, o generarles un ID único:
```typescript
if (!mesh.name) mesh.name = `mesh_${Math.random().toString(36).slice(2)}`;
```

---

## Roadmap de implementaciones

### Fase 1 — Estabilidad (alta prioridad)

- [x] **Fix crítico:** `clonedScene` con `useState` en `InteractiveModel`
- [x] **Fix:** `MeshInfoPanel` position sin `window` directo
- [x] **Fix:** Memory leak de materiales en cleanup
- [x] **Fix:** Guard de tipos en material cast (`getMat` helper)
- [x] **Fix:** `hoveredMesh` stale al navegar entre proyectos
- [x] **Fix:** Eliminar `cardRef` muerto en `ProjectCard`
- [x] **Fix:** Tipado estricto en `getProjectsByCategory`
- [x] **Fix:** `ErrorBoundary` alrededor del viewer 3D (`ViewerErrorBoundary`)
- [ ] **Fix:** Mallas sin nombre en raycasting
- [ ] Crear `public/models/` y `public/thumbnails/` con un modelo de prueba real
- [ ] Reemplazar datos de ejemplo en `projects.ts` con proyectos reales de Fer
- [ ] Crear una página `/404` personalizada

---

### Fase 2 — UX del visor (media prioridad)

- [ ] **Galería de imágenes por proyecto** — el campo `images` ya está en el tipo `Project` pero no tiene UI. Agregar un carrusel/grid en el sidebar del visor para renders adicionales.
- [ ] **Indicador de progreso de carga** — reemplazar el spinner por una barra de progreso usando `useProgress` de Drei, que muestra el porcentaje real de descarga del GLB.
- [ ] **Autorotate toggle** — botón en el visor para activar rotación automática del modelo.
- [ ] **Wireframe toggle** — botón que cambia todos los materiales a `wireframe: true`.
- [ ] **Screenshot** — botón que llama a `gl.domElement.toDataURL()` y descarga la imagen del canvas actual.
- [ ] **Fullscreen** — botón que pone el canvas en pantalla completa con la API nativa.
- [ ] **Reset cámara** — botón para volver a la posición inicial de la cámara.
- [ ] **Controles táctiles** — OrbitControls ya soporta touch, pero el panel de Scene y el MeshInfoPanel no están optimizados para pantallas pequeñas.

---

### Fase 3 — Funcionalidades de galería (media prioridad)

- [ ] **Página `/about`** — página con bio de Fer, foto, skills, experiencia. Accesible desde el header.
- [ ] **Header/Nav persistente** — actualmente no hay navegación entre la galería y el about. Agregar una barra de navegación mínima.
- [ ] **Links sociales** — Instagram, ArtStation, LinkedIn, email. Colocarlos en el footer o sidebar de la galería.
- [ ] **Proyecto destacado (`featured`)** — agregar campo `featured: boolean` al tipo `Project` para anclar proyectos al inicio del grid.
- [ ] **Búsqueda de proyectos** — campo de búsqueda que filtra por título y tags.
- [ ] **Next.js `<Image>`** — reemplazar el `div` con `background-image` en `ProjectCard` por el componente `<Image>` de Next.js para lazy loading y optimización automática (WebP, sizes).
- [ ] **Ordenar proyectos** — selector de orden: más reciente, más antiguo, por categoría.

---

### Fase 4 — SEO y performance (baja prioridad)

- [ ] **Open Graph por proyecto** — generar `metadata` dinámica en `/project/[id]/page.tsx` con título, descripción e imagen del proyecto para que los links se vean bien en redes sociales.
- [ ] **`generateStaticParams`** — exportar `generateStaticParams` en la ruta dinámica para pre-renderizar todas las páginas de proyecto en build time (actualmente son `ƒ Dynamic`).
- [ ] **Draco decoder local** — actualmente Drei descarga el decoder de Draco desde un CDN externo. Para producción, copiar el decoder a `public/` y configurar `useGLTF.setDecoderPath('/draco/')`.
- [ ] **Preload de modelos** — usar `useGLTF.preload()` en la página de galería para empezar a descargar los GLB en background mientras el usuario navega.
- [ ] **Sitemap.xml** — generado automáticamente con `next-sitemap`.

---

### Fase 5 — Contenido y animaciones (baja prioridad)

- [ ] **Reproducción de animaciones** — si el GLB tiene clips de animación, mostrar controles de play/pause/scrub usando `useAnimations` de Drei.
- [ ] **Anotaciones en espacio 3D** — pines (`Html` de Drei) anclados a posiciones del modelo que muestran info sin necesidad de hacer clic.
- [ ] **Transición entre proyectos** — desde el visor, botones prev/next para navegar entre proyectos sin volver a la galería.
- [ ] **Modo comparación** — split-view con dos modelos simultáneos (útil para mostrar low-poly vs high-poly).
- [ ] **Fondo animado en la galería** — partículas sutiles o gradiente animado en el hero para darle más vida sin distraer.

---

### Fase 6 — CMS / Admin (largo plazo)

Actualmente los proyectos se agregan editando código en `data/projects.ts`. Opciones en orden de complejidad:

- [ ] **Opción A — JSON editable** — mover `projects.ts` a `public/data/projects.json` y agregar un formulario protegido con contraseña en `/admin` que lee y escribe ese JSON.
- [ ] **Opción B — Contentlayer** — tipado automático desde archivos MDX. Fer escribe un archivo `.mdx` por proyecto sin tocar código.
- [ ] **Opción C — Sanity.io** — CMS visual con panel de administración. Free tier disponible. Los modelos GLB se alojarían en el CDN de Sanity. Más trabajo de setup pero la mejor UX para el admin.

---

## Decisiones de diseño para recordar

- **Turbopack está activo** (`next.config.ts` tiene `turbopack: {}`). No usar `webpack()` en next.config — rompe el build.
- **`useGLTF` cachea por URL** — por eso se clona la escena antes de mutar materiales. Si se elimina el clonado, cambiar el emissive de un modelo afectará todas las instancias del mismo GLB.
- **`dynamic(() => import(...), { ssr: false })`** en la página de proyecto — Three.js no puede correr en Node.js (SSR), el viewer debe ser client-only siempre.
- **Zustand global para el viewer** — facilita que `MeshInfoPanel` y `EnvironmentSelector` accedan al estado sin prop drilling. Si el store crece mucho, considerar separarlo en slices.
- **Tailwind v4** — usa la sintaxis `@import "tailwindcss"` en globals.css, no la v3 (`@tailwind base/components/utilities`). No mezclar.
- **`clonedScene` como `useState`** — debe ser estado, no ref, para que el cambio dispare re-render. El `useEffect` de clonado llama `setClonedScene(clone)` al terminar.
- **`getMat` helper en InteractiveModel** — siempre usar este helper para acceder al material de una malla; maneja arrays de materiales y verifica `.isMeshStandardMaterial` antes del cast.
- **`isLoading` inicializa en `true`** — el store arranca en estado de carga. `setLoading(false)` se llama desde `InteractiveModel` cuando `useGLTF` resuelve el `scene`.

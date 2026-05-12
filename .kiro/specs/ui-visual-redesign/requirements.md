# Requirements Document

## Introduction

Rediseño visual completo del portfolio 3D de Fer — una aplicación Next.js con visor de modelos 3D (React Three Fiber). El objetivo es elevar la identidad visual a algo más personal y profesional: una estética oscura, editorial y técnica. El rediseño abarca tres capas: (1) sistema de diseño — tipografía, paleta de color, tokens CSS; (2) galería — layout, tarjetas, header; (3) visor 3D — controles, overlays, wireframe quad mejorado.

## Glossary

- **Design_System**: El conjunto de tokens CSS (custom properties) definidos en `globals.css` y consumidos por todos los componentes.
- **Gallery**: El componente `Gallery.tsx` que renderiza el header, los filtros y el grid de proyectos en la ruta `/`.
- **ProjectCard**: El componente `ProjectCard.tsx` que representa una tarjeta individual de proyecto con thumbnail y hover reveal.
- **ViewerPage**: El layout de la ruta `/project/[id]` que contiene el header, el viewport 3D y el sidebar de información.
- **DisplayModeSelector**: El componente `DisplayModeSelector.tsx` que permite cambiar entre los modos Shaded, Wire y Clay.
- **InteractiveModel**: El componente `InteractiveModel.tsx` que gestiona el mesh picking y el wireframe quad.
- **buildQuadWireframe**: La función pura que construye una `BufferGeometry` de aristas de quads a partir de una geometría indexada.
- **viewerStore**: El store Zustand que mantiene el estado del visor, incluyendo `displayMode`.
- **WCAG_AA**: El estándar de accesibilidad Web Content Accessibility Guidelines nivel AA, que requiere ratio de contraste ≥ 4.5:1 para texto normal.

---

## Requirements

### Requirement 1: Sistema de diseño — tokens CSS

**User Story:** As a developer, I want a centralized CSS design token system, so that all components share a consistent visual language without hardcoded values.

#### Acceptance Criteria

1. THE Design_System SHALL define custom CSS properties for background colors: `--bg-base: #080808`, `--bg-surface: #0f0f0f`, `--bg-elevated: #161616`, and `--bg-overlay: rgba(10, 10, 10, 0.92)`.
2. THE Design_System SHALL define custom CSS properties for the accent color: `--accent: #8b5cf6`, `--accent-dim: #6d28d9`, and `--accent-glow: rgba(139, 92, 246, 0.15)`.
3. THE Design_System SHALL define custom CSS properties for text: `--text-primary: #f0f0f0`, `--text-secondary: #888`, and `--text-muted: #444`.
4. THE Design_System SHALL define custom CSS properties for borders: `--border-subtle: rgba(255, 255, 255, 0.06)` and `--border-medium: rgba(255, 255, 255, 0.12)`.
5. THE Design_System SHALL define `--font-display` as `'Space Grotesk'` with `var(--font-geist-sans)` as fallback, and `--font-mono` as `var(--font-geist-mono)`.
6. WHEN rendered on `--bg-base`, THE Design_System SHALL ensure all text colors meet WCAG_AA contrast ratio of at least 4.5:1.
7. THE Design_System SHALL apply custom scrollbar styles and range input styles using the defined tokens.

---

### Requirement 2: Tipografía — Space Grotesk

**User Story:** As a visitor, I want to see a distinctive display typeface for the portfolio title, so that the site has a strong personal identity.

#### Acceptance Criteria

1. THE Gallery SHALL load Space Grotesk via `next/font/google` and apply it as the display font for the portfolio name.
2. WHEN Space Grotesk is unavailable, THE Gallery SHALL fall back to Geist Sans for the display font.
3. THE Gallery SHALL use Geist Sans for all UI text elements (labels, filters, metadata).
4. THE Gallery SHALL use Geist Mono for all technical data elements (counts, IDs, technical labels).

---

### Requirement 3: Galería — header rediseñado

**User Story:** As a visitor, I want a visually striking header with the author's name, so that the portfolio makes a strong first impression.

#### Acceptance Criteria

1. THE Gallery SHALL render the portfolio name `"Fer."` using the display font at a large size (≥ 3rem).
2. THE Gallery SHALL render the period character in the name using the `--accent` color with a subtle glow effect using `--accent-glow`.
3. THE Gallery SHALL render a personal subtitle below the name that is distinct from a purely descriptive label.
4. THE Gallery SHALL render a visual separator (decorative line or spacing element) between the header and the project grid.
5. THE Gallery SHALL apply a subtle radial gradient background from the center to add visual depth.

---

### Requirement 4: Galería — filtros de categoría

**User Story:** As a visitor, I want clear category filter pills, so that I can browse projects by type.

#### Acceptance Criteria

1. THE Gallery SHALL render category filters as pill-shaped buttons.
2. WHEN a filter is inactive, THE Gallery SHALL render it with a subtle visible border using `--border-subtle` or `--border-medium`.
3. WHEN a filter is active, THE Gallery SHALL render it with a solid background and a visible border to distinguish it from inactive filters.
4. WHEN a filter button is clicked, THE Gallery SHALL update the active filter and re-render the project grid accordingly.

---

### Requirement 5: Galería — grid con featured card

**User Story:** As a visitor, I want the first project to stand out visually, so that the most important work gets more attention.

#### Acceptance Criteria

1. THE Gallery SHALL render the project grid with a generous gap between cards.
2. WHERE the `featured` prop is true, THE ProjectCard SHALL render with a 16:9 aspect ratio and larger typography.
3. WHERE the `featured` prop is false or absent, THE ProjectCard SHALL render with a 4:3 aspect ratio.
4. THE Gallery SHALL pass `featured={true}` to the first ProjectCard in the grid.

---

### Requirement 6: ProjectCard — overlay hover

**User Story:** As a visitor, I want an informative and visually rich hover state on project cards, so that I can preview project details before clicking.

#### Acceptance Criteria

1. WHEN a user hovers over a ProjectCard, THE ProjectCard SHALL reveal an overlay with a rich gradient and legible project information.
2. WHEN a user hovers over a ProjectCard, THE ProjectCard SHALL display the project title and description with improved typography hierarchy.
3. WHEN a user is not hovering, THE ProjectCard SHALL hide the overlay content.
4. THE ProjectCard SHALL render the "3D" badge with a technical/editorial style.
5. THE ProjectCard SHALL render the category badge using a border and text style instead of a solid violet background.
6. THE ProjectCard SHALL render a subtle separator line below the card thumbnail area to improve visual hierarchy.

---

### Requirement 7: ViewerPage — header y sidebar

**User Story:** As a visitor, I want a clear and well-structured viewer layout, so that I can read project information while interacting with the 3D model.

#### Acceptance Criteria

1. THE ViewerPage SHALL render the project title with prominent typography hierarchy as the primary heading.
2. THE ViewerPage SHALL render the breadcrumb link "Portfolio ←" in a subtle but legible style.
3. THE ViewerPage SHALL render visual separators between sidebar sections to improve scannability.
4. THE ViewerPage SHALL render project metadata (category, tags, description) with improved typographic hierarchy using the Design_System tokens.
5. THE ViewerPage SHALL render project tags with a refined style that provides sufficient contrast against the background.

---

### Requirement 8: DisplayModeSelector — rediseño visual

**User Story:** As a user, I want clear visual feedback when switching 3D display modes, so that I always know which mode is active.

#### Acceptance Criteria

1. THE DisplayModeSelector SHALL render three buttons: Shaded, Wire, and Clay.
2. WHEN a display mode button is active, THE DisplayModeSelector SHALL render it with a violet glow background using `--accent-glow` and `--accent`.
3. WHEN a display mode button is inactive, THE DisplayModeSelector SHALL render it without the glow effect.
4. THE DisplayModeSelector SHALL render an improved SVG icon for each mode button.
5. THE DisplayModeSelector SHALL render each button with an accessible `title` attribute and `aria-label` describing the mode.
6. WHEN a display mode button is clicked, THE DisplayModeSelector SHALL call `setDisplayMode` on the viewerStore with the corresponding mode value.

---

### Requirement 9: buildQuadWireframe — color y algoritmo

**User Story:** As a viewer, I want the wireframe overlay to use a color consistent with the UI accent, so that the 3D view feels visually cohesive with the rest of the portfolio.

#### Acceptance Criteria

1. THE buildQuadWireframe SHALL use wire color `0x7c6af7` (violet) instead of the previous `0x5577ff` (blue).
2. WHEN given an indexed BufferGeometry, THE buildQuadWireframe SHALL return a BufferGeometry containing only boundary edges and feature edges with dihedral angle > 30°.
3. WHEN given an indexed BufferGeometry, THE buildQuadWireframe SHALL omit triangulation diagonal edges where the dihedral angle is below the skip threshold (normalDot ≥ SKIP_THRESHOLD).
4. IF `geo.index` is null, THEN THE buildQuadWireframe SHALL return a `THREE.WireframeGeometry` as fallback.
5. THE buildQuadWireframe SHALL produce a result BufferGeometry that shares no references with the input geometry.
6. WHEN a degenerate triangle is encountered (cross product magnitude < ε), THE buildQuadWireframe SHALL include that edge in the result.

---

### Requirement 10: Gestión de memoria — display mode

**User Story:** As a developer, I want all Three.js resources created during display mode changes to be properly disposed, so that the viewer does not leak memory.

#### Acceptance Criteria

1. WHEN the display mode changes away from wireframe, THE InteractiveModel SHALL call `dispose()` on every `BufferGeometry` created by buildQuadWireframe.
2. WHEN the display mode changes away from wireframe, THE InteractiveModel SHALL call `dispose()` on every `LineBasicMaterial` created for wireframe lines.
3. WHEN the display mode changes away from wireframe, THE InteractiveModel SHALL remove every `LineSegments` object from its parent mesh.
4. WHEN the InteractiveModel component unmounts, THE InteractiveModel SHALL dispose all active wireframe geometries and materials.

---

### Requirement 11: Restauración de materiales — modo shaded

**User Story:** As a user, I want the model to return to its original appearance when switching back to Shaded mode, so that the material colors are always accurate.

#### Acceptance Criteria

1. WHEN the display mode changes to `'shaded'`, THE InteractiveModel SHALL restore each mesh's `color`, `roughness`, and `metalness` to the values stored in `originalProps`.
2. WHEN the display mode changes to `'shaded'`, THE InteractiveModel SHALL set each mesh material's `visible` property to `true`.
3. THE InteractiveModel SHALL store the original `color`, `roughness`, and `metalness` of each mesh in `originalProps` before any display mode is applied.

---

### Requirement 12: Consistencia de estado del visor

**User Story:** As a developer, I want the viewer's visual state to be fully derived from the viewerStore, so that there is a single source of truth for display mode.

#### Acceptance Criteria

1. THE viewerStore SHALL be the single source of truth for `displayMode`.
2. WHEN `displayMode` changes in the viewerStore, THE InteractiveModel SHALL react via `useEffect` and update the Three.js scene accordingly.
3. THE InteractiveModel SHALL NOT maintain independent visual state that diverges from the viewerStore `displayMode`.

---

### Requirement 13: Memoización de buildQuadWireframe

**User Story:** As a developer, I want the quad wireframe computation to be memoized per geometry, so that switching modes on complex models does not recompute unnecessarily.

#### Acceptance Criteria

1. THE InteractiveModel SHALL memoize the result of buildQuadWireframe keyed by `geometry.uuid`.
2. WHEN buildQuadWireframe is called with a geometry whose `uuid` has been seen before, THE InteractiveModel SHALL return the cached result without recomputing.
3. WHEN a mesh is removed from the scene, THE InteractiveModel SHALL evict its cached wireframe geometry from the memoization cache.

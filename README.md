# Fer · Portfolio 3D

Tu portafolio personal de arte 3D. Funciona como ArtStation pero es **tuyo**: sin comisiones, sin algoritmos, con tu URL.

---

## Tabla de contenidos

1. [¿Qué puedo hacer en este sitio?](#1-qué-puedo-hacer-en-este-sitio)
2. [Cómo correr el sitio en tu computadora](#2-cómo-correr-el-sitio-en-tu-computadora)
3. [Estructura de carpetas (lo que te importa)](#3-estructura-de-carpetas-lo-que-te-importa)
4. [Cómo agregar un proyecto nuevo](#4-cómo-agregar-un-proyecto-nuevo)
5. [Cómo exportar tu modelo desde Blender (formato correcto)](#5-cómo-exportar-tu-modelo-desde-blender-formato-correcto)
6. [Cómo encontrar los nombres de las mallas](#6-cómo-encontrar-los-nombres-de-las-mallas)
7. [Configurar la escena de cada proyecto](#7-configurar-la-escena-de-cada-proyecto)
8. [Agregar una nueva categoría](#8-agregar-una-nueva-categoría)
9. [Personalizar el encabezado del sitio](#9-personalizar-el-encabezado-del-sitio)
10. [Publicar el sitio en internet (Vercel)](#10-publicar-el-sitio-en-internet-vercel)
11. [Preguntas frecuentes y problemas comunes](#11-preguntas-frecuentes-y-problemas-comunes)

---

## 1. ¿Qué puedo hacer en este sitio?

### Galería principal
- Ver todos tus proyectos en una cuadrícula visual oscura y minimalista.
- Filtrar por categoría: **All**, **Character**, **Environment**, **Prop** (puedes agregar más).
- Cada tarjeta muestra el título, año, software y tags al hacer hover.
- Si el proyecto tiene modelo 3D, aparece un badge **`3D`** en la esquina.

### Visor 3D (página de proyecto)
- El modelo carga directamente en el navegador — sin plugins, sin descargas.
- **Rotar**: clic izquierdo + arrastrar.
- **Zoom**: rueda del mouse.
- **Pan**: clic derecho + arrastrar.
- **Hacer clic en una parte del modelo**: aparece un panel flotante con el nombre, descripción, material y polycount de esa pieza.
- **Pasar el cursor sobre una pieza**: se ilumina en violeta suave.
- **Esc**: cierra el panel de información.

### Panel de escena (botón "Scene" abajo a la izquierda)
- Cambiar el entorno HDRI: Studio, Dawn, Sunset, Forest, City, Warehouse, Lobby, Night, Park, Apartment.
- Activar o desactivar el fondo del entorno.
- Ajustar la intensidad de la luz ambiental y la luz principal con sliders.

---

## 2. Cómo correr el sitio en tu computadora

Necesitas tener **Node.js** instalado. Si no lo tienes, descárgalo en [nodejs.org](https://nodejs.org) (versión LTS).

### Pasos

Abre una terminal (PowerShell o CMD) en la carpeta del proyecto:

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Arrancar el servidor de desarrollo
npm run dev
```

Luego abre tu navegador en **http://localhost:3000** y listo.

Para detener el servidor: `Ctrl + C` en la terminal.

---

## 3. Estructura de carpetas (lo que te importa)

De todo el proyecto, estas son las únicas carpetas que vas a tocar para agregar y editar proyectos:

```
portfolio-fer/
│
├── public/
│   ├── models/          ← Aquí van tus archivos .glb
│   │   ├── ancient-warrior.glb
│   │   └── forest-shrine.glb
│   │
│   └── thumbnails/      ← Aquí van las imágenes de portada (JPG/PNG/WebP)
│       ├── ancient-warrior.jpg
│       └── forest-shrine.jpg
│
└── data/
    └── projects.ts      ← Aquí registras cada proyecto (título, descripción, etc.)
```

> **Regla de oro**: archivo en `public/` → el sitio lo puede leer.
> Cualquier cosa fuera de `public/` es código — no la necesitas tocar salvo que quieras cambiar el diseño.

---

## 4. Cómo agregar un proyecto nuevo

### Paso 1 — Prepara los archivos

1. Exporta tu modelo como `.glb` (ver [sección 5](#5-cómo-exportar-tu-modelo-desde-blender-formato-correcto)).
2. Toma una captura o render del proyecto y guárdala como `.jpg` o `.webp`.
3. Nómbralos igual (facilita la organización):
   - `mi-personaje.glb`
   - `mi-personaje.jpg`
4. Copia el `.glb` a `public/models/` y la imagen a `public/thumbnails/`.

### Paso 2 — Registra el proyecto en `data/projects.ts`

Abre el archivo [data/projects.ts](data/projects.ts) y agrega una nueva entrada al array `projects`.

Copia este bloque como plantilla y rellénalo:

```typescript
{
  id: 'mi-personaje',                        // ← URL del proyecto: /project/mi-personaje
  title: 'Mi Personaje',                     // ← Título que aparece en la galería
  description: 'Descripción del proyecto.',  // ← Texto del sidebar en el visor
  category: 'character',                     // ← 'character' | 'environment' | 'prop' | 'concept'
  thumbnail: '/thumbnails/mi-personaje.jpg', // ← Ruta a tu imagen en /public/thumbnails/
  modelPath: '/models/mi-personaje.glb',     // ← Ruta al .glb (quítala si no tienes modelo 3D)
  tags: ['character', 'fantasy', 'armor'],   // ← Tags que aparecen en la tarjeta
  year: 2025,                                // ← Año del proyecto
  software: ['ZBrush', 'Blender'],           // ← Programas usados (el primero aparece en la tarjeta)
},
```

Guarda el archivo. El navegador actualiza automáticamente.

---

### Ejemplo completo: proyecto con partes interactivas

Si quieres que el usuario pueda hacer clic en partes específicas del modelo y ver información, agrega `meshInfo`:

```typescript
{
  id: 'dragon-knight',
  title: 'Dragon Knight',
  description: 'Character diseñado para cutscene. Armadura escamada con cape animada.',
  category: 'character',
  thumbnail: '/thumbnails/dragon-knight.jpg',
  modelPath: '/models/dragon-knight.glb',
  tags: ['character', 'armor', 'dragon', 'fantasy'],
  year: 2025,
  software: ['ZBrush', 'Substance Painter', 'Maya'],

  // Partes del modelo en las que el usuario puede hacer clic:
  meshInfo: {
    'Helmet': {                               // ← Nombre EXACTO de la malla en Blender
      name: 'Casco',                          // ← Nombre bonito para mostrar
      description: 'Casco con cresta de dragón. Tiene damage map personalizado.',
      material: 'Acero + escamas de dragón',
      polycount: '12,400 tris',
    },
    'Chestplate': {
      name: 'Peto',
      description: 'Peto modular con overlay de cuero quemado.',
      material: 'Hierro forjado',
      polycount: '18,200 tris',
    },
    'Cape': {
      name: 'Capa',
      description: 'Simulación de tela con damage en los bordes.',
      material: 'Seda desgastada',
      polycount: '6,500 tris',
    },
  },

  // Escena que carga por defecto al abrir este proyecto:
  defaultScene: {
    environment: 'dawn',           // ← Entorno HDRI (ver tabla en sección 7)
    ambientIntensity: 0.4,         // ← Luz ambiental (0 = negro, 2 = muy brillante)
    directionalIntensity: 1.2,     // ← Luz principal (0 = apagada, 3 = muy intensa)
  },
},
```

---

### Ejemplo: proyecto solo con imagen (sin modelo 3D)

Si el proyecto es concept art o no tienes el .glb listo, omite `modelPath`:

```typescript
{
  id: 'concept-mercenary',
  title: 'Mercenary Concept',
  description: 'Concept art de personaje para un juego indie.',
  category: 'concept',
  thumbnail: '/thumbnails/concept-mercenary.jpg',
  // Sin modelPath → el visor muestra la imagen de thumbnail en su lugar
  tags: ['concept', '2D', 'character'],
  year: 2025,
  software: ['Photoshop'],
},
```

---

## 5. Cómo exportar tu modelo desde Blender (formato correcto)

El sitio usa el formato **GLB** — un único archivo que empaqueta geometría, materiales y texturas. Más pequeño y rápido que OBJ o FBX.

### Exportar desde Blender con compresión Draco

1. Selecciona todos los objetos de tu modelo (`A`).
2. Ve a **File → Export → glTF 2.0 (.glb/.gltf)**.
3. En el panel de opciones de la derecha, configura:
   - **Format**: `GLB` (un solo archivo)
   - **Include**: activa `Selected Objects` si no quieres exportar toda la escena
   - **Geometry → Compression**: activa `Draco` ✓
   - **Draco → Compression Level**: 6 es buen balance (más alto = más pequeño, pero más lento de cargar)
4. Asegúrate de que los materiales usen el sistema de nodos **Principled BSDF** — es el único que se convierte correctamente a PBR en la web.
5. Guarda el archivo.

> **Recomendación de peso**: intenta mantener los modelos por debajo de 15 MB. Con Draco activo, la mayoría de personajes de alta calidad entran fácilmente en 3–8 MB.

### Desde ZBrush

ZBrush no exporta GLB directamente. El flujo recomendado es:
1. Exportar desde ZBrush como **OBJ** o **FBX**.
2. Importar en Blender.
3. Asignar materiales Principled BSDF.
4. Exportar como GLB desde Blender (ver arriba).

---

## 6. Cómo encontrar los nombres de las mallas

Los nombres de las mallas en `meshInfo` tienen que coincidir **exactamente** (mayúsculas, espacios, todo) con los nombres en tu archivo .glb.

### En Blender

Los nombres son los que aparecen en el **Outliner** (panel de jerarquía, arriba a la derecha):

```
Outliner
└── Dragon_Knight          ← objeto padre (no lo necesitas)
    ├── Helmet             ← nombre de la malla ← usa este
    ├── Chestplate
    └── Cape
```

Usa exactamente esos nombres en `meshInfo`. Por ejemplo:

```typescript
meshInfo: {
  'Helmet': { ... },      // ✅ Correcto — mismo nombre que en Blender
  'helmet': { ... },      // ❌ Incorrecto — diferente capitalización
  'Helm': { ... },        // ❌ Incorrecto — nombre distinto
}
```

### Tip: revisar los nombres sin abrir Blender

Si ya exportaste el GLB y no recuerdas los nombres exactos, arrastra tu archivo en [gltf.report](https://gltf.report/) — en la pestaña **JSON** busca las entradas con `"type": "MESH"` y ahí están los nombres.

---

## 7. Configurar la escena de cada proyecto

Cada proyecto puede tener su propia iluminación y entorno HDRI por defecto. Esto se configura con `defaultScene`:

```typescript
defaultScene: {
  environment: 'forest',         // Entorno HDRI
  ambientIntensity: 0.6,         // Luz ambiental  (rango: 0.0 – 2.0)
  directionalIntensity: 0.8,     // Luz principal  (rango: 0.0 – 3.0)
  background: false,             // Mostrar el HDRI como fondo (true/false)
},
```

### Entornos disponibles

| Valor | Descripción | Ideal para |
|---|---|---|
| `'studio'` | Luz de estudio plana y neutral | Props, weapon showcases |
| `'dawn'` | Amanecer suave, tonos cálidos | Characters con fantasía |
| `'sunset'` | Crepúsculo dramático, naranja/rojo | Sci-fi, mecha, armaduras |
| `'forest'` | Verde filtrado, sombras suaves | Entornos naturales, criaturas |
| `'city'` | Luz urbana difusa | Sci-fi, personajes modernos |
| `'warehouse'` | Industrial, duro y contrastado | Mech, robots, props industriales |
| `'lobby'` | Arquitectónico, neutro-cálido | Personajes realistas |
| `'night'` | Muy oscuro, dramático | Villanos, dark fantasy |
| `'park'` | Exterior durante el día, luz natural | Personajes casuales, props |
| `'apartment'` | Interior suave, íntimo | Portraits, bust characters |

> El usuario siempre puede cambiar la escena manualmente desde el panel "Scene" en el visor. Tu `defaultScene` es solo el punto de partida.

---

## 8. Agregar una nueva categoría

Las categorías actuales son: `character`, `environment`, `prop`, `concept`.

Para agregar una nueva, por ejemplo `creature`:

**1. Edita [types/index.ts](types/index.ts)**

```typescript
// Línea actual:
export type Category = 'all' | 'character' | 'environment' | 'prop' | 'concept';

// Agrega tu nueva categoría:
export type Category = 'all' | 'character' | 'environment' | 'prop' | 'concept' | 'creature';
```

**2. Edita [components/gallery/Gallery.tsx](components/gallery/Gallery.tsx)**

Agrega el botón de filtro en el array `CATEGORIES`:

```typescript
const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Character', value: 'character' },
  { label: 'Environment', value: 'environment' },
  { label: 'Prop', value: 'prop' },
  { label: 'Concept', value: 'concept' },
  { label: 'Creature', value: 'creature' },  // ← Nueva categoría
];
```

---

## 9. Personalizar el encabezado del sitio

### Cambiar el nombre y subtítulo

Abre [components/gallery/Gallery.tsx](components/gallery/Gallery.tsx) y edita estas líneas:

```tsx
<h1 className="text-5xl font-bold text-white tracking-tight">
  Fer<span className="text-violet-400">.</span>   {/* ← Tu nombre */}
</h1>
<p className="text-zinc-400 mt-3 text-lg max-w-xl">
  3D Artist · Character & Environment Design      {/* ← Tu descripción */}
</p>
```

### Cambiar el título de la pestaña del navegador

Abre [app/layout.tsx](app/layout.tsx):

```typescript
export const metadata: Metadata = {
  title: "Fer · 3D Artist Portfolio",        // ← Título de la pestaña
  description: "3D Artist specializing ...", // ← Descripción para Google
};
```

---

## 10. Publicar el sitio en internet (Vercel)

Vercel es gratuito para proyectos personales y es el hosting más fácil para Next.js.

### Pasos

1. Crea una cuenta en [vercel.com](https://vercel.com) (puedes entrar con GitHub).
2. Sube el proyecto a un repositorio de GitHub.
3. En Vercel, haz clic en **"Add New Project"** → importa tu repositorio.
4. Vercel detecta automáticamente que es Next.js. Haz clic en **Deploy**.
5. En unos minutos tendrás una URL pública como `fer-portfolio.vercel.app`.

> Cada vez que hagas cambios y los subas a GitHub, Vercel se actualiza automáticamente.

### ¿Y mis archivos .glb? ¿Hay límite de tamaño?

Vercel tiene un límite de **100 MB por deploy** en el plan gratuito. Si tus modelos son grandes, hay dos opciones:

- **Opción A (simple)**: comprime bien con Draco — la mayoría de modelos entran fácil.
- **Opción B (para portafolios grandes)**: sube los `.glb` a [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) o Google Drive (público) y usa esa URL en `modelPath` en lugar de `/models/archivo.glb`.

---

## 11. Preguntas frecuentes y problemas comunes

### El modelo carga pero se ve completamente negro

Los materiales en Blender deben usar **Principled BSDF** — otros shaders no se exportan correctamente a GLB. Verifica que las texturas estén conectadas al nodo Principled BSDF antes de exportar.

### El modelo carga pero no tiene texturas

Al exportar GLB, asegúrate de que la opción **"Export Textures"** esté activada. Las texturas deben estar empaquetadas en el archivo: en Blender ve a `File → External Data → Pack All Into .blend` antes de exportar.

### Hago clic en el modelo pero no aparece el panel de información

La parte en la que hiciste clic no tiene una entrada en `meshInfo`. Revisa que el nombre en el código coincida exactamente con el nombre de la malla en Blender (ver [sección 6](#6-cómo-encontrar-los-nombres-de-las-mallas)).

### El modelo aparece muy pequeño o muy grande

Esto pasa cuando el modelo no está en el origen (0, 0, 0) o tiene escala no aplicada. En Blender: selecciona el modelo → `Object → Apply → All Transforms` antes de exportar.

### El sitio no encuentra mi imagen o modelo

Verifica que el archivo esté en la carpeta correcta dentro de `public/`. La ruta en el código empieza con `/` (relativa a `public/`). Los nombres de archivos son case-sensitive: `Mi-Foto.jpg` ≠ `mi-foto.jpg`.

### No arranca el servidor (`npm run dev` da error)

```bash
# Borra la caché y reinstala:
rmdir /s .next
rmdir /s node_modules
npm install
npm run dev
```

### Quiero cambiar el color violeta a otro color

Busca y reemplaza en todos los archivos del proyecto (`Ctrl + Shift + H` en VS Code):

| Buscar | Reemplazar (ejemplo: rosa) |
|---|---|
| `violet-600` | `rose-600` |
| `violet-500` | `rose-500` |
| `violet-400` | `rose-400` |
| `violet-300` | `rose-300` |

---

## Referencia rápida de campos de proyecto

| Campo | Obligatorio | Tipo | Ejemplo |
|---|---|---|---|
| `id` | ✅ | string | `'dragon-knight'` |
| `title` | ✅ | string | `'Dragon Knight'` |
| `description` | ✅ | string | `'Personaje para cutscene...'` |
| `category` | ✅ | `'character'` \| `'environment'` \| `'prop'` \| `'concept'` | `'character'` |
| `thumbnail` | ✅ | string (ruta) | `'/thumbnails/dragon.jpg'` |
| `year` | ✅ | number | `2025` |
| `software` | ✅ | string[] | `['ZBrush', 'Blender']` |
| `tags` | ✅ | string[] | `['character', 'armor']` |
| `modelPath` | ❌ | string (ruta) | `'/models/dragon.glb'` |
| `meshInfo` | ❌ | objeto | ver [sección 4](#4-cómo-agregar-un-proyecto-nuevo) |
| `defaultScene` | ❌ | objeto | ver [sección 7](#7-configurar-la-escena-de-cada-proyecto) |

---

Hecho con mucho cariño 🫶

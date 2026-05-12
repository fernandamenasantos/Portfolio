import { Project, Category } from '@/types';

export const projects: Project[] = [
  {
    id: 'cafe-lamp',
    title: 'Café Lamp',
    description:
      'Lámpara de techo del proyecto de escena de café. Modelado y texturizado con materiales PBR.',
    category: 'prop',
    thumbnail: '/thumbnails/cafe-lamp.jpg',
    modelPath: '/models/cafe-lamp.glb',
    tags: ['prop', 'interior', 'cafe', 'lighting'],
    year: 2025,
    software: ['Blender'],
    meshInfo: {
      // Replace these keys with the exact mesh names from your GLB file.
      // You can find them by opening the model in Blender or checking the console
      // when you click a part in the viewer (it logs the mesh name).
      'Lamp_Body': {
        name: 'Body',
        description: 'Main structural body of the lamp.',
        material: 'Metal PBR',
        polycount: '1,240',
      },
      'Lamp_Shade': {
        name: 'Shade',
        description: 'Diffuser shade — frosted glass material.',
        material: 'Glass',
        polycount: '860',
      },
      'Lamp_Cable': {
        name: 'Cable',
        description: 'Hanging cable and socket.',
        material: 'Rubber',
        polycount: '320',
      },
    },
    // Add your reference images here.
    // turnaround: front/side/back sketches or renders before the 3D model.
    // moodboard: inspiration images, color palettes, reference photos.
    turnaround: [
      // '/references/cafe-lamp-front.jpg',
      // '/references/cafe-lamp-side.jpg',
      // '/references/cafe-lamp-back.jpg',
    ],
    moodboard: [
      // '/references/cafe-lamp-ref-1.jpg',
      // '/references/cafe-lamp-ref-2.jpg',
    ],
    defaultScene: {
      environment: 'studio',
      ambientIntensity: 0.5,
      directionalIntensity: 1.0,
    },
  },
  {
    id: 'silla-cafe',
    title: 'Silla Café',
    description:
      'Silla de café con diseño moderno, preparada para entornos de interiores y visualización de producto.',
    category: 'prop',
    thumbnail: '/thumbnails/silla-cafe.jpg',
    modelPath: '/models/silla-cafe.glb',
    tags: ['prop', 'furniture', 'interior', 'seating'],
    year: 2025,
    software: ['Blender'],
    // Añade meshInfo si quieres información detallada de las partes al hacer clic.
    defaultScene: {
      environment: 'studio',
      ambientIntensity: 0.6,
      directionalIntensity: 1.2,
    },
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);

export const getProjectsByCategory = (category: Category) =>
  category === 'all' ? projects : projects.filter((p) => p.category === category);

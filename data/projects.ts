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
    // meshInfo se llena con los nombres exactos de las mallas del GLB
    // Ejemplo:
    // meshInfo: {
    //   'Lamp_Body': { name: 'Cuerpo', description: 'Estructura principal de la lámpara.' },
    //   'Lamp_Shade': { name: 'Pantalla', description: 'Pantalla difusora de luz.' },
    // },
    defaultScene: {
      environment: 'studio',
      ambientIntensity: 0.5,
      directionalIntensity: 1.0,
    },
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);

export const getProjectsByCategory = (category: Category) =>
  category === 'all' ? projects : projects.filter((p) => p.category === category);

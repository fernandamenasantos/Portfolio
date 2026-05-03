import { Project, Category } from '@/types';

export const projects: Project[] = [
  {
    id: 'ancient-warrior',
    title: 'Ancient Warrior',
    description:
      'High-poly character designed for cinematic rendering. Full body armor with intricate engravings, hand-painted textures and custom cloth simulation.',
    category: 'character',
    thumbnail: '/thumbnails/ancient-warrior.jpg',
    modelPath: '/models/ancient-warrior.glb',
    tags: ['character', 'armor', 'fantasy', 'high-poly'],
    year: 2024,
    software: ['ZBrush', 'Substance Painter', 'Maya'],
    meshInfo: {
      Helmet: {
        name: 'Helmet',
        description: 'Full-coverage helm with face guard. Engraved with clan sigils.',
        material: 'Hammered iron + gold inlay',
        polycount: '18,420 tris',
      },
      Chestplate: {
        name: 'Chestplate',
        description: 'Layered pauldrons and breastplate forged from tempered steel.',
        material: 'Polished steel with leather straps',
        polycount: '24,100 tris',
      },
      Cape: {
        name: 'Cape',
        description: 'Cloth-simulated cape with torn edges and battle damage.',
        material: 'Silk + weathered linen',
        polycount: '8,200 tris',
      },
    },
    defaultScene: {
      environment: 'dawn',
      ambientIntensity: 0.4,
      directionalIntensity: 1.2,
    },
  },
  {
    id: 'forest-shrine',
    title: 'Forest Shrine',
    description:
      'Atmospheric environment piece featuring an ancient stone shrine overtaken by nature. Real-time ready with PBR materials.',
    category: 'environment',
    thumbnail: '/thumbnails/forest-shrine.jpg',
    modelPath: '/models/forest-shrine.glb',
    tags: ['environment', 'nature', 'stylized', 'realtime'],
    year: 2024,
    software: ['Blender', 'Substance Designer', 'Unreal Engine'],
    meshInfo: {
      StonePillar: {
        name: 'Stone Pillar',
        description: 'Weathered granite pillar covered in moss and vines.',
        material: 'Granite + moss PBR',
        polycount: '4,800 tris',
      },
      Lantern: {
        name: 'Lantern',
        description: 'Paper lantern with emissive material. Gently animates in wind.',
        material: 'Washi paper + iron frame',
        polycount: '1,240 tris',
      },
    },
    defaultScene: {
      environment: 'forest',
      ambientIntensity: 0.6,
      directionalIntensity: 0.8,
    },
  },
  {
    id: 'arcane-staff',
    title: 'Arcane Staff',
    description:
      'Game-ready weapon prop. Modular design with interchangeable crystal tips and rune carvings.',
    category: 'prop',
    thumbnail: '/thumbnails/arcane-staff.jpg',
    modelPath: '/models/arcane-staff.glb',
    tags: ['prop', 'weapon', 'magic', 'game-ready'],
    year: 2023,
    software: ['Maya', 'Substance Painter'],
    defaultScene: {
      environment: 'studio',
      ambientIntensity: 0.5,
      directionalIntensity: 1.0,
    },
  },
  {
    id: 'mech-spider',
    title: 'Mech Spider',
    description:
      'Mechanical arachnid with fully rigged legs and articulated abdomen. Sci-fi aesthetic with industrial weathering.',
    category: 'character',
    thumbnail: '/thumbnails/mech-spider.jpg',
    modelPath: '/models/mech-spider.glb',
    tags: ['character', 'mech', 'sci-fi', 'rigged'],
    year: 2025,
    software: ['ZBrush', 'Maya', 'Substance Painter'],
    defaultScene: {
      environment: 'warehouse',
      ambientIntensity: 0.3,
      directionalIntensity: 1.5,
    },
  },
  {
    id: 'desert-outpost',
    title: 'Desert Outpost',
    description:
      'Modular environment kit for a post-apocalyptic desert base. Optimized for real-time with LODs.',
    category: 'environment',
    thumbnail: '/thumbnails/desert-outpost.jpg',
    tags: ['environment', 'sci-fi', 'modular', 'post-apocalyptic'],
    year: 2023,
    software: ['Blender', 'Substance Designer'],
    defaultScene: {
      environment: 'sunset',
      ambientIntensity: 0.5,
      directionalIntensity: 1.1,
    },
  },
  {
    id: 'crystal-golem',
    title: 'Crystal Golem',
    description:
      'Fantasy creature concept brought to 3D. Translucent crystal formations with subsurface scattering material.',
    category: 'character',
    thumbnail: '/thumbnails/crystal-golem.jpg',
    tags: ['character', 'fantasy', 'creature', 'SSS'],
    year: 2025,
    software: ['ZBrush', 'Blender', 'Substance Painter'],
    defaultScene: {
      environment: 'city',
      ambientIntensity: 0.4,
      directionalIntensity: 1.0,
    },
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);

export const getProjectsByCategory = (category: Category) =>
  category === 'all' ? projects : projects.filter((p) => p.category === category);

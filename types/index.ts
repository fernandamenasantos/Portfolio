export type Category = 'all' | 'character' | 'environment' | 'prop' | 'concept';
export type DisplayMode = 'shaded' | 'wireframe' | 'clay';

export interface MeshInfo {
  name: string;
  description: string;
  material?: string;
  polycount?: string;
}

export interface SceneConfig {
  environment: EnvironmentPreset;
  ambientIntensity: number;
  directionalIntensity: number;
  background: boolean;
}

export type EnvironmentPreset =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'all'>;
  thumbnail: string;
  modelPath?: string;
  images?: string[];
  tags: string[];
  year: number;
  software: string[];
  meshInfo?: Record<string, MeshInfo>;
  defaultScene?: Partial<SceneConfig>;
}

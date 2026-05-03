import { create } from 'zustand';
import { SceneConfig, MeshInfo, EnvironmentPreset, DisplayMode } from '@/types';

interface SelectedMesh {
  name: string;
  info: MeshInfo | null;
  position: { x: number; y: number };
}

interface ViewerState {
  scene: SceneConfig;
  selectedMesh: SelectedMesh | null;
  hoveredMesh: string | null;
  isLoading: boolean;
  displayMode: DisplayMode;

  setEnvironment: (env: EnvironmentPreset) => void;
  setAmbientIntensity: (v: number) => void;
  setDirectionalIntensity: (v: number) => void;
  toggleBackground: () => void;
  setSelectedMesh: (mesh: SelectedMesh | null) => void;
  setHoveredMesh: (name: string | null) => void;
  setLoading: (v: boolean) => void;
  applySceneConfig: (config: Partial<SceneConfig>) => void;
  setDisplayMode: (mode: DisplayMode) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  scene: {
    environment: 'studio',
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    background: false,
  },
  selectedMesh: null,
  hoveredMesh: null,
  isLoading: true,
  displayMode: 'shaded',

  setEnvironment: (environment) =>
    set((s) => ({ scene: { ...s.scene, environment } })),

  setAmbientIntensity: (ambientIntensity) =>
    set((s) => ({ scene: { ...s.scene, ambientIntensity } })),

  setDirectionalIntensity: (directionalIntensity) =>
    set((s) => ({ scene: { ...s.scene, directionalIntensity } })),

  toggleBackground: () =>
    set((s) => ({ scene: { ...s.scene, background: !s.scene.background } })),

  setSelectedMesh: (selectedMesh) => set({ selectedMesh }),

  setHoveredMesh: (hoveredMesh) => set({ hoveredMesh }),

  setLoading: (isLoading) => set({ isLoading }),

  applySceneConfig: (config) =>
    set((s) => ({ scene: { ...s.scene, ...config } })),

  setDisplayMode: (displayMode) => set({ displayMode }),
}));

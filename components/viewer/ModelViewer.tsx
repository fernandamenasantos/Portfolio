'use client';

import { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useViewerStore } from '@/store/viewerStore';
import { Project } from '@/types';
import Scene from './Scene';
import MeshInfoPanel from './MeshInfoPanel';
import EnvironmentSelector from './EnvironmentSelector';
import LoadingOverlay from './LoadingOverlay';
import ViewerErrorBoundary from './ViewerErrorBoundary';
import DisplayModeSelector from './DisplayModeSelector';

interface Props {
  project: Project;
}

export default function ModelViewer({ project }: Props) {
  const {
    isLoading, setLoading, applySceneConfig,
    setSelectedMesh, setHoveredMesh, setDisplayMode,
  } = useViewerStore();

  useEffect(() => {
    setLoading(true);
    setSelectedMesh(null);
    setHoveredMesh(null);
    setDisplayMode('shaded');
    if (project.defaultScene) {
      applySceneConfig(project.defaultScene);
    }
  }, [project.id, project.defaultScene, setLoading, setSelectedMesh, setHoveredMesh, setDisplayMode, applySceneConfig]);

  if (!project.modelPath) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-600 text-sm">No 3D model available for this project.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <LoadingOverlay visible={isLoading} />

      {/* Hint overlay — centered, only after load */}
      {!isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <p className="text-zinc-600 text-xs font-mono bg-zinc-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
            Drag to rotate · Scroll to zoom · Click a part for info
          </p>
        </div>
      )}

      {/* Display mode buttons — top right */}
      {!isLoading && <DisplayModeSelector />}

      {/* R3F Canvas */}
      <ViewerErrorBoundary>
        <Canvas
          camera={{ position: [0, 2, 5], fov: 45 }}
          shadows="percentage"
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#09090b' }}
        >
          <Suspense fallback={null}>
            <Scene modelPath={project.modelPath} meshInfo={project.meshInfo} />
          </Suspense>
        </Canvas>
      </ViewerErrorBoundary>

      {/* UI overlays */}
      <MeshInfoPanel />
      <EnvironmentSelector />
    </div>
  );
}

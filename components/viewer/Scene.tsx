'use client';

import { Suspense } from 'react';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { useViewerStore } from '@/store/viewerStore';
import InteractiveModel from './InteractiveModel';
import { MeshInfo } from '@/types';

interface Props {
  modelPath: string;
  meshInfo?: Record<string, MeshInfo>;
}

export default function Scene({ modelPath, meshInfo }: Props) {
  const { scene } = useViewerStore();

  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        makeDefault
        minDistance={1}
        maxDistance={20}
        enablePan
        enableZoom
        enableRotate
        dampingFactor={0.05}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={scene.ambientIntensity} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={scene.directionalIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={scene.directionalIntensity * 0.3} />

      {/* HDRI Environment */}
      <Environment preset={scene.environment} background={scene.background} />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />

      {/* Model */}
      <Suspense fallback={null}>
        <InteractiveModel modelPath={modelPath} meshInfo={meshInfo} />
      </Suspense>
    </>
  );
}

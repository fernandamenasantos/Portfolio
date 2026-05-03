'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useViewerStore } from '@/store/viewerStore';
import { MeshInfo } from '@/types';

interface Props {
  modelPath: string;
  meshInfo?: Record<string, MeshInfo>;
}

const HIGHLIGHT_COLOR = new THREE.Color('#a855f7');
const HOVER_COLOR = new THREE.Color('#c084fc');

function getMat(mesh: THREE.Mesh): THREE.MeshStandardMaterial | null {
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial
    ? (mat as THREE.MeshStandardMaterial)
    : null;
}

export default function InteractiveModel({ modelPath, meshInfo }: Props) {
  const { scene } = useGLTF(modelPath);
  const { camera, gl } = useThree();
  const { setSelectedMesh, setHoveredMesh, hoveredMesh, setLoading } = useViewerStore();

  const originalColors = useRef<Map<string, THREE.Color>>(new Map());
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    setLoading(false);
  }, [scene, setLoading]);

  // Clone scene so original GLTF cache isn't mutated
  useEffect(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = getMat(mesh);
        if (!mat) return;
        const cloned = mat.clone();
        mesh.material = cloned;
        originalColors.current.set(mesh.name, cloned.color.clone());
      }
    });

    setClonedScene(clone);

    return () => {
      originalColors.current.clear();
      clone.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  const getMeshByName = useCallback(
    (name: string): THREE.Mesh | null => {
      if (!clonedScene) return null;
      let found: THREE.Mesh | null = null;
      clonedScene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh && obj.name === name) {
          found = obj as THREE.Mesh;
        }
      });
      return found;
    },
    [clonedScene]
  );

  const resetMeshColor = useCallback(
    (name: string) => {
      const mesh = getMeshByName(name);
      if (!mesh) return;
      const mat = getMat(mesh);
      if (!mat) return;
      const original = originalColors.current.get(name);
      if (original) mat.color.copy(original);
      mat.emissive.set(0, 0, 0);
      mat.emissiveIntensity = 0;
    },
    [getMeshByName]
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const name = e.object.name;
      if (name === hoveredMesh) return;

      if (hoveredMesh) resetMeshColor(hoveredMesh);

      setHoveredMesh(name);
      gl.domElement.style.cursor = 'pointer';

      const mesh = e.object as THREE.Mesh;
      const mat = getMat(mesh);
      if (!mat) return;
      mat.emissive.copy(HOVER_COLOR);
      mat.emissiveIntensity = 0.3;
    },
    [hoveredMesh, resetMeshColor, setHoveredMesh, gl]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const name = e.object.name;
      resetMeshColor(name);
      setHoveredMesh(null);
      gl.domElement.style.cursor = 'default';
    },
    [resetMeshColor, setHoveredMesh, gl]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const name = e.object.name;

      const mesh = e.object as THREE.Mesh;
      const mat = getMat(mesh);
      if (mat) {
        mat.emissive.copy(HIGHLIGHT_COLOR);
        mat.emissiveIntensity = 0.5;
      }

      // Project 3D position to screen coords for info panel placement
      const pos = new THREE.Vector3();
      mesh.getWorldPosition(pos);
      pos.project(camera);

      const canvas = gl.domElement;
      const x = ((pos.x + 1) / 2) * canvas.clientWidth;
      const y = ((-pos.y + 1) / 2) * canvas.clientHeight;

      setSelectedMesh({
        name,
        info: meshInfo?.[name] ?? { name, description: 'No info available for this mesh.' },
        position: { x, y },
      });
    },
    [camera, gl, meshInfo, setSelectedMesh]
  );

  const handleMissedClick = useCallback(() => {
    setSelectedMesh(null);
    if (hoveredMesh) resetMeshColor(hoveredMesh);
    setHoveredMesh(null);
    gl.domElement.style.cursor = 'default';
  }, [setSelectedMesh, hoveredMesh, resetMeshColor, setHoveredMesh, gl]);

  if (!clonedScene) return null;

  return (
    <primitive
      object={clonedScene}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      onPointerMissed={handleMissedClick}
    />
  );
}

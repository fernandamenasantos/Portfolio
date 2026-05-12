'use client';

import { useRef, useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useViewerStore } from '@/store/viewerStore';
import { MeshInfo } from '@/types';
import { buildQuadWireframe, QUAD_WIRE_CONFIG } from './buildQuadWireframe';

interface Props {
  modelPath: string;
  meshInfo?: Record<string, MeshInfo>;
}

const HIGHLIGHT_COLOR = new THREE.Color('#a855f7');
const HOVER_COLOR = new THREE.Color('#c084fc');
const CLAY_COLOR = new THREE.Color('#c8b8a2');

interface OriginalProps {
  color: THREE.Color;
  roughness: number;
  metalness: number;
}

interface WireframeLine {
  lines: THREE.LineSegments;
  geo: THREE.BufferGeometry;
  mat: THREE.LineBasicMaterial;
}

function getMat(mesh: THREE.Mesh): THREE.MeshStandardMaterial | null {
  const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial
    ? (mat as THREE.MeshStandardMaterial)
    : null;
}

export default function InteractiveModel({ modelPath, meshInfo }: Props) {
  const { scene } = useGLTF(modelPath);
  const { camera, gl } = useThree();
  const { setSelectedMesh, setHoveredMesh, hoveredMesh, setLoading, displayMode, isolatedMesh } = useViewerStore();

  const originalProps = useRef<Map<string, OriginalProps>>(new Map());
  const wireframeLines = useRef<WireframeLine[]>([]);
  const wireframeCache = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);

  // Update cursor based on hoveredMesh
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    gl.domElement.style.cursor = hoveredMesh ? 'pointer' : 'default';
  }, [hoveredMesh, gl]);

  useEffect(() => {
    setLoading(false);
  }, [scene, setLoading]);

  // Clone scene so original GLTF cache isn't mutated
  useLayoutEffect(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;

      if (!mesh.name) mesh.name = `mesh_${Math.random().toString(36).slice(2)}`;

      const mat = getMat(mesh);
      if (!mat) return;
      const cloned = mat.clone();
      mesh.material = cloned;
      originalProps.current.set(mesh.name, {
        color: cloned.color.clone(),
        roughness: cloned.roughness,
        metalness: cloned.metalness,
      });
    });

    // Auto-center: shift origin to bounding-box center so camera always frames the model
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClonedScene(clone);

    return () => {
      wireframeLines.current.forEach(({ lines, geo, mat }) => {
        lines.parent?.remove(lines);
        geo.dispose();
        mat.dispose();
      });
      wireframeLines.current = [];
      originalProps.current.clear();
      // Dispose and evict all cached wireframe geometries on unmount
      wireframeCache.current.forEach((geo) => geo.dispose());
      wireframeCache.current.clear();
      clone.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        const mesh = obj as THREE.Mesh;
        if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
        else mesh.material.dispose();
      });
    };
  }, [scene]);

  // Apply display mode whenever it changes or the scene reloads
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const mat = getMat(mesh);
      if (!mat) return;

      // Reset transient state from previous mode
      mat.visible = true;
      mat.emissive.set(0, 0, 0);
      mat.emissiveIntensity = 0;

      if (displayMode === 'wireframe') {
        // Hide faces — only the EdgeGeometry lines are visible against the dark background
        mat.visible = false;
      } else if (displayMode === 'clay') {
        mat.color.copy(CLAY_COLOR);
        mat.roughness = 0.95;
        mat.metalness = 0;
      } else {
        // shaded — restore original material properties
        const orig = originalProps.current.get(mesh.name);
        if (orig) {
          mat.color.copy(orig.color);
          mat.roughness = orig.roughness;
          mat.metalness = orig.metalness;
        }
      }

      if (displayMode === 'wireframe') {
        // Check memoization cache before computing
        let wireGeo: THREE.BufferGeometry;
        if (wireframeCache.current.has(mesh.geometry.uuid)) {
          wireGeo = wireframeCache.current.get(mesh.geometry.uuid)!;
        } else {
          wireGeo = buildQuadWireframe(mesh.geometry);
          wireframeCache.current.set(mesh.geometry.uuid, wireGeo);
        }
        const linesMat = new THREE.LineBasicMaterial({ color: QUAD_WIRE_CONFIG.WIRE_COLOR });
        const lines = new THREE.LineSegments(wireGeo, linesMat);
        mesh.add(lines);
        wireframeLines.current.push({ lines, geo: wireGeo, mat: linesMat });
      }
    });

    return () => {
      wireframeLines.current.forEach(({ lines, mat }) => {
        lines.parent?.remove(lines);
        // NOTE: geo is NOT disposed here — it lives in wireframeCache and is reused
        // across mode switches. Cache is cleared only when the scene unmounts.
        mat.dispose();
      });
      wireframeLines.current = [];
    };
  }, [displayMode, clonedScene]);

  // Isolate a single mesh — hide all others, show only the isolated one
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const mat = getMat(mesh);
      if (!mat) return;
      if (isolatedMesh === null) {
        // No isolation — restore visibility (display mode effect owns this, just ensure visible)
        mat.visible = displayMode !== 'wireframe';
      } else {
        mat.visible = mesh.name === isolatedMesh;
      }
    });
  }, [isolatedMesh, clonedScene, displayMode]);

  const getMeshByName = useCallback(
    (name: string): THREE.Mesh | null => {
      if (!clonedScene) return null;
      let found: THREE.Mesh | null = null;
      clonedScene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh && obj.name === name) found = obj as THREE.Mesh;
      });
      return found;
    },
    [clonedScene]
  );

  // Only resets emissive — base color/visibility is owned by the display-mode effect
  const resetMeshHighlight = useCallback(
    (name: string) => {
      const mesh = getMeshByName(name);
      if (!mesh) return;
      const mat = getMat(mesh);
      if (!mat) return;
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

      if (hoveredMesh) resetMeshHighlight(hoveredMesh);

      setHoveredMesh(name);
      // gl.domElement.style.cursor = 'pointer'; // Moved to useEffect

      const mat = getMat(e.object as THREE.Mesh);
      if (!mat) return;
      mat.emissive.copy(HOVER_COLOR);
      mat.emissiveIntensity = 0.3;
    },
    [hoveredMesh, resetMeshHighlight, setHoveredMesh]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      resetMeshHighlight(e.object.name);
      setHoveredMesh(null);
      // gl.domElement.style.cursor = 'default'; // Moved to useEffect
    },
    [resetMeshHighlight, setHoveredMesh]
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

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMissedClick = useCallback((e: MouseEvent) => {
    // Ignore if the pointer moved more than 4px — it was a drag, not a click
    if (pointerDownPos.current) {
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 4) return;
    }
    setSelectedMesh(null);
    if (hoveredMesh) resetMeshHighlight(hoveredMesh);
    setHoveredMesh(null);
  }, [setSelectedMesh, hoveredMesh, resetMeshHighlight, setHoveredMesh]);

  if (!clonedScene) return null;

  return (
    <primitive
      object={clonedScene}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      onPointerMissed={handleMissedClick}
    />
  );
}

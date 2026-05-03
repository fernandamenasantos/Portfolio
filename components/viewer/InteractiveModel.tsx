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

/**
 * Builds a wireframe geometry that only draws quad edges — triangulation diagonals are omitted.
 *
 * Algorithm: for each interior edge (shared by exactly 2 triangles), check if the 4 vertices
 * forming those 2 triangles are coplanar AND the edge's opposite vertices lie on opposite sides
 * of it. If so, the edge is a triangulation diagonal of a flat quad → skip it.
 * Boundary edges and non-planar feature edges are always kept.
 */
function buildQuadWireframe(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const posAttr = geo.attributes.position;
  const idx = geo.index?.array;
  if (!idx) return new THREE.WireframeGeometry(geo); // non-indexed fallback

  // Build edge → [opposite vertex per adjacent triangle]
  const edgeMap = new Map<string, { u: number; v: number; others: number[] }>();
  const key = (a: number, b: number) => a < b ? `${a}_${b}` : `${b}_${a}`;

  for (let i = 0; i < idx.length; i += 3) {
    const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]];
    for (const [u, v, w] of [[a, b, c], [b, c, a], [c, a, b]] as [number, number, number][]) {
      const k = key(u, v);
      if (!edgeMap.has(k)) edgeMap.set(k, { u, v, others: [] });
      edgeMap.get(k)!.others.push(w);
    }
  }

  const kept: number[] = [];
  const vU = new THREE.Vector3();
  const vV = new THREE.Vector3();
  const vP = new THREE.Vector3();
  const vQ = new THREE.Vector3();
  const edgeDir = new THREE.Vector3();
  const c1 = new THREE.Vector3();
  const c2 = new THREE.Vector3();

  // c1 = edgeDir × (P−U)  and  c2 = edgeDir × (Q−U) are the face normals of the
  // two adjacent triangles (relative to the shared edge direction).
  // For a consistently wound mesh: normalDot ≈ −cos(dihedral angle).
  //   normalDot ≈ −1  →  dihedral ≈ 0°  (flat / smooth surface)
  //   normalDot ≈  0  →  dihedral ≈ 90° (sharp corner)
  //   normalDot >  0  →  dihedral > 90° (concave)
  //
  // A triangulation diagonal of any quad (flat OR curved) has:
  //   • dihedral ≈ 0° on the smooth surface  →  normalDot ≈ −1
  //   • P and Q on opposite sides of the edge
  // Both conditions collapse into: normalDot < −THRESHOLD.
  // We use 30°  →  THRESHOLD = cos(30°) ≈ 0.866.
  // Edges with dihedral > 30° are kept as real feature / topology edges.
  const SKIP_THRESHOLD = -Math.cos(30 * Math.PI / 180); // ≈ −0.866

  edgeMap.forEach(({ u, v, others }) => {
    vU.fromBufferAttribute(posAttr, u);
    vV.fromBufferAttribute(posAttr, v);

    if (others.length !== 2) {
      kept.push(vU.x, vU.y, vU.z, vV.x, vV.y, vV.z);
      return;
    }

    vP.fromBufferAttribute(posAttr, others[0]);
    vQ.fromBufferAttribute(posAttr, others[1]);
    edgeDir.subVectors(vV, vU);

    c1.crossVectors(edgeDir, vP.clone().sub(vU));
    c2.crossVectors(edgeDir, vQ.clone().sub(vU));

    const c1len = c1.length();
    const c2len = c2.length();
    if (c1len < 1e-9 || c2len < 1e-9) {
      kept.push(vU.x, vU.y, vU.z, vV.x, vV.y, vV.z);
      return;
    }

    const normalDot = c1.dot(c2) / (c1len * c2len);
    if (normalDot >= SKIP_THRESHOLD) {
      // Significant dihedral (>30°) or same-side vertices → real edge → draw
      kept.push(vU.x, vU.y, vU.z, vV.x, vV.y, vV.z);
    }
    // else: smooth surface diagonal → skip
  });

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(kept, 3));
  return result;
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
  const { setSelectedMesh, setHoveredMesh, hoveredMesh, setLoading, displayMode } = useViewerStore();

  const originalProps = useRef<Map<string, OriginalProps>>(new Map());
  const wireframeLines = useRef<WireframeLine[]>([]);
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    setLoading(false);
  }, [scene, setLoading]);

  // Clone scene so original GLTF cache isn't mutated
  useEffect(() => {
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

    setClonedScene(clone);

    return () => {
      wireframeLines.current.forEach(({ lines, geo, mat }) => {
        lines.parent?.remove(lines);
        geo.dispose();
        mat.dispose();
      });
      wireframeLines.current = [];
      originalProps.current.clear();
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
        const wireGeo = buildQuadWireframe(mesh.geometry);
        const linesMat = new THREE.LineBasicMaterial({ color: 0x5577ff });
        const lines = new THREE.LineSegments(wireGeo, linesMat);
        mesh.add(lines);
        wireframeLines.current.push({ lines, geo: wireGeo, mat: linesMat });
      }
    });

    return () => {
      wireframeLines.current.forEach(({ lines, geo, mat }) => {
        lines.parent?.remove(lines);
        geo.dispose();
        mat.dispose();
      });
      wireframeLines.current = [];
    };
  }, [displayMode, clonedScene]);

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
      gl.domElement.style.cursor = 'pointer';

      const mat = getMat(e.object as THREE.Mesh);
      if (!mat) return;
      mat.emissive.copy(HOVER_COLOR);
      mat.emissiveIntensity = 0.3;
    },
    [hoveredMesh, resetMeshHighlight, setHoveredMesh, gl]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      resetMeshHighlight(e.object.name);
      setHoveredMesh(null);
      gl.domElement.style.cursor = 'default';
    },
    [resetMeshHighlight, setHoveredMesh, gl]
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

  const handleMissedClick = useCallback(() => {
    setSelectedMesh(null);
    if (hoveredMesh) resetMeshHighlight(hoveredMesh);
    setHoveredMesh(null);
    gl.domElement.style.cursor = 'default';
  }, [setSelectedMesh, hoveredMesh, resetMeshHighlight, setHoveredMesh, gl]);

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

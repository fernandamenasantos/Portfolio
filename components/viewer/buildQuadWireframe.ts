import * as THREE from 'three';

/**
 * Configuration for the quad wireframe renderer.
 *
 * SKIP_THRESHOLD: normalDot threshold below which an interior edge is considered
 *   a triangulation diagonal and is omitted. Corresponds to dihedral angle ≤ 1°.
 *   normalDot ≈ −cos(dihedral), so SKIP_THRESHOLD = −cos(1°) ≈ −0.99985.
 *   Edges with normalDot < SKIP_THRESHOLD are skipped (smooth surface diagonals).
 *   Edges with normalDot ≥ SKIP_THRESHOLD are kept (feature edges, dihedral > 1°).
 */
export const QUAD_WIRE_CONFIG = {
  // 1° threshold — preserves straight/quadrilateral topology while hiding only
  // the exact triangulation diagonals of near-planar quads.
  SKIP_THRESHOLD: -Math.cos(1 * Math.PI / 180), // ≈ −0.99985
  WIRE_COLOR: 0x7c6af7,   // violet — coherent with UI accent
  WIRE_OPACITY: 0.9,
} as const;

/**
 * Builds a wireframe geometry that only draws quad edges — triangulation diagonals
 * are omitted.
 *
 * Algorithm: for each interior edge (shared by exactly 2 triangles), check the
 * dihedral angle between the two adjacent faces. If the dihedral is ≤ 1°
 * (normalDot < SKIP_THRESHOLD), the edge is a triangulation diagonal of a flat
 * or smooth quad → skip it. Boundary edges (1 adjacent triangle) and feature
 * edges (dihedral > 1°) are always kept.
 *
 * For non-indexed geometries, falls back to THREE.WireframeGeometry.
 *
 * @param geo - Input BufferGeometry (indexed or non-indexed)
 * @returns A new BufferGeometry with LineSegments-compatible position data.
 *          The result shares no references with the input geometry.
 */
export function buildQuadWireframe(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const posAttr = geo.attributes.position;
  const idx = geo.index?.array;
  if (!idx) return new THREE.WireframeGeometry(geo); // non-indexed fallback

  const edgeMap = new Map<string, { u: number; v: number; others: number[] }>();
  const key = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`);

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
  const { SKIP_THRESHOLD } = QUAD_WIRE_CONFIG;

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
      kept.push(vU.x, vU.y, vU.z, vV.x, vV.y, vV.z);
    }
  });

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(kept, 3));
  return result;
}

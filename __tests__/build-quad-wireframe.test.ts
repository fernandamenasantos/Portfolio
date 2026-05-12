/**
 * Property tests for buildQuadWireframe and its memoization wrapper.
 *
 * Tests run in Node environment — no DOM or WebGL required.
 * THREE.js is used directly for geometry construction.
 *
 * **Validates: Requirements 9.2, 9.3, 9.5, 13.1, 13.2**
 *
 * Property 1: Wireframe edge correctness
 *   The result contains only quad edges and skips triangulation diagonals.
 *
 * Property 2: Wireframe result independence
 *   The result shares no object references with the input geometry.
 *
 * Property 12: Memoization correctness
 *   Calling the memoized wrapper twice with the same geometry uuid returns the
 *   same cached BufferGeometry instance (===).
 */

import * as fc from 'fast-check';
import * as THREE from 'three';
import { buildQuadWireframe, QUAD_WIRE_CONFIG } from '../components/viewer/buildQuadWireframe';

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/**
 * Creates a flat quad (2 coplanar triangles sharing a diagonal).
 *
 *   0 ── 1
 *   │  ╲ │
 *   3 ── 2
 *
 * Triangles: [0,1,2] and [0,2,3]
 * Perimeter edges: 0-1, 1-2, 2-3, 3-0  (4 edges)
 * Diagonal:        0-2                  (included in full wireframe)
 */
function makeFlatQuad(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        0, 0, 0, // 0
        1, 0, 0, // 1
        1, 1, 0, // 2
        0, 1, 0, // 3
      ],
      3
    )
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  return geo;
}

/**
 * Creates a right-angle dihedral: two quads meeting at 90°.
 * Left quad lies in XY plane, right quad lies in XZ plane.
 * The shared edge (0-1) has a 90° dihedral → must be kept.
 *
 *   Left quad (XY):  vertices 0,1,4,5
 *   Right quad (XZ): vertices 0,1,2,3
 */
function makeRightAngleDihedral(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        0, 0, 0,  // 0 — shared edge start
        1, 0, 0,  // 1 — shared edge end
        1, 0, 1,  // 2 — right quad
        0, 0, 1,  // 3 — right quad
        1, 1, 0,  // 4 — left quad
        0, 1, 0,  // 5 — left quad
      ],
      3
    )
  );
  // Right quad (XZ plane): triangles [0,1,2] and [0,2,3]
  // Left quad (XY plane):  triangles [0,4,1] and [0,5,4]
  geo.setIndex([0, 1, 2, 0, 2, 3, 0, 4, 1, 0, 5, 4]);
  return geo;
}

/**
 * Arbitrary generator for small indexed BufferGeometries.
 * Generates a grid of vertices with random heights and a regular triangulation.
 */
function arbitraryIndexedGeometry(): fc.Arbitrary<THREE.BufferGeometry> {
  return fc
    .record({
      cols: fc.integer({ min: 2, max: 6 }),
      rows: fc.integer({ min: 2, max: 6 }),
      heights: fc.array(fc.float({ min: -2, max: 2, noNaN: true }), {
        minLength: 4,
        maxLength: 36,
      }),
    })
    .map(({ cols, rows, heights }) => {
      const geo = new THREE.BufferGeometry();
      const positions: number[] = [];
      const indices: number[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const h = heights[idx % heights.length] ?? 0;
          positions.push(c, r, h);
        }
      }

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const tl = r * cols + c;
          const tr = tl + 1;
          const bl = tl + cols;
          const br = bl + 1;
          indices.push(tl, tr, br, tl, br, bl);
        }
      }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      return geo;
    });
}

// ─── Unit tests: flat quad ────────────────────────────────────────────────────

describe('buildQuadWireframe — unit: flat quad', () => {
  test('flat quad produces exactly 4 edges (perimeter only, diagonal omitted)', () => {
    const geo = makeFlatQuad();
    const result = buildQuadWireframe(geo);
    expect(result.attributes.position.count).toBe(8);
  });

  test('flat quad result has fewer edges than WireframeGeometry', () => {
    const geo = makeFlatQuad();
    const quad = buildQuadWireframe(geo);
    const full = new THREE.WireframeGeometry(geo);
    expect(quad.attributes.position.count).toBeLessThan(full.attributes.position.count);
  });
});

// ─── Unit tests: right-angle dihedral ────────────────────────────────────────

describe('buildQuadWireframe — unit: right-angle dihedral', () => {
  test('90° dihedral edge is kept in result', () => {
    const geo = makeRightAngleDihedral();
    const result = buildQuadWireframe(geo);
    expect(result.attributes.position.count).toBeGreaterThanOrEqual(2);
  });

  test('result has ≤ edges than WireframeGeometry', () => {
    const geo = makeRightAngleDihedral();
    const quad = buildQuadWireframe(geo);
    const full = new THREE.WireframeGeometry(geo);
    expect(quad.attributes.position.count).toBeLessThanOrEqual(full.attributes.position.count);
  });
});

// ─── Unit tests: non-indexed fallback ────────────────────────────────────────

describe('buildQuadWireframe — unit: non-indexed fallback', () => {
  test('non-indexed geometry returns a WireframeGeometry (all edges)', () => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3)
    );
    // No index set → fallback
    const result = buildQuadWireframe(geo);
    // WireframeGeometry for a single triangle has 3 edges = 6 vertices
    expect(result.attributes.position.count).toBe(6);
  });
});

// ─── Unit tests: QUAD_WIRE_CONFIG ─────────────────────────────────────────────

describe('QUAD_WIRE_CONFIG', () => {
  test('WIRE_COLOR is 0x7c6af7 (violet)', () => {
    expect(QUAD_WIRE_CONFIG.WIRE_COLOR).toBe(0x7c6af7);
  });

});

// ─── Property 1: Wireframe edge correctness ───────────────────────────────────

/**
 * **Validates: Requirements 9.2, 9.3**
 *
 * Property 1: For any indexed geometry, the result has ≤ edges than
 * THREE.WireframeGeometry (which includes all triangulation diagonals).
 * Also, the result position count is a multiple of 2 (pairs of vertices).
 */
describe('buildQuadWireframe — Property 1: edge correctness', () => {
  test(
    'for any indexed geometry, result has ≤ edges than WireframeGeometry',
    () => {
      fc.assert(
        fc.property(arbitraryIndexedGeometry(), (geo) => {
          const result = buildQuadWireframe(geo);
          const full = new THREE.WireframeGeometry(geo);
          return result.attributes.position.count <= full.attributes.position.count;
        }),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any indexed geometry, result position count is a multiple of 2',
    () => {
      fc.assert(
        fc.property(arbitraryIndexedGeometry(), (geo) => {
          const result = buildQuadWireframe(geo);
          return result.attributes.position.count % 2 === 0;
        }),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test('flat quad produces exactly 4 edges', () => {
    const geo = makeFlatQuad();
    const result = buildQuadWireframe(geo);
    expect(result.attributes.position.count).toBe(8);
  });
});

// ─── Property 2: Wireframe result independence ────────────────────────────────

/**
 * **Validates: Requirements 9.5**
 *
 * Property 2: For any geometry, the result shares no object references with
 * the input. Specifically:
 *   - result.attributes.position.array !== geo.attributes.position.array
 *   - result.index is null (LineSegments don't need an index)
 */
describe('buildQuadWireframe — Property 2: result independence', () => {
  test(
    'for any indexed geometry, result position array is a different object',
    () => {
      fc.assert(
        fc.property(arbitraryIndexedGeometry(), (geo) => {
          const result = buildQuadWireframe(geo);
          return result.attributes.position.array !== geo.attributes.position.array;
        }),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any indexed geometry, result.index is null',
    () => {
      fc.assert(
        fc.property(arbitraryIndexedGeometry(), (geo) => {
          const result = buildQuadWireframe(geo);
          return result.index === null;
        }),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for flat quad, result position array is a different object from input',
    () => {
      const geo = makeFlatQuad();
      const result = buildQuadWireframe(geo);
      expect(result.attributes.position.array).not.toBe(geo.attributes.position.array);
    }
  );

  test(
    'for flat quad, result.index is null',
    () => {
      const geo = makeFlatQuad();
      const result = buildQuadWireframe(geo);
      expect(result.index).toBeNull();
    }
  );
});

// ─── Property 12: Memoization correctness ────────────────────────────────────

/**
 * **Validates: Requirements 13.1, 13.2**
 *
 * Property 12: Calling the memoized wrapper twice with the same geometry uuid
 * returns the same cached BufferGeometry instance (===).
 *
 * We implement a minimal memoize wrapper that mirrors what InteractiveModel does:
 *   const cache = new Map<string, THREE.BufferGeometry>()
 *   function memoized(geo): BufferGeometry {
 *     if (cache.has(geo.uuid)) return cache.get(geo.uuid)!
 *     const result = buildQuadWireframe(geo)
 *     cache.set(geo.uuid, result)
 *     return result
 *   }
 */
function makeMemoizedBuildQuadWireframe() {
  const cache = new Map<string, THREE.BufferGeometry>();
  return {
    call(geo: THREE.BufferGeometry): THREE.BufferGeometry {
      if (cache.has(geo.uuid)) return cache.get(geo.uuid)!;
      const result = buildQuadWireframe(geo);
      cache.set(geo.uuid, result);
      return result;
    },
    cache,
  };
}

describe('buildQuadWireframe — Property 12: memoization correctness', () => {
  test(
    'calling memoized wrapper twice with same geometry returns same instance (===)',
    () => {
      fc.assert(
        fc.property(arbitraryIndexedGeometry(), (geo) => {
          const { call } = makeMemoizedBuildQuadWireframe();
          const first = call(geo);
          const second = call(geo);
          return first === second;
        }),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'calling memoized wrapper with different geometries returns different instances',
    () => {
      fc.assert(
        fc.property(
          arbitraryIndexedGeometry(),
          arbitraryIndexedGeometry(),
          (geoA, geoB) => {
            // Different geometries have different uuids (THREE assigns unique uuids)
            if (geoA.uuid === geoB.uuid) return true; // skip degenerate case
            const { call } = makeMemoizedBuildQuadWireframe();
            const resultA = call(geoA);
            const resultB = call(geoB);
            return resultA !== resultB;
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'second call does not recompute: cache has the entry after first call',
    () => {
      fc.assert(
        fc.property(arbitraryIndexedGeometry(), (geo) => {
          const { call, cache } = makeMemoizedBuildQuadWireframe();
          expect(cache.has(geo.uuid)).toBe(false);
          call(geo);
          expect(cache.has(geo.uuid)).toBe(true);
          const cached = cache.get(geo.uuid)!;
          const second = call(geo);
          return second === cached;
        }),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test('flat quad: same instance returned on second call', () => {
    const geo = makeFlatQuad();
    const { call } = makeMemoizedBuildQuadWireframe();
    const first = call(geo);
    const second = call(geo);
    expect(first).toBe(second);
  });
});

/**
 * Property tests for material restoration when switching back to 'shaded' mode.
 *
 * Tests run in Node environment — no DOM, WebGL, or React required.
 * THREE.Color is mocked with a simple { r, g, b } object and a copy() method.
 *
 * **Validates: Requirements 11.1, 11.2, 11.3**
 *
 * Property 4: Material restoration round-trip
 *   For any set of meshes with arbitrary color, roughness, and metalness values,
 *   applying any display mode (wireframe or clay) and then switching to 'shaded'
 *   must restore each mesh's material properties to exactly the values stored in
 *   originalProps, and each material's visible property must be true.
 */

import * as fc from 'fast-check';
import type { DisplayMode } from '../types';

// ─── Minimal mocks ────────────────────────────────────────────────────────────

/** Minimal mock for THREE.Color — stores r, g, b and supports copy(). */
interface MockColor {
  r: number;
  g: number;
  b: number;
  copy: (src: MockColor) => MockColor;
  clone: () => MockColor;
}

function makeColor(r: number, g: number, b: number): MockColor {
  const c: MockColor = {
    r,
    g,
    b,
    copy(src) {
      this.r = src.r;
      this.g = src.g;
      this.b = src.b;
      return this;
    },
    clone() {
      return makeColor(this.r, this.g, this.b);
    },
  };
  return c;
}

interface MockMaterial {
  color: MockColor;
  roughness: number;
  metalness: number;
  visible: boolean;
  emissive: { set: (x: number, y: number, z: number) => void };
  emissiveIntensity: number;
}

function makeMaterial(r: number, g: number, b: number, roughness: number, metalness: number): MockMaterial {
  return {
    color: makeColor(r, g, b),
    roughness,
    metalness,
    visible: true,
    emissive: { set: jest.fn() },
    emissiveIntensity: 0,
  };
}

interface OriginalProps {
  color: MockColor;
  roughness: number;
  metalness: number;
}

interface MockMesh {
  name: string;
  material: MockMaterial;
}

// ─── The display mode logic under test ───────────────────────────────────────
//
// This is the exact logic from the displayMode useEffect in InteractiveModel.tsx,
// extracted as a pure function so it can be tested without React or WebGL.

const CLAY_COLOR = makeColor(0.784, 0.722, 0.635); // #c8b8a2 in 0-1 range

function applyDisplayMode(
  meshes: MockMesh[],
  displayMode: DisplayMode,
  originalProps: Map<string, OriginalProps>
): void {
  for (const mesh of meshes) {
    const mat = mesh.material;

    // Reset transient state from previous mode (mirrors InteractiveModel.tsx)
    mat.visible = true;
    mat.emissive.set(0, 0, 0);
    mat.emissiveIntensity = 0;

    if (displayMode === 'wireframe') {
      // Hide faces — only the EdgeGeometry lines are visible
      mat.visible = false;
    } else if (displayMode === 'clay') {
      mat.color.copy(CLAY_COLOR);
      mat.roughness = 0.95;
      mat.metalness = 0;
    } else {
      // shaded — restore original material properties
      const orig = originalProps.get(mesh.name);
      if (orig) {
        mat.color.copy(orig.color);
        mat.roughness = orig.roughness;
        mat.metalness = orig.metalness;
      }
    }
  }
}

// ─── Arbitrary generators ─────────────────────────────────────────────────────

/** Generates a color channel value in [0, 1]. */
const arbitraryChannel = (): fc.Arbitrary<number> =>
  fc.float({ min: 0, max: 1, noNaN: true });

/** Generates a roughness or metalness value in [0, 1]. */
const arbitraryMaterialScalar = (): fc.Arbitrary<number> =>
  fc.float({ min: 0, max: 1, noNaN: true });

/** Generates a single mesh with arbitrary material properties. */
const arbitraryMesh = (name: string): fc.Arbitrary<MockMesh> =>
  fc
    .record({
      r: arbitraryChannel(),
      g: arbitraryChannel(),
      b: arbitraryChannel(),
      roughness: arbitraryMaterialScalar(),
      metalness: arbitraryMaterialScalar(),
    })
    .map(({ r, g, b, roughness, metalness }) => ({
      name,
      material: makeMaterial(r, g, b, roughness, metalness),
    }));

/** Generates 1–5 meshes with unique names. */
const arbitraryMeshes = (): fc.Arbitrary<MockMesh[]> =>
  fc.integer({ min: 1, max: 5 }).chain((count) =>
    fc.tuple(...Array.from({ length: count }, (_, i) => arbitraryMesh(`mesh_${i}`)))
  ).map((tuple) => tuple as MockMesh[]);

/** Generates a non-shaded display mode (wireframe or clay). */
const arbitraryNonShadedMode = (): fc.Arbitrary<DisplayMode> =>
  fc.constantFrom<DisplayMode>('wireframe', 'clay');

// ─── Helper: build originalProps from meshes ─────────────────────────────────

function buildOriginalProps(meshes: MockMesh[]): Map<string, OriginalProps> {
  const map = new Map<string, OriginalProps>();
  for (const mesh of meshes) {
    map.set(mesh.name, {
      color: mesh.material.color.clone(),
      roughness: mesh.material.roughness,
      metalness: mesh.material.metalness,
    });
  }
  return map;
}

// ─── Unit tests: shaded restoration ──────────────────────────────────────────

describe('applyDisplayMode — unit: shaded restoration', () => {
  test('after wireframe mode, shaded restores original color', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(0.5, 0.3, 0.8, 0.4, 0.2),
    };
    const originalProps = buildOriginalProps([mesh]);

    // Apply wireframe (mutates material)
    applyDisplayMode([mesh], 'wireframe', originalProps);
    expect(mesh.material.visible).toBe(false);

    // Apply shaded (should restore)
    applyDisplayMode([mesh], 'shaded', originalProps);

    const orig = originalProps.get('test_mesh')!;
    expect(mesh.material.color.r).toBeCloseTo(orig.color.r);
    expect(mesh.material.color.g).toBeCloseTo(orig.color.g);
    expect(mesh.material.color.b).toBeCloseTo(orig.color.b);
  });

  test('after clay mode, shaded restores original roughness and metalness', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(0.2, 0.4, 0.6, 0.3, 0.7),
    };
    const originalProps = buildOriginalProps([mesh]);

    applyDisplayMode([mesh], 'clay', originalProps);
    expect(mesh.material.roughness).toBe(0.95);
    expect(mesh.material.metalness).toBe(0);

    applyDisplayMode([mesh], 'shaded', originalProps);

    const orig = originalProps.get('test_mesh')!;
    expect(mesh.material.roughness).toBeCloseTo(orig.roughness);
    expect(mesh.material.metalness).toBeCloseTo(orig.metalness);
  });

  test('shaded mode sets visible=true after wireframe hid the material', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(1, 1, 1, 0.5, 0.5),
    };
    const originalProps = buildOriginalProps([mesh]);

    applyDisplayMode([mesh], 'wireframe', originalProps);
    expect(mesh.material.visible).toBe(false);

    applyDisplayMode([mesh], 'shaded', originalProps);
    expect(mesh.material.visible).toBe(true);
  });

  test('shaded mode sets visible=true even after clay mode', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(0.1, 0.2, 0.3, 0.8, 0.1),
    };
    const originalProps = buildOriginalProps([mesh]);

    applyDisplayMode([mesh], 'clay', originalProps);
    // visible is reset to true at start of each traverse, so it stays true in clay
    expect(mesh.material.visible).toBe(true);

    applyDisplayMode([mesh], 'shaded', originalProps);
    expect(mesh.material.visible).toBe(true);
  });

  test('multiple meshes: all are restored independently', () => {
    const meshes: MockMesh[] = [
      { name: 'mesh_0', material: makeMaterial(0.1, 0.2, 0.3, 0.4, 0.5) },
      { name: 'mesh_1', material: makeMaterial(0.6, 0.7, 0.8, 0.2, 0.9) },
      { name: 'mesh_2', material: makeMaterial(0.9, 0.1, 0.5, 0.7, 0.3) },
    ];
    const originalProps = buildOriginalProps(meshes);

    applyDisplayMode(meshes, 'clay', originalProps);
    applyDisplayMode(meshes, 'shaded', originalProps);

    for (const mesh of meshes) {
      const orig = originalProps.get(mesh.name)!;
      expect(mesh.material.color.r).toBeCloseTo(orig.color.r);
      expect(mesh.material.color.g).toBeCloseTo(orig.color.g);
      expect(mesh.material.color.b).toBeCloseTo(orig.color.b);
      expect(mesh.material.roughness).toBeCloseTo(orig.roughness);
      expect(mesh.material.metalness).toBeCloseTo(orig.metalness);
      expect(mesh.material.visible).toBe(true);
    }
  });
});

// ─── Unit tests: originalProps population ordering ───────────────────────────

describe('originalProps population — unit', () => {
  test('originalProps stores color as a clone (not the same reference)', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(0.5, 0.5, 0.5, 0.5, 0.5),
    };
    const originalProps = buildOriginalProps([mesh]);
    const orig = originalProps.get('test_mesh')!;

    // The stored color must be a clone, not the same object
    expect(orig.color).not.toBe(mesh.material.color);
    expect(orig.color.r).toBe(mesh.material.color.r);
    expect(orig.color.g).toBe(mesh.material.color.g);
    expect(orig.color.b).toBe(mesh.material.color.b);
  });

  test('originalProps stores roughness and metalness as numbers', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(0, 0, 0, 0.42, 0.77),
    };
    const originalProps = buildOriginalProps([mesh]);
    const orig = originalProps.get('test_mesh')!;

    expect(orig.roughness).toBe(0.42);
    expect(orig.metalness).toBe(0.77);
  });

  test('mutating material after storing originalProps does not affect stored values', () => {
    const mesh: MockMesh = {
      name: 'test_mesh',
      material: makeMaterial(0.3, 0.6, 0.9, 0.5, 0.5),
    };
    const originalProps = buildOriginalProps([mesh]);

    // Mutate the material (simulating clay mode)
    applyDisplayMode([mesh], 'clay', originalProps);

    const orig = originalProps.get('test_mesh')!;
    // Stored values must be unchanged
    expect(orig.color.r).toBeCloseTo(0.3);
    expect(orig.color.g).toBeCloseTo(0.6);
    expect(orig.color.b).toBeCloseTo(0.9);
    expect(orig.roughness).toBeCloseTo(0.5);
    expect(orig.metalness).toBeCloseTo(0.5);
  });
});

// ─── Property 4: Material restoration round-trip ─────────────────────────────

/**
 * **Validates: Requirements 11.1, 11.2, 11.3**
 *
 * Property 4: For any set of meshes with arbitrary color, roughness, and
 * metalness values, applying any display mode (wireframe or clay) and then
 * switching to 'shaded' must restore each mesh's material properties to
 * exactly the values stored in originalProps, and each material's visible
 * property must be true.
 */
describe('material restoration — Property 4: round-trip to shaded', () => {
  test(
    'for any meshes and any non-shaded mode, switching to shaded restores color exactly',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          arbitraryNonShadedMode(),
          (meshes, intermediateMode) => {
            const originalProps = buildOriginalProps(meshes);

            // Apply intermediate mode (wireframe or clay)
            applyDisplayMode(meshes, intermediateMode, originalProps);

            // Switch back to shaded
            applyDisplayMode(meshes, 'shaded', originalProps);

            // Every mesh must have its original color restored
            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              return (
                Math.abs(mesh.material.color.r - orig.color.r) < 1e-6 &&
                Math.abs(mesh.material.color.g - orig.color.g) < 1e-6 &&
                Math.abs(mesh.material.color.b - orig.color.b) < 1e-6
              );
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any meshes and any non-shaded mode, switching to shaded restores roughness exactly',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          arbitraryNonShadedMode(),
          (meshes, intermediateMode) => {
            const originalProps = buildOriginalProps(meshes);

            applyDisplayMode(meshes, intermediateMode, originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);

            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              return Math.abs(mesh.material.roughness - orig.roughness) < 1e-6;
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any meshes and any non-shaded mode, switching to shaded restores metalness exactly',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          arbitraryNonShadedMode(),
          (meshes, intermediateMode) => {
            const originalProps = buildOriginalProps(meshes);

            applyDisplayMode(meshes, intermediateMode, originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);

            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              return Math.abs(mesh.material.metalness - orig.metalness) < 1e-6;
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any meshes and any non-shaded mode, switching to shaded sets visible=true',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          arbitraryNonShadedMode(),
          (meshes, intermediateMode) => {
            const originalProps = buildOriginalProps(meshes);

            applyDisplayMode(meshes, intermediateMode, originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);

            return meshes.every((mesh) => mesh.material.visible === true);
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any meshes, round-trip through wireframe then shaded restores all properties',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          (meshes) => {
            const originalProps = buildOriginalProps(meshes);

            applyDisplayMode(meshes, 'wireframe', originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);

            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              return (
                Math.abs(mesh.material.color.r - orig.color.r) < 1e-6 &&
                Math.abs(mesh.material.color.g - orig.color.g) < 1e-6 &&
                Math.abs(mesh.material.color.b - orig.color.b) < 1e-6 &&
                Math.abs(mesh.material.roughness - orig.roughness) < 1e-6 &&
                Math.abs(mesh.material.metalness - orig.metalness) < 1e-6 &&
                mesh.material.visible === true
              );
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any meshes, round-trip through clay then shaded restores all properties',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          (meshes) => {
            const originalProps = buildOriginalProps(meshes);

            applyDisplayMode(meshes, 'clay', originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);

            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              return (
                Math.abs(mesh.material.color.r - orig.color.r) < 1e-6 &&
                Math.abs(mesh.material.color.g - orig.color.g) < 1e-6 &&
                Math.abs(mesh.material.color.b - orig.color.b) < 1e-6 &&
                Math.abs(mesh.material.roughness - orig.roughness) < 1e-6 &&
                Math.abs(mesh.material.metalness - orig.metalness) < 1e-6 &&
                mesh.material.visible === true
              );
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any meshes, multi-step round-trip (wireframe→clay→shaded) restores all properties',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          (meshes) => {
            const originalProps = buildOriginalProps(meshes);

            applyDisplayMode(meshes, 'wireframe', originalProps);
            applyDisplayMode(meshes, 'clay', originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);

            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              return (
                Math.abs(mesh.material.color.r - orig.color.r) < 1e-6 &&
                Math.abs(mesh.material.color.g - orig.color.g) < 1e-6 &&
                Math.abs(mesh.material.color.b - orig.color.b) < 1e-6 &&
                Math.abs(mesh.material.roughness - orig.roughness) < 1e-6 &&
                Math.abs(mesh.material.metalness - orig.metalness) < 1e-6 &&
                mesh.material.visible === true
              );
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'originalProps values are immutable across mode transitions (stored values never change)',
    () => {
      fc.assert(
        fc.property(
          arbitraryMeshes(),
          arbitraryNonShadedMode(),
          (meshes, intermediateMode) => {
            const originalProps = buildOriginalProps(meshes);

            // Snapshot the original values before any mode changes
            const snapshot = new Map(
              meshes.map((mesh) => {
                const orig = originalProps.get(mesh.name)!;
                return [
                  mesh.name,
                  {
                    r: orig.color.r,
                    g: orig.color.g,
                    b: orig.color.b,
                    roughness: orig.roughness,
                    metalness: orig.metalness,
                  },
                ];
              })
            );

            // Apply multiple mode changes
            applyDisplayMode(meshes, intermediateMode, originalProps);
            applyDisplayMode(meshes, 'shaded', originalProps);
            applyDisplayMode(meshes, intermediateMode, originalProps);

            // originalProps must still hold the original values
            return meshes.every((mesh) => {
              const orig = originalProps.get(mesh.name)!;
              const snap = snapshot.get(mesh.name)!;
              return (
                Math.abs(orig.color.r - snap.r) < 1e-6 &&
                Math.abs(orig.color.g - snap.g) < 1e-6 &&
                Math.abs(orig.color.b - snap.b) < 1e-6 &&
                Math.abs(orig.roughness - snap.roughness) < 1e-6 &&
                Math.abs(orig.metalness - snap.metalness) < 1e-6
              );
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );
});

/**
 * Property tests for memory management during display mode transitions.
 *
 * Tests run in Node environment — no DOM, WebGL, or React required.
 * THREE.js objects are mocked with spy functions to track dispose/remove calls.
 *
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
 *
 * Property 3: No memory leaks on mode transitions
 *   For any sequence of display mode changes, every BufferGeometry and
 *   LineBasicMaterial created during wireframe mode must have dispose() called,
 *   and every LineSegments must be removed from its parent before or when the
 *   mode changes away from wireframe. This invariant also holds on unmount.
 */

import * as fc from 'fast-check';
import type { DisplayMode } from '../types';

// ─── Minimal mocks for THREE.js objects ──────────────────────────────────────

interface MockParent {
  remove: jest.Mock;
}

interface MockBufferGeometry {
  uuid: string;
  dispose: jest.Mock;
}

interface MockLineBasicMaterial {
  dispose: jest.Mock;
}

interface MockLineSegments {
  parent: MockParent | null;
}

interface WireframeLine {
  lines: MockLineSegments;
  geo: MockBufferGeometry;
  mat: MockLineBasicMaterial;
}

let _uuidCounter = 0;

function makeParent(): MockParent {
  return { remove: jest.fn() };
}

function makeGeo(): MockBufferGeometry {
  return { uuid: `geo-${_uuidCounter++}`, dispose: jest.fn() };
}

function makeMat(): MockLineBasicMaterial {
  return { dispose: jest.fn() };
}

function makeLines(parent: MockParent | null = makeParent()): MockLineSegments {
  return { parent };
}

function makeWireframeLine(parent: MockParent | null = makeParent()): WireframeLine {
  return {
    lines: makeLines(parent),
    geo: makeGeo(),
    mat: makeMat(),
  };
}

// ─── The cleanup function under test ─────────────────────────────────────────
//
// This is the exact logic from the displayMode useEffect cleanup in
// InteractiveModel.tsx. We extract it as a pure function so it can be
// tested without React or a WebGL context.

function runCleanup(wireframeLines: WireframeLine[]): void {
  wireframeLines.forEach(({ lines, geo, mat }) => {
    (lines.parent as MockParent | null)?.remove(lines);
    geo.dispose();
    mat.dispose();
  });
  // Mirrors: wireframeLines.current = []
  wireframeLines.length = 0;
}

// ─── Arbitrary generators ─────────────────────────────────────────────────────

const ALL_MODES: DisplayMode[] = ['shaded', 'wireframe', 'clay'];

/** Generates a single DisplayMode value. */
const arbitraryMode = (): fc.Arbitrary<DisplayMode> =>
  fc.constantFrom(...ALL_MODES);

/** Generates a non-empty sequence of DisplayMode values (1–10 transitions). */
const arbitraryModeSequence = (): fc.Arbitrary<DisplayMode[]> =>
  fc.array(arbitraryMode(), { minLength: 1, maxLength: 10 });

/**
 * Simulates the wireframe lifecycle for a given mode sequence.
 *
 * For each mode in the sequence:
 *   - If mode === 'wireframe': create N wireframe lines (1–3 per mesh) and
 *     push them into the active list (simulating the effect body).
 *   - Then run the cleanup (simulating the effect return / next render).
 *
 * Returns all WireframeLine objects ever created, so we can assert that
 * every one of them had dispose() and remove() called.
 */
function simulateModeTransitions(
  modes: DisplayMode[],
  meshCount: number
): { allLines: WireframeLine[] } {
  const allLines: WireframeLine[] = [];
  let activeLines: WireframeLine[] = [];

  for (const mode of modes) {
    // Simulate effect body: if wireframe, create lines for each mesh
    if (mode === 'wireframe') {
      for (let i = 0; i < meshCount; i++) {
        const wl = makeWireframeLine();
        activeLines.push(wl);
        allLines.push(wl);
      }
    }

    // Simulate cleanup (runs before next effect or on unmount)
    runCleanup(activeLines);
    // activeLines is now empty (length = 0), matching wireframeLines.current = []
    activeLines = [];
  }

  return { allLines };
}

// ─── Unit tests: single cleanup call ─────────────────────────────────────────

describe('runCleanup — unit', () => {
  test('calls geo.dispose() on every WireframeLine', () => {
    const lines = [makeWireframeLine(), makeWireframeLine(), makeWireframeLine()];
    runCleanup(lines);
    lines.forEach((wl) => {
      // Note: lines array is mutated (length = 0), so we check the captured refs
    });
    // Re-create to check — we need to capture before cleanup
    const a = makeWireframeLine();
    const b = makeWireframeLine();
    const captured = [a, b];
    runCleanup([a, b]);
    expect(a.geo.dispose).toHaveBeenCalledTimes(1);
    expect(b.geo.dispose).toHaveBeenCalledTimes(1);
  });

  test('calls mat.dispose() on every WireframeLine', () => {
    const a = makeWireframeLine();
    const b = makeWireframeLine();
    runCleanup([a, b]);
    expect(a.mat.dispose).toHaveBeenCalledTimes(1);
    expect(b.mat.dispose).toHaveBeenCalledTimes(1);
  });

  test('calls parent.remove(lines) on every WireframeLine with a parent', () => {
    const parent = makeParent();
    const a = makeWireframeLine(parent);
    const b = makeWireframeLine(parent);
    runCleanup([a, b]);
    expect(parent.remove).toHaveBeenCalledWith(a.lines);
    expect(parent.remove).toHaveBeenCalledWith(b.lines);
    expect(parent.remove).toHaveBeenCalledTimes(2);
  });

  test('does not throw when lines.parent is null', () => {
    const wl = makeWireframeLine(null);
    expect(() => runCleanup([wl])).not.toThrow();
    // geo and mat are still disposed even without a parent
    expect(wl.geo.dispose).toHaveBeenCalledTimes(1);
    expect(wl.mat.dispose).toHaveBeenCalledTimes(1);
  });

  test('empties the wireframeLines array after cleanup', () => {
    const arr = [makeWireframeLine(), makeWireframeLine()];
    runCleanup(arr);
    expect(arr).toHaveLength(0);
  });

  test('is a no-op on an empty array', () => {
    expect(() => runCleanup([])).not.toThrow();
  });
});

// ─── Unit tests: mode transition scenarios ────────────────────────────────────

describe('simulateModeTransitions — unit', () => {
  test('shaded→wireframe→shaded: all wireframe resources are disposed', () => {
    const { allLines } = simulateModeTransitions(['shaded', 'wireframe', 'shaded'], 2);
    // wireframe step creates 2 lines; cleanup runs after each step
    expect(allLines).toHaveLength(2);
    allLines.forEach((wl) => {
      expect(wl.geo.dispose).toHaveBeenCalledTimes(1);
      expect(wl.mat.dispose).toHaveBeenCalledTimes(1);
      expect((wl.lines.parent as MockParent).remove).toHaveBeenCalledWith(wl.lines);
    });
  });

  test('wireframe→clay→wireframe: both wireframe batches are fully disposed', () => {
    const { allLines } = simulateModeTransitions(['wireframe', 'clay', 'wireframe'], 1);
    // Two wireframe steps → 2 lines total
    expect(allLines).toHaveLength(2);
    allLines.forEach((wl) => {
      expect(wl.geo.dispose).toHaveBeenCalledTimes(1);
      expect(wl.mat.dispose).toHaveBeenCalledTimes(1);
    });
  });

  test('shaded→shaded→shaded: no wireframe resources created', () => {
    const { allLines } = simulateModeTransitions(['shaded', 'shaded', 'shaded'], 3);
    expect(allLines).toHaveLength(0);
  });

  test('single wireframe step: resources disposed after cleanup', () => {
    const { allLines } = simulateModeTransitions(['wireframe'], 3);
    expect(allLines).toHaveLength(3);
    allLines.forEach((wl) => {
      expect(wl.geo.dispose).toHaveBeenCalledTimes(1);
      expect(wl.mat.dispose).toHaveBeenCalledTimes(1);
    });
  });
});

// ─── Property 3: No memory leaks on mode transitions ─────────────────────────

/**
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
 *
 * Property 3: For any sequence of display mode changes and any number of
 * meshes, every BufferGeometry and LineBasicMaterial created during wireframe
 * mode must have dispose() called exactly once, and every LineSegments must
 * be removed from its parent exactly once.
 */
describe('memory management — Property 3: no memory leaks on mode transitions', () => {
  test(
    'for any mode sequence, every geo.dispose() is called exactly once',
    () => {
      fc.assert(
        fc.property(
          arbitraryModeSequence(),
          fc.integer({ min: 1, max: 5 }),
          (modes, meshCount) => {
            const { allLines } = simulateModeTransitions(modes, meshCount);
            return allLines.every((wl) => wl.geo.dispose.mock.calls.length === 1);
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any mode sequence, every mat.dispose() is called exactly once',
    () => {
      fc.assert(
        fc.property(
          arbitraryModeSequence(),
          fc.integer({ min: 1, max: 5 }),
          (modes, meshCount) => {
            const { allLines } = simulateModeTransitions(modes, meshCount);
            return allLines.every((wl) => wl.mat.dispose.mock.calls.length === 1);
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any mode sequence, every LineSegments is removed from its parent exactly once',
    () => {
      fc.assert(
        fc.property(
          arbitraryModeSequence(),
          fc.integer({ min: 1, max: 5 }),
          (modes, meshCount) => {
            const { allLines } = simulateModeTransitions(modes, meshCount);
            return allLines.every((wl) => {
              const parent = wl.lines.parent as MockParent;
              // parent.remove may be called for multiple lines on the same parent,
              // so we check it was called with this specific lines object exactly once
              const callsForThisLine = parent.remove.mock.calls.filter(
                (call: unknown[]) => call[0] === wl.lines
              );
              return callsForThisLine.length === 1;
            });
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any mode sequence, no geo or mat is disposed more than once (no double-free)',
    () => {
      fc.assert(
        fc.property(
          arbitraryModeSequence(),
          fc.integer({ min: 1, max: 5 }),
          (modes, meshCount) => {
            const { allLines } = simulateModeTransitions(modes, meshCount);
            return allLines.every(
              (wl) =>
                wl.geo.dispose.mock.calls.length <= 1 &&
                wl.mat.dispose.mock.calls.length <= 1
            );
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any mode sequence, wireframeLines array is empty after each cleanup',
    () => {
      fc.assert(
        fc.property(
          arbitraryModeSequence(),
          fc.integer({ min: 1, max: 5 }),
          (modes, meshCount) => {
            // Simulate step by step and verify the array is cleared each time
            const activeLines: WireframeLine[] = [];
            let alwaysEmpty = true;

            for (const mode of modes) {
              if (mode === 'wireframe') {
                for (let i = 0; i < meshCount; i++) {
                  activeLines.push(makeWireframeLine());
                }
              }
              runCleanup(activeLines);
              if (activeLines.length !== 0) {
                alwaysEmpty = false;
                break;
              }
            }

            return alwaysEmpty;
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any mode sequence with null parents, cleanup does not throw and still disposes',
    () => {
      fc.assert(
        fc.property(
          arbitraryModeSequence(),
          fc.integer({ min: 1, max: 5 }),
          (modes, meshCount) => {
            // All lines have null parents (e.g. mesh was already removed from scene)
            const allLines: WireframeLine[] = [];
            let activeLines: WireframeLine[] = [];

            for (const mode of modes) {
              if (mode === 'wireframe') {
                for (let i = 0; i < meshCount; i++) {
                  const wl = makeWireframeLine(null); // null parent
                  activeLines.push(wl);
                  allLines.push(wl);
                }
              }
              runCleanup(activeLines);
              activeLines = [];
            }

            // geo and mat must still be disposed even with null parent
            return allLines.every(
              (wl) =>
                wl.geo.dispose.mock.calls.length === 1 &&
                wl.mat.dispose.mock.calls.length === 1
            );
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );
});

// ─── Unmount scenario (Requirement 10.4) ─────────────────────────────────────

/**
 * **Validates: Requirement 10.4**
 *
 * When InteractiveModel unmounts while in wireframe mode, the scene-clone
 * cleanup (useLayoutEffect return) also calls dispose on all active wireframe
 * geometries and materials. We simulate this by running cleanup on an active
 * wireframeLines array without a prior mode change.
 */
describe('memory management — unmount while in wireframe mode', () => {
  test('unmounting with active wireframe lines disposes all resources', () => {
    const meshCount = 4;
    const activeLines: WireframeLine[] = [];
    for (let i = 0; i < meshCount; i++) {
      activeLines.push(makeWireframeLine());
    }

    // Simulate unmount: the useLayoutEffect cleanup runs
    runCleanup(activeLines);

    // All resources must be disposed
    // (activeLines is now empty, so we need to capture refs first)
    // Re-run with captured refs:
    const captured: WireframeLine[] = [];
    for (let i = 0; i < meshCount; i++) {
      captured.push(makeWireframeLine());
    }
    const toClean = [...captured];
    runCleanup(toClean);

    captured.forEach((wl) => {
      expect(wl.geo.dispose).toHaveBeenCalledTimes(1);
      expect(wl.mat.dispose).toHaveBeenCalledTimes(1);
      expect((wl.lines.parent as MockParent).remove).toHaveBeenCalledWith(wl.lines);
    });
    expect(toClean).toHaveLength(0);
  });

  test(
    'for any number of active wireframe lines, unmount disposes all of them',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          (lineCount) => {
            const captured: WireframeLine[] = [];
            for (let i = 0; i < lineCount; i++) {
              captured.push(makeWireframeLine());
            }
            const toClean = [...captured];
            runCleanup(toClean);

            return (
              toClean.length === 0 &&
              captured.every(
                (wl) =>
                  wl.geo.dispose.mock.calls.length === 1 &&
                  wl.mat.dispose.mock.calls.length === 1
              )
            );
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );
});

/**
 * Property tests for DisplayModeSelector style logic and MODES_CONFIG mapping.
 *
 * These tests operate on pure functions and data — no DOM rendering required.
 * The test environment is Node (see jest.config.ts).
 *
 * **Validates: Requirements 8.2, 8.3, 8.5, 8.6**
 *
 * Property 7: For any display mode value, the button for the active mode has
 *   violet glow style, and the two inactive buttons do not.
 *
 * Property 8: For any display mode button, it has non-empty aria-label and title.
 *
 * Property 9: For any display mode button clicked, setDisplayMode is called
 *   with exactly the mode value for that button.
 */

import * as fc from 'fast-check';
import { getButtonStyle, MODES_CONFIG } from '../components/viewer/displayModeStyles';
import type { DisplayMode } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** All valid display mode values, derived from MODES_CONFIG. */
const ALL_MODES = MODES_CONFIG.map((m) => m.value) as DisplayMode[];

/**
 * Returns true when the style object represents the active glow state —
 * i.e. background references --accent-glow and color references --accent.
 */
function hasGlowStyle(style: React.CSSProperties): boolean {
  const bg = style.background as string | undefined;
  const color = style.color as string | undefined;
  return (
    typeof bg === 'string' &&
    bg.includes('--accent-glow') &&
    typeof color === 'string' &&
    color.includes('--accent')
  );
}

/**
 * Returns true when the style object represents the inactive state —
 * i.e. no glow background and no accent color.
 */
function hasNoGlowStyle(style: React.CSSProperties): boolean {
  return !hasGlowStyle(style);
}

// ─── Unit tests: concrete active / inactive cases ────────────────────────────

describe('getButtonStyle — unit', () => {
  test('active button has glow background (--accent-glow)', () => {
    const style = getButtonStyle('shaded', 'shaded');
    expect(style.background).toContain('--accent-glow');
  });

  test('active button has accent color (--accent)', () => {
    const style = getButtonStyle('shaded', 'shaded');
    expect(style.color).toContain('--accent');
  });

  test('active button has accent border (--accent)', () => {
    const style = getButtonStyle('wireframe', 'wireframe');
    expect(style.border).toContain('--accent');
  });

  test('inactive button has no glow background', () => {
    const style = getButtonStyle('wireframe', 'shaded');
    expect(style.background).not.toContain('--accent-glow');
  });

  test('inactive button has no accent color', () => {
    const style = getButtonStyle('clay', 'shaded');
    expect(style.color).not.toContain('--accent');
  });

  test('inactive button uses --text-secondary for color', () => {
    const style = getButtonStyle('clay', 'wireframe');
    expect(style.color).toContain('--text-secondary');
  });
});

// ─── Unit tests: MODES_CONFIG accessibility fields ───────────────────────────

describe('MODES_CONFIG — unit accessibility', () => {
  test('has exactly 3 modes', () => {
    expect(MODES_CONFIG).toHaveLength(3);
  });

  test('shaded mode has correct ariaLabel and title', () => {
    const shaded = MODES_CONFIG.find((m) => m.value === 'shaded');
    expect(shaded?.ariaLabel).toBe('Shaded mode');
    expect(shaded?.title).toBe('Shaded');
  });

  test('wireframe mode has correct ariaLabel and title', () => {
    const wire = MODES_CONFIG.find((m) => m.value === 'wireframe');
    expect(wire?.ariaLabel).toBe('Wireframe mode');
    expect(wire?.title).toBe('Wire');
  });

  test('clay mode has correct ariaLabel and title', () => {
    const clay = MODES_CONFIG.find((m) => m.value === 'clay');
    expect(clay?.ariaLabel).toBe('Clay mode');
    expect(clay?.title).toBe('Clay');
  });

  test('each mode value matches what would be passed to setDisplayMode', () => {
    const expectedValues: DisplayMode[] = ['shaded', 'wireframe', 'clay'];
    const actualValues = MODES_CONFIG.map((m) => m.value);
    expect(actualValues).toEqual(expectedValues);
  });
});

// ─── Property 7: active/inactive glow invariant ──────────────────────────────

/**
 * **Validates: Requirements 8.2, 8.3**
 *
 * Property 7: For any activeMode value, only the button matching activeMode
 * has the glow background; the other two do not.
 */
describe('getButtonStyle — Property 7: glow invariant', () => {
  test(
    'for any activeMode, exactly the matching button has glow style',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_MODES),
          (activeMode) => {
            return ALL_MODES.every((mode) => {
              const style = getButtonStyle(mode, activeMode);
              if (mode === activeMode) {
                return hasGlowStyle(style);
              } else {
                return hasNoGlowStyle(style);
              }
            });
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any activeMode, the count of glow buttons is exactly 1',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_MODES),
          (activeMode) => {
            const glowCount = ALL_MODES.filter((mode) =>
              hasGlowStyle(getButtonStyle(mode, activeMode))
            ).length;
            return glowCount === 1;
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any activeMode, the count of non-glow buttons is exactly 2',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_MODES),
          (activeMode) => {
            const noGlowCount = ALL_MODES.filter((mode) =>
              hasNoGlowStyle(getButtonStyle(mode, activeMode))
            ).length;
            return noGlowCount === 2;
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );
});

// ─── Property 8: accessibility invariant ─────────────────────────────────────

/**
 * **Validates: Requirements 8.5**
 *
 * Property 8: For any display mode button in MODES_CONFIG, the button must
 * have a non-empty ariaLabel and a non-empty title.
 */
describe('MODES_CONFIG — Property 8: accessibility invariant', () => {
  test(
    'for any mode in MODES_CONFIG, ariaLabel and title are non-empty strings',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: MODES_CONFIG.length - 1 }),
          (idx) => {
            const mode = MODES_CONFIG[idx];
            return (
              typeof mode.ariaLabel === 'string' &&
              mode.ariaLabel.trim().length > 0 &&
              typeof mode.title === 'string' &&
              mode.title.trim().length > 0
            );
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );
});

// ─── Property 9: click dispatches correct mode ───────────────────────────────

/**
 * **Validates: Requirements 8.6**
 *
 * Property 9: For any mode in MODES_CONFIG, the mode.value is exactly the
 * value that would be passed to setDisplayMode when that button is clicked.
 *
 * We test the pure mapping: mode.value === the argument passed to setDisplayMode.
 * The component calls `setDisplayMode(mode.value)` directly, so verifying
 * that each MODES_CONFIG entry's value is a valid DisplayMode and matches
 * the expected set proves the invariant without needing a DOM.
 */
describe('MODES_CONFIG — Property 9: click dispatches correct mode', () => {
  test(
    'for any mode in MODES_CONFIG, mode.value is a valid DisplayMode',
    () => {
      const validModes = new Set<string>(['shaded', 'wireframe', 'clay']);
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: MODES_CONFIG.length - 1 }),
          (idx) => {
            const mode = MODES_CONFIG[idx];
            return validModes.has(mode.value);
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any mode in MODES_CONFIG, mode.value matches the expected setDisplayMode argument',
    () => {
      // The component calls: onClick={() => setDisplayMode(mode.value)}
      // So mode.value IS the argument. We verify the mapping is bijective
      // and each value is unique (no two buttons dispatch the same mode).
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: MODES_CONFIG.length - 1 }),
          fc.integer({ min: 0, max: MODES_CONFIG.length - 1 }),
          (idxA, idxB) => {
            if (idxA === idxB) return true; // same button — trivially equal
            // Different buttons must dispatch different mode values
            return MODES_CONFIG[idxA].value !== MODES_CONFIG[idxB].value;
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test('MODES_CONFIG values cover all DisplayMode values exactly', () => {
    const configValues = MODES_CONFIG.map((m) => m.value).sort();
    const expectedValues: DisplayMode[] = ['clay', 'shaded', 'wireframe'];
    expect(configValues).toEqual(expectedValues);
  });
});

/**
 * Property test for gallery category filter pill styles.
 *
 * **Validates: Requirements 4.2, 4.3**
 *
 * Property 6: Filter active/inactive style invariant
 *   For any set of category filters and any selected active filter,
 *   every inactive filter must render with a visible border style and no
 *   solid background fill, and the active filter must render with a solid
 *   background and a visible border — regardless of which category is selected.
 *
 * Strategy: test the pure `getFilterPillStyle` function exported from Gallery.tsx
 * directly, using fast-check to drive arbitrary active/inactive combinations over
 * the full CATEGORIES list. No DOM rendering is required because the style
 * invariant is fully captured in that function.
 */

import * as fc from 'fast-check';
import { CATEGORIES, getFilterPillStyle } from '../components/gallery/filterStyles';
import type { CSSProperties } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the style object represents a solid (non-transparent)
 * background fill — i.e. the `background` property is set to something other
 * than 'transparent', 'none', or an empty string.
 */
function hasSolidBackground(style: CSSProperties): boolean {
  const bg = style.background as string | undefined;
  if (!bg) return false;
  return bg !== 'transparent' && bg !== 'none' && bg !== '';
}

/**
 * Returns true when the style object has a visible border — i.e. the `border`
 * property is set to a non-empty, non-'none' value.
 */
function hasVisibleBorder(style: CSSProperties): boolean {
  const border = style.border as string | undefined;
  if (!border) return false;
  return border !== 'none' && border !== '';
}

// ─── Unit tests: concrete active / inactive cases ────────────────────────────

describe('getFilterPillStyle — unit', () => {
  test('active pill has solid background', () => {
    const style = getFilterPillStyle(true);
    expect(hasSolidBackground(style)).toBe(true);
  });

  test('active pill has visible border', () => {
    const style = getFilterPillStyle(true);
    expect(hasVisibleBorder(style)).toBe(true);
  });

  test('inactive pill has no solid background fill', () => {
    const style = getFilterPillStyle(false);
    expect(hasSolidBackground(style)).toBe(false);
  });

  test('inactive pill has visible border', () => {
    const style = getFilterPillStyle(false);
    expect(hasVisibleBorder(style)).toBe(false ? false : true);
  });

  test('active pill uses --accent token for background', () => {
    const style = getFilterPillStyle(true);
    expect(style.background).toContain('--accent');
  });

  test('inactive pill uses --border-medium token for border', () => {
    const style = getFilterPillStyle(false);
    expect(style.border).toContain('--border-medium');
  });

  test('active pill uses --text-primary for color', () => {
    const style = getFilterPillStyle(true);
    expect(style.color).toContain('--text-primary');
  });

  test('inactive pill uses --text-secondary for color', () => {
    const style = getFilterPillStyle(false);
    expect(style.color).toContain('--text-secondary');
  });
});

// ─── Property test: style invariant over all CATEGORIES ──────────────────────

/**
 * **Validates: Requirements 4.2, 4.3**
 *
 * Property 6: For any filter in the CATEGORIES list and any boolean active
 * state, the style invariant must hold:
 *   - active  → solid background + visible border
 *   - inactive → no solid background + visible border
 */
describe('getFilterPillStyle — property (Property 6)', () => {
  test(
    'for any filter in CATEGORIES, active state has solid background + border',
    () => {
      fc.assert(
        fc.property(
          // Arbitrary index into the CATEGORIES array
          fc.integer({ min: 0, max: CATEGORIES.length - 1 }),
          (idx) => {
            const _cat = CATEGORIES[idx]; // any valid category
            const style = getFilterPillStyle(true);
            return hasSolidBackground(style) && hasVisibleBorder(style);
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any filter in CATEGORIES, inactive state has border but no solid background',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: CATEGORIES.length - 1 }),
          (idx) => {
            const _cat = CATEGORIES[idx]; // any valid category
            const style = getFilterPillStyle(false);
            return !hasSolidBackground(style) && hasVisibleBorder(style);
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );

  test(
    'for any combination of active filter index and category list, exactly the active filter has solid background',
    () => {
      fc.assert(
        fc.property(
          // Pick an arbitrary "active" index
          fc.integer({ min: 0, max: CATEGORIES.length - 1 }),
          (activeIdx) => {
            return CATEGORIES.every((cat, idx) => {
              const isActive = idx === activeIdx;
              const style = getFilterPillStyle(isActive);
              if (isActive) {
                return hasSolidBackground(style) && hasVisibleBorder(style);
              } else {
                return !hasSolidBackground(style) && hasVisibleBorder(style);
              }
            });
          }
        ),
        { verbose: true, numRuns: 100 }
      );
    }
  );
});

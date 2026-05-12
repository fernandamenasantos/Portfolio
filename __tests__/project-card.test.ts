/**
 * Property test for ProjectCard hover overlay visibility.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3**
 *
 * Property 10: ProjectCard hover overlay visibility
 *   For any ProjectCard with any project data, the overlay content must be
 *   hidden when the card is not hovered, and visible when the card is hovered.
 *
 * Strategy: test the pure `getOverlayVisibilityClasses` helper exported from
 * cardStyles.ts directly, using fast-check to drive arbitrary project data.
 * No DOM rendering is required — the visibility invariant is fully captured
 * in the class string returned by that function.
 */

import * as fc from 'fast-check';
import {
  getOverlayVisibilityClasses,
  getHoverInfoClasses,
} from '../components/gallery/cardStyles';
import type { Project } from '../types';

// ─── Arbitrary project data generator ────────────────────────────────────────

const arbitraryProject = (): fc.Arbitrary<Project> =>
  fc.record<Project>({
    id: fc.stringMatching(/^[a-z0-9]{4,12}$/),
    title: fc.string({ minLength: 1, maxLength: 80 }),
    description: fc.string({ minLength: 0, maxLength: 300 }),
    category: fc.constantFrom(
      'character',
      'environment',
      'prop',
      'concept'
    ) as fc.Arbitrary<Project['category']>,
    thumbnail: fc.webUrl(),
    modelPath: fc.option(fc.webUrl(), { nil: undefined }),
    images: fc.option(fc.array(fc.webUrl(), { maxLength: 5 }), { nil: undefined }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
    year: fc.integer({ min: 2000, max: 2030 }),
    software: fc.array(fc.string({ minLength: 1, maxLength: 30 }), {
      minLength: 1,
      maxLength: 5,
    }),
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true when the class string indicates the element is hidden. */
function isHidden(classes: string): boolean {
  return classes.includes('opacity-0');
}

/** Returns true when the class string indicates the element is visible. */
function isVisible(classes: string): boolean {
  return classes.includes('opacity-100');
}

// ─── Unit tests: concrete hover states ───────────────────────────────────────

describe('getOverlayVisibilityClasses — unit', () => {
  test('not hovered → opacity-0 (hidden)', () => {
    const classes = getOverlayVisibilityClasses(false);
    expect(isHidden(classes)).toBe(true);
    expect(isVisible(classes)).toBe(false);
  });

  test('hovered → opacity-100 (visible)', () => {
    const classes = getOverlayVisibilityClasses(true);
    expect(isVisible(classes)).toBe(true);
    expect(isHidden(classes)).toBe(false);
  });

  test('not hovered → pointer-events-none', () => {
    expect(getOverlayVisibilityClasses(false)).toContain('pointer-events-none');
  });

  test('hovered → pointer-events-auto', () => {
    expect(getOverlayVisibilityClasses(true)).toContain('pointer-events-auto');
  });
});

describe('getHoverInfoClasses — unit', () => {
  test('not hovered → translate-y-2 + opacity-0', () => {
    const classes = getHoverInfoClasses(false);
    expect(classes).toContain('translate-y-2');
    expect(classes).toContain('opacity-0');
  });

  test('hovered → translate-y-0 + opacity-100', () => {
    const classes = getHoverInfoClasses(true);
    expect(classes).toContain('translate-y-0');
    expect(classes).toContain('opacity-100');
  });
});

// ─── Property tests ───────────────────────────────────────────────────────────

/**
 * **Validates: Requirements 6.1, 6.2, 6.3**
 *
 * Property 10: For any project data, when isHovered=false the overlay has
 * opacity-0/hidden classes; when isHovered=true it has opacity-100/visible
 * classes.
 */
describe('getOverlayVisibilityClasses — property (Property 10)', () => {
  test(
    'for any project data, overlay is hidden when not hovered',
    () => {
      fc.assert(
        fc.property(
          arbitraryProject(),
          (_project) => {
            // The overlay visibility is independent of project data —
            // it depends solely on the hover boolean. We verify the
            // invariant holds regardless of what project is rendered.
            const classes = getOverlayVisibilityClasses(false);
            return isHidden(classes) && !isVisible(classes);
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any project data, overlay is visible when hovered',
    () => {
      fc.assert(
        fc.property(
          arbitraryProject(),
          (_project) => {
            const classes = getOverlayVisibilityClasses(true);
            return isVisible(classes) && !isHidden(classes);
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any project data, hover state is mutually exclusive (hidden XOR visible)',
    () => {
      fc.assert(
        fc.property(
          arbitraryProject(),
          fc.boolean(),
          (_project, isHovered) => {
            const classes = getOverlayVisibilityClasses(isHovered);
            const hidden = isHidden(classes);
            const visible = isVisible(classes);
            // Exactly one of hidden/visible must be true
            return hidden !== visible;
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any project data, hover info panel is translated down and hidden when not hovered',
    () => {
      fc.assert(
        fc.property(
          arbitraryProject(),
          (_project) => {
            const classes = getHoverInfoClasses(false);
            return classes.includes('translate-y-2') && classes.includes('opacity-0');
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );

  test(
    'for any project data, hover info panel is in place and visible when hovered',
    () => {
      fc.assert(
        fc.property(
          arbitraryProject(),
          (_project) => {
            const classes = getHoverInfoClasses(true);
            return classes.includes('translate-y-0') && classes.includes('opacity-100');
          }
        ),
        { verbose: true, numRuns: 200 }
      );
    }
  );
});

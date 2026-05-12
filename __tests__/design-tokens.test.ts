/**
 * WCAG AA contrast ratio tests for design system text tokens.
 *
 * Validates: Requirements 1.6
 *
 * Property 5: For any text color token defined in the Design_System
 * (--text-primary, --text-secondary, --text-muted), the WCAG relative
 * luminance contrast ratio against --bg-base (#080808) must be at least 4.5:1.
 */

import * as fc from 'fast-check';

// ─── Design token values (must stay in sync with globals.css) ────────────────

const TOKENS = {
  '--bg-base': '#080808',
  '--text-primary': '#f0f0f0',
  '--text-secondary': '#888888',
  '--text-muted': '#787878',
} as const;

// ─── WCAG relative luminance helpers ─────────────────────────────────────────

/**
 * Convert a single 8-bit channel value (0–255) to its linearised form
 * as defined by the WCAG 2.1 relative luminance formula.
 */
function linearise(channel8bit: number): number {
  const sRGB = channel8bit / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * Parse a CSS hex colour string (#rrggbb or #rgb) into [r, g, b] 0–255.
 */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Compute WCAG relative luminance for a hex colour.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/**
 * Compute WCAG contrast ratio between two hex colours.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function contrastRatio(hex1: string, hex2: string): number {
  const L1 = relativeLuminance(hex1);
  const L2 = relativeLuminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ─── Unit tests: concrete token values ───────────────────────────────────────

describe('Design token WCAG AA contrast (unit)', () => {
  const bg = TOKENS['--bg-base'];
  const WCAG_AA_THRESHOLD = 4.5;

  test.each([
    ['--text-primary', TOKENS['--text-primary']],
    ['--text-secondary', TOKENS['--text-secondary']],
    ['--text-muted', TOKENS['--text-muted']],
  ])('%s (%s) has contrast ≥ 4.5:1 against --bg-base', (tokenName, textColor) => {
    const ratio = contrastRatio(textColor, bg);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_THRESHOLD);
  });
});

// ─── Property test: WCAG AA invariant ────────────────────────────────────────

/**
 * **Validates: Requirements 1.6**
 *
 * Property 5: For any text color token defined in the Design_System,
 * the WCAG contrast ratio against --bg-base must be at least 4.5:1.
 *
 * We model this as a property over the set of defined text tokens,
 * asserting the invariant holds for every element of that set.
 */
describe('Design token WCAG AA contrast (property)', () => {
  const textTokenEntries = [
    ['--text-primary', TOKENS['--text-primary']],
    ['--text-secondary', TOKENS['--text-secondary']],
    ['--text-muted', TOKENS['--text-muted']],
  ] as const;

  test('all text tokens satisfy WCAG AA (4.5:1) against --bg-base for any token in the set', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...textTokenEntries),
        ([tokenName, textColor]) => {
          const ratio = contrastRatio(textColor, TOKENS['--bg-base']);
          return ratio >= 4.5;
        }
      ),
      { verbose: true }
    );
  });
});

// ─── Helper unit tests ────────────────────────────────────────────────────────

describe('WCAG luminance helpers', () => {
  test('pure white (#ffffff) has luminance 1.0', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1.0, 5);
  });

  test('pure black (#000000) has luminance 0.0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0.0, 5);
  });

  test('white vs black contrast ratio is 21:1', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
  });

  test('parseHex handles shorthand #rgb notation', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('#000')).toEqual([0, 0, 0]);
  });
});

import type { CSSProperties } from 'react';
import type { DisplayMode } from '@/types';

/**
 * Configuration for each display mode button.
 * Exported so property tests can verify the MODES array directly.
 */
export const MODES_CONFIG: {
  value: DisplayMode;
  label: string;
  ariaLabel: string;
  title: string;
}[] = [
  {
    value: 'shaded',
    label: 'Shaded',
    ariaLabel: 'Shaded mode',
    title: 'Shaded',
  },
  {
    value: 'wireframe',
    label: 'Wire',
    ariaLabel: 'Wireframe mode',
    title: 'Wire',
  },
  {
    value: 'clay',
    label: 'Clay',
    ariaLabel: 'Clay mode',
    title: 'Clay',
  },
];

/**
 * Returns the inline style object for a display mode button based on whether
 * it is the currently active mode.
 *
 * Active:   violet glow background (--accent-glow) + accent border/text (--accent)
 * Inactive: no glow, subtle text color (--text-secondary)
 *
 * Exported as a pure function so property tests can verify the invariant
 * without DOM rendering.
 */
export function getButtonStyle(
  mode: DisplayMode,
  activeMode: DisplayMode
): CSSProperties {
  const isActive = mode === activeMode;

  if (isActive) {
    return {
      background: 'var(--accent-glow)',
      border: '1px solid var(--accent)',
      color: 'var(--accent)',
      transition: 'all 0.15s ease',
    };
  }

  return {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  };
}

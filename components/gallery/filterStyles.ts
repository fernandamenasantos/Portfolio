import type { CSSProperties } from 'react';
import type { Category } from '@/types';

export const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Character', value: 'character' },
  { label: 'Environment', value: 'environment' },
  { label: 'Prop', value: 'prop' },
];

/**
 * Returns the inline style object for a filter pill based on its active state.
 *
 * Inactive: subtle visible border (--border-medium), no solid fill,
 *           text in --text-secondary.
 * Active:   solid background (--accent) + visible border (--accent-dim),
 *           text in --text-primary (white-ish).
 *
 * Exported so the property test can verify the invariant without DOM rendering.
 */
export function getFilterPillStyle(isActive: boolean): CSSProperties {
  if (isActive) {
    return {
      background: 'var(--accent)',
      border: '1px solid var(--accent-dim)',
      color: 'var(--text-primary)',
      transition: 'all 0.2s ease',
    };
  }
  return {
    background: 'transparent',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
  };
}

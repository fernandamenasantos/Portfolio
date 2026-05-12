/**
 * Pure style helpers for ProjectCard.
 *
 * Exported so property tests can verify overlay visibility invariants
 * without any DOM rendering.
 */

/**
 * Returns the Tailwind class string for the hover overlay visibility.
 *
 * When `isHovered` is false the overlay is fully transparent (opacity-0)
 * and pointer-events are disabled.
 * When `isHovered` is true the overlay is fully opaque (opacity-100).
 *
 * Used by Property 10: ProjectCard hover overlay visibility.
 */
export function getOverlayVisibilityClasses(isHovered: boolean): string {
  return isHovered
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none';
}

/**
 * Returns the Tailwind class string for the hover info panel
 * (title + description block at the bottom of the card).
 *
 * When not hovered: translated down + invisible.
 * When hovered: in place + visible.
 */
export function getHoverInfoClasses(isHovered: boolean): string {
  return isHovered
    ? 'translate-y-0 opacity-100'
    : 'translate-y-2 opacity-0';
}

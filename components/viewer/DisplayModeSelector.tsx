'use client';

import { useViewerStore } from '@/store/viewerStore';
import { MODES_CONFIG, getButtonStyle } from './displayModeStyles';

// ─── Improved SVG icons ───────────────────────────────────────────────────────

/** Shaded: filled sphere with a specular highlight dot */
const ShadedIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    {/* Main sphere body */}
    <circle cx="7" cy="7" r="5.5" fill="currentColor" opacity="0.9" />
    {/* Primary specular highlight */}
    <ellipse
      cx="4.8"
      cy="4.6"
      rx="1.6"
      ry="1.0"
      fill="white"
      opacity="0.55"
      transform="rotate(-25 4.8 4.6)"
    />
    {/* Small secondary specular dot */}
    <circle cx="5.6" cy="3.8" r="0.5" fill="white" opacity="0.35" />
  </svg>
);

/** Wire: wireframe sphere with visible grid lines */
const WireIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    {/* Outer circle */}
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    {/* Horizontal equator */}
    <line
      x1="1.5"
      y1="7"
      x2="12.5"
      y2="7"
      stroke="currentColor"
      strokeWidth="0.9"
    />
    {/* Vertical meridian */}
    <line
      x1="7"
      y1="1.5"
      x2="7"
      y2="12.5"
      stroke="currentColor"
      strokeWidth="0.9"
    />
    {/* Latitude line (upper) */}
    <path
      d="M 2.8 4.5 Q 7 3.2 11.2 4.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    {/* Latitude line (lower) */}
    <path
      d="M 2.8 9.5 Q 7 10.8 11.2 9.5"
      stroke="currentColor"
      strokeWidth="0.8"
      fill="none"
    />
    {/* Longitude ellipse */}
    <ellipse
      cx="7"
      cy="7"
      rx="2.8"
      ry="5.5"
      stroke="currentColor"
      strokeWidth="0.8"
    />
  </svg>
);

/** Clay: matte sphere — filled, no specular highlight, slightly desaturated */
const ClayIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    {/* Matte sphere body — slightly lower opacity than shaded, no highlight */}
    <circle cx="7" cy="7" r="5.5" fill="currentColor" opacity="0.6" />
    {/* Subtle rim/edge darkening to suggest matte roundness */}
    <circle
      cx="7"
      cy="7"
      r="5.5"
      stroke="currentColor"
      strokeWidth="1.2"
      opacity="0.4"
    />
    {/* Very faint ambient occlusion hint at bottom */}
    <ellipse
      cx="7"
      cy="10.5"
      rx="3.2"
      ry="1.0"
      fill="currentColor"
      opacity="0.2"
    />
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  shaded: <ShadedIcon />,
  wireframe: <WireIcon />,
  clay: <ClayIcon />,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DisplayModeSelector() {
  const { displayMode, setDisplayMode } = useViewerStore();

  return (
    <div className="absolute top-4 right-4 z-20 flex bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
      {MODES_CONFIG.map((mode, i) => (
        <button
          key={mode.value}
          onClick={() => setDisplayMode(mode.value)}
          aria-label={mode.ariaLabel}
          title={mode.title}
          style={getButtonStyle(mode.value, displayMode)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-all duration-150${
            i > 0 ? ' border-l border-white/5' : ''
          }`}
        >
          {ICONS[mode.value]}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

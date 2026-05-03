'use client';

import { useViewerStore } from '@/store/viewerStore';
import { DisplayMode } from '@/types';

const MODES: { value: DisplayMode; label: string; icon: React.ReactNode }[] = [
  {
    value: 'shaded',
    label: 'Shaded',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5" fill="currentColor" opacity="0.85" />
        <ellipse cx="4.5" cy="4.5" rx="1.8" ry="1.2" fill="white" opacity="0.35" transform="rotate(-20 4.5 4.5)" />
      </svg>
    ),
  },
  {
    value: 'wireframe',
    label: 'Wire',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="1.5" y1="6.5" x2="11.5" y2="6.5" stroke="currentColor" strokeWidth="1" />
        <line x1="6.5" y1="1.5" x2="6.5" y2="11.5" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="6.5" cy="6.5" rx="3" ry="5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    value: 'clay',
    label: 'Clay',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5" fill="currentColor" opacity="0.45" stroke="currentColor" strokeWidth="1.2" />
        <ellipse cx="4.8" cy="4.8" rx="1.5" ry="1" fill="white" opacity="0.25" transform="rotate(-20 4.8 4.8)" />
      </svg>
    ),
  },
];

export default function DisplayModeSelector() {
  const { displayMode, setDisplayMode } = useViewerStore();

  return (
    <div className="absolute top-4 right-4 z-20 flex bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
      {MODES.map((mode, i) => (
        <button
          key={mode.value}
          onClick={() => setDisplayMode(mode.value)}
          title={mode.label}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-all duration-150 ${
            displayMode === mode.value
              ? 'bg-violet-600/30 text-violet-300'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          } ${i > 0 ? 'border-l border-white/5' : ''}`}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewerStore } from '@/store/viewerStore';
import { EnvironmentPreset } from '@/types';

const ENVIRONMENTS: { label: string; value: EnvironmentPreset; emoji: string }[] = [
  { label: 'Studio', value: 'studio', emoji: '🔆' },
  { label: 'Dawn', value: 'dawn', emoji: '🌅' },
  { label: 'Sunset', value: 'sunset', emoji: '🌇' },
  { label: 'Forest', value: 'forest', emoji: '🌲' },
  { label: 'City', value: 'city', emoji: '🏙' },
  { label: 'Warehouse', value: 'warehouse', emoji: '🏭' },
  { label: 'Lobby', value: 'lobby', emoji: '🏨' },
  { label: 'Night', value: 'night', emoji: '🌙' },
  { label: 'Park', value: 'park', emoji: '🌳' },
  { label: 'Apartment', value: 'apartment', emoji: '🏠' },
];

export default function EnvironmentSelector() {
  const [open, setOpen] = useState(false);
  const { scene, setEnvironment, setAmbientIntensity, setDirectionalIntensity, toggleBackground } =
    useViewerStore();

  return (
    <div className="absolute bottom-6 left-6 z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-white/10 text-zinc-300 text-xs px-3 py-2 rounded-lg hover:border-violet-500/50 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Scene
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-10 left-0 w-72 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl"
          >
            {/* Environment presets */}
            <p className="text-zinc-500 text-xs font-medium mb-2 uppercase tracking-widest">
              Environment
            </p>
            <div className="grid grid-cols-5 gap-1 mb-4">
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env.value}
                  onClick={() => setEnvironment(env.value)}
                  title={env.label}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    scene.environment === env.value
                      ? 'bg-violet-600/30 border border-violet-500/50 text-violet-300'
                      : 'bg-zinc-800 border border-transparent text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-base leading-none">{env.emoji}</span>
                  <span className="text-[10px] leading-none">{env.label}</span>
                </button>
              ))}
            </div>

            {/* Background toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-xs">Show background</span>
              <button
                onClick={toggleBackground}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  scene.background ? 'bg-violet-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    scene.background ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Ambient light */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400 text-xs">Ambient</span>
                <span className="text-zinc-500 text-xs font-mono">
                  {scene.ambientIntensity.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={scene.ambientIntensity}
                onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                className="w-full accent-violet-500 h-1"
              />
            </div>

            {/* Directional light */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400 text-xs">Key light</span>
                <span className="text-zinc-500 text-xs font-mono">
                  {scene.directionalIntensity.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={scene.directionalIntensity}
                onChange={(e) => setDirectionalIntensity(parseFloat(e.target.value))}
                className="w-full accent-violet-500 h-1"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

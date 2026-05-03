'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewerStore } from '@/store/viewerStore';

export default function MeshInfoPanel() {
  const { selectedMesh, setSelectedMesh } = useViewerStore();
  const [panelPos, setPanelPos] = useState({ left: 0, top: 0 });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMesh(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSelectedMesh]);

  // Calculate panel position safely (avoids direct window access in JSX)
  useEffect(() => {
    if (!selectedMesh) return;
    setPanelPos({
      left: Math.min(selectedMesh.position.x + 16, window.innerWidth - 280),
      top: Math.max(selectedMesh.position.y - 60, 16),
    });
  }, [selectedMesh]);

  return (
    <AnimatePresence>
      {selectedMesh && (
        <motion.div
          key={selectedMesh.name}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute pointer-events-none z-20"
          style={panelPos}
        >
          <div className="pointer-events-auto w-64 bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                  <h4 className="text-white font-semibold text-sm">
                    {selectedMesh.info?.name ?? selectedMesh.name}
                  </h4>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {selectedMesh.info?.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedMesh(null)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0 mt-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Metadata */}
            {(selectedMesh.info?.material || selectedMesh.info?.polycount) && (
              <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                {selectedMesh.info?.material && (
                  <div>
                    <span className="text-zinc-600 text-xs block">Material</span>
                    <span className="text-zinc-300 text-xs">{selectedMesh.info.material}</span>
                  </div>
                )}
                {selectedMesh.info?.polycount && (
                  <div>
                    <span className="text-zinc-600 text-xs block">Polycount</span>
                    <span className="text-zinc-300 text-xs font-mono">{selectedMesh.info.polycount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

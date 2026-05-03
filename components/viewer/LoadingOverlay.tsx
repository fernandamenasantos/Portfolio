'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-sm font-mono tracking-wider">Loading model…</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

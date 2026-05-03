'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProjectById } from '@/data/projects';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('@/components/viewer/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: Props) {
  const { id } = use(params);
  const project = getProjectById(id);

  if (!project) notFound();

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-950/80 backdrop-blur-sm z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Portfolio
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-xs capitalize">{project.category}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-100 font-medium text-sm">{project.title}</span>
        </div>

        <div className="flex gap-2">
          {project.software.map((sw) => (
            <span
              key={sw}
              className="text-zinc-500 text-xs bg-zinc-800 px-2 py-0.5 rounded"
            >
              {sw}
            </span>
          ))}
        </div>
      </header>

      {/* Main layout: viewer + sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          {project.modelPath ? (
            <ModelViewer project={project} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${project.thumbnail})` }}
              />
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <motion.aside
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-72 shrink-0 border-l border-white/5 bg-zinc-950 overflow-y-auto"
        >
          <div className="p-6">
            <h1 className="text-xl font-bold text-white">{project.title}</h1>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{project.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-violet-400 text-xs font-mono bg-violet-900/20 border border-violet-800/40 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Metadata */}
            <div className="mt-6 space-y-3 border-t border-white/5 pt-5">
              <div className="flex justify-between">
                <span className="text-zinc-600 text-xs">Year</span>
                <span className="text-zinc-300 text-xs font-mono">{project.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 text-xs">Category</span>
                <span className="text-zinc-300 text-xs capitalize">{project.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 text-xs">Software</span>
                <span className="text-zinc-300 text-xs">{project.software.join(', ')}</span>
              </div>
            </div>

            {/* Mesh guide */}
            {project.meshInfo && Object.keys(project.meshInfo).length > 0 && (
              <div className="mt-6 border-t border-white/5 pt-5">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
                  Interactive parts
                </p>
                <ul className="space-y-1.5">
                  {Object.keys(project.meshInfo).map((name) => (
                    <li key={name} className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="text-zinc-600 text-xs mt-3">
                  Click any highlighted part in the viewer to see details.
                </p>
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

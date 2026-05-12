'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Project } from '@/types';

interface Props {
  project: Project;
  index: number;
  featured?: boolean;
}

export default function ProjectCard({ project, index, featured = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className="group relative"
    >
      <Link href={`/project/${project.id}`}>
        {/* ── Thumbnail container ─────────────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-xl bg-zinc-900 cursor-pointer ${
            featured ? 'aspect-[16/9]' : 'aspect-[4/3]'
          }`}
        >
          {/* Thumbnail image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: `url(${project.thumbnail})`,
              backgroundColor: '#1a1a2e',
            }}
          />

          {/* ── Gradient overlay (5.1) ──────────────────────────────────
              Richer gradient: more opaque at bottom, fades to transparent.
              Hidden by default, revealed on hover.
          ─────────────────────────────────────────────────────────────── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* ── 3D badge (5.2) ──────────────────────────────────────────
              Technical/editorial style: mono font, wide tracking, border
              only — no solid background fill.
          ─────────────────────────────────────────────────────────────── */}
          {project.modelPath && (
            <div className="absolute top-3 right-3 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] px-2 py-1 rounded-md font-mono tracking-widest">
              3D
            </div>
          )}

          {/* ── Category badge (5.3) ────────────────────────────────────
              Border + accent text instead of solid violet background.
          ─────────────────────────────────────────────────────────────── */}
          <div
            className="absolute top-3 left-3 backdrop-blur-sm border text-xs px-2 py-1 rounded-md font-medium capitalize"
            style={{
              borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)',
              color: 'var(--accent)',
              background: 'transparent',
            }}
          >
            {project.category}
          </div>

          {/* ── Hover info (5.1) ────────────────────────────────────────
              Title + description with improved typographic hierarchy.
              Slides up and fades in on hover.
          ─────────────────────────────────────────────────────────────── */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3
              className={`text-white font-bold leading-tight tracking-tight ${
                featured ? 'text-2xl' : 'text-lg'
              }`}
            >
              {project.title}
            </h3>
            <p className="text-white/75 text-sm mt-1.5 leading-snug line-clamp-2">
              {project.description}
            </p>
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-white/40 text-xs font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Separator (5.4) ─────────────────────────────────────────────
            Subtle 1px line between thumbnail and below-card info.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          className="mt-0 h-px w-full"
          style={{ background: 'var(--border-subtle)' }}
        />

        {/* ── Below-card info (always visible) ────────────────────────── */}
        <div className="mt-3 px-1">
          <h3
            className={`text-zinc-100 font-medium ${
              featured ? 'text-base' : 'text-sm'
            }`}
          >
            {project.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-zinc-500 text-xs">{project.year}</span>
            <span className="text-zinc-700 text-xs">·</span>
            <span className="text-zinc-500 text-xs">{project.software[0]}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

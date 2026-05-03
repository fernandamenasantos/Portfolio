'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Project } from '@/types';

interface Props {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className="group relative"
    >
      <Link href={`/project/${project.id}`}>
        <div className="relative overflow-hidden rounded-xl bg-zinc-900 aspect-[4/3] cursor-pointer">
          {/* Thumbnail */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: `url(${project.thumbnail})`,
              backgroundColor: '#1a1a2e',
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 3D badge */}
          {project.modelPath && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 text-white/80 text-xs px-2 py-1 rounded-md font-mono tracking-wider">
              3D
            </div>
          )}

          {/* Category tag */}
          <div className="absolute top-3 left-3 bg-violet-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium capitalize">
            {project.category}
          </div>

          {/* Hover info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <h3 className="text-white font-semibold text-base leading-tight">
              {project.title}
            </h3>
            <p className="text-white/60 text-xs mt-1 line-clamp-2">
              {project.description}
            </p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-white/40 text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Below-card info (always visible) */}
        <div className="mt-3 px-1">
          <h3 className="text-zinc-100 font-medium text-sm">{project.title}</h3>
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

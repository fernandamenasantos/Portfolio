'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { getProjectsByCategory } from '@/data/projects';
import { Category } from '@/types';

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Character', value: 'character' },
  { label: 'Environment', value: 'environment' },
  { label: 'Prop', value: 'prop' },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const projects = getProjectsByCategory(activeCategory);

  return (
    <div className="min-h-screen bg-zinc-950 px-6 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Fer<span className="text-violet-400">.</span>
          </h1>
          <p className="text-zinc-400 mt-3 text-lg max-w-xl">
            3D Artist · Character & Environment Design
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 mt-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {projects.length === 0 && (
          <p className="text-zinc-600 text-center py-20">No projects in this category yet.</p>
        )}
      </div>
    </div>
  );
}

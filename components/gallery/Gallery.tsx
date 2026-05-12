'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { getProjectsByCategory } from '@/data/projects';
import { Category } from '@/types';
import { CATEGORIES, getFilterPillStyle } from './filterStyles';

export { CATEGORIES, getFilterPillStyle };

function Gallery() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const projects = getProjectsByCategory(activeCategory);

  return (
    <div
      className="min-h-screen px-6 pb-20 relative"
      style={{
        background:
          'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 40%, var(--bg-base) 70%)',
      }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Name — display font, two lines for visual weight */}
          <h1
            className="font-bold leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 7vw, 6rem)',
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Fernanda</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Mena</span>
            <span
              style={{
                color: 'var(--accent)',
                textShadow: '0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(139,92,246,0.3)',
              }}
            >
              .
            </span>
          </h1>

          {/* Accent line under name */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="h-0.5 w-12"
              style={{ background: 'var(--accent)', opacity: 0.8 }}
            />
            <p
              className="text-sm tracking-widest uppercase"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.25em',
              }}
            >
              3D Artist &amp; World Builder
            </p>
          </div>
        </motion.div>

        {/* Visual separator between header and grid */}
        <div className="mt-10 mb-0 flex items-center gap-4">
          <div
            className="h-px flex-1 max-w-xs"
            style={{
              background:
                'linear-gradient(to right, var(--accent), transparent)',
              opacity: 0.4,
            }}
          />
          <div
            className="w-1 h-1 rounded-full"
            style={{ background: 'var(--accent)', opacity: 0.6 }}
          />
          <div
            className="h-px flex-1"
            style={{
              background: 'var(--border-subtle)',
            }}
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mt-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                style={getFilterPillStyle(isActive)}
                className="px-4 py-1.5 rounded-full text-sm font-medium"
              >
                {cat.label}
              </button>
            );
          })}
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
              <ProjectCard key={project.id} project={project} index={i} featured={i === 0} />
            ))}
          </motion.div>
        </AnimatePresence>

        {projects.length === 0 && (
          <p className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            No projects in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Gallery;

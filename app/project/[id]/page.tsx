'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectById } from '@/data/projects';
import { useViewerStore } from '@/store/viewerStore';
import type { MeshInfo } from '@/types';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('@/components/viewer/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  ),
});

type SidebarTab = 'info' | 'parts' | 'photos';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: Props) {
  const { id } = use(params);
  const project = getProjectById(id);
  const [activeTab, setActiveTab] = useState<SidebarTab>('info');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!project) notFound();

  const hasParts = project.meshInfo && Object.keys(project.meshInfo).length > 0;
  const hasPhotos = (project.moodboard?.length ?? 0) + (project.turnaround?.length ?? 0) > 0;
  const carouselImages = project.images?.length
    ? project.images
    : [...(project.turnaround ?? []), ...(project.moodboard ?? [])];
  const hasCarousel = carouselImages.length > 0;

  const tabs: { id: SidebarTab; label: string; show: boolean }[] = [
    { id: 'info'   as SidebarTab, label: 'Info',   show: true },
    { id: 'parts'  as SidebarTab, label: 'Parts',  show: !!hasParts },
    { id: 'photos' as SidebarTab, label: 'Photos', show: !!hasPhotos },
  ].filter((t) => t.show);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <header
        className="shrink-0 flex items-center justify-between px-6 py-3 backdrop-blur-sm z-10"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(8,8,8,0.85)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Portfolio
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{project.category}</span>
          <span style={{ color: 'var(--border-medium)' }}>·</span>
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{project.title}</span>
        </div>

        <div className="flex gap-2">
          {project.software.map((sw) => (
            <span key={sw} className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {sw}
            </span>
          ))}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          {project.modelPath ? (
            <ModelViewer project={project} />
          ) : (
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${project.thumbnail})` }} />
          )}
        </div>

        {/* Sidebar */}
        <motion.aside
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}
        >
          {/* Tab bar */}
          <div className="shrink-0 flex" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-3 text-xs font-medium tracking-wider uppercase transition-colors relative"
                style={{ color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
                  <InfoTab project={project} />
                </motion.div>
              )}
              {activeTab === 'parts' && (
                <motion.div key="parts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
                  <PartsTab meshInfo={project.meshInfo!} />
                </motion.div>
              )}
              {activeTab === 'photos' && (
                <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-4">
                  <PhotosTab
                    moodboard={project.moodboard}
                    turnaround={project.turnaround}
                    onOpen={setLightboxSrc}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>

      {hasCarousel && (
        <div className="shrink-0 border-t border-white/10 bg-[var(--bg-elevated)]">
          <ImageCarousel images={carouselImages} onOpen={setLightboxSrc} />
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightboxSrc(null)}
          >
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={lightboxSrc}
              alt=""
              className="max-w-full max-h-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 p-2 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
              onClick={() => setLightboxSrc(null)}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function InfoTab({ project }: { project: NonNullable<ReturnType<typeof getProjectById>> }) {
  return (
    <>
      <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        {project.title}
      </h1>
      <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-medium)', background: 'transparent' }}>
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5" style={{ borderTop: '1px solid var(--border-subtle)' }} />

      <div className="mt-5 space-y-3">
        {[
          { label: 'Year',     value: String(project.year) },
          { label: 'Category', value: project.category },
          { label: 'Software', value: project.software.join(', ') },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-baseline">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Parts Tab ────────────────────────────────────────────────────────────────

function PartsTab({ meshInfo }: { meshInfo: Record<string, MeshInfo> }) {
  const { isolatedMesh, setIsolatedMesh } = useViewerStore();
  const names = Object.keys(meshInfo);

  return (
    <>
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        Parts — click to isolate
      </p>

      {/* Show all button */}
      {isolatedMesh !== null && (
        <button
          onClick={() => setIsolatedMesh(null)}
          className="w-full mb-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
        >
          ← Show all parts
        </button>
      )}

      <ul className="space-y-1.5">
        {names.map((name) => {
          const info = meshInfo[name];
          const isIsolated = isolatedMesh === name;
          return (
            <li key={name}>
              <button
                onClick={() => setIsolatedMesh(isIsolated ? null : name)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group"
                style={{
                  background: isIsolated ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  border: `1px solid ${isIsolated ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                    style={{ background: isIsolated ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                  <span className="text-xs font-medium" style={{ color: isIsolated ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {info.name ?? name}
                  </span>
                  {isIsolated && (
                    <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--accent)' }}>ISOLATED</span>
                  )}
                </div>
                {info.description && (
                  <p className="text-xs mt-1 ml-3.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                    {info.description}
                  </p>
                )}
                {(info.material || info.polycount) && (
                  <div className="flex gap-3 mt-1.5 ml-3.5">
                    {info.material && (
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {info.material}
                      </span>
                    )}
                    {info.polycount && (
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {info.polycount} tris
                      </span>
                    )}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// ─── Photos Tab ───────────────────────────────────────────────────────────────

function PhotosTab({
  moodboard,
  turnaround,
  onOpen,
}: {
  moodboard?: string[];
  turnaround?: string[];
  onOpen: (src: string) => void;
}) {
  return (
    <div className="space-y-6">
      {turnaround && turnaround.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Turnaround
          </p>
          <div className="grid grid-cols-2 gap-2">
            {turnaround.map((src, i) => (
              <PhotoThumb key={i} src={src} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}

      {moodboard && moodboard.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Moodboard
          </p>
          <div className="grid grid-cols-2 gap-2">
            {moodboard.map((src, i) => (
              <PhotoThumb key={i} src={src} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ImageCarousel({ images, onOpen }: { images: string[]; onOpen: (src: string) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const next = () => setActiveIndex((current) => (current + 1) % images.length);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Images
        </p>
        <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-secondary)' }}>
          {activeIndex + 1}/{images.length}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-elevated)]" style={{ aspectRatio: '3 / 1' }}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            prev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-white/10 bg-black/40 text-white transition hover:bg-black/60"
          aria-label="Previous image"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-white/10 bg-black/40 text-white transition hover:bg-black/60"
          aria-label="Next image"
        >
          ›
        </button>

        <button
          type="button"
          onClick={() => onOpen(images[activeIndex])}
          className="w-full h-full"
          style={{ background: 'transparent', border: 'none', padding: 0 }}
        >
          <img
            src={images[activeIndex]}
            alt="Project carousel"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="shrink-0 rounded-xl border transition"
              style={{
                border: index === activeIndex ? '1px solid var(--accent)' : '1px solid transparent',
                background: 'var(--bg-base)',
              }}
            >
              <img
                src={src}
                alt="Thumbnail"
                className="h-16 w-24 rounded-xl object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoThumb({ src, onOpen }: { src: string; onOpen: (src: string) => void }) {
  return (
    <button
      onClick={() => onOpen(src)}
      className="relative overflow-hidden rounded-lg group"
      style={{ aspectRatio: '4/3', background: 'var(--bg-elevated)' }}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'white' }}>
          <path d="M8 3H3v5M17 3h-5M3 12v5h5M12 17h5v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

import { useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { Magnetic } from './Magnetic';
import type { ProjectItem } from '../data/cvData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenCv: () => void;
}

export function ProjectModal({ project, onClose, onOpenCv }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] dark:bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-black/10 bg-[#f7f7f5] p-6 text-[#111111] shadow-xl dark:border-white/10 dark:bg-[#141417] dark:text-[#f3f3f0] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
          <div>
            <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
              <span>Project {project.index}</span>
              <span aria-hidden="true"> · </span>
              <span>{project.categoryLabel}</span>
            </div>
            <h3
              id="project-modal-title"
              className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0]"
            >
              {project.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#111111] transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-white/15 dark:text-[#f3f3f0] dark:hover:bg-white dark:hover:text-[#111111] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <p className="text-[15px] leading-relaxed text-[#3a3a3a] dark:text-[#c8c8cc]">
            {project.summary}
          </p>

          <div>
            <h4 className="text-xs font-semibold tracking-wide text-[#7b7b7b] dark:text-[#9a9aa0]">
              Engineering Highlights
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#222222] dark:text-[#e2e2e5]">
              {project.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#111111] dark:bg-[#f3f3f0]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-black/10 pt-4 dark:border-white/10">
            <div className="text-xs font-semibold text-[#7b7b7b] dark:text-[#9a9aa0]">
              Technologies
            </div>
            <div className="mt-1.5 text-sm font-medium text-[#111111] dark:text-[#f3f3f0]">
              {project.technologies.join(' · ')}
            </div>
          </div>

          <div className="border-t border-black/10 pt-4 dark:border-white/10">
            <div className="text-xs font-semibold text-[#7b7b7b] dark:text-[#9a9aa0]">Outcome</div>
            <div className="mt-1.5 text-sm font-medium text-[#111111] dark:text-[#f3f3f0]">
              {project.outcome}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-black/10 pt-5 dark:border-white/10">
          <Magnetic strength={0.25}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCv();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:border-black/40 dark:border-white/15 dark:text-[#f3f3f0] dark:hover:border-white/40 cursor-pointer"
            >
              View Original CV
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </Magnetic>
          <Magnetic strength={0.28}>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#111111] px-5 py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-[#f3f3f0] dark:text-[#111111] cursor-pointer"
            >
              Done
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}

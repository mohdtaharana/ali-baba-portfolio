import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, Moon, Sun } from 'lucide-react';
import { DotMatrixHandsCanvas } from './components/DotMatrixHandsCanvas';
import { AnimatedProfileSection } from './components/AnimatedProfileSection';
import { PixelLabSection } from './components/PixelLabSection';
import { Magnetic } from './components/Magnetic';
import { ScrollReveal } from './components/ScrollReveal';
import { ScrollWordReveal } from './components/ScrollWordReveal';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { PixelScrollbar } from './components/PixelScrollbar';
import { PixelPointerEffect } from './components/PixelPointerEffect';
import { ProjectModal } from './components/ProjectModal';
import { CvPreviewModal } from './components/CvPreviewModal';
import { CV_PROFILE, type ProjectCategory, type ProjectItem } from './data/cvData';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'ali-baba-portfolio-theme';

const STACK_LOGOS = [
  {
    name: 'Python',
    path: 'M10 1a9 9 0 110 18 9 9 0 010-18zm0 3a6 6 0 100 12 6 6 0 000-12zm0 3a3 3 0 110 6 3 3 0 010-6z',
  },
  {
    name: 'Scikit-learn',
    path: 'M10 1l8 4.5v9L10 19l-8-4.5v-9zM10 6l-4 2.3v4.4L10 15l4-2.3V8.3z',
  },
  {
    name: 'Deep Learning',
    path: 'M3 15c0-7 5-12 14-12-1 9-6 14-13 13l-1 2-2-1z',
  },
  {
    name: 'Pandas & NumPy',
    path: 'M10 1l9 4-9 4-9-4zm-9 8l9 4 9-4v3l-9 4-9-4zm0 5l9 4 9-4v2l-9 4-9-4z',
  },
  {
    name: 'Java & MySQL',
    path: 'M1 5q4.5-3 9 0t9 0v3q-4.5 3-9 0t-9 0zm0 7q4.5-3 9 0t9 0v3q-4.5 3-9 0t-9 0z',
  },
  {
    name: 'Arduino IoT',
    path: 'M1 17L7 6l3 5 3-7 6 13z',
  },
];

const PROJECT_FILTERS: { id: ProjectCategory; label: string }[] = [
  { id: 'all', label: 'All Projects' },
  { id: 'ai-ml', label: 'AI & Deep Learning' },
  { id: 'software-db', label: 'Java & MySQL' },
  { id: 'hardware-iot', label: 'Arduino & IoT' },
];

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [filter, setFilter] = useState<ProjectCategory>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const filteredProjects =
    filter === 'all'
      ? CV_PROFILE.projects
      : CV_PROFILE.projects.filter((project) => project.category === filter);

  const handleCopy = async (value: string, field: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111111] transition-colors duration-200 dark:bg-[#0b0b0d] dark:text-[#f3f3f0]">
      <ScrollProgressBar theme={theme} />
      <PixelScrollbar theme={theme} />
      <PixelPointerEffect theme={theme} />
      <div className={cvModalOpen ? 'print:hidden' : undefined}>
        {/* Full-Viewport Dot-Matrix Hands Hero */}
        <section className="hero relative h-screen min-h-[660px] w-full overflow-hidden bg-[#f7f7f5] transition-colors duration-200 dark:bg-[#0b0b0d]">
          <DotMatrixHandsCanvas theme={theme} />

          {/* 3-Zone Top Navigation */}
          <header className="relative z-[3] flex items-center justify-between px-[18px] pt-[22px] md:justify-center md:gap-[clamp(18px,2.6vw,40px)] md:px-6 md:pt-[36px]">
            <a
              href="#"
              className="shrink-0 whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em] text-[#111111] dark:text-[#f3f3f0] md:mr-[10px]"
            >
              {CV_PROFILE.name}
            </a>

            <nav
              aria-label="Primary"
              className="hidden items-center gap-[clamp(18px,2.6vw,40px)] text-[13.5px] md:flex"
            >
              <a
                href="#summary"
                className="whitespace-nowrap shrink-0 text-[#3a3a3a] transition-colors duration-200 hover:text-black dark:text-[#a8a8af] dark:hover:text-white"
              >
                Summary
              </a>
              <a
                href="#projects"
                className="whitespace-nowrap shrink-0 text-[#3a3a3a] transition-colors duration-200 hover:text-black dark:text-[#a8a8af] dark:hover:text-white"
              >
                Projects
              </a>
              <a
                href="#skills"
                className="whitespace-nowrap shrink-0 text-[#3a3a3a] transition-colors duration-200 hover:text-black dark:text-[#a8a8af] dark:hover:text-white"
              >
                Skills
              </a>
              <a
                href="#lab"
                className="whitespace-nowrap shrink-0 text-[#3a3a3a] transition-colors duration-200 hover:text-black dark:text-[#a8a8af] dark:hover:text-white"
              >
                Pixel Lab
              </a>
              <a
                href="#contact"
                className="whitespace-nowrap shrink-0 text-[#3a3a3a] transition-colors duration-200 hover:text-black dark:text-[#a8a8af] dark:hover:text-white"
              >
                Contact
              </a>
            </nav>

            <Magnetic strength={0.3} className="inline-block md:ml-[10px]">
              <button
                type="button"
                onClick={() => setCvModalOpen(true)}
                className="shrink-0 whitespace-nowrap rounded-full bg-[#111111] px-[21px] py-[10px] text-[13.5px] font-medium text-white transition-transform duration-200 hover:-translate-y-[1px] dark:bg-[#f3f3f0] dark:text-[#111111] cursor-pointer"
              >
                View CV
              </button>
            </Magnetic>
          </header>

          {/* Centered Editorial Copy Block */}
          <div className="copy absolute left-1/2 top-[20%] z-[3] w-[min(92vw,720px)] -translate-x-1/2 text-center md:top-[24.5%]">
            <h1 className="text-[clamp(38px,3.75vw,68px)] font-medium leading-[1.04] tracking-[-0.035em] [text-wrap:balance]">
              <span className="block text-[#9a9a9a] dark:text-[#76767c]">
                {CV_PROFILE.headlineTop}
              </span>
              <span className="block text-[#111111] dark:text-[#f3f3f0]">
                {CV_PROFILE.headlineBottom}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[360px] text-[clamp(13px,1.02vw,15.5px)] leading-[1.4] text-[#7b7b7b] dark:text-[#a0a0a6]">
              {CV_PROFILE.subline}
            </p>

            <div className="mt-[clamp(34px,3.6vw,52px)]">
              <Magnetic strength={0.34}>
                <div className="cta-glow-wrap">
                  <a
                    href="#projects"
                    className="cta-pill inline-block rounded-full bg-[#111111] px-5 py-[11px] text-[13.5px] font-medium text-white dark:bg-[#f3f3f0] dark:text-[#111111]"
                  >
                    Explore Projects
                  </a>
                </div>
              </Magnetic>
            </div>
          </div>

          {/* Bottom Technical Stack Row */}
          <div className="logos absolute bottom-[clamp(28px,6vh,64px)] left-0 z-[3] flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3.5 px-4 text-[13px] font-medium tracking-[-0.01em] text-[#8d8d8d] dark:text-[#86868d] md:gap-[clamp(26px,4.6vw,66px)] md:text-[clamp(14px,1.18vw,17px)]">
            {STACK_LOGOS.map((item) => (
              <div key={item.name} className="flex items-center gap-[7px] whitespace-nowrap">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d={item.path} />
                </svg>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Main CV Content */}
        <main className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8 md:py-28">
          <AnimatedProfileSection />

          {/* Projects Section */}
          <section
            id="projects"
            className="mt-20 scroll-mt-12 border-t border-black/10 pt-12 dark:border-white/10 md:mt-24"
          >
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <ScrollReveal delayMs={0}>
                  <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                    02 · Selected Work
                  </div>
                </ScrollReveal>
                <ScrollWordReveal
                  as="h2"
                  text="Academic & Technical Projects"
                  offset={['start 0.92', 'start 0.62']}
                  className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0] sm:text-3xl"
                />
              </div>

              <ScrollReveal delayMs={140}>
                <div
                  role="group"
                  aria-label="Filter projects by domain"
                  className="flex flex-wrap items-center gap-1 rounded-lg bg-black/[0.04] p-1 dark:bg-white/[0.06]"
                >
                  {PROJECT_FILTERS.map((item) => {
                    const active = filter === item.id;
                    return (
                      <Magnetic key={item.id} strength={0.18}>
                        <button
                          type="button"
                          onClick={() => setFilter(item.id)}
                          className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-white text-[#111111] shadow-xs dark:bg-[#232327] dark:text-[#f3f3f0]'
                              : 'text-[#666666] hover:text-[#111111] dark:text-[#9a9aa0] dark:hover:text-[#f3f3f0]'
                          }`}
                        >
                          {item.label}
                        </button>
                      </Magnetic>
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {filteredProjects.map((project, idx) => (
                <ScrollReveal key={project.id} delayMs={80 + idx * 90}>
                  <article className="group flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white/70 p-6 transition-colors duration-200 hover:border-black/25 hover:bg-white dark:border-white/10 dark:bg-[#131316] dark:hover:border-white/25 dark:hover:bg-[#18181c] sm:p-7">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                          {project.index} · {project.categoryLabel}
                        </span>
                        <Magnetic strength={0.35}>
                          <button
                            type="button"
                            onClick={() => setSelectedProject(project)}
                            aria-label={`Inspect ${project.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#111111] transition-colors group-hover:bg-[#111111] group-hover:text-white dark:border-white/15 dark:text-[#f3f3f0] dark:group-hover:bg-[#f3f3f0] dark:group-hover:text-[#111111] cursor-pointer"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </Magnetic>
                      </div>

                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0]">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="text-left hover:underline decoration-black/30 underline-offset-4 dark:decoration-white/30 cursor-pointer"
                        >
                          {project.title}
                        </button>
                      </h3>

                      <p className="mt-2.5 text-sm leading-relaxed text-[#555555] dark:text-[#b4b4ba]">
                        {project.summary}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/10">
                      <div className="text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                        {project.technologies.join(' · ')}
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#111111] dark:text-[#f3f3f0]">
                        {project.outcome}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          <section
            id="skills"
            className="mt-20 scroll-mt-12 border-t border-black/10 pt-12 dark:border-white/10 md:mt-24"
          >
            <ScrollReveal delayMs={0}>
              <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                03 · Technical Stack
              </div>
            </ScrollReveal>
            <ScrollWordReveal
              as="h2"
              text="Skills & Tooling"
              offset={['start 0.92', 'start 0.62']}
              className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0] sm:text-3xl"
            />

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {CV_PROFILE.skills.map((group, groupIdx) => (
                <div
                  key={group.title}
                  className="border-t border-black/10 pt-5 dark:border-white/10"
                >
                  <ScrollReveal delayMs={groupIdx * 90}>
                    <h3 className="text-sm font-semibold text-[#111111] dark:text-[#f3f3f0]">
                      {group.title}
                    </h3>
                  </ScrollReveal>
                  <ul className="mt-4 space-y-2.5 text-sm text-[#444444] dark:text-[#c4c4ca]">
                    {group.items.map((skill, skillIdx) => (
                      <li
                        key={skill}
                        className="border-b border-black/[0.06] pb-2 last:border-b-0 dark:border-white/[0.08]"
                      >
                        <ScrollReveal delayMs={groupIdx * 90 + 60 + skillIdx * 45} yOffset={12}>
                          <div className="flex items-center justify-between">
                            <span>{skill}</span>
                            <span className="font-mono-tabular text-xs text-[#9a9a9a] dark:text-[#6e6e74]">
                              —
                            </span>
                          </div>
                        </ScrollReveal>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Pixel Lab */}
          <PixelLabSection theme={theme} />

          {/* Education & Training */}
          <section
            id="education"
            className="mt-20 scroll-mt-12 border-t border-black/10 pt-12 dark:border-white/10 md:mt-24"
          >
            <ScrollReveal delayMs={0}>
              <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                05 · Academic Background
              </div>
            </ScrollReveal>
            <ScrollWordReveal
              as="h2"
              text="Education & Training"
              offset={['start 0.92', 'start 0.62']}
              className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0] sm:text-3xl"
            />

            <div className="mt-10 divide-y divide-black/10 border-y border-black/10 dark:divide-white/10 dark:border-white/10">
              {CV_PROFILE.education.map((edu, idx) => (
                <div
                  key={edu.program}
                  className="grid gap-4 py-7 md:grid-cols-12 md:items-baseline"
                >
                  <ScrollReveal delayMs={idx * 100} className="md:col-span-3">
                    <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                      {edu.period}
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delayMs={idx * 100 + 70} className="md:col-span-5">
                    <div>
                      <h3 className="text-lg font-semibold text-[#111111] dark:text-[#f3f3f0]">
                        {edu.program}
                      </h3>
                      <div className="mt-1 text-sm text-[#555555] dark:text-[#b4b4ba]">
                        {edu.institution} · {edu.location}
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delayMs={idx * 100 + 140} className="md:col-span-4">
                    <p className="text-sm leading-relaxed text-[#666666] dark:text-[#a0a0a6]">
                      {edu.note}
                    </p>
                  </ScrollReveal>
                </div>
              ))}
            </div>
          </section>

          {/* Contact & CV Footer */}
          <footer
            id="contact"
            className="mt-20 scroll-mt-12 border-t border-black/10 pt-12 dark:border-white/10 md:mt-24"
          >
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <ScrollReveal delayMs={0}>
                  <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
                    06 · Get in Touch
                  </div>
                </ScrollReveal>
                <ScrollWordReveal
                  as="h2"
                  text="Open to AI, Data Science & Software Internships."
                  offset={['start 0.95', 'start 0.72']}
                  className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-[#111111] [text-wrap:balance] dark:text-[#f3f3f0] sm:text-3xl"
                />

                <ScrollReveal delayMs={150}>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Magnetic strength={0.25}>
                      <button
                        type="button"
                        onClick={() => handleCopy(CV_PROFILE.email, 'email')}
                        className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:border-black/40 dark:border-white/15 dark:bg-[#16161a] dark:text-[#f3f3f0] dark:hover:border-white/40 cursor-pointer"
                      >
                        {copiedField === 'email' ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied {CV_PROFILE.email}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            {CV_PROFILE.email}
                          </>
                        )}
                      </button>
                    </Magnetic>

                    <Magnetic strength={0.25}>
                      <button
                        type="button"
                        onClick={() => handleCopy(CV_PROFILE.phone, 'phone')}
                        className="font-mono-tabular inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:border-black/40 dark:border-white/15 dark:bg-[#16161a] dark:text-[#f3f3f0] dark:hover:border-white/40 cursor-pointer"
                      >
                        {copiedField === 'phone' ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied {CV_PROFILE.phone}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            {CV_PROFILE.phone}
                          </>
                        )}
                      </button>
                    </Magnetic>
                  </div>
                </ScrollReveal>
              </div>

              <ScrollReveal delayMs={200}>
                <div className="flex flex-wrap items-center gap-3">
                  <Magnetic strength={0.28}>
                    <button
                      type="button"
                      onClick={() => setCvModalOpen(true)}
                      className="rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium text-[#111111] transition-colors hover:border-black/40 dark:border-white/15 dark:text-[#f3f3f0] dark:hover:border-white/40 cursor-pointer"
                    >
                      Preview Full CV
                    </button>
                  </Magnetic>
                  <Magnetic strength={0.3}>
                    <a
                      href={`mailto:${CV_PROFILE.email}`}
                      className="inline-block rounded-full bg-[#111111] px-5 py-2.5 text-xs font-medium text-white transition-transform hover:-translate-y-0.5 dark:bg-[#f3f3f0] dark:text-[#111111]"
                    >
                      Send Email
                    </a>
                  </Magnetic>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delayMs={240} yOffset={12}>
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6 text-xs text-[#7b7b7b] dark:border-white/10 dark:text-[#9a9aa0]">
                <span>
                  {CV_PROFILE.name} · {CV_PROFILE.location}
                </span>
                <span>BS Computer Science · Sindh Madressatul Islam University (SMIU)</span>
              </div>
            </ScrollReveal>
          </footer>
        </main>
      </div>

      {/* Floating Magnetic Theme Switcher */}
      <div className="no-print fixed bottom-5 right-7 z-40">
        <Magnetic strength={0.3}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 bg-white/90 px-4 text-xs font-medium text-[#111111] shadow-sm backdrop-blur-md transition-colors hover:border-black/35 dark:border-white/15 dark:bg-[#17171a]/90 dark:text-[#f3f3f0] dark:hover:border-white/35 cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dark</span>
              </>
            )}
          </button>
        </Magnetic>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenCv={() => setCvModalOpen(true)}
      />
      <CvPreviewModal open={cvModalOpen} onClose={() => setCvModalOpen(false)} />
    </div>
  );
}

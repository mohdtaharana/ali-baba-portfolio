import { Mail, MapPin, Phone } from 'lucide-react';
import { CV_PROFILE } from '../data/cvData';
import { ScrollReveal } from './ScrollReveal';
import { ScrollWordReveal } from './ScrollWordReveal';

const SUMMARY_HIGHLIGHTS = new Set([
  'Artificial',
  'Intelligence',
  'Data',
  'Science',
  'Machine',
  'Learning',
  'Python',
  'Java',
  'Saylani',
  'Mass',
  'IT',
  'Training',
  'Program',
]);

export function AnimatedProfileSection() {
  return (
    <section
      id="summary"
      className="scroll-mt-12 border-t border-black/10 pt-12 dark:border-white/10"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <ScrollReveal delayMs={0}>
            <div className="font-mono-tabular text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
              01 · Profile
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={70}>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#f3f3f0] sm:text-3xl">
              {CV_PROFILE.name}
            </h2>
          </ScrollReveal>

          <ScrollReveal delayMs={140}>
            <p className="mt-2 text-sm text-[#7b7b7b] dark:text-[#9a9aa0]">{CV_PROFILE.role}</p>
          </ScrollReveal>

          <div className="mt-5 space-y-2 text-sm text-[#3a3a3a] dark:text-[#c8c8cc]">
            <ScrollReveal delayMs={210}>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#7b7b7b] dark:text-[#9a9aa0]" aria-hidden="true" />
                <span>{CV_PROFILE.location}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={270}>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#7b7b7b] dark:text-[#9a9aa0]" aria-hidden="true" />
                <a
                  href={`mailto:${CV_PROFILE.email}`}
                  className="underline decoration-black/20 underline-offset-4 transition-colors hover:text-black hover:decoration-black dark:decoration-white/25 dark:hover:text-white dark:hover:decoration-white"
                >
                  {CV_PROFILE.email}
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={330}>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#7b7b7b] dark:text-[#9a9aa0]" aria-hidden="true" />
                <a
                  href={`tel:${CV_PROFILE.phone}`}
                  className="font-mono-tabular underline decoration-black/20 underline-offset-4 transition-colors hover:text-black hover:decoration-black dark:decoration-white/25 dark:hover:text-white dark:hover:decoration-white"
                >
                  {CV_PROFILE.phone}
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          <ScrollWordReveal
            text={CV_PROFILE.summary}
            highlights={SUMMARY_HIGHLIGHTS}
            offset={['start 0.88', 'end 0.52']}
            className="text-xl leading-[1.6] text-[#111111] dark:text-[#e6e6e2] sm:text-2xl sm:leading-[1.55]"
          />

          <div className="mt-10 grid gap-8 border-t border-black/10 pt-8 dark:border-white/10 sm:grid-cols-2">
            <ScrollReveal delayMs={120}>
              <div>
                <div className="text-xs font-semibold text-[#7b7b7b] dark:text-[#9a9aa0]">
                  Languages
                </div>
                <p className="mt-2 text-sm text-[#111111] dark:text-[#f3f3f0]">
                  {CV_PROFILE.languages.map((l) => `${l.name} (${l.level})`).join(' · ')}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={200}>
              <div>
                <div className="text-xs font-semibold text-[#7b7b7b] dark:text-[#9a9aa0]">
                  Interests
                </div>
                <p className="mt-2 text-sm text-[#111111] dark:text-[#f3f3f0]">
                  {CV_PROFILE.interests.join(' · ')}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

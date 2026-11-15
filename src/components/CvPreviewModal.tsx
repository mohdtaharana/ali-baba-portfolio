import { useEffect, useState } from 'react';
import { X, Download, Printer, Mail, MapPin, Phone, Check } from 'lucide-react';
import { Magnetic } from './Magnetic';
import { CV_PROFILE } from '../data/cvData';

interface CvPreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function CvPreviewModal({ open, onClose }: CvPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await fetch(CV_PROFILE.pdfPath);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Ali-Baba-CV.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      const link = document.createElement('a');
      link.href = CV_PROFILE.pdfPath;
      link.download = 'Ali-Baba-CV.pdf';
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] dark:bg-black/75 sm:p-5 print:static print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f7f7f5] text-[#111111] shadow-2xl dark:border-white/10 dark:bg-[#141417] dark:text-[#f3f3f0] print:max-h-none print:rounded-none print:border-0 print:bg-white print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#f7f7f5] px-5 py-4 dark:border-white/10 dark:bg-[#141417] sm:px-6">
          <div>
            <h3 id="cv-modal-title" className="text-base font-semibold tracking-tight">
              {CV_PROFILE.name} — Curriculum Vitae
            </h3>
            <p className="text-xs text-[#7b7b7b] dark:text-[#9a9aa0]">
              {CV_PROFILE.role} · {CV_PROFILE.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Magnetic strength={0.25}>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:border-black/40 dark:border-white/15 dark:bg-[#1e1e22] dark:text-[#f3f3f0] dark:hover:border-white/40 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print CV
              </button>
            </Magnetic>
            <Magnetic strength={0.28}>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 dark:bg-[#f3f3f0] dark:text-[#111111] cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    {downloading ? 'Preparing...' : 'Download PDF'}
                  </>
                )}
              </button>
            </Magnetic>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close CV preview"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#111111] transition-colors hover:bg-black hover:text-white dark:border-white/15 dark:bg-[#1e1e22] dark:text-[#f3f3f0] dark:hover:bg-white dark:hover:text-[#111111] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Paper CV Sheet */}
        <div className="flex-1 overflow-y-auto bg-[#ecece8] p-4 dark:bg-[#0b0b0d] sm:p-8 print:overflow-visible print:bg-white print:p-0">
          <article className="mx-auto max-w-[780px] rounded-xl border border-black/10 bg-white px-6 py-8 shadow-sm sm:px-11 sm:py-11 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
            {/* CV Header */}
            <header className="flex flex-col justify-between gap-4 border-b border-[#111111] pb-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#111111]">
                  {CV_PROFILE.name}
                </h1>
                <p className="mt-1 text-sm font-medium text-[#4a4a4a]">
                  BS Computer Science Student | AI &amp; Data Science
                </p>
              </div>

              <div className="space-y-1 text-xs text-[#333333] sm:text-right">
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <Phone className="h-3 w-3 text-[#7b7b7b]" aria-hidden="true" />
                  <span className="font-mono-tabular">{CV_PROFILE.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <Mail className="h-3 w-3 text-[#7b7b7b]" aria-hidden="true" />
                  <a
                    href={`mailto:${CV_PROFILE.email}`}
                    className="underline decoration-black/25 underline-offset-2"
                  >
                    {CV_PROFILE.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <MapPin className="h-3 w-3 text-[#7b7b7b]" aria-hidden="true" />
                  <span>{CV_PROFILE.location}</span>
                </div>
              </div>
            </header>

            {/* Summary */}
            <section className="mt-6">
              <h2 className="border-b border-black/20 pb-1 text-xs font-semibold tracking-wider text-[#111111]">
                SUMMARY
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#2a2a2a]">
                {CV_PROFILE.summary}
              </p>
            </section>

            {/* Education */}
            <section className="mt-6">
              <h2 className="border-b border-black/20 pb-1 text-xs font-semibold tracking-wider text-[#111111]">
                EDUCATION
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#111111]">BS Computer Science</h3>
                    <span className="font-mono-tabular text-xs text-[#555555]">
                      Expected Graduation: 2026
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13.5px] text-[#3a3a3a]">
                    Sindh Madressatul Islam University (SMIU) · Karachi, Pakistan
                  </p>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#111111]">
                      Saylani Mass IT Training Program
                    </h3>
                    <span className="font-mono-tabular text-xs text-[#555555]">Ongoing</span>
                  </div>
                  <p className="mt-0.5 text-[13.5px] text-[#3a3a3a]">
                    Practical training in Python, Data Preprocessing, and Machine Learning workflows
                  </p>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="mt-6">
              <h2 className="border-b border-black/20 pb-1 text-xs font-semibold tracking-wider text-[#111111]">
                SKILLS
              </h2>
              <div className="mt-3 space-y-1.5 text-[13.5px] leading-relaxed text-[#2a2a2a]">
                <p>
                  <span className="font-semibold text-[#111111]">Languages:</span> Python · Java · C
                </p>
                <p>
                  <span className="font-semibold text-[#111111]">Libraries &amp; Tools:</span> Pandas ·
                  NumPy · Matplotlib · Seaborn · Scikit-learn
                </p>
                <p>
                  <span className="font-semibold text-[#111111]">Domains:</span> Machine Learning ·
                  Deep Learning · Data Analysis · Data Visualization · MySQL Database · Arduino
                </p>
              </div>
            </section>

            {/* Projects */}
            <section className="mt-6">
              <h2 className="border-b border-black/20 pb-1 text-xs font-semibold tracking-wider text-[#111111]">
                PROJECTS
              </h2>
              <div className="mt-3 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">
                    Automatic Door Locking System
                  </h3>
                  <p className="text-xs text-[#555555]">Technologies: Arduino, Sensors</p>
                  <p className="mt-1 text-[13.5px] text-[#2a2a2a]">
                    Result: Automated security system for controlling door access.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">
                    Hospital Management System
                  </h3>
                  <p className="text-xs text-[#555555]">Technologies: Java, MySQL Database</p>
                  <p className="mt-1 text-[13.5px] text-[#2a2a2a]">
                    Result: Digital management of patient records and appointments.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">
                    Library Management System
                  </h3>
                  <p className="text-xs text-[#555555]">Technologies: Java, MySQL Database</p>
                  <p className="mt-1 text-[13.5px] text-[#2a2a2a]">
                    Result: Faster book management and borrowing system.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">
                    AI-Powered Medical Image Analysis System
                  </h3>
                  <p className="text-xs text-[#555555]">Technologies: Python, Deep Learning</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[#2a2a2a]">
                    Developed an AI-based system to analyze medical images and detect multiple
                    diseases. Built a deep learning model capable of detecting 15+ diseases from 7
                    different types of medical images.
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section className="mt-6 border-t border-black/10 pt-4">
              <h2 className="border-b border-black/20 pb-1 text-xs font-semibold tracking-wider text-[#111111]">
                ADDITIONAL INFORMATION
              </h2>
              <div className="mt-3 space-y-1.5 text-[13.5px] text-[#2a2a2a]">
                <p>
                  <span className="font-semibold text-[#111111]">Languages:</span>{' '}
                  {CV_PROFILE.languages.map((l) => `${l.name} (${l.level})`).join(' · ')}
                </p>
                <p>
                  <span className="font-semibold text-[#111111]">Interests:</span>{' '}
                  {CV_PROFILE.interests.join(' · ')}
                </p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}

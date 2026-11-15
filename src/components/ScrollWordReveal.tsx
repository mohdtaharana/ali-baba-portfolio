import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';

interface WordProps {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  highlight?: boolean;
}

function ScrollWord({ word, progress, range, highlight = false }: WordProps) {
  const opacity = useTransform(progress, range, [0.16, 1]);

  return (
    <span className="relative mr-[0.27em] inline-block">
      <motion.span
        style={{ opacity }}
        className={`inline-block will-change-[opacity] ${
          highlight ? 'font-semibold text-[#111111] dark:text-[#f5f5f2]' : ''
        }`}
      >
        {word}
      </motion.span>
    </span>
  );
}

interface ScrollWordRevealProps {
  text: string;
  className?: string;
  as?: 'p' | 'h2';
  highlights?: ReadonlySet<string>;
  offset?: [
    `${'start' | 'center' | 'end'} ${number}` | 'start end' | 'start center' | 'end start',
    `${'start' | 'center' | 'end'} ${number}` | 'start start' | 'start center' | 'end center'
  ];
}

export function ScrollWordReveal({
  text,
  className = '',
  as = 'p',
  highlights,
  offset = ['start 0.9', 'end 0.56'],
}: ScrollWordRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset,
  });

  const words = text.split(' ');
  const Tag = as;

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef}>
        <Tag className={className}>{text}</Tag>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Tag className={className}>
        {words.map((word, idx) => {
          const start = (idx / words.length) * 0.82;
          const end = Math.min(1, start + 1 / words.length + 0.16);
          const cleanWord = word.replace(/[.,]/g, '');
          const isHighlight = Boolean(
            highlights && (highlights.has(word) || highlights.has(cleanWord))
          );

          return (
            <ScrollWord
              key={`${word}-${idx}`}
              word={word}
              progress={scrollYProgress}
              range={[start, end]}
              highlight={isHighlight}
            />
          );
        })}
      </Tag>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import content from '../../data/content.json';

// 하트 외곽선 path (stroke 드로잉 애니메이션용)
const HEART_PATH =
  'M12 21s-6.55-4.36-9.33-8.2C.86 10.27 1.62 6.9 4.31 5.53 6.42 4.45 8.9 5.06 10.2 6.78L12 9.1l1.8-2.32c1.3-1.72 3.78-2.33 5.89-1.25 2.69 1.37 3.45 4.74 1.64 7.27C18.55 16.64 12 21 12 21z';

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  // D-day: content.json 날짜를 단일 소스로 사용
  const isoDate = content.hero.date.replace(/\./g, '-');
  const dDay = Math.max(
    0,
    Math.ceil((new Date(`${isoDate}T00:00:00`) - new Date()) / 86400000)
  );

  useEffect(() => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setIsLoading(false);
    };

    // 메인 이미지가 실제로 로드되면 종료(살짝 여유), 아니면 최대 2.8초 후 종료
    const img = new Image();
    img.onload = () => setTimeout(finish, 700);
    img.src = '/Wedding/images/main.jpg';
    const timer = setTimeout(finish, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] bg-theme-bg flex flex-col items-center justify-center px-6"
        >
          {/* 그려지는 하트 모노그램 */}
          <motion.svg
            viewBox="0 0 24 24"
            className="w-14 h-14 mb-6"
            fill="none"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.path
              d={HEART_PATH}
              stroke="var(--color-theme-accent)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
            />
          </motion.svg>

          {/* 이니셜 (디스플레이 세리프) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="font-display text-5xl md:text-6xl tracking-wide text-brand"
          >
            J <span className="text-theme-accent">&amp;</span> S
          </motion.div>

          {/* 골드 헤어라인 */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '6rem', opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: 'easeInOut' }}
            className="h-px my-5 bg-theme-accent/70"
          />

          {/* 날짜 + D-day */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="text-center"
          >
            <p className="font-display text-lg tracking-[0.35em] text-white/80">
              {content.hero.date.replace(/\./g, '. ')}
            </p>
            <p className="mt-2 text-[11px] tracking-[0.3em] uppercase text-white/45">
              {dDay > 0 ? `D-${dDay}` : 'The Day'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import content from '../../data/content.json';

// v2: 커플 사진(load.webp)을 풀스크린으로 보여주는 인트로.
// 사진 상단 절반이 밝은 페리윙클 하늘이라 텍스트는 상단에 딥 슬레이트 톤으로 얹는다.
const SLATE = '#3d4964';

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  // D-day: content.json 날짜를 단일 소스로 사용
  const isoDate = content.hero.date.replace(/\./g, '-');
  const dDay = Math.max(
    0,
    Math.ceil((new Date(`${isoDate}T00:00:00`) - new Date()) / 86400000)
  );

  useEffect(() => {
    // 사진과 텍스트 연출을 충분히 보여주기 위한 최소 노출 시간
    const MIN_MS = 3000;
    const MAX_MS = 4500;
    const start = Date.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setIsLoading(false);
    };
    const tryFinish = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= MIN_MS) finish();
      else setTimeout(finish, MIN_MS - elapsed);
    };

    // 히어로 이미지가 로드되면(최소 시간 보장 후) 종료, 최대 시간엔 무조건 종료
    const img = new Image();
    img.onload = tryFinish;
    img.onerror = tryFinish;
    img.src = '/Wedding/images/hero.webp';
    const maxTimer = setTimeout(finish, MAX_MS);

    return () => clearTimeout(maxTimer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-[#b7c6e9]"
        >
          {/* 풀스크린 커플 사진 — 커플이 하단에 있어 아래 기준으로 크롭 */}
          <motion.img
            src="/Wedding/images/load.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* 상단 하늘을 살짝 더 밝혀 텍스트 가독성 확보 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.28), transparent 42%)' }}
          />

          {/* 하늘 영역(상단)에 얹는 텍스트 블록 */}
          <div className="absolute inset-x-0 top-[11vh] flex flex-col items-center px-6">
            {/* 이니셜 (필기체, 은은히 흩날리듯 등장) */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
              className="font-script text-7xl md:text-8xl leading-none"
              style={{ color: SLATE }}
            >
              J <span className="opacity-60">&amp;</span> S
            </motion.div>

            {/* 헤어라인 */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '6rem', opacity: 0.5 }}
              transition={{ duration: 1.2, delay: 0.9, ease: 'easeInOut' }}
              className="h-px my-5"
              style={{ backgroundColor: SLATE }}
            />

            {/* 날짜 + D-day */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="text-center"
              style={{ color: SLATE }}
            >
              <p className="font-display text-lg tracking-[0.35em]">
                {content.hero.date.replace(/\./g, '. ')}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.3em] uppercase opacity-60">
                {dDay > 0 ? `D-${dDay}` : 'The Day'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;

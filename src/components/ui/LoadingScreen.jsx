import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import content from '../../data/content.json';

// v2: 커플 사진(load.webp)을 풀스크린으로 보여주는 인트로.
// 텍스트는 상단 하늘 위에 흰색으로 — 상단 스크림 + 소프트 섀도로 가독성 확보.

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  // D-day: content.json 날짜를 단일 소스로 사용
  const isoDate = content.hero.date.replace(/\./g, '-');
  const dDay = Math.max(
    0,
    Math.ceil((new Date(`${isoDate}T00:00:00`) - new Date()) / 86400000)
  );

  useEffect(() => {
    // 현상(2.4s) 연출 후 사진을 충분히 감상할 여유를 주고 종료
    const MIN_MS = 5000;
    const MAX_MS = 6500;
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
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-[#b7c6e9]"
        >
          {/* 사진 레이어: 바깥 = 느린 줌(Ken Burns), 안쪽 = 필름 현상(develop) 효과.
              transform 충돌을 피하려고 줌과 현상을 레이어로 분리 */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 4.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 커플이 하단에 있어 아래 기준으로 크롭. 뿌옇고 밝은 상태에서 서서히 현상됨 */}
            <motion.img
              src="/Wedding/images/load.webp"
              alt=""
              className="h-full w-full object-cover object-bottom"
              initial={{ opacity: 0, filter: 'blur(18px) brightness(1.2) saturate(0.7)' }}
              animate={{ opacity: 1, filter: 'blur(0px) brightness(1) saturate(1)' }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
            />
          </motion.div>

          {/* 필름 그레인: 원본 사진의 날 것 느낌을 눌러주는 질감 */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.09] mix-blend-overlay"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
          />

          {/* 상단 스크림: 밝은 하늘 위 흰색 텍스트가 묻히지 않게 살짝 어둡게 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(38,48,72,0.34), transparent 45%)' }}
          />

          {/* 하늘 영역(상단)에 얹는 텍스트 블록 — svh로 모바일 주소창 유무와 무관하게 고정 */}
          <div
            className="absolute inset-x-0 top-[10svh] flex flex-col items-center px-6 text-white"
            style={{ textShadow: '0 1px 14px rgba(35,45,70,0.55)' }}
          >
            {/* 이니셜 — 미니멀 세리프 (캘리그라피 X) */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, delay: 1.0, ease: 'easeOut' }}
              className="font-display text-base md:text-lg tracking-[0.5em] leading-none pl-[0.5em]"
            >
              J <span className="opacity-70">&amp;</span> S
            </motion.div>

            {/* 헤어라인 */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '6rem', opacity: 0.7 }}
              transition={{ duration: 1.2, delay: 1.4, ease: 'easeInOut' }}
              className="h-px my-5 bg-white"
            />

            {/* 날짜 + D-day */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="text-center"
            >
              <p className="font-display text-lg tracking-[0.35em] text-white/95">
                {content.hero.date.replace(/\./g, '. ')}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.3em] uppercase text-white/75">
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

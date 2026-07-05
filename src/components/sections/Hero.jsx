import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import content from '../../data/content.json';
import DDayCounter from '../ui/DDayCounter';

const Hero = () => {
  const { hero } = content;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // content.json의 날짜/시간을 단일 소스로 사용 ("2026.09.20" -> "2026-09-20")
  const isoDate = hero.date.replace(/\./g, '-');
  const targetDate = `${isoDate}T${hero.time}:00`;
  const weddingDate = new Date(isoDate);
  const dayOfWeek = weddingDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  // 배경 이미지만 스크롤에 따라 천천히 움직이게 설정 (Parallax 효과 유지)
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-svh w-full overflow-hidden bg-theme-bg">
      {/* Background Image Area - Portrait Optimization */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {/* Ken Burns: 아주 느린 줌으로 커버에 생명감. v2: 소프트 블러로 몽환적 배경 처리 */}
        <motion.img
          src="/Wedding/images/hero.webp"
          alt="Wedding Hero"
          className="h-full w-full object-cover blur-[6px]"
          initial={{ scale: 1.16 }}
          animate={{ scale: [1.16, 1.06, 1.16] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 비네트: 가장자리를 살짝 어둡게 (밝은 무드에 맞게 강도 완화) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(115% 85% at 50% 32%, transparent 48%, rgba(0,0,0,0.38) 100%)' }}
        />
        {/* 톤 오버레이 */}
        <div className="absolute inset-0 bg-black/15"></div>
        {/* 필름 그레인 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />
      </motion.div>

      {/* 하단 페이드: 사진이 페이지 배경색(테마 대응)으로 자연스럽게 이어지도록.
          날짜/카운트다운(75% 지점)이 이 그라데이션 위에 놓이므로 h-2/5로 넉넉히 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-theme-bg) 78%)' }}
      />

      {/* Content Area */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full w-full max-w-[430px] mx-auto"
      >
        {/* 25% Position: Intro Text Group with Lines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="absolute top-[30%] left-0 w-full -translate-y-1/2 text-center"
        >
          <div className="inline-flex flex-col items-center">
            {/* Top Line */}
            <div className="w-full h-[1px] bg-white/60 mb-6"></div>

            <p className="font-display text-base md:text-lg tracking-[0.25em] uppercase text-white/90 mb-4 px-2">
              We are getting <span className="italic font-semibold text-[#f2b491]">married</span>
            </p>

            {/* Names */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            >
              <span className="text-2xl md:text-3xl font-light text-white tracking-widest">
                {hero.groomName} <span className="text-[#e3c28f]">&</span> {hero.brideName}
              </span>
            </motion.div>

            {/* Bottom Line */}
            <div className="w-full h-[1px] bg-white/60 mt-6"></div>

            {/* 날짜/시간 — 하단은 배경에 묻혀서 상단 어두운 수풀 위에 흰색으로 배치 */}
            <p className="mt-5 font-display text-base md:text-lg text-white/95 tracking-[0.2em]">
              {hero.date} <span className="text-[#f2b491]">{dayOfWeek}</span> {hero.time}
            </p>
          </div>
        </motion.div>

        {/* 75% Position: Date & Countdown Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
          className="absolute top-[75%] left-0 w-full -translate-y-1/2 text-center"
        >
          <DDayCounter targetDate={targetDate} />
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-[9px] text-fg-muted uppercase tracking-widest mb-2">Scroll</span>
          <svg
            className="w-6 h-6 text-fg-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
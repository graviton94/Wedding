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

  // 배경 이미지만 스크롤에 따라 천천히 움직이게 설정 (Parallax 효과 유지)
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-[#0F0F0F]">
      {/* Background Image Area - Portrait Optimization */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src="/Wedding/images/main.jpg"
          alt="Wedding Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
      >
        <div className="max-w-[430px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            <p className="text-white text-sm md:text-base mb-6 tracking-[0.3em] uppercase font-['Noto_Sans_KR']">
              We are getting <span className="italic text-theme-primary font-bold">married</span>
            </p>
            <h1 className="text-5xl md:text-7xl font-['Playfair_Display'] text-white mb-8 leading-tight">
              Our Wedding
            </h1>
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className="text-3xl md:text-4xl font-light text-white font-['Playfair_Display']">
                {hero.groomName} & {hero.brideName}
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-xl md:text-2xl text-white font-bold font-['Noto_Sans_KR'] tracking-wide">
                {hero.date} {hero.time}
              </p>
              <p className="text-base md:text-lg text-white/90 font-light font-['Noto_Sans_KR']">
                {hero.location}
              </p>

              {/* D-Day Counter */}
              <DDayCounter targetDate="2026-09-20T12:30:00" />
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-[10px] text-white uppercase tracking-widest mb-2">Scroll</span>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
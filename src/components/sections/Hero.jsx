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

  // Calculate day of week
  const weddingDate = new Date('2026-09-20');
  const dayOfWeek = weddingDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

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
            <p className="text-xs md:text-sm mb-5 tracking-[0.3em] uppercase text-white">
              We are getting <span className="italic font-bold" style={{ color: '#E16A7B' }}>married</span>
            </p>
            <h1 className="text-4xl md:text-6xl text-white mb-6 leading-tight">
              Our Wedding
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-2xl md:text-3xl font-light text-white">
                {hero.groomName} & {hero.brideName}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-lg md:text-xl text-white font-bold tracking-wide">
                {hero.date} <span style={{ color: '#E16A7B' }}>{dayOfWeek}</span> {hero.time}
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
            <span className="text-[9px] text-white uppercase tracking-widest mb-2">Scroll</span>
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
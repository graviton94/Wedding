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

            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-white font-light mb-4 px-2">
              We are getting <span className="italic font-bold" style={{ color: '#D6635C' }}>married</span>
            </p>

            {/* Names */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            >
              <span className="text-2xl md:text-3xl font-light text-white tracking-widest">
                {hero.groomName} & {hero.brideName}
              </span>
            </motion.div>

            {/* Bottom Line */}
            <div className="w-full h-[1px] bg-white/60 mt-6"></div>
          </div>
        </motion.div>

        {/* 75% Position: Date & Countdown Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
          className="absolute top-[75%] left-0 w-full -translate-y-1/2 text-center space-y-6"
        >
          <p className="text-xs md:text-sm text-white font-bold tracking-widest">
            {hero.date} <span style={{ color: '#D6635C' }}>{dayOfWeek}</span> {hero.time}
          </p>
          <DDayCounter targetDate="2026-09-20T12:30:00" />
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
      </motion.div>
    </section>
  );
};

export default Hero;
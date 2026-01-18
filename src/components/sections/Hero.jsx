import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import content from '../../data/content.json';

const Hero = () => {
  const { hero } = content;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-[#FDFCF0]">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
      >
        <div className="max-w-[430px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-[#D4AF37] text-sm md:text-base mb-4 tracking-widest uppercase font-['Noto_Sans_KR']">
              {hero.title}
            </p>
            <h1 className="text-5xl md:text-6xl font-['Playfair_Display'] text-[#333333] mb-6">
              Our Wedding
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-2xl md:text-3xl font-light text-[#333333] font-['Playfair_Display']">
                {hero.groomName} & {hero.brideName}
              </span>
            </div>
            <p className="text-lg md:text-xl text-[#333333] mb-4 font-['Noto_Sans_KR']">
              {hero.date}
            </p>
            <p className="text-base md:text-lg text-[#333333] font-['Noto_Sans_KR']">
              {hero.location}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[#D4AF37]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#D4AF37] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#D4AF37] rounded-full opacity-10 blur-3xl"></div>
    </section>
  );
};

export default Hero;

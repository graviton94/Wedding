import { motion, useScroll, useSpring } from 'framer-motion';

// 페이지 상단의 얇은 골드 진행바
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{ scaleX, backgroundColor: 'var(--color-theme-accent)' }}
    />
  );
};

export default ScrollProgress;

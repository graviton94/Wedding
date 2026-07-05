import { motion } from 'framer-motion';
import content from '../../data/content.json';

const Footer = () => {
  const { hero } = content;

  return (
    <footer className="bg-theme-bg border-t border-theme-accent/20 py-14 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-[430px] mx-auto flex flex-col items-center gap-3"
      >
        {/* 모노그램 */}
        <div className="font-display text-base tracking-[0.5em] pl-[0.5em] leading-none text-theme-accent">J &amp; S</div>

        {/* 골드 ❦ 라인 */}
        <div className="flex items-center justify-center gap-2 my-1">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-theme-accent/50" />
          <span className="text-theme-accent/80 text-xs leading-none">&#10086;</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-theme-accent/50" />
        </div>

        <p className="text-fg text-sm">함께해 주셔서 감사합니다.</p>
        <p className="font-display italic text-fg-muted text-base">We can't wait to celebrate with you!</p>
        <p className="mt-3 text-xs text-fg-subtle tracking-wider tabular-nums">
          {hero.date.replace(/\./g, '. ')} · {hero.groomName} &amp; {hero.brideName}
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;

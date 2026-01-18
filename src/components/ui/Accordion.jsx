import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/5 last:border-0 mb-4 overflow-hidden rounded-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 px-6 flex items-center justify-between text-left bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 group shadow-sm border border-white/20"
      >
        <span className="text-lg font-bold text-theme-primary font-['Noto_Sans_KR'] group-hover:translate-x-1 transition-transform duration-300">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.2 : 1 }}
          transition={{ duration: 0.3 }}
          className="text-theme-primary text-xl"
        >
          ↓
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Accordion = ({ children }) => {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
};

Accordion.Item = AccordionItem;

export default Accordion;

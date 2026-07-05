import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import content from '../../data/content.json';

const Share = () => {
  const { share } = content;
  const [showToast, setShowToast] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      // 클립보드 API를 쓸 수 없는 환경(구형 브라우저/비보안 컨텍스트) 폴백
      window.prompt('아래 주소를 복사해 주세요', window.location.href);
    }
  };

  return (
    <section className="py-10 px-4 bg-theme-bg text-center">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] backdrop-blur-md bg-brand/80 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm whitespace-nowrap border border-white/20"
          >
            ✓ 청첩장 주소가 복사되었습니다!
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl text-theme-primary mb-2">
            {share.title}
          </h2>
          <p className="text-fg-muted text-xs mb-6">
            {share.subtitle}
          </p>

          <div>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full"
            >
              링크 주소 복사하기
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Share;

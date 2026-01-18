import { motion } from 'framer-motion';
import { useState } from 'react';

const Share = () => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleKakaoShare = () => {
    // KakaoTalk share functionality would be implemented here
    // For now, this is a placeholder
    if (window.Kakao && window.Kakao.Link) {
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: 'We are getting married!',
          description: 'Please join us on our special day',
          imageUrl: window.location.origin + '/wedding-image.jpg',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      });
    } else {
      alert('KakaoTalk sharing is not available. Please use "Copy Link" instead.');
    }
  };

  return (
    <section className="py-20 px-4 bg-[#FDFCF0]">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] text-[#333333] mb-8">
            Share Our Joy
          </h2>
          <p className="text-[#333333] text-base mb-8 font-['Noto_Sans_KR']">
            소중한 분들과 이 기쁨을 나누어 주세요
          </p>

          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleKakaoShare}
              className="w-full bg-[#FEE500] text-[#333333] py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#FDD835] transition-colors flex items-center justify-center gap-2"
            >
              <span>💬</span>
              <span>Share on KakaoTalk</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyLink}
              className="w-full bg-white text-[#D4AF37] border-2 border-[#D4AF37] py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#D4AF37] hover:text-white transition-colors"
            >
              {copyFeedback ? '✓ Link Copied!' : '🔗 Copy Link'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Share;

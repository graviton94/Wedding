import { motion } from 'framer-motion';
import { useState } from 'react';
import content from '../../data/content.json';

const Share = () => {
  const { share } = content;
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
          title: share.title,
          description: share.subtitle,
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
    <section className="py-20 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-theme-primary mb-4">
            {share.title}
          </h2>
          <p className="text-white text-base mb-8 font-['Noto_Sans_KR']">
            {share.subtitle}
          </p>

          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleKakaoShare}
              className="w-full bg-[#FEE500] text-black border-2 border-black py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-3"
            >
              <img
                src="https://i.namu.wiki/i/lXr7m01ZyyI7UqpH4ogeDHcLY4pCiysnwCvNf8VlULO4aMqE7mX8ww-VLKjIAuKdIO6XniPyCBx4zyI7LK--7shuXBlp9GEQUhZcbzWNULYHhb88FjgXDLgPqZwzJA9BymVRndsCIRTbvEtUraowxQ.svg"
                alt="KakaoTalk"
                className="w-5 h-5"
              />
              <span>Share on KakaoTalk</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyLink}
              className="w-full bg-theme-primary text-white py-4 px-6 rounded-lg font-semibold text-lg active:bg-theme-primary-active transition-colors"
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

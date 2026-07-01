import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import content from '../../data/content.json';

const Gallery = () => {
  const { gallery } = content;
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const images = gallery.images;

  const openModal = (index) => {
    setSelectedImageIndex(index);
    setActiveSlide(index);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2600);
  };

  // 펼치기 전 표시 개수: 대표컷 1 + 썸네일 6 = 총 7 (1 / 3 / 3)
  const INITIAL_IMAGE_COUNT = 7;

  const displayedImages = showAll ? images : images.slice(0, INITIAL_IMAGE_COUNT);

  return (
    <section className="py-8 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-3xl text-theme-primary mb-2">
            {gallery.title}
          </h2>
          <p className="text-fg-muted text-sm">
            {gallery.subtitle}
          </p>
        </motion.div>

        {/* 3x3 Grid Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-3 gap-2 mb-6"
              layout
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {displayedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: showAll ? (index >= INITIAL_IMAGE_COUNT ? (index - INITIAL_IMAGE_COUNT) * 0.05 : 0) : 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className={`overflow-hidden rounded-lg shadow-lg cursor-pointer ${index === 0 ? 'col-span-3 aspect-[16/10]' : 'aspect-square'}`}
                  onClick={() => openModal(index)}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Show More Button */}
          {!showAll && images.length > INITIAL_IMAGE_COUNT && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(true)}
                className="border-theme-primary/30 text-theme-primary hover:bg-white/5 px-8 py-2 text-sm"
              >
                더보기
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal with Swiper for full-size images */}
      <Modal isOpen={selectedImageIndex !== null} onClose={() => setSelectedImageIndex(null)}>
        {selectedImageIndex !== null && (
          <div className="relative w-full h-full flex items-center justify-center">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              initialSlide={selectedImageIndex}
              onSlideChange={(s) => { setActiveSlide(s.activeIndex); setShowHint(false); }}
              className="modal-swiper w-full h-full"
            >
              {images.map((image) => (
                <SwiperSlide key={image.id}>
                  <div className="flex items-center justify-center h-full">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* 사진 번호 */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs tracking-widest tabular-nums pointer-events-none">
              {activeSlide + 1} / {images.length}
            </div>

            {/* 스와이프 힌트 (잠시 후 사라짐) */}
            <AnimatePresence>
              {showHint && images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[11px] tracking-wider pointer-events-none"
                >
                  ← 밀어서 넘기기 →
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Gallery;

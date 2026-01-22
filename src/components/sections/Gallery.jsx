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
  const images = gallery.images;

  // Number of images to display initially
  const INITIAL_IMAGE_COUNT = 9;

  // Show first 9 images by default, all when expanded
  const displayedImages = showAll ? images : images.slice(0, INITIAL_IMAGE_COUNT);

  return (
    <section className="py-16 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl text-theme-primary mb-3">
            {gallery.title}
          </h2>
          <p className="text-white text-base">
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer"
                  onClick={() => setSelectedImageIndex(showAll ? index : index)}
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
          <div className="w-full h-full flex items-center justify-center">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              initialSlide={selectedImageIndex}
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
          </div>
        )}
      </Modal>

      <style jsx>{`
        .modal-swiper {
          --swiper-navigation-color: #FF6F61;
          --swiper-pagination-color: #FF6F61;
        }
      `}</style>
    </section>
  );
};

export default Gallery;

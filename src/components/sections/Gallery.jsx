import { motion } from 'framer-motion';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Modal from '../ui/Modal';
import content from '../../data/content.json';

const Gallery = () => {
  const { gallery } = content;
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const images = gallery.images;

  return (
    <section className="py-20 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-theme-primary mb-4">
            {gallery.title}
          </h2>
          <p className="text-white text-lg font-['Noto_Sans_KR']">
            {gallery.subtitle}
          </p>
        </motion.div>

        {/* Horizontal Swiper Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView="auto"
            navigation
            pagination={{ clickable: true }}
            className="gallery-swiper"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.id} style={{ width: '400px' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-[400px] h-[400px] overflow-hidden rounded-lg shadow-lg cursor-pointer"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
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
        .gallery-swiper {
          padding: 20px 0 50px;
        }
        .modal-swiper {
          --swiper-navigation-color: #FF6F61;
          --swiper-pagination-color: #FF6F61;
        }
      `}</style>
    </section>
  );
};

export default Gallery;

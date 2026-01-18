import { motion } from 'framer-motion';
import { useState } from 'react';
import Modal from '../ui/Modal';
import content from '../../data/content.json';

const Gallery = () => {
  const { gallery } = content;
  const [selectedImage, setSelectedImage] = useState(null);

  const images = gallery.images;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-theme-primary mb-4">
            {gallery.title}
          </h2>
          <p className="text-white text-lg font-['Noto_Sans_KR']">
            {gallery.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-4"
        >
          {images.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="aspect-[3/4] overflow-hidden rounded-lg shadow-lg cursor-pointer"
              onClick={() => setSelectedImage(image)}
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
      </div>

      {/* Modal for full-size image */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        {selectedImage && (
          <img
            src={selectedImage.url}
            alt={selectedImage.alt}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        )}
      </Modal>
    </section>
  );
};

export default Gallery;

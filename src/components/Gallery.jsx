import { motion } from 'framer-motion';
import { useState } from 'react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Placeholder images - in a real app, these would be actual photos
  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop', alt: 'Wedding photo 1' },
    { id: 2, url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=800&fit=crop', alt: 'Wedding photo 2' },
    { id: 3, url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=800&fit=crop', alt: 'Wedding photo 3' },
    { id: 4, url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=800&fit=crop', alt: 'Wedding photo 4' },
    { id: 5, url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=800&fit=crop', alt: 'Wedding photo 5' },
    { id: 6, url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=800&fit=crop', alt: 'Wedding photo 6' },
  ];

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
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            Our Moments
          </h2>
          <p className="text-gray-600 text-lg">
            Precious memories we've shared together
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
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
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={selectedImage.url}
            alt={selectedImage.alt}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            className="absolute top-4 right-4 text-white text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default Gallery;

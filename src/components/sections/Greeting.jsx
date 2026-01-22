import { motion } from 'framer-motion';
import content from '../../data/content.json';

const Greeting = () => {
  const { greeting } = content;

  return (
    <section className="py-10 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3"
        >
          {greeting.messages.map((message, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
              className="text-white text-base leading-relaxed"
            >
              {message}
            </motion.p>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-8"
          >
            <p className="text-theme-primary text-lg font-bold tracking-wide">
              {greeting.closing}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Greeting;

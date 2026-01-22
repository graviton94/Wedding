import { motion } from 'framer-motion';
import content from '../../data/content.json';

const RSVP = () => {
    const { rsvp } = content;

    return (
        <section className="py-10 px-4 bg-theme-bg">
            <div className="max-w-[430px] mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl text-theme-primary mb-3">
                        {rsvp.title}
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 space-y-6"
                >
                    <div className="space-y-4">
                        <p className="text-black/70 text-base leading-relaxed break-keep font-medium whitespace-pre-wrap">
                            {rsvp.description}
                        </p>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="pt-2"
                    >
                        <a
                            href={rsvp.formUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-10 py-3.5 text-white rounded-full text-base font-bold tracking-wider shadow-lg hover:brightness-110 transition-all duration-300"
                            style={{ backgroundColor: '#E16A7B' }}
                        >
                            {rsvp.buttonText}
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default RSVP;

import { motion } from 'framer-motion';
import content from '../../data/content.json';

const RSVP = () => {
    const { rsvp } = content;

    return (
        <section className="py-20 px-4 bg-theme-bg">
            <div className="max-w-[430px] mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl md:text-3xl font-serif text-theme-primary mb-4">
                        {rsvp.title}
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl p-10 shadow-xl border border-white/20 space-y-10"
                >
                    <div className="space-y-6">
                        <p className="text-black/70 text-lg leading-relaxed font-['Noto_Sans_KR'] break-keep font-medium whitespace-pre-wrap">
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
                            className="inline-block px-14 py-4.5 bg-theme-secondary text-white rounded-full text-lg font-bold font-['Noto_Sans_KR'] tracking-wider shadow-lg hover:brightness-110 transition-all duration-300"
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

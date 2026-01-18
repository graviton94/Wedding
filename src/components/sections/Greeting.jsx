import { motion } from 'framer-motion';

const Greeting = () => {
  return (
    <section className="py-20 px-4 bg-[#FDFCF0]">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#333333] text-lg leading-relaxed font-['Noto_Sans_KR']"
          >
            두 사람이 사랑으로 하나 되는 날,
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[#333333] text-lg leading-relaxed font-['Noto_Sans_KR']"
          >
            저희의 소중한 시작을 함께 축복해 주시면
            <br />
            큰 기쁨이 되겠습니다.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[#333333] text-lg leading-relaxed font-['Noto_Sans_KR']"
          >
            여러분의 따뜻한 마음과 격려가
            <br />
            저희에게 큰 힘이 됩니다.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-8"
          >
            <p className="text-[#D4AF37] text-base font-['Noto_Sans_KR']">
              진심을 담아 초대합니다.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Greeting;

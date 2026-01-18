import { motion } from 'framer-motion';
import Accordion from '../ui/Accordion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const Money = () => {
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const groomAccount = {
    name: 'John Doe',
    bank: 'KB Bank',
    accountNumber: '123-456-789012',
  };

  const brideAccount = {
    name: 'Jane Smith',
    bank: 'Shinhan Bank',
    accountNumber: '987-654-321098',
  };

  const handleCopyAccount = (accountNumber) => {
    copyToClipboard(accountNumber);
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-[#333333] mb-4">
              Money Gift
            </h2>
            <p className="text-[#333333] text-lg font-['Noto_Sans_KR']">
              Your presence is the greatest gift, but if you wish to bless us
            </p>
          </div>

          <Accordion>
            <Accordion.Item title="Groom's Side">
              <div className="space-y-3 font-['Noto_Sans_KR']">
                <p className="text-[#333333] font-semibold">{groomAccount.name}</p>
                <p className="text-[#333333]">{groomAccount.bank}</p>
                <p className="text-[#333333] font-mono text-lg">{groomAccount.accountNumber}</p>
                <Button
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={() => handleCopyAccount(groomAccount.accountNumber)}
                >
                  {isCopied ? '✓ Copied!' : 'Copy Account Number'}
                </Button>
              </div>
            </Accordion.Item>

            <Accordion.Item title="Bride's Side">
              <div className="space-y-3 font-['Noto_Sans_KR']">
                <p className="text-[#333333] font-semibold">{brideAccount.name}</p>
                <p className="text-[#333333]">{brideAccount.bank}</p>
                <p className="text-[#333333] font-mono text-lg">{brideAccount.accountNumber}</p>
                <Button
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={() => handleCopyAccount(brideAccount.accountNumber)}
                >
                  {isCopied ? '✓ Copied!' : 'Copy Account Number'}
                </Button>
              </div>
            </Accordion.Item>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default Money;

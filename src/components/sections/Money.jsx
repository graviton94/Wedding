import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Accordion from '../ui/Accordion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import content from '../../data/content.json';

const Money = () => {
  const { accounts } = content;
  const [copiedNumber, setCopiedNumber] = useState(null);
  const copyToClipboard = useCopyToClipboard()[1];

  const handleCopyAccount = (accountNumber) => {
    copyToClipboard(accountNumber);
    setCopiedNumber(accountNumber);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const renderAccountList = (accountList) => (
    <div className="space-y-6 pt-2">
      {accountList.map((account, index) => (
        <div key={index} className="pb-6 last:pb-0 border-b last:border-0 border-black/5 font-['Noto_Sans_KR']">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-theme-primary text-white px-3 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">
              {account.label}
            </span>
            <p className="text-theme-primary font-bold text-xl">{account.name}</p>
          </div>
          <div className="p-5 rounded-2xl border border-black/5 bg-white/60 shadow-inner">
            <p className="text-xs text-black/50 mb-1 font-medium uppercase tracking-widest">{account.bank}</p>
            <p className="text-black font-mono text-xl mb-4 tracking-wider font-semibold">{account.accountNumber}</p>
            <Button
              variant="primary"
              className="w-full py-3 text-sm rounded-xl font-bold"
              onClick={() => handleCopyAccount(account.accountNumber)}
            >
              {copiedNumber === account.accountNumber ? '✓ 복사되었습니다' : '계좌번호 복사'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-20 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif text-theme-primary mb-4">
              {accounts.title}
            </h2>
            <p className="text-white font-light text-lg font-['Noto_Sans_KR']">
              {accounts.subtitle}
            </p>
          </div>

          <Accordion>
            <Accordion.Item title={accounts.groom.title}>
              {renderAccountList(accounts.groom.accounts)}
            </Accordion.Item>

            <Accordion.Item title={accounts.bride.title}>
              {renderAccountList(accounts.bride.accounts)}
            </Accordion.Item>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default Money;

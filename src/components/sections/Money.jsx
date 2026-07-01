import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import content from '../../data/content.json';
import Accordion from '../ui/Accordion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const Money = () => {
  const { accounts } = content;
  const [copiedNumber, copyToClipboard] = useCopyToClipboard();
  const [showToast, setShowToast] = useState(false);

  const handleCopyAccount = (accountNumber) => {
    copyToClipboard(accountNumber);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 신랑측(navy) / 신부측(primary)에 따라 색상만 달라지는 계좌 리스트
  const renderAccountList = (accountList, side = 'bride') => {
    const isGroom = side === 'groom';
    const labelBg = isGroom ? '!bg-[#003764]' : '!bg-[#D6635C]';
    const labelHover = isGroom ? 'hover:!bg-[#004080]' : 'hover:!bg-[#C5524B]';
    const accentColor = isGroom ? '#003764' : '#D6635C';

    return (
      <div className="space-y-5 pt-2">
        {accountList.map((account, index) => (
          <div key={index} className="pb-5 last:pb-0 border-b last:border-0 border-black/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider" style={{ backgroundColor: accentColor }}>
                  {account.label}
                </span>
                <p className="font-bold text-lg" style={{ color: accentColor }}>{account.name}</p>
              </div>
              <Button
                variant="primary"
                className={`py-1 px-3 text-xs rounded-lg font-bold !text-white ${labelBg} ${labelHover} transition-colors`}
                onClick={() => handleCopyAccount(`${account.bank} ${account.accountNumber}`)}
              >
                {copiedNumber === `${account.bank} ${account.accountNumber}` ? '✓' : '복사'}
              </Button>
            </div>
            <div className="p-4 rounded-2xl border border-black/5 bg-white/60 shadow-inner">
              <p className="text-xs text-black/80 mb-1 font-bold uppercase tracking-widest">{account.bank}</p>
              <p className="text-black font-mono text-lg tracking-wider font-semibold">{account.accountNumber}</p>
              {account.phone && (
                <p className="mt-2 text-xs text-black/60 flex items-center gap-1">
                  <span>📞</span>
                  <a href={`tel:${account.phone.replace(/-/g, '')}`} className="hover:underline">{account.phone}</a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="py-10 px-4 bg-theme-bg">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm whitespace-nowrap border border-white/20"
            style={{ backgroundColor: 'rgba(214, 99, 92, 0.8)' }}
          >
            ✓ 복사가 완료되었습니다!
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl text-theme-primary mb-3">
              {accounts.title}
            </h2>
            <p className="text-white/80 text-sm">
              {accounts.subtitle}
            </p>
          </div>

          <Accordion>
            <Accordion.Item title={accounts.groom.title} variant="navy">
              {renderAccountList(accounts.groom.accounts, 'groom')}
            </Accordion.Item>

            <Accordion.Item title={accounts.bride.title}>
              {renderAccountList(accounts.bride.accounts, 'bride')}
            </Accordion.Item>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default Money;

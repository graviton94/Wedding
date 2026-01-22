import React, { useState } from 'react';
import { motion } from 'framer-motion';
import content from '../../data/content.json';
import Accordion from '../ui/Accordion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const Money = () => {
  const { accounts } = content;
  const [copiedNumber, copyToClipboard] = useCopyToClipboard();

  const handleCopyAccount = (accountNumber) => {
    copyToClipboard(accountNumber);
  };

  // Render account list with custom color
  const renderGroomAccountList = (accountList) => (
    <div className="space-y-5 pt-2">
      {accountList.map((account, index) => (
        <div key={index} className="pb-5 last:pb-0 border-b last:border-0 border-black/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#003764] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {account.label}
              </span>
              <p className="text-[#003764] font-bold text-lg">{account.name}</p>
            </div>
            <Button
              className="py-1 px-3 text-xs rounded-lg font-bold !bg-[#003764] !text-white hover:!bg-[#004080] transition-colors"
              onClick={() => handleCopyAccount(account.accountNumber)}
            >
              {copiedNumber === account.accountNumber ? '✓' : '복사'}
            </Button>
          </div>
          <div className="p-4 rounded-2xl border border-black/5 bg-white/60 shadow-inner">
            <p className="text-[10px] text-black/50 mb-1 font-medium uppercase tracking-widest">{account.bank}</p>
            <p className="text-black font-mono text-lg tracking-wider font-semibold">{account.accountNumber}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAccountList = (accountList) => (
    <div className="space-y-5 pt-2">
      {accountList.map((account, index) => (
        <div key={index} className="pb-5 last:pb-0 border-b last:border-0 border-black/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-theme-primary text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {account.label}
              </span>
              <p className="text-theme-primary font-bold text-lg">{account.name}</p>
            </div>
            <Button
              variant="primary"
              className="py-1 px-3 text-xs rounded-lg font-bold"
              onClick={() => handleCopyAccount(account.accountNumber)}
            >
              {copiedNumber === account.accountNumber ? '✓' : '복사'}
            </Button>
          </div>
          <div className="p-4 rounded-2xl border border-black/5 bg-white/60 shadow-inner">
            <p className="text-[10px] text-black/50 mb-1 font-medium uppercase tracking-widest">{account.bank}</p>
            <p className="text-black font-mono text-lg tracking-wider font-semibold">{account.accountNumber}</p>
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
              {renderGroomAccountList(accounts.groom.accounts)}
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

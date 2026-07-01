import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import CalendarButton from '../ui/CalendarButton';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import content from '../../data/content.json';

const Map = () => {
  const { location } = content;
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(location.venueName)},${location.coordinates.lat},${location.coordinates.lng}`;
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [showToast, setShowToast] = useState(false);

  const handleCopyAddress = () => {
    copyToClipboard(location.address);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <section className="py-10 px-4 bg-theme-bg">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] backdrop-blur-md bg-brand/80 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm whitespace-nowrap border border-white/20"
          >
            ✓ 주소가 복사되었습니다!
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
          <h2 className="font-display text-3xl text-theme-primary mb-2 text-center">
            {location.title}
          </h2>
          <p className="text-fg-muted text-sm text-center mb-6">
            {location.subtitle}
          </p>

          {/* 장소 정보 */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-brand mb-2">
                {location.venueName}
              </h3>
              <p className="text-base text-black/80 mb-1">
                {location.floor}
              </p>
              <p className="text-sm text-black/60">
                {location.address}
              </p>
            </div>

            {/* 지도 이미지 - 네이버 지도 연동 */}
            <div className="mb-5">
              <div className="rounded-xl overflow-hidden shadow-lg mb-2">
                <a href={location.naverMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={location.mapImage}
                    alt="Location Map"
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
              <p className="text-xs text-black/50 text-center">
                (이미지 클릭 시 네이버 지도로 이동)
              </p>
            </div>

            {/* 버튼들 - 2개만 일렬로 배치, 동일한 크기 */}
            <div className="flex gap-2 w-full">
              <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer" className="basis-1/2">
                <Button
                  variant="primary"
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm !bg-navy hover:!bg-navy-hover"
                >
                  <img
                    src="/Wedding/images/kakao_icon.png"
                    alt="Kakao Map"
                    className="w-4 h-4"
                  />
                  카카오맵
                </Button>
              </a>

              <Button
                variant="primary"
                className="basis-1/2 py-3 rounded-xl text-sm !bg-brand hover:!bg-brand-hover"
                onClick={handleCopyAddress}
              >
                {isCopied ? '복사완료!' : '📋 주소복사'}
              </Button>
            </div>

            {/* 캘린더 일정 추가 (플랫폼 감지) */}
            <div className="mt-2">
              <CalendarButton />
            </div>
          </div>
        </motion.div>

        {/* 교통편 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 text-left border border-white/20 shadow-xl"
        >
          <h3 className="text-xl text-brand mb-6 border-b pb-2 border-brand/20 font-bold">
            교통편 안내
          </h3>

          <div className="space-y-5">
            {/* 지하철 */}
            <div className="pb-5 border-b border-black/5">
              <h4 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                <span className="text-xl">🚇</span>
                지하철
              </h4>
              <p className="text-black text-sm leading-relaxed pl-4">
                {location.transportation.subway}
              </p>
            </div>

            {/* 버스 */}
            <div className="pb-5 border-b border-black/5">
              <h4 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                <span className="text-xl">🚌</span>
                버스
              </h4>
              <div className="text-black text-sm leading-relaxed pl-4 whitespace-pre-line">
                {location.transportation.bus}
              </div>
            </div>

            {/* 자가용 */}
            <div className="pb-5 border-b border-black/5">
              <h4 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                <span className="text-xl">🚗</span>
                자가용
              </h4>
              <p className="text-black text-sm leading-relaxed pl-4">
                {location.transportation.car}
              </p>
            </div>

            {/* 주차 */}
            <div>
              <h4 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
                <span className="text-xl">🅿️</span>
                주차
              </h4>
              <div className="text-black text-sm leading-relaxed pl-4 whitespace-pre-line">
                {location.transportation.parking}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Map;
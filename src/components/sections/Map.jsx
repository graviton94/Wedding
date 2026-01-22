import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import content from '../../data/content.json';

const Map = () => {
  const { location, hero } = content;
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(location.venueName)},${location.coordinates.lat},${location.coordinates.lng}`;
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const handleCopyAddress = () => {
    copyToClipboard(location.address);
  };

  return (
    <section className="py-20 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl text-theme-primary mb-3 text-center">
            {location.title}
          </h2>
          <p className="text-white/80 text-sm text-center mb-8">
            {location.subtitle}
          </p>

          {/* 장소 정보 */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-theme-primary mb-2">
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
            <div className="flex gap-2">
              <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button 
                  variant="primary" 
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm !bg-[#003764] hover:!bg-[#004080]"
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
                className="flex-1 py-3 rounded-xl text-sm !bg-[#E16A7B] hover:!bg-[#D15969]"
                onClick={handleCopyAddress}
              >
                {isCopied ? '복사완료!' : '📋 주소복사'}
              </Button>
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
          <h3 className="text-xl text-theme-primary mb-6 border-b pb-2 border-theme-primary/20 font-bold">
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
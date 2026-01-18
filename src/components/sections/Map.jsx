import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import content from '../../data/content.json';

const Map = () => {
  const { location, hero } = content;
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const handleCopyAddress = () => {
    copyToClipboard(location.address);
  };

  const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(location.venueName)},${location.coordinates.lat},${location.coordinates.lng}`;
  const tmapUrl = `https://apis.openapi.sk.com/tmap/app/routes?appKey=&name=${encodeURIComponent(location.venueName)}&lon=${location.coordinates.lng}&lat=${location.coordinates.lat}`;

  return (
    <section className="py-20 px-4 bg-theme-bg">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-theme-primary mb-4">
            Location
          </h2>
          <p className="text-white text-lg">
            오시는 길을 안내해 드립니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          <div className="p-8">
            <p className="text-theme-primary text-lg mb-4 font-bold tracking-tight">{hero.time}</p>
            <h3 className="text-3xl font-serif text-theme-primary mb-3 font-bold">
              {location.venueName}
            </h3>
            <p className="text-black/80 mb-1 font-medium">{location.floor}</p>
            <p className="text-black/60 mb-8 leading-relaxed">{location.address}</p>

            {/* ✅ 지도 이미지 영역 */}
            <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-8 relative group shadow-inner">
              <a
                href={location.naverMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full cursor-pointer"
              >
                <img
                  src={location.mapImage}
                  alt="예식장 약도"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/95 px-6 py-2.5 rounded-full text-sm font-bold text-[#03C75A] shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <img
                      src="https://i.namu.wiki/i/p_1IEyQ8rYenO9YgAFp_LHIAW46kn6DXT0VKmZ_jKNijvYth9DieYZuJX_E_H_4GkCER_sVKhMqSyQYoW94JKA.svg"
                      alt="Naver Map"
                      className="w-4 h-4"
                    />
                    네이버 지도로 보기 ↗
                  </span>
                </div>
              </a>
            </div>

            {/* ✅ 네비게이션 버튼 세트 */}
            <div className="flex flex-col gap-4">
              <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className="w-full flex items-center justify-center gap-3 py-4 rounded-xl">
                  <img
                    src="https://lh3.google.com/u/0/d/1-G7VISzuwKv0OSzlcY8O2qH6nbVRN2PL=w1920-h868-iv1?auditContext=prefetch"
                    alt="Kakao Map"
                    className="w-5 h-5"
                  />
                  카카오맵으로 보기
                </Button>
              </a>

              <Button
                variant="primary"
                className="w-full py-4 rounded-xl"
                onClick={handleCopyAddress}
              >
                {isCopied ? '주소가 복사되었습니다!' : '📋 주소 텍스트 복사'}
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
          className="mt-10 bg-white/80 backdrop-blur-md rounded-2xl p-8 text-left border border-white/20 shadow-xl"
        >
          <h3 className="text-2xl font-serif text-theme-primary mb-8 border-b pb-3 border-theme-primary/20 font-bold">
            교통수단 안내
          </h3>
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-theme-secondary mb-3 flex items-center gap-2 text-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary" />
                지하철 이용 시
              </h4>
              <p className="text-black/70 leading-relaxed font-medium pl-3.5 whitespace-pre-wrap">
                {location.transportation.subway}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-theme-secondary mb-3 flex items-center gap-2 text-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary" />
                버스 이용 시
              </h4>
              <p className="text-black/70 leading-relaxed font-medium pl-3.5 whitespace-pre-wrap">
                {location.transportation.bus}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-theme-secondary mb-3 flex items-center gap-2 text-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary" />
                승용차 이용 시
              </h4>
              <p className="text-black/70 leading-relaxed font-medium pl-3.5 whitespace-pre-wrap">
                {location.transportation.car}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-theme-secondary mb-3 flex items-center gap-2 text-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary" />
                주차 안내
              </h4>
              <p className="text-black/70 leading-relaxed font-medium pl-3.5 whitespace-pre-wrap">
                {location.transportation.parking}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Map;
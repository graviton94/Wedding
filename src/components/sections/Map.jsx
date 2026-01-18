import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import CalendarButton from '../ui/CalendarButton';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import content from '../../data/content.json';

const Map = () => {
  const { location, hero } = content;
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(location.venueName)},${location.coordinates.lat},${location.coordinates.lng}`;
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  // 캘린더 이벤트 정보
  const eventDetails = {
    title: "최준영 ❤️ 민수영 결혼식",
    description: "소중한 날에 함께해 주세요",
    location: `${location.venueName} ${location.floor} (${location.address})`,
    startDate: "2026-09-20T12:30:00",
    endDate: "2026-09-20T14:30:00",
  };

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
          <h2 className="text-3xl font-serif text-theme-primary mb-4 text-center">
            {location.title}
          </h2>
          <p className="text-white/80 text-base text-center mb-10 font-['Noto_Sans_KR']">
            {location.subtitle}
          </p>

          {/* 장소 정보 */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 mb-6 border border-white/20 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-theme-primary mb-3 font-['Noto_Sans_KR']">
                {location.venueName}
              </h3>
              <p className="text-lg text-black/80 mb-2 font-['Noto_Sans_KR']">
                {location.floor}
              </p>
              <p className="text-base text-black/60 font-['Noto_Sans_KR']">
                {location.address}
              </p>
            </div>

            {/* 지도 이미지 - 네이버 지도 연동 */}
            <div className="mb-6">
              <div className="rounded-xl overflow-hidden shadow-lg mb-2">
                <a href={location.naverMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={location.mapImage}
                    alt="Location Map"
                    className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
              <p className="text-s text-black/50 text-center">
                (이미지 클릭 시 네이버 지도로 이동)
              </p>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3">
              <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="primary" className="w-full py-4 rounded-xl flex items-center justify-center gap-3">
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

              {/* 캘린더 저장 버튼 */}
              <CalendarButton eventDetails={eventDetails} />
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
            교통편 안내
          </h3>

          <div className="space-y-6">
            {/* 지하철 */}
            <div className="pb-6 border-b border-black/5">
              <h4 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">🚇</span>
                지하철
              </h4>
              <p className="text-black/70 leading-relaxed pl-4">
                {location.transportation.subway}
              </p>
            </div>

            {/* 버스 */}
            <div className="pb-6 border-b border-black/5">
              <h4 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">🚌</span>
                버스
              </h4>
              <div className="text-black/70 leading-relaxed pl-4 whitespace-pre-line">
                {location.transportation.bus}
              </div>
            </div>

            {/* 자가용 */}
            <div className="pb-6 border-b border-black/5">
              <h4 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                자가용
              </h4>
              <p className="text-black/70 leading-relaxed pl-4">
                {location.transportation.car}
              </p>
            </div>

            {/* 주차 */}
            <div>
              <h4 className="text-lg font-bold text-theme-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">🅿️</span>
                주차
              </h4>
              <div className="text-black/70 leading-relaxed pl-4 whitespace-pre-line">
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
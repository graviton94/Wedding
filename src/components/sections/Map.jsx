import { motion } from 'framer-motion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';
import content from '../../data/content.json';

const Map = () => {
  const { location } = content;
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const venue = {
    name: location.venueName,
    address: location.address,
    floor: location.floor,
    time: content.hero.time,
    mapUrl: location.naverMapUrl,
    tmapUrl: 'https://tmap.life/search',
    lat: location.coordinates.lat,
    lng: location.coordinates.lng
  };

  const handleCopyAddress = () => {
    copyToClipboard(venue.address);
  };

  // Validate coordinates are within valid ranges
  const isValidCoordinate = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  return (
    <section className="py-20 px-4 bg-[#FDFCF0]">
      <div className="max-w-[430px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] text-[#333333] mb-4">
            오시는 길
          </h2>
          <p className="text-[#333333] text-lg font-['Noto_Sans_KR']">
            저희의 앞날을 축복하러 오시는 길을 안내해 드립니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <p className="text-[#D4AF37] text-lg mb-4 font-['Noto_Sans_KR']">{venue.time}</p>
            <h3 className="text-2xl font-['Playfair_Display'] text-[#333333] mb-2">
              {venue.name}
            </h3>
            <p className="text-[#333333] mb-2 font-['Noto_Sans_KR']">{venue.floor}</p>
            <p className="text-[#333333] mb-4 font-['Noto_Sans_KR']">{venue.address}</p>

            {/* Optimized Naver Map Embed */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
              {isValidCoordinate(venue.lat, venue.lng) ? (
                <iframe
                  src="https://m.map.naver.com/menu/location.naver?pinId=12023277&pinType=site"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Naver Map for The White Veil"
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  지도를 불러올 수 없습니다.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <a
                href={`nmap://route/public?dlat=${location.coordinates.lat}&dlng=${location.coordinates.lng}&dname=${encodeURIComponent(location.venueName)}&appname=wedding-invitation`}
                className="block md:hidden"
              >
                <Button variant="primary" className="w-full bg-[#03C75A] border-[#03C75A] hover:bg-[#02b351]">
                  네이버 지도 앱 열기 (길찾기)
                </Button>
              </a>
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full">
                  네이버 지도 (웹)
                </Button>
              </a>
              <a
                href={venue.tmapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="w-full">
                  T-Map 앱 열기
                </Button>
              </a>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyAddress}
              >
                {isCopied ? '✓ 주소 복사 완료!' : '주소 복사하기'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Transportation info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-['Playfair_Display'] text-[#333333] mb-4">
            교통수단 안내
          </h3>
          <div className="space-y-4 text-[#333333] font-['Noto_Sans_KR']">
            <div>
              <h4 className="font-semibold mb-2">지하철/버스</h4>
              <p className="text-[#333333]">
                {location.transportation.subway}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">자가용/주차</h4>
              <p className="text-[#333333]">
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

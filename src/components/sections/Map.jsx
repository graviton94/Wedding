import { motion } from 'framer-motion';
import Button from '../ui/Button';
import useCopyToClipboard from '../../hooks/useCopyToClipboard';

const Map = () => {
  const [isCopied, copyToClipboard] = useCopyToClipboard();

  const venue = {
    name: 'Grand Hotel Seoul',
    address: '123 Gangnam-daero, Gangnam-gu, Seoul, South Korea',
    floor: '5th Floor, Grand Ballroom',
    time: '2:00 PM',
    mapUrl: 'https://map.naver.com/v5/search/Grand%20Hotel%20Seoul',
    tmapUrl: 'https://tmap.life/search',
    lat: 37.4979,
    lng: 127.0276
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
            Location
          </h2>
          <p className="text-[#333333] text-lg font-['Noto_Sans_KR']">
            Join us at this beautiful venue
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
            
            {/* Kakao Map Embed - Using iframe with Naver Map for now */}
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
              {isValidCoordinate(venue.lat, venue.lng) ? (
                <iframe
                  src={`https://map.naver.com/v5/search/${encodeURIComponent(venue.name)}?c=${venue.lng},${venue.lat},15,0,0,0,dh`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map for ${venue.name}`}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Map unavailable
                </div>
              )}
            </div>

            <div className="space-y-2">
              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full">
                  Open in Naver Map
                </Button>
              </a>
              <a
                href={venue.tmapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" className="w-full">
                  Open in T-Map
                </Button>
              </a>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCopyAddress}
              >
                {isCopied ? '✓ Address Copied!' : 'Copy Address'}
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
            Transportation
          </h3>
          <div className="space-y-4 text-[#333333] font-['Noto_Sans_KR']">
            <div>
              <h4 className="font-semibold mb-2">By Subway</h4>
              <p className="text-[#333333]">
                Gangnam Station (Line 2), Exit 10<br />
                5 minutes walk
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Parking</h4>
              <p className="text-[#333333]">
                Free parking available<br />
                B1-B3 floors
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Map;

import { motion } from 'framer-motion';

const Location = () => {
  const venues = [
    {
      title: 'Wedding Ceremony',
      name: 'Grand Hotel Seoul',
      address: '123 Gangnam-daero, Gangnam-gu, Seoul, South Korea',
      time: '2:00 PM',
      // Naver Map coordinates for Seoul area (example)
      mapUrl: 'https://map.naver.com/v5/search/Grand%20Hotel%20Seoul',
      lat: 37.4979,
      lng: 127.0276
    },
    {
      title: 'Reception',
      name: 'Grand Ballroom',
      address: 'Same venue, 5th Floor',
      time: '4:00 PM',
      mapUrl: 'https://map.naver.com/v5/search/Grand%20Hotel%20Seoul',
      lat: 37.4979,
      lng: 127.0276
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            Location
          </h2>
          <p className="text-gray-600 text-lg">
            Join us at these beautiful venues
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {venues.map((venue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-2xl font-serif text-gray-800 mb-2">
                  {venue.title}
                </h3>
                <p className="text-rose-400 text-lg mb-4">{venue.time}</p>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {venue.name}
                </p>
                <p className="text-gray-600 mb-4">{venue.address}</p>
                
                {/* Naver Map Embed - Using iframe with Naver Map */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
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
                </div>

                <a
                  href={venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-rose-400 text-white py-3 px-6 rounded-lg hover:bg-rose-500 transition-colors"
                >
                  Open in Naver Map
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transportation info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h3 className="text-2xl font-serif text-gray-800 mb-4">
            Transportation
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">By Subway</h4>
              <p className="text-gray-600">
                Gangnam Station (Line 2), Exit 10<br />
                5 minutes walk
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Parking</h4>
              <p className="text-gray-600">
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

export default Location;

import { motion } from 'framer-motion';
import { useState } from 'react';

const RSVP = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '1',
    attending: 'yes',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    console.log('RSVP Data:', formData);
    setSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        guests: '1',
        attending: 'yes',
        message: ''
      });
    }, 3000);
  };

  const accounts = [
    {
      title: "Groom's Account",
      name: 'John Doe',
      bank: 'KB Bank',
      accountNumber: '123-456-789012',
    },
    {
      title: "Bride's Account",
      name: 'Jane Smith',
      bank: 'Shinhan Bank',
      accountNumber: '987-654-321098',
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* RSVP Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
              RSVP
            </h2>
            <p className="text-gray-600 text-lg">
              Please let us know if you can join us
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-pink-50 rounded-xl p-6 md:p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Number of Guests *
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Will you attend? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attending"
                    value="yes"
                    checked={formData.attending === 'yes'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Joyfully accepts</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="attending"
                    value="no"
                    checked={formData.attending === 'no'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Regretfully declines</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Message to the couple
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="Your wishes and messages..."
              ></textarea>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-rose-400 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-rose-500 transition-colors"
            >
              {submitted ? '✓ Submitted!' : 'Submit RSVP'}
            </motion.button>
          </form>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
              Send Your Blessings
            </h2>
            <p className="text-gray-600 text-lg">
              Your presence is the greatest gift, but if you wish to bless us
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {accounts.map((account, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-serif text-gray-800 mb-4">
                  {account.title}
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">{account.name}</p>
                  <p>{account.bank}</p>
                  <p className="font-mono text-lg">{account.accountNumber}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(account.accountNumber);
                    alert('Account number copied!');
                  }}
                  className="mt-4 w-full bg-white text-rose-400 border border-rose-400 py-2 px-4 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Copy Account Number
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RSVP;

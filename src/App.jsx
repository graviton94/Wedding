import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Location from './components/Location';
import RSVP from './components/RSVP';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Gallery />
      <Location />
      <RSVP />
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 text-center">
        <p className="text-sm">
          We can't wait to celebrate with you!
        </p>
        <p className="text-xs mt-2 text-gray-400">
          Jane & John • June 15, 2026
        </p>
      </footer>
    </div>
  );
}

export default App;

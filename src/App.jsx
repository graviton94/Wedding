import Hero from './components/sections/Hero';
import Greeting from './components/sections/Greeting';
import Gallery from './components/sections/Gallery';
import Map from './components/sections/Map';
import Money from './components/sections/Money';
import Share from './components/sections/Share';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#FDFCF0]">
      <Hero />
      <Greeting />
      <Gallery />
      <Map />
      <Money />
      <Share />
      <Footer />
    </div>
  );
}

export default App;

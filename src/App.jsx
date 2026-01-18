import Hero from './components/sections/Hero';
import Greeting from './components/sections/Greeting';
import Gallery from './components/sections/Gallery';
import Map from './components/sections/Map';
import RSVP from './components/sections/RSVP';
import Money from './components/sections/Money';
import Share from './components/sections/Share';
import Footer from './components/layout/Footer';
import BackgroundMusic from './components/ui/BackgroundMusic';
import Guestbook from './components/sections/Guestbook';
import Divider from './components/ui/Divider';

function App() {
  return (
    <div className="min-h-screen bg-[#FDFCF0]">
      <BackgroundMusic />
      <Hero />
      <Divider />
      <Greeting />
      <Divider />
      <Gallery />
      <Divider />
      <Map />
      <Divider />
      <RSVP />
      <Divider />
      <Money />
      <Divider />
      <Guestbook />
      <Divider />
      <Share />
      <Footer />
    </div>
  );
}

export default App;

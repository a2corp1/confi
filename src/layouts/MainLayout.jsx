import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import BackToTop from '../components/common/BackToTop';
import TokenMarquee from '../components/token/token-marquee';
import TopTokensNavbar from '../components/token/top-tokens-navbar';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-950 bg-grid-pattern">
      {/* Add TokenMarquee at the very top */}
      
      {/* Add TopTokensNavbar right after the marquee */}
      
      {/* Your existing Navbar */}
      
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      <BackToTop />
      <Toaster position="top-right" />
      
      {/* Add CSS for the marquee animation */}
      <style jsx="true">{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        
        .marquee-content {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 40s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        /* Pause animation on hover */
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
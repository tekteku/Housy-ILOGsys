import { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNavigationBar from './BottomNavigationBar';
import { useIsMobile } from '@/hooks/use-mobile';
import CompanyLogo from '../ui/CompanyLogo';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Mobile Header when sidebar is hidden */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm py-3 px-4 flex items-center justify-between z-10">
          <div className="flex items-center">
            <CompanyLogo />
            <span className="font-heading font-bold text-lg ml-2 text-neutral-800">Housy</span>
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <i className="fas fa-bars"></i>
          </button>
        </header>
      )}

      {/* Sidebar - visible on desktop and conditionally on mobile */}
      <Sidebar
        isVisible={!isMobile || showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        isMobileView={isMobile}
      />      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 ${isMobile ? 'pt-16 pb-20' : 'ml-64'}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigationBar />
    </div>
  );
};

export default MainLayout;

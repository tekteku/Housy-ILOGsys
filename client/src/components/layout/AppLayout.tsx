import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import CompanyLogo from "../ui/CompanyLogo";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileSidebar(false);
    }
  }, [isMobile]);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-50 font-sans">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white shadow-sm py-3 px-4 flex items-center justify-between z-10">
          <div className="flex items-center">
            <CompanyLogo />
            <span className="font-heading font-bold text-lg ml-2 text-neutral-800">Housy</span>
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>
      )}

      {/* Sidebar - visible on desktop and conditionally on mobile */}
      <Sidebar
        isVisible={!isMobile || showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        isMobileView={isMobile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
};

export default AppLayout;

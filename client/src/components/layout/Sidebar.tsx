import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import CompanyLogo from "../ui/CompanyLogo";

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home', label: "Tableau de bord" },
  { name: 'Projects', href: '/projects', icon: 'folder-open', label: "Projets" },
  { name: 'Estimation', href: '/estimation', icon: 'calculator', label: "Estimation" },
  { name: 'Materials', href: '/materials', icon: 'cubes', label: "Matériaux" },
  { name: 'Chatbot AI', href: '/chatbot', icon: 'robot', label: "Chatbot IA" },
  { name: 'Parameters', href: '/settings', icon: 'cog', label: "Paramètres" },
];

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  isMobileView: boolean;
}

const Sidebar = ({ isVisible, onClose, isMobileView }: SidebarProps) => {
  const [location] = useLocation();

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isMobileView && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
        ></div>
      )}

      <div
        className={cn(
          "h-screen z-30 bg-neutral-800 text-neutral-200 flex flex-col",
          isMobileView
            ? "fixed top-0 left-0 w-64 shadow-lg transition-transform duration-300 ease-in-out"
            : "w-64 sticky top-0"
        )}
      >
        <div className="p-4 flex items-center gap-2 border-b border-neutral-700">
          <CompanyLogo className="text-white" />
          <span className="font-semibold text-lg">Housy</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location === item.href || 
              (item.href === "/dashboard" && location === "/");
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  )}
                >
                  <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                  <span>{item.label || item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Section Utilisateur en bas */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              AB
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-200">Adnen Ben Zineb</p>
              <p className="text-xs text-neutral-400">Chef de Projet</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: "tachometer-alt", label: "Tableau de bord" },
  { path: "/projects", icon: "tasks", label: "Projets" },
  { path: "/estimation", icon: "calculator", label: "Estimation" },
  { path: "/materials", icon: "hammer", label: "Matériaux" },
  { path: "/chatbot", icon: "robot", label: "Chatbot IA" },
  { path: "/settings", icon: "cog", label: "Paramètres" },
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

      <nav
        className={cn(
          "bg-white border-r border-neutral-200 h-screen z-30",
          isMobileView
            ? "fixed top-0 left-0 w-64 shadow-lg transition-transform duration-300 ease-in-out"
            : "flex-col w-64 sticky top-0"
        )}
      >
        <div className="flex items-center justify-center p-6 border-b border-neutral-200">
          <svg className="h-10 w-10 rounded-lg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#3B82F6"/>
            <path d="M12 20H28M20 12V28" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <span className="font-heading font-bold text-lg ml-2 text-neutral-800">Housy</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <div className="bg-neutral-100 rounded-lg p-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                AC
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Ahmed Chebbi</p>
                <p className="text-xs text-neutral-500">Chef de Projet</p>
              </div>
            </div>
          </div>

          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location === item.path || 
                (item.path === "/dashboard" && location === "/");
              
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 font-medium rounded-lg",
                        isActive
                          ? "text-neutral-900 bg-neutral-100"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      )}
                    >
                      <i
                        className={cn(
                          `fas fa-${item.icon} w-5 text-center`,
                          isActive ? "text-primary-600" : "text-neutral-500"
                        )}
                      ></i>
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

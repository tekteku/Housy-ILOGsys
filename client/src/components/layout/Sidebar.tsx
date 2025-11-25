import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import CompanyLogo from "../ui/CompanyLogo";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

// Navigation pour les administrateurs
const adminNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home', label: "Tableau de bord" },
  { name: 'Projects', href: '/projects', icon: 'folder-open', label: "Projets" },
  { name: 'Categories', href: '/admin/categories', icon: 'tags', label: "Catégories" },
  { name: 'Client Requests', href: '/admin/requests', icon: 'inbox', label: "Demandes Clients" },
  { name: 'Quotations', href: '/admin/quotations', icon: 'file-text', label: "Devis" },
  { name: 'Users', href: '/admin/users', icon: 'users', label: "Utilisateurs" },
  { name: 'Materials', href: '/materials', icon: 'cubes', label: "Matériaux" },
  
  // Section Analytics & Monitoring
  { name: 'Analytics', href: '/admin/analytics', icon: 'bar-chart', label: "Analytiques" },
  { name: 'Analytics Advanced', href: '/admin/analytics-enhanced', icon: 'chart-line', label: "Analytics Avancés" },
  { name: 'System Monitoring', href: '/admin/system-monitoring', icon: 'desktop', label: "Monitoring Système" },
  
  // Section Gestion
  { name: 'Permission Management', href: '/admin/permission-management', icon: 'key', label: "Gestion Permissions" },
  { name: 'Notifications', href: '/admin/notifications', icon: 'bell', label: "Notifications" },
  { name: 'Notification Center', href: '/admin/notification-center', icon: 'envelope', label: "Centre Notifications" },
  
  // Section Sécurité & Contrôle
  { name: 'System Control', href: '/admin/system-control', icon: 'server', label: "Contrôle Système" },
  { name: 'Security Audit', href: '/admin/security-audit', icon: 'shield-alt', label: "Audit Sécurité" },
  { name: 'Financial Management', href: '/admin/financial-management', icon: 'money-bill-wave', label: "Gestion Financière" },
  { name: 'Settings', href: '/settings', icon: 'cog', label: "Paramètres" },
];

// Navigation pour les clients
const clientNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home', label: "Tableau de bord" },
  { name: 'My Projects', href: '/client/projects', icon: 'folder-open', label: "Mes Projets" },
  { name: 'New Request', href: '/client/request', icon: 'plus-circle', label: "Nouvelle Demande" },
  { name: 'Quotations', href: '/client/quotations', icon: 'file-text', label: "Mes Devis" },
  { name: 'Documents', href: '/client/documents', icon: 'paperclip', label: "Documents" },
  { name: 'Payments', href: '/client/payments', icon: 'credit-card', label: "Paiements" },
  { name: 'Estimation', href: '/estimation', icon: 'calculator', label: "Estimation" },
  { name: 'Chatbot AI', href: '/chatbot', icon: 'robot', label: "Assistant IA" },
  { name: 'Profile', href: '/client/profile', icon: 'user', label: "Profil" },
];

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  isMobileView: boolean;
}

const Sidebar = ({ isVisible, onClose, isMobileView }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Sélectionner les éléments de navigation selon le rôle
  const navigationItems = user?.role === 'admin' || user?.role === 'super_admin' 
    ? adminNavigationItems 
    : clientNavigationItems;

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
          "h-screen z-30 bg-[#162032] text-white flex flex-col rounded-r-3xl shadow-2xl",
          isMobileView
            ? "fixed top-0 left-0 w-64 transition-transform duration-300 ease-in-out"
            : "w-64 sticky top-0"
        )}
      >
        <div className="p-6 flex items-center gap-2 border-b border-[#22304a]">
          <CompanyLogo className="text-white" />
          <span className="font-bold text-2xl ml-2">Housy</span>
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors",
                    isActive
                      ? "bg-white text-[#162032] shadow-md"
                      : "text-white hover:bg-[#22304a] hover:text-white"
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
        <div className="p-6 border-t border-[#22304a] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#b0b8c1]">Thème</span>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#162032] font-bold text-lg">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-base font-bold text-white">{user?.fullName || 'Utilisateur'}</p>
              <p className="text-xs text-[#b0b8c1]">
                {user?.role === 'admin' || user?.role === 'super_admin' ? 'Administrateur' : 'Client'}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors text-red-300 hover:bg-red-600 hover:text-white"
          >
            <i className="fas fa-sign-out-alt w-5 text-center"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

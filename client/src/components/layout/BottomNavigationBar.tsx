import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { useState, useEffect } from 'react';

const mobileNavItems = [
  { name: 'Accueil', href: '/dashboard', icon: 'fa-home', description: 'Tableau de bord principal' },
  { name: 'Projets', href: '/projects', icon: 'fa-folder-open', description: 'Gérer les projets' },
  { name: 'Estimation', href: '/estimation', icon: 'fa-calculator', description: 'Calculer les coûts' },
  { name: 'Chat', href: '/chatbot', icon: 'fa-comments', description: 'Assistance intelligente' },
];

const BottomNavigationBar = () => {
  const [location] = useLocation();
  const [lastVisited, setLastVisited] = useState<string | null>(null);
  const [showTooltips, setShowTooltips] = useState(false);
  
  // Détecter si c'est la première utilisation pour montrer éventuellement les tooltips
  useEffect(() => {
    const isFirstTimeUser = localStorage.getItem('hasUsedNavigation') !== 'true';
    setShowTooltips(isFirstTimeUser);
    
    // Marquer comme non-nouvel utilisateur après quelques secondes
    if (isFirstTimeUser) {
      const timer = setTimeout(() => {
        localStorage.setItem('hasUsedNavigation', 'true');
        setShowTooltips(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Suivre la dernière page visitée pour les animations
  useEffect(() => {
    setLastVisited(location);
  }, [location]);
  
  return (
    <nav aria-label="Navigation mobile" className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex justify-around items-center md:hidden z-50 shadow-inner">
      {mobileNavItems.map((item) => {
        const isActive = location === item.href;
        const wasActive = lastVisited === item.href && location !== item.href;
        
        return (
          <EnhancedTooltip 
            key={item.name}
            content={item.description}
            side="top"
            disabled={!showTooltips}
            delay={500}
          >
            <Link
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs w-full h-full relative",
                isActive ? "text-primary-600" : "text-neutral-500",
                "transition-colors duration-200 hover:text-primary-500",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                "touch-manipulation" // Optimisation tactile
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div 
                className={cn(
                  "relative",
                  isActive && "after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary-600 after:rounded-full"
                )}
              >
                <i 
                  className={cn(
                    "fas",
                    item.icon,
                    "text-lg mb-0.5",
                    isActive && "animate-scale-in"
                  )}
                  aria-hidden="true"
                ></i>
                
                {/* Indication visuelle pour une nouvelle notification */}
                {item.name === 'Chat' && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              
              <span 
                className={cn(
                  "transition-all",
                  isActive ? "font-medium" : "font-normal"
                )}
              >
                {item.name}
              </span>
              
              {/* Animation pour indiquer la transition de page */}
              {isActive && (
                <span className="absolute inset-0 bg-primary-100 opacity-0 rounded-md animate-pulse-once" />
              )}
            </Link>
          </EnhancedTooltip>
        );
      })}
    </nav>
  );
};

export default BottomNavigationBar;

import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: "tachometer-alt", label: "Tableau" },
  { path: "/projects", icon: "tasks", label: "Projets" },
  { path: "/estimation", icon: "calculator", label: "Estimation" },
  { path: "/materials", icon: "hammer", label: "Matériaux" },
  { path: "/chatbot", icon: "robot", label: "Assistant" },
];

const MobileNav = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-2 px-2 z-10 shadow-lg">
      <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === "/dashboard" && location === "/");
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-1 rounded-md cursor-pointer transition-colors duration-200",
                  isActive 
                    ? "text-primary-600 bg-primary-50" 
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                )}
              >
                <i className={`fas fa-${item.icon} text-lg mb-1`}></i>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

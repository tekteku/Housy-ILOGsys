import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: "tachometer-alt", label: "Tableau" },
  { path: "/projects", icon: "tasks", label: "Projets" },
  { path: "/estimation", icon: "calculator", label: "Estimation" },
  { path: "/materials", icon: "hammer", label: "Matériaux" },
  { path: "/chatbot", icon: "robot", label: "Chatbot" },
];

const MobileNav = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-2 px-6 z-10">
      <div className="grid grid-cols-5 gap-2">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === "/dashboard" && location === "/");
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex flex-col items-center",
                  isActive ? "text-primary-600" : "text-neutral-500"
                )}
              >
                <i className={`fas fa-${item.icon} text-lg`}></i>
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

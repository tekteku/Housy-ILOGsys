import { Link, useLocation } from 'wouter';

const mobileNavItems = [
  { name: 'Accueil', href: '/dashboard', icon: 'fa-home' },
  { name: 'Projets', href: '/projects', icon: 'fa-folder-open' },
  { name: 'Estimation', href: '/estimation', icon: 'fa-calculator' },
  { name: 'Chat', href: '/chatbot', icon: 'fa-comments' },
];

const BottomNavigationBar = () => {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex justify-around items-center md:hidden z-50 shadow-inner">
      {mobileNavItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center text-xs w-full h-full ${ 
              isActive ? 'text-primary-600' : 'text-neutral-500'
            }`}
        >
          <i className={`fas ${item.icon} text-lg mb-0.5`}></i>
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNavigationBar;

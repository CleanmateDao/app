import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  PlusCircle, 
  Gift, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Insights', icon: LayoutDashboard },
  { path: '/cleanups', label: 'Cleanups', icon: MapPin },
  { path: '/organize', label: 'Organize', icon: PlusCircle, isCenter: true },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const [plusButtonPath, setPlusButtonPath] = useState('/organize');

  // Read plus button preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plusButtonAction');
    const action = saved === 'streak' ? 'streak' : 'organize';
    setPlusButtonPath(action === 'streak' ? '/streaks/submit' : '/organize');

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plusButtonAction') {
        const newAction = e.newValue === 'streak' ? 'streak' : 'organize';
        setPlusButtonPath(newAction === 'streak' ? '/streaks/submit' : '/organize');
      }
    };

    // Listen for custom storage event (for same-tab updates)
    const handleCustomStorage = () => {
      const saved = localStorage.getItem('plusButtonAction');
      const action = saved === 'streak' ? 'streak' : 'organize';
      setPlusButtonPath(action === 'streak' ? '/streaks/submit' : '/organize');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('plusButtonAction-changed', handleCustomStorage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('plusButtonAction-changed', handleCustomStorage);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/cleanups' && location.pathname.startsWith('/cleanups/')) ||
            (item.path === '/dashboard' && location.pathname === '/');
          
          if (item.isCenter) {
            const centerPath = plusButtonPath;
            const centerIsActive = location.pathname === centerPath || 
              (centerPath === '/organize' && location.pathname === '/organize') ||
              (centerPath === '/streaks/submit' && location.pathname === '/streaks/submit');
            
            return (
              <NavLink
                key="plus-button"
                to={centerPath}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                    centerIsActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/90 text-primary-foreground"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                />
              </motion.div>
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

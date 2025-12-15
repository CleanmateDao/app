import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/cleanups' && location.pathname.startsWith('/cleanups/')) ||
            (item.path === '/dashboard' && location.pathname === '/');
          
          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                    isActive
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

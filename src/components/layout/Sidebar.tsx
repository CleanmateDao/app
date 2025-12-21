import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Gift,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CleanMateLogoIcon from "../icons/logo-icon";
import CleanMateLogo from "../icons/logo";

const navItems = [
  { path: "/dashboard", label: "Insights", icon: LayoutDashboard },
  { path: "/cleanups", label: "Cleanups", icon: MapPin },
  { path: "/organize", label: "Organize Cleanup", icon: PlusCircle },
  { path: "/rewards", label: "Rewards", icon: Gift },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "bg-card/80 backdrop-blur-xl border border-border/50 flex flex-col shrink-0 shadow-lg",
        "lg:h-[calc(100vh-2rem)] lg:m-4 lg:mr-0 lg:rounded-2xl lg:sticky lg:top-4",
        "max-lg:h-full max-lg:w-full max-lg:rounded-none max-lg:border-0 max-lg:shadow-none"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          {collapsed ? <CleanMateLogoIcon /> : <CleanMateLogo />}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === "/cleanups" &&
              location.pathname.startsWith("/cleanups/")) ||
            (item.path === "/dashboard" && location.pathname === "/");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 relative rounded-lg",
                isActive
                  ? "bg-primary/10 text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2.5 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn(!collapsed ? "block" : "lg:hidden")}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle - Desktop Only */}
      <div className="p-3 border-t border-border/50 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}

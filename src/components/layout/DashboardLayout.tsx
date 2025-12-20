import { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRecording } from "@/contexts/RecordingContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isRecording } = useRecording();

  // Hide bottom nav on streaks pages
  const hideBottomNav =
    location.pathname === "/streaks" || location.pathname === "/streaks/submit";

  // Hide topbar when recording video for streak
  const hideTopbar = isRecording;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence>
          {!hideTopbar && (
            <Topbar key="topbar" onMenuClick={() => setMobileMenuOpen(true)} />
          )}
        </AnimatePresence>
        <main
          className={`flex-1 overflow-auto flex justify-center ${
            hideBottomNav ? "lg:pb-0" : "pb-20 lg:pb-0"
          }`}
        >
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

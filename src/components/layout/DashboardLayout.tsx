import { ReactNode, useState, useEffect } from "react";
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
  const [isMapView, setIsMapView] = useState(false);
  const location = useLocation();
  const { isRecording } = useRecording();

  // Hide bottom nav on streaks pages and ai-chat page
  const hideBottomNav =
    location.pathname === "/streaks" ||
    location.pathname === "/streaks/submit" ||
    location.pathname === "/ai-chat";

  // Hide topbar when recording video for streak or in map view
  const hideTopbar =
    isRecording || isMapView || location.pathname === "/streaks/submit";

  // Check if we're in map view and update reactively
  useEffect(() => {
    const checkMapView = () => {
      const viewMode = localStorage.getItem("cleanups-view-mode");
      setIsMapView(location.pathname === "/cleanups" && viewMode === "map");
    };

    // Check initially
    checkMapView();

    // Listen for storage changes (when view mode changes in Cleanups component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cleanups-view-mode") {
        checkMapView();
      }
    };

    // Listen for custom storage event (for same-tab updates)
    const handleCustomStorage = () => {
      checkMapView();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cleanups-view-mode-changed", handleCustomStorage);

    // Also check on location change
    checkMapView();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "cleanups-view-mode-changed",
        handleCustomStorage
      );
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      {!isMapView && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}

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
          className={`flex-1 overflow-y-auto overflow-x-hidden flex justify-center ${
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

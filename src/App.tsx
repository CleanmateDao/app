import {
  VeChainKitProvider,
  TransactionModalProvider,
} from "@vechain/vechain-kit";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import Insights from "./pages/Insights";
import Cleanups from "./pages/Cleanups";
import CleanupDetail from "./pages/CleanupDetail";
import OrganizeCleanup from "./pages/OrganizeCleanup";
import SubmitProofOfWork from "./pages/SubmitProofOfWork";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import AIChat from "./pages/AIChat";
import Onboarding from "./pages/Onboarding";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Streaks from "./pages/Streaks";
import StreakSubmit from "./pages/StreakSubmit";
import { useWalletAddress } from "./hooks/use-wallet-address";
import { RecordingProvider } from "./contexts/RecordingContext";
import { ExchangeRateProvider } from "./contexts/ExchangeRateContext";
import { useUser } from "./services/subgraph/queries";
import { PopupHandler } from "./components/PopupHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale - fetch fresh data every time
      gcTime: 1000 * 60 * 30, // 30 minutes - cache garbage collection
      retry: 2,
      refetchOnMount: true, // Always refetch on mount for fresh data
      refetchOnWindowFocus: true, // Always refetch on window focus for fresh data
      refetchOnReconnect: true, // Refetch on reconnect to sync with server
    },
  },
});

// Route guard for first-time users
const FirstTimeRedirect = () => {
  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

  if (!hasSeenOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

// Prevent registered users from accessing onboarding
const PreventRegisteredUsers = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const walletAddress = useWalletAddress();
  const { data: existingUser, isLoading } = useUser(walletAddress);

  // If user is registered, redirect to dashboard
  if (walletAddress && existingUser?.registeredAt > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking user registration
  if (walletAddress && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppInner = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <QueryClientProvider client={queryClient}>
      <PopupHandler />
      <VeChainKitProvider
        feeDelegation={{
          delegatorUrl: import.meta.env.VITE_DELEGATOR_URL!,
          delegateAllTransactions: false,
          b3trTransfers: { minAmountInEther: 1 },
        }}
        privy={{
          appId: import.meta.env.VITE_PRIVY_APP_ID!,
          clientId: import.meta.env.VITE_PRIVY_CLIENT_ID!,
          loginMethods: ["google", "apple"],
          embeddedWallets: {
            createOnLogin: "all-users",
          },
          appearance: {
            logo: "/logo.png",
            loginMessage: "Login to CleanMate",
          },
        }}
        theme={{
          modal: {
            useBottomSheetOnMobile: true,
          },
        }}
        dappKit={{
          allowedWallets: ["veworld", "sync2", "wallet-connect"],
          walletConnectOptions: {
            projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
            metadata: {
              name: "CleanMate",
              description: "CleanMate - Clean the planet",
              url: window.location.origin,
              icons: [`${window.location.origin}/logo.png`],
            },
          },
          usePersistence: true,
          useFirstDetectedSource: false,
        }}
        loginMethods={[
          { method: "vechain", gridColumn: 4 },
          { method: "dappkit", gridColumn: 4 },
          { method: "ecosystem", gridColumn: 4 },
        ]}
        loginModalUI={{
          description:
            "Choose between social login through VeChain or by connecting your wallet.",
        }}
        network={{ type: import.meta.env.VITE_VECHAIN_NETWORK }}
        allowCustomTokens={false}
        darkMode={isDarkMode}
      >
        <ExchangeRateProvider>
          <TransactionModalProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<FirstTimeRedirect />} />
                  <Route
                    path="/onboarding"
                    element={
                      <PreventRegisteredUsers>
                        <Onboarding />
                      </PreventRegisteredUsers>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <DashboardLayout>
                        <Insights />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/cleanups"
                    element={
                      <DashboardLayout>
                        <Cleanups />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/cleanups/:id"
                    element={
                      <DashboardLayout>
                        <CleanupDetail />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/cleanups/:id/submit-proof"
                    element={
                      <DashboardLayout>
                        <SubmitProofOfWork />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/organize"
                    element={
                      <DashboardLayout>
                        <OrganizeCleanup />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/rewards"
                    element={
                      <DashboardLayout>
                        <Rewards />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/ai-chat"
                    element={
                      <DashboardLayout>
                        <AIChat />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <DashboardLayout>
                        <Notifications />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <DashboardLayout>
                        <Settings />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/streaks"
                    element={
                      <DashboardLayout>
                        <Streaks />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/streaks/submit"
                    element={
                      <DashboardLayout>
                        <StreakSubmit />
                      </DashboardLayout>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </TransactionModalProvider>
        </ExchangeRateProvider>
      </VeChainKitProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <RecordingProvider>
      <AppInner />
    </RecordingProvider>
  </ThemeProvider>
);

export default App;

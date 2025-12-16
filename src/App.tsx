import {
  VeChainKitProvider,
  TransactionModalProvider,
} from "@vechain/vechain-kit";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Check if user has completed onboarding
const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const isOnboarded = localStorage.getItem("onboardingComplete") === "true";
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <VeChainKitProvider
        feeDelegation={{
          delegatorUrl: import.meta.env.VITE_DELEGATOR_URL!,
          delegateAllTransactions: true,
          b3trTransfers: { minAmountInEther: 1 },
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
      >
        <TransactionModalProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/onboarding" replace />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <Insights />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/cleanups"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <Cleanups />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/cleanups/:id"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <CleanupDetail />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/cleanups/:id/submit-proof"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <SubmitProofOfWork />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/organize"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <OrganizeCleanup />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <Rewards />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/ai-chat"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <AIChat />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <Notifications />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireOnboarding>
                      <DashboardLayout>
                        <Settings />
                      </DashboardLayout>
                    </RequireOnboarding>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TransactionModalProvider>
      </VeChainKitProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

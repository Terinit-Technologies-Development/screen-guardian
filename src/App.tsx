import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSettingsStore } from "@/store/settingsStore";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import BottomNav from "@/components/navigation/BottomNav";
import HomeScreen from "@/screens/HomeScreen";
import AppsScreen from "@/screens/AppsScreen";
import ProgressScreen from "@/screens/ProgressScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const hasCompletedOnboarding = useSettingsStore(s => s.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/apps" element={<AppsScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

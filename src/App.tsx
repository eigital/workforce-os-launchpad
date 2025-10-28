import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import FloatingAIButton from "@/components/ai/FloatingAIButton";
import { PointerGlow } from "@/components/3d/PointerGlow";
import { Route3D } from "@/components/3d/Route3D";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Schedule from "./pages/Schedule";
import TimeOff from "./pages/TimeOff";
import Availability from "./pages/Availability";
import ShiftPool from "./pages/ShiftPool";
import Team from "./pages/Team";
import Engage from "./pages/Engage";
import Hiring from "./pages/Hiring";
import Tasks from "./pages/Tasks";
import LogBook from "./pages/LogBook";
import TimeClocking from "./pages/TimeClocking";
import TipManagement from "./pages/TipManagement";
import TipManagementSettings from "./pages/TipManagementSettings";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import QuickStart from "./pages/QuickStart";
import Help from "./pages/Help";
import LogBookCategories from "./pages/LogBookCategories";
import LogBookSearch from "./pages/LogBookSearch";
import Messages from "./pages/communication/Messages";
import Announcements from "./pages/communication/Announcements";
import Notifications from "./pages/communication/Notifications";
import TimeOffRequests from "./pages/TimeOffRequests";
import TimeOffCalendar from "./pages/TimeOffCalendar";
import BlockedDays from "./pages/BlockedDays";
import OvertimeAnalysis from "./pages/reports/OvertimeAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="perspective-3d preserve-3d w-full min-h-screen">
          <Toaster />
          <Sonner />
          <PointerGlow />
          <FloatingAIButton />
          <BrowserRouter>
            <Route3D>
              <Routes>
                <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/time-off" element={<TimeOff />} />
            <Route path="/schedule/time-off/requests" element={<TimeOffRequests />} />
            <Route path="/schedule/time-off/calendar" element={<TimeOffCalendar />} />
            <Route path="/schedule/time-off/blocked-days" element={<BlockedDays />} />
            <Route path="/schedule/availability" element={<Availability />} />
            <Route path="/schedule/shift-pool" element={<ShiftPool />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/engage" element={<Engage />} />
            <Route path="/hiring" element={<Hiring />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/log-book" element={<LogBook />} />
            <Route path="/time-clocking" element={<TimeClocking />} />
            <Route path="/tip-management" element={<TipManagement />} />
            <Route path="/tip-management/settings" element={<TipManagementSettings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/overtime-analysis" element={<OvertimeAnalysis />} />
            <Route path="/help" element={<Help />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/quick-start" element={<QuickStart />} />
            <Route path="/communication/messages" element={<Messages />} />
            <Route path="/communication/announcements" element={<Announcements />} />
            <Route path="/communication/notifications" element={<Notifications />} />
            <Route path="/log-book/categories" element={<LogBookCategories />} />
            <Route path="/log-book/search" element={<LogBookSearch />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Route3D>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

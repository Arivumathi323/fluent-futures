import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GrammarTest from "./pages/GrammarTest";
import ReadingPractice from "./pages/practice/ReadingPractice";
import WritingPractice from "./pages/practice/WritingPractice";
import SpeakingPractice from "./pages/practice/SpeakingPractice";
import QuizChallenge from "./pages/practice/QuizChallenge";
import MediaPractice from "./pages/practice/MediaPractice";
import MediaSessionPlayer from "./pages/practice/MediaSessionPlayer";
import ScenarioLearning from "./pages/practice/ScenarioLearning";
import WeaknessAnalysis from "./pages/practice/WeaknessAnalysis";
import MonthlyReport from "./pages/MonthlyReport";
import Certification from "./pages/Certification";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Resources from "./pages/Resources";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSignup from "./pages/admin/AdminSignup";
import PublicIDCard from "./pages/PublicIDCard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student (Protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/grammar" element={<ProtectedRoute><GrammarTest /></ProtectedRoute>} />
            <Route path="/practice/reading" element={<ProtectedRoute><ReadingPractice /></ProtectedRoute>} />
            <Route path="/practice/writing" element={<ProtectedRoute><WritingPractice /></ProtectedRoute>} />
            <Route path="/practice/speaking" element={<ProtectedRoute><SpeakingPractice /></ProtectedRoute>} />
            <Route path="/practice/quiz" element={<ProtectedRoute><QuizChallenge /></ProtectedRoute>} />
            <Route path="/practice/media" element={<ProtectedRoute><MediaPractice /></ProtectedRoute>} />
            <Route path="/practice/media/:sessionId" element={<ProtectedRoute><MediaSessionPlayer /></ProtectedRoute>} />
            <Route path="/practice/scenario" element={<ProtectedRoute><ScenarioLearning /></ProtectedRoute>} />
            <Route path="/practice/weakness" element={<ProtectedRoute><WeaknessAnalysis /></ProtectedRoute>} />
            <Route path="/monthly-report" element={<ProtectedRoute><MonthlyReport /></ProtectedRoute>} />
            <Route path="/certification" element={<ProtectedRoute><Certification /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Public ID Card */}
            <Route path="/id-card/:uid" element={<PublicIDCard />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

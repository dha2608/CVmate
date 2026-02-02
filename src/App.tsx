import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Toast from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Builder = lazy(() => import("@/pages/Builder"));
const Interview = lazy(() => import("@/pages/Interview"));
const Community = lazy(() => import("@/pages/Community"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const NewsDetail = lazy(() => import("@/pages/NewsDetail"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Messaging = lazy(() => import("@/pages/Messaging"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("@/pages/PaymentCancel"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const About = lazy(() => import("@/pages/About"));
const Pricing = lazy(() => import("@/pages/Pricing"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-crimson-red mx-auto mb-4" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Đang tải...</p>
    </div>
  </div>
);

export default function App() {
  const { user } = useAuthStore();

  return (
    <ErrorBoundary>
      <Router>
        <Toast />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/builder" 
              element={
                <ProtectedRoute>
                  <Builder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interview" 
              element={
                <ProtectedRoute>
                  <Interview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog" 
              element={
                <ProtectedRoute>
                  <Blog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog/:id" 
              element={
                <ProtectedRoute>
                  <BlogDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/news/:link" 
              element={
                <ProtectedRoute>
                  <NewsDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messaging" 
              element={
                <ProtectedRoute>
                  <Messaging />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookmarks" 
              element={
                <ProtectedRoute>
                  <Bookmarks />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { normalizeImageUrl } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Toast from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/mobile";
import { Loader2 } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";

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
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const Contact = lazy(() => import("@/pages/Contact"));
const Careers = lazy(() => import("@/pages/Careers"));
const Partners = lazy(() => import("@/pages/Partners"));
const Sitemap = lazy(() => import("@/pages/Sitemap"));
const Accessibility = lazy(() => import("@/pages/Accessibility"));
const Admin = lazy(() => import("@/pages/Admin"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));

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
  const { user, setUser } = useAuthStore();

  // 在应用初始化时刷新用户数据，确保获取最新的头像和封面图片
  useEffect(() => {
    const refreshUserData = async () => {
      if (user?.token) {
        try {
          const { api } = await import('@/lib/utils');
          const response = await api.getMe();
          if (response.success && response.data) {
            // 只更新数据，保留 token，并规范化图片 URL
            const normalizedData = {
              ...response.data,
              avatar: normalizeImageUrl(response.data.avatar) || response.data.avatar,
              coverPhoto: normalizeImageUrl((response.data as any).coverPhoto) || (response.data as any).coverPhoto,
              token: user.token
            };
            setUser(normalizedData);
          }
        } catch (error) {
          // 静默失败，不影响用户体验
          console.warn('Failed to refresh user data on app init:', error);
        }
      }
    };

    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在应用启动时运行一次

  return (
    <ErrorBoundary>
      <Router>
        <OfflineIndicator />
        <Toast />
        <ScrollToTop />
        <PageTransition>
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
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/accessibility" element={<Accessibility />} />
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
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route 
              path="/u/:id"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </Router>
    </ErrorBoundary>
  );
}

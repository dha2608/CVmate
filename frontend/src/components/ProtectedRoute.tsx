import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1386123c-2287-451b-80f4-d6f4e7719507', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `log_${Date.now()}_ProtectedRoute`,
      timestamp: Date.now(),
      location: 'frontend/src/components/ProtectedRoute.tsx:render',
      runId: 'pre-fix',
      hypothesisId: 'H2',
      message: 'ProtectedRoute evaluated',
      data: { hasUser: !!user, path: location.pathname },
    }),
  }).catch(() => {});
  // #endregion agent log

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

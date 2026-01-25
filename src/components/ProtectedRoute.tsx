import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  // Nếu không có user hoặc token hết hạn → redirect tới login
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

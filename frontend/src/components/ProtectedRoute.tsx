import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type UserProtectedRouteProps = {
  children: JSX.Element;
};

const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default UserProtectedRoute;

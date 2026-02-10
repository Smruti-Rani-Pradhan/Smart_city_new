import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '@/services/auth';

type RouteGuardProps = {
  role?: 'citizen' | 'official';
};

export const RouteGuard = ({ role }: RouteGuardProps) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.userType !== role) {
    if (user.userType === 'official') {
      return <Navigate to="/official/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

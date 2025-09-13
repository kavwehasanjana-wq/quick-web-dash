import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '@/services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!ApiService.isAuthenticated()) {
    return <div>Redirecting...</div>;
  }

  return <>{children}</>;
};
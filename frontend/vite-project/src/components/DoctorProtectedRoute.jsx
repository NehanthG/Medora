import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDoctorAuthStore } from '../stores/doctorAuthStore';
import { useEffect, useState } from 'react';

export default function DoctorProtectedRoute() {
  const { doctor, isCheckingAuth, checkAuth } = useDoctorAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname.includes('/login');
  const isRegisterPage = location.pathname.includes('/register');

  useEffect(() => {
    // Only check auth if we're not on login/register pages
    if (!isLoginPage && !isRegisterPage) {
      const verifyAuth = async () => {
        await checkAuth();
        setIsLoading(false);
      };
      verifyAuth();
    } else {
      setIsLoading(false);
    }
  }, [isLoginPage, isRegisterPage, checkAuth]);

  // Don't show anything while checking auth state
  if (isLoading || isCheckingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If we're on login/register pages, just render the content
  if (isLoginPage || isRegisterPage) {
    return <Outlet />;
  }

  // If we have a doctor, render the protected route
  if (doctor) {
    return <Outlet />;
  }

  // If no doctor, redirect to login
  return <Navigate to="/doctor/login" state={{ from: location }} replace />;
}

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isCheckingAuth } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600/10 border-t-[#2563eb] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#2563eb] font-semibold text-xs tracking-wide">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

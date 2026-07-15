import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkCurrentUser } from './modules/auth/slices/authSlice.js';

// Page imports
import Login from './modules/auth/pages/Login.jsx';
import Register from './modules/auth/pages/Register.jsx';
import ForgotPassword from './modules/auth/pages/ForgotPassword.jsx';
import ResetPassword from './modules/auth/pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import EmailVerification from './pages/EmailVerification.jsx';
import LandingPage from './pages/LandingPage.jsx';

// Route Guard
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const dispatch = useDispatch();
  const { isCheckingAuth, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Attempt session restore on mount using HTTP-only cookies
    dispatch(checkCurrentUser());
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600/10 border-t-[#2563eb] rounded-full animate-spin"></div>
          <p className="mt-4 text-[#2563eb] font-semibold text-xs tracking-wide">
            Loading CRM Core Application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected enterprise dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback routing */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

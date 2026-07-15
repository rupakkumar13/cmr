import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Verification token is missing from the URL.');
        setLoading(false);
        return;
      }

      try {
        await api.get(`/api/v1/auth/verify-email?token=${token}`);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Account Verification</h2>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 text-xs font-medium">Verifying your email token with server...</p>
          </div>
        ) : success ? (
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Verified!</h3>
            <p className="text-gray-600 text-xs px-2 mb-5 font-medium">
              Thank you for verifying your email. Your account is now fully activated and ready for use.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-red-600 text-xs px-2 mb-5 font-medium">
              {error}
            </p>
            <div className="space-y-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors animate-fade-in"
              >
                Create New Account
              </Link>
              <Link
                to="/login"
                className="block text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium mt-4"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../services/api.js';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      setError('Invalid reset link. Reset token is missing.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/v1/auth/reset-password?token=${token}`, {
        password: data.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            Please enter your new password below.
          </p>
        </div>

        {!token ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 mb-5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">Invalid password reset link. Please check your email or request a new reset link.</span>
          </div>
        ) : success ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset Successful</h3>
            <p className="text-gray-600 text-xs px-2 mb-5 font-medium">
              Your password has been successfully updated. You can now login with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-sm font-medium"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1.5 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-sm font-medium"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1.5 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

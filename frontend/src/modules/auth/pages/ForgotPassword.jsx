import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../services/api.js';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/v1/auth/forgot-password', data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-gray-500 text-xs mt-1 font-medium font-sans">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200 text-green-600 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Request Submitted</h3>
            <p className="text-gray-600 text-xs px-2 mb-5 font-medium">
              If an account exists for that email, password reset instructions will arrive shortly.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg py-2.5 text-sm font-semibold transition-all border border-slate-200"
            >
              Return to Login
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
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@company.com"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-sm font-medium"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

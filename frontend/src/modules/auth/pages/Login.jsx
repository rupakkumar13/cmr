import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../slices/authSlice.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, from, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100/80">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Sign in to CRM</h2>
          <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-2.5 text-red-600 text-sm">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-200 rounded-lg shadow-sm py-2.5 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 rounded-lg shadow-sm py-2.5 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

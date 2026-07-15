import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../slices/authSlice.js';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'HR', 'SALES', 'MANAGER', 'EMPLOYEE'], {
    error_message: 'Please select a valid role',
  }),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'EMPLOYEE',
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(resultAction)) {
      setSuccess(true);
      reset();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm ring-1 ring-slate-900/[0.03]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100/80">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Get started with your CRM profile</p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Registration Successful</h3>
            <p className="text-sm text-slate-500 px-2 mb-6">
              An email verification link has been sent to your registered email address.
            </p>
            <Link
              to="/login"
              className="btn-primary w-full h-10 inline-flex items-center justify-center transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-2.5 text-red-600 text-sm">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white border border-slate-200 rounded-lg shadow-sm py-2.5 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
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
                    placeholder="john@company.com"
                    className="w-full bg-white border border-slate-200 rounded-lg shadow-sm py-2.5 pl-9 pr-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
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
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Organizational Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <select
                    {...register('role')}
                    className="w-full bg-white border border-slate-200 rounded-lg shadow-sm py-2.5 pl-9 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="HR">HR MANAGER</option>
                    <option value="SALES">SALES EXECUTIVE</option>
                    <option value="MANAGER">GENERAL MANAGER</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                    ▼
                  </span>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.role.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;

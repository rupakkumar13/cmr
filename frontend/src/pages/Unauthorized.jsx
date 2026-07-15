import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 border border-red-100 text-red-600 mb-5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Access Denied</h2>
        <p className="text-gray-500 text-xs mt-2 px-2 font-medium">
          Your current organizational role does not have authorization to view this resource. Please contact your administrator.
        </p>

        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg py-2.5 px-4 text-xs font-semibold border border-slate-200 transition-colors w-full cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

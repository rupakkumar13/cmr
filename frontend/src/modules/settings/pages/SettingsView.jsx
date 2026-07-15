import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCompanySettings, 
  updateCompanySettings, 
  fetchSystemPreferences, 
  updateSystemPreferences, 
  updateUserProfile, 
  changeUserPassword, 
  clearSettingsMessages 
} from '../../../store/settingsSlice.js';
import { useForm } from 'react-hook-form';
import { Loader2, Settings, User, Building2, Key, ToggleLeft, Palette, Check } from 'lucide-react';

const SettingsView = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { company, preferences, loading, error, successMessage } = useSelector((state) => state.settings);

  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#2563eb');

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } = useForm();
  const { register: registerCompany, handleSubmit: handleSubmitCompany, reset: resetCompany } = useForm();
  const { register: registerPrefs, handleSubmit: handleSubmitPrefs, reset: resetPrefs } = useForm();

  useEffect(() => {
    dispatch(fetchCompanySettings());
    dispatch(fetchSystemPreferences());
  }, [dispatch]);

  // Set default form values once fetched
  useEffect(() => {
    if (currentUser) {
      resetProfile({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser, resetProfile]);

  useEffect(() => {
    if (company) {
      resetCompany(company);
    }
  }, [company, resetCompany]);

  useEffect(() => {
    if (preferences) {
      resetPrefs(preferences);
    }
  }, [preferences, resetPrefs]);

  const onProfileSubmit = (data) => {
    dispatch(updateUserProfile(data));
  };

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    dispatch(changeUserPassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }));
    resetPassword();
  };

  const onCompanySubmit = (data) => {
    dispatch(updateCompanySettings(data));
  };

  const onPrefsSubmit = (data) => {
    dispatch(updateSystemPreferences({
      ...data,
      sessionExpiryHours: Number(data.sessionExpiryHours),
      lowStockThreshold: Number(data.lowStockThreshold),
      defaultTaxRate: Number(data.defaultTaxRate)
    }));
  };

  const changeAccent = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
    // Reload dynamically if needed, or simply let the app read accent color
  };

  const menuItems = [
    { id: 'profile', label: 'User Profile', icon: User, allowed: true },
    { id: 'password', label: 'Change Password', icon: Key, allowed: true },
    { id: 'company', label: 'Company Settings', icon: Building2, allowed: currentUser?.role === 'ADMIN' },
    { id: 'preferences', label: 'System Preferences', icon: ToggleLeft, allowed: currentUser?.role === 'ADMIN' },
    { id: 'theme', label: 'Theme Accents', icon: Palette, allowed: true }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      {/* Sidebar Nav */}
      <div className="w-full md:w-52 space-y-1.5 shrink-0">
        <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-blue-600" /> Configurations
        </h3>

        <div className="space-y-1 pt-2">
          {menuItems.filter(item => item.allowed).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  dispatch(clearSettingsMessages());
                  setActiveSubTab(item.id);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeSubTab === item.id 
                    ? 'bg-gray-100 font-bold text-gray-900 border-l-2 border-blue-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main settings config views */}
      <div className="flex-1 space-y-4">
        {/* Messages */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-lg font-bold">
            {successMessage}
          </div>
        )}

        {/* PROFILE SETTINGS VIEW */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4 max-w-md">
            <div>
              <h4 className="text-sm font-bold text-gray-900">User Profile details</h4>
              <p className="text-gray-400 text-[10px] mt-0.5">Manage your personal credentials, email handles, and contact phones</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  {...registerProfile('name', { required: true })}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <input
                  {...registerProfile('email', { required: true })}
                  type="email"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone number</label>
                <input
                  {...registerProfile('phone')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Update Profile
            </button>
          </form>
        )}

        {/* CHANGE PASSWORD VIEW */}
        {activeSubTab === 'password' && (
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Change Account Password</h4>
              <p className="text-gray-400 text-[10px] mt-0.5">Keep your account secure by rotating your login password frequently</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                <input
                  {...registerPassword('currentPassword', { required: true })}
                  type="password"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                <input
                  {...registerPassword('newPassword', { required: true, minLength: 6 })}
                  type="password"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                <input
                  {...registerPassword('confirmPassword', { required: true })}
                  type="password"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Change Password
            </button>
          </form>
        )}

        {/* COMPANY SETTINGS VIEW */}
        {activeSubTab === 'company' && currentUser?.role === 'ADMIN' && (
          <form onSubmit={handleSubmitCompany(onCompanySubmit)} className="space-y-4 max-w-lg">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Company Business Profile</h4>
              <p className="text-gray-400 text-[10px] mt-0.5">Manage currency units, billing addresses, tax registrations, and identity information</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Company name</label>
                <input
                  {...registerCompany('companyName', { required: true })}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Corporate Tax ID</label>
                <input
                  {...registerCompany('taxNumber')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base currency</label>
                <select
                  {...registerCompany('currency')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none text-gray-700"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact Email</label>
                <input
                  {...registerCompany('contactEmail')}
                  type="email"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact Phone</label>
                <input
                  {...registerCompany('contactPhone')}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Billing Address</label>
                <textarea
                  {...registerCompany('address')}
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Settings
            </button>
          </form>
        )}

        {/* SYSTEM PREFERENCES VIEW */}
        {activeSubTab === 'preferences' && currentUser?.role === 'ADMIN' && (
          <form onSubmit={handleSubmitPrefs(onPrefsSubmit)} className="space-y-4 max-w-md">
            <div>
              <h4 className="text-sm font-bold text-gray-900">System Constants & Preferences</h4>
              <p className="text-gray-400 text-[10px] mt-0.5">Toggle default alerts levels, tax rates, and session durations</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Session validity (Hours)</label>
                <input
                  {...registerPrefs('sessionExpiryHours')}
                  type="number"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Low stock alert threshold</label>
                <input
                  {...registerPrefs('lowStockThreshold')}
                  type="number"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default VAT/GST rate (%)</label>
                <input
                  {...registerPrefs('defaultTaxRate')}
                  type="number"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-bold text-gray-900">Automatic email alerts</h5>
                  <p className="text-[10px] text-gray-400 mt-0.5">Disburse system notifications alerts directly to user inbox</p>
                </div>
                <input
                  type="checkbox"
                  {...registerPrefs('enableEmailAlerts')}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Preferences
            </button>
          </form>
        )}

        {/* THEME ACCENTS VIEW */}
        {activeSubTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Dashboard Theme Accents</h4>
              <p className="text-gray-400 text-[10px] mt-0.5">Customize the default layout visual accents color</p>
            </div>

            <div className="flex gap-4 pt-3">
              {[
                { hex: '#2563eb', name: 'Zoho Blue' },
                { hex: '#4f46e5', name: 'Indigo Hub' },
                { hex: '#0d9488', name: 'Teal SaaS' },
                { hex: '#059669', name: 'Emerald Vault' }
              ].map((color) => (
                <button
                  key={color.hex}
                  onClick={() => changeAccent(color.hex)}
                  className="w-20 h-16 rounded-lg border border-gray-300 relative flex flex-col justify-between p-2 cursor-pointer shadow-sm text-left"
                  style={{ borderTop: `4px solid ${color.hex}` }}
                >
                  <span className="text-[9px] font-bold text-gray-900 leading-tight">{color.name}</span>
                  {accentColor === color.hex && (
                    <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;

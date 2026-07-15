import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../modules/auth/slices/authSlice.js';
import {
  Layers,
  ArrowRight,
  ChevronRight,
  Check,
  CheckCircle2,
  Users,
  DollarSign,
  Briefcase,
  HardDrive,
  Bell,
  Activity,
  Shield,
  Menu,
  X,
  LogOut,
  Sparkles,
  TrendingUp,
  Inbox,
  UserCheck,
  Play
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('crm');
  const [openFaq, setOpenFaq] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [leads, setLeads] = useState(250);
  const [invoices, setInvoices] = useState(50);

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Content definitions for Interactive Tabs
  const tabContent = {
    crm: {
      title: "Advanced Customer Relationship Management",
      desc: "Nurture prospects into customers. Track deal phases, register client contacts, and manage the lead funnel with high visibility.",
      icon: Users,
      badge: "Sales Pipeline",
      mockUi: (
        <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden text-xs">
          <div className="bg-gray-50 border-b border-gray-150 px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Recent Deals</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium text-[10px]">Active Pipeline</span>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Acme Corp Integration</p>
                <p className="text-[10px] text-gray-400">Owner: Sarah Jenkins</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹18,500</p>
                <span className="bg-amber-105 text-amber-800 text-[9px] font-medium px-1.5 py-0.5 rounded">Proposal Stage</span>
              </div>
            </div>
            <div className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Nova Solutions SaaS</p>
                <p className="text-[10px] text-gray-400">Owner: Michael Chen</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹9,200</p>
                <span className="bg-blue-100 text-blue-800 text-[9px] font-medium px-1.5 py-0.5 rounded">Negotiation</span>
              </div>
            </div>
            <div className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">Global Logistics Upgrade</p>
                <p className="text-[10px] text-gray-400">Owner: Sarah Jenkins</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹45,000</p>
                <span className="bg-green-100 text-green-800 text-[9px] font-medium px-1.5 py-0.5 rounded">Closed Won</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    billing: {
      title: "Smart Automations for Invoicing & Payments",
      desc: "Create dynamic billing logs, set customized tax categories, compute subtotal and grand total metrics, and monitor balance dues instantly.",
      icon: DollarSign,
      badge: "Invoicing Engine",
      mockUi: (
        <div className="bg-white border border-gray-150 rounded-xl shadow-sm p-4 text-xs font-sans text-gray-700">
          <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Invoice Details</p>
              <p className="font-bold text-gray-900 mt-0.5">INV-2026-0048</p>
            </div>
            <span className="bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Paid</span>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-gray-500">
              <span>Enterprise Subscription (1 Month)</span>
              <span className="font-medium text-gray-900">₹2,400.00</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Custom Integration SLA Support</span>
              <span className="font-medium text-gray-900">₹500.00</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1 text-right">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>₹2,900.00</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (18% GST):</span>
              <span>₹522.00</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-sm pt-1">
              <span>Total Balance:</span>
              <span className="text-blue-600">₹3,422.00</span>
            </div>
          </div>
        </div>
      )
    },
    hr: {
      title: "Organized HR & Employee Directory",
      desc: "Manage personnel profiles, set user roles (Admin, Manager, Employee), audit team statistics, and ensure correct permission hierarchies.",
      icon: Briefcase,
      badge: "Team Directory",
      mockUi: (
        <div className="bg-white border border-gray-150 rounded-xl shadow-sm p-3 grid grid-cols-2 gap-3 text-xs">
          <div className="border border-gray-100 rounded-lg p-2.5 hover:border-blue-100 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">Alex Dev</p>
              <p className="text-[10px] text-gray-400">Chief Architect</p>
              <span className="inline-block mt-1 bg-purple-50 text-purple-700 text-[9px] px-1.5 py-0.2 rounded font-medium">Admin</span>
            </div>
          </div>
          <div className="border border-gray-100 rounded-lg p-2.5 hover:border-blue-100 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs">
              MT
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">Maria Taylor</p>
              <p className="text-[10px] text-gray-400">Account Executive</p>
              <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.2 rounded font-medium">Manager</span>
            </div>
          </div>
          <div className="border border-gray-100 rounded-lg p-2.5 hover:border-blue-100 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              RH
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">Ray Hudson</p>
              <p className="text-[10px] text-gray-400">Billing Analyst</p>
              <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-[9px] px-1.5 py-0.2 rounded font-medium">Employee</span>
            </div>
          </div>
          <div className="border border-gray-100 rounded-lg p-2.5 hover:border-blue-100 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              JC
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">John Cole</p>
              <p className="text-[10px] text-gray-400">Inventory Specialist</p>
              <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-[9px] px-1.5 py-0.2 rounded font-medium">Employee</span>
            </div>
          </div>
        </div>
      )
    },
    inventory: {
      title: "Warehouse & Smart Stock Cataloging",
      desc: "Supervise products in real time. Track unit quantities, set price lists, record active supplier details, and get low-stock warnings.",
      icon: HardDrive,
      badge: "Stock Control",
      mockUi: (
        <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-semibold">
                <th className="px-3 py-2">Item Name</th>
                <th className="px-3 py-2 text-center">In Stock</th>
                <th className="px-3 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Optics Router v2</td>
                <td className="px-3 py-2 text-center">
                  <span className="bg-green-100 text-green-800 text-[9px] font-semibold px-2 py-0.5 rounded-full">142 Units</span>
                </td>
                <td className="px-3 py-2 text-right font-medium">₹499.00</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Fiber Shield Cable</td>
                <td className="px-3 py-2 text-center">
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-semibold px-2 py-0.5 rounded-full">12 Units</span>
                </td>
                <td className="px-3 py-2 text-right font-medium">₹25.50</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Server Chassis M1</td>
                <td className="px-3 py-2 text-center">
                  <span className="bg-red-100 text-red-800 text-[9px] font-semibold px-2 py-0.5 rounded-full">3 Units</span>
                </td>
                <td className="px-3 py-2 text-right font-medium">₹1,290.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 overflow-x-hidden font-sans selection:bg-blue-150 relative">
      {/* Zoho CRM-inspired Pastel Gradient Background overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-[650px] pointer-events-none opacity-90 z-0"
        style={{
          background: 'linear-gradient(to right, rgba(254, 240, 240, 0.95), rgba(255, 248, 230, 0.95), rgba(240, 253, 244, 0.95), rgba(236, 254, 255, 0.95), rgba(239, 246, 255, 0.95))',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
        }}
      ></div>

      {/* Header / Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-gray-200/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                CRM Core
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#modules" className="hover:text-blue-600 transition-colors">Modules</a>
              <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            </nav>

            {/* CTA / Auth Controls */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 leading-tight">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg shadow-sm shadow-blue-600/10 transition-all cursor-pointer hover:shadow"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors py-2 px-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-all shadow-sm shadow-slate-950/10 cursor-pointer"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none p-1.5 border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 pt-4 pb-6 space-y-4 shadow-xl">
            <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-600">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 transition-colors">Features</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 transition-colors">Modules</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 transition-colors">FAQ</a>
            </nav>
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center mb-1">
                    <p className="text-[10px] text-gray-400 leading-tight">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{user?.name || user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-sm"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-lg border border-slate-200"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center font-semibold text-slate-600 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center bg-slate-900 text-white font-semibold py-2.5 rounded-lg"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/60 mb-6 text-blue-700 font-semibold text-[11px] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
            CRM Core Version 1.0 is Live
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight max-w-4xl mx-auto">
            The Unified Enterprise CRM Platform Built for Scale
          </h1>

          {/* Subheading Checklist (Zoho CRM pricing page style) */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-y-3 gap-x-6 sm:gap-x-8 text-slate-800 font-semibold text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50 shrink-0" />
              <span>Scalable platform</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50 shrink-0" />
              <span>Automated billing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50 shrink-0" />
              <span>Minimal learning curve</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50 shrink-0" />
              <span>Reliable SLA support</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.01] hover:shadow-xl transition-all cursor-pointer"
              >
                Access Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:scale-[1.01] hover:shadow-xl transition-all cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-slate-750 hover:text-slate-900 font-semibold px-7 py-3.5 rounded-xl border border-gray-250/80 hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600/10" /> Watch Demo Video
                </button>
              </>
            )}
          </div>


        </div>
      </section>

      {/* Trust Banner / Stats */}
      <section className="bg-white border-y border-gray-200/60 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">99.99%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Platform Uptime</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">10k+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Active Accounts</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">₹50M+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Transactions Processed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">24/7</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">SLA Support Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 sm:py-28 bg-[#f6f8fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Enterprise Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              An Integrated Approach to Workspace Management
            </p>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed">
              Ditch the dozens of scattered SaaS tabs. Elevate your operational capabilities with unified databases, seamless logic modules, and clear, granular records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Sales & Client CRM</h3>
              <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                Log and monitor deals at every stage of your pipeline. Build profile registries with metadata logs for each contact.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Smart Invoicing</h3>
              <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                Create structured lists of services, specify tax items, generate printable layouts, and track payments to reduce billing delays.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">HR & Team Directory</h3>
              <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                Manage roles, view department mappings, track statuses, and audit employee logs to maintain transparent operational hierarchy.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Inventory Control</h3>
              <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                Monitor current quantities, audit item pricing structure, coordinate with suppliers, and keep logs error-free.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Centralized Alerts</h3>
              <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                Get notified immediately on data adjustments, payment receipts, or low stock counts to stay ahead of errors.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Integrated Analytics</h3>
              <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
                Audit metrics, analyze overall pipeline revenue, and review financial growth stats through standard charting panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs / Module Deep-Dive Section */}
      <section id="modules" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Interactive Modules</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">Explore the Platform in Real-time</p>
            <p className="text-slate-500 text-xs mt-3">Click on a module name to inspect its custom layout structure and UI presentation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Tab Selectors */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {Object.entries(tabContent).map(([key, item]) => {
                const TabIcon = item.icon;
                const isSelected = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-start gap-4 p-4.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                        : 'bg-white border-gray-150 hover:bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-500'
                    }`}>
                      <TabIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{item.badge}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5 leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Displaying Visual Mockup */}
            <div className="lg:col-span-7 bg-[#f6f8fb] border border-gray-200 rounded-2xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-center min-h-[360px] shadow-inner">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-250/20 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Tab Header Badge */}
              <div className="mb-4 inline-flex items-center gap-1.5 bg-white border border-gray-200/80 px-3 py-1 rounded-full text-[10px] font-semibold text-slate-600 self-start shadow-sm">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                Module View: {tabContent[activeTab].badge}
              </div>

              {/* Render dynamic mockup */}
              <div className="transition-all duration-300 transform scale-100">
                {tabContent[activeTab].mockUi}
              </div>

              {/* Action Button inside Module Preview */}
              <div className="mt-6 flex justify-end">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
                >
                  Configure this module
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="roi-calculator" className="py-20 sm:py-28 bg-[#f6f8fb] border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">ROI Calculator</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">Estimate Your Savings</p>
            <p className="text-slate-500 text-xs mt-3">Drag the sliders to see estimate working hours and operations value CRM Core can reclaim for your business.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
            {/* Sliders Container */}
            <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Slider 1: Leads */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Monthly Active Leads</span>
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono text-[11px]">{leads} Leads</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="50"
                  value={leads}
                  onChange={(e) => setLeads(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-150 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>50</span>
                  <span>1,000</span>
                </div>
              </div>

              {/* Slider 2: Invoices */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Monthly Invoices Processed</span>
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono text-[11px]">{invoices} Invoices</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="10"
                  value={invoices}
                  onChange={(e) => setInvoices(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-gray-150 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>
            </div>

            {/* Calculations Result Cards */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Time Restored</span>
                <div className="mt-4">
                  <p className="text-4xl font-extrabold text-white tracking-tight">{Math.round((leads * 0.1) + (invoices * 0.4))} hrs</p>
                  <p className="text-[10px] text-slate-450 mt-1 leading-tight font-semibold">Restored work hours / month</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-5 flex flex-col justify-between shadow-md">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Monthly Savings</span>
                <div className="mt-4">
                  <p className="text-4xl font-extrabold tracking-tight">₹{(Math.round((leads * 0.1) + (invoices * 0.4)) * 35).toLocaleString()}</p>
                  <p className="text-[10px] text-blue-100 mt-1 leading-tight font-semibold">Reclaimed operations value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-28 bg-white border-t border-gray-200/65">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Client Feedback</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">Trusted by Modern Business Teams</p>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">
              Read how teams unify customer contacts, HR directory charts, inventory logs, and invoice billing records using CRM Core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-[#f6f8fb] border border-gray-150 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 text-amber-500 mb-4 text-xs">
                {"★★★★★".split("").map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed italic mb-5">
                "CRM Core unified our sales pipelines and client billing accounts in under 24 hours. The inventory restocking alert log has single-handedly prevented several critical delivery delays."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  TB
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs leading-tight">Tom Brady</p>
                  <p className="text-[10px] text-slate-400">VP of Logistics, Globalize Inc</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f6f8fb] border border-gray-150 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 text-amber-500 mb-4 text-xs">
                {"★★★★★".split("").map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed italic mb-5">
                "We had dozens of spreadsheets tracking invoice taxes and employee directory lists. Now, everything hooks into one dashboard. The interface is clean, modern, and requires almost no team training."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                  SK
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs leading-tight">Sarah Koenig</p>
                  <p className="text-[10px] text-slate-400">Director of People Operations, Nova Soft</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f6f8fb] border border-gray-150 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 text-amber-500 mb-4 text-xs">
                {"★★★★★".split("").map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed italic mb-5">
                "The automated client invoicing engine computes GST subtotals perfectly and provides PDF export links that look highly professional. Excellent uptime support and seamless Redux auth session restores."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  ML
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs leading-tight">Marcus Lin</p>
                  <p className="text-[10px] text-slate-400">Chief Accountant, Apex Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Common Questions</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is CRM Core?",
                a: "CRM Core is an integrated B2B software suite designed to combine sales pipeline records, team directory setups, billing invoicing calculations, and stock control logs into a single high-performance interface."
              },
              {
                q: "Is it secure to store billing info on this platform?",
                a: "Absolutely. Our authentication layer runs via secure HTTP-only cookie validation and checks authorization permissions for all data edits, ensuring client records remain secure."
              },
              {
                q: "Can I manage inventory lists and connect them to invoices?",
                a: "Yes. The platform provides structured hooks to manage inventory assets. Invoicing submenus allow specifying exact unit line-items, compute tax liabilities, and automatically updates total weights."
              },
              {
                q: "Do I need to download any desktop client software?",
                a: "No. CRM Core is a fully cloud-hosted web application that runs inside any modern desktop or mobile browser."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-150 rounded-xl overflow-hidden transition-all bg-[#fafbfc]/30"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 text-sm hover:bg-slate-50/50 cursor-pointer focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className={`text-blue-600 transition-transform duration-250 font-mono text-lg`}>
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-slate-500 text-xs leading-relaxed transition-all duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section 
        className="py-16 sm:py-20 relative overflow-hidden border-t border-gray-200"
        style={{
          background: 'linear-gradient(to right, rgba(254, 240, 240, 0.95), rgba(255, 248, 230, 0.95), rgba(240, 253, 244, 0.95), rgba(236, 254, 255, 0.95), rgba(239, 246, 255, 0.95))'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">Ready to Align Your Business?</h2>
          <p className="mt-4 text-slate-600 text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Create your account today, verify your email, and start configuring your CRM modules instantly.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 bg-transparent hover:bg-slate-100/60 text-slate-800 font-semibold px-6 py-3 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 text-slate-500 text-xs py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <span className="font-semibold text-slate-800">CRM Core Platform</span>
          </div>
          <p className="text-[11px] text-slate-500">&copy; {new Date().getFullYear()} CRM Core. All rights reserved.</p>
          <div className="flex gap-6 text-[11px] text-slate-500">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Security</a>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <div className="relative bg-slate-900 w-full max-w-4xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-950/90 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400">CRM Core Platform Video Tour</span>
              <button 
                onClick={() => setIsDemoOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-850 transition-colors cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-black flex flex-col items-center justify-center text-slate-400 relative">
              <div className="relative z-10 flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 border-2 border-blue-500 flex items-center justify-center text-blue-500 mb-4 animate-pulse">
                  <Play className="w-8 h-8 fill-blue-500/20 animate-bounce" />
                </div>
                <p className="text-white font-bold text-sm">CRM Core Interactive Tour Loading...</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">Connecting to streaming nodes. Click the close button above to exit the tour.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

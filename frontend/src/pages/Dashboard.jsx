import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../modules/auth/slices/authSlice.js';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Shield, 
  Mail, 
  Layers, 
  HardDrive, 
  Users, 
  Activity, 
  FileText, 
  Settings, 
  LayoutDashboard,
  FolderLock,
  Calendar,
  DollarSign,
  Loader2,
  Bell,
  Clock,
  ClipboardList,
  FolderOpen,
  ArrowRight,
  Megaphone,
  Check,
  Search,
  ChevronDown
} from 'lucide-react';

// Recharts components
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// HR Sub-pages
import EmployeeList from '../modules/hr/pages/EmployeeList.jsx';
import EmployeeDetail from '../modules/hr/pages/EmployeeDetail.jsx';
import DepartmentList from '../modules/hr/pages/DepartmentList.jsx';
import AttendanceLogs from '../modules/hr/pages/AttendanceLogs.jsx';
import LeaveRequests from '../modules/hr/pages/LeaveRequests.jsx';
import PayrollManager from '../modules/hr/pages/PayrollManager.jsx';
import MyDocuments from '../modules/hr/pages/MyDocuments.jsx';
import api from '../services/api.js';

// CRM Sub-pages
import LeadList from '../modules/crm/pages/LeadList.jsx';
import LeadDetail from '../modules/crm/pages/LeadDetail.jsx';
import CustomerList from '../modules/crm/pages/CustomerList.jsx';
import CustomerDetail from '../modules/crm/pages/CustomerDetail.jsx';
import DealManager from '../modules/crm/pages/DealManager.jsx';
import MeetingList from '../modules/crm/pages/MeetingList.jsx';
import FollowUpList from '../modules/crm/pages/FollowUpList.jsx';

// Inventory Sub-pages
import CategoryList from '../modules/inventory/pages/CategoryList.jsx';
import ProductList from '../modules/inventory/pages/ProductList.jsx';
import SupplierList from '../modules/inventory/pages/SupplierList.jsx';
import PurchaseOrderList from '../modules/inventory/pages/PurchaseOrderList.jsx';
import StockMovementList from '../modules/inventory/pages/StockMovementList.jsx';

// Billing Sub-pages
import QuotationList from '../modules/billing/pages/QuotationList.jsx';
import InvoiceList from '../modules/billing/pages/InvoiceList.jsx';
import PaymentList from '../modules/billing/pages/PaymentList.jsx';

// Reports Sub-pages
import ReportView from '../modules/reports/pages/ReportView.jsx';

// Settings Sub-pages
import SettingsView from '../modules/settings/pages/SettingsView.jsx';

// Notifications Sub-pages
import NotificationDrawer from '../modules/notifications/components/NotificationDrawer.jsx';
import { fetchNotifications, addRealtimeNotification } from '../store/notificationsSlice.js';
import { io } from 'socket.io-client';

// Dashboard Thunks
import {
  fetchDashboardSummary,
  fetchDashboardCharts,
  fetchDashboardActivities
} from '../store/dashboardSlice.js';
import { fetchMyAttendance, fetchMyLeaves } from '../store/hrSlice.js';
import { fetchFollowUps, updateFollowUp } from '../store/crmSlice.js';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const greetingStr = `${getGreeting()}, ${user?.name || 'User'}`;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTasksModal, setShowTasksModal] = useState(false);
  
  // HR Module sub-navigation
  const [hrSubTab, setHrSubTab] = useState('employees');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // CRM Module sub-navigation
  const [crmSubTab, setCrmSubTab] = useState('leads');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Inventory Module sub-navigation
  const [inventorySubTab, setInventorySubTab] = useState('products');

  // Billing Module sub-navigation
  const [billingSubTab, setBillingSubTab] = useState('quotations');

  // Dashboard state selectors
  const { summary, charts, activities, loading: dashLoading } = useSelector((state) => state.dashboard);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { attendanceLogs = [], myLeaves = [] } = useSelector((state) => state.hr);
  const { followups = [] } = useSelector((state) => state.crm);
  const [showNotifications, setShowNotifications] = useState(false);
  const [myEmployeeProfile, setMyEmployeeProfile] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  useEffect(() => {
    if (!showProfileDropdown) return;
    const closeDropdown = () => setShowProfileDropdown(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [showProfileDropdown]);

  useEffect(() => {
    setGlobalSearchQuery('');
  }, [activeTab, hrSubTab, crmSubTab, inventorySubTab, billingSubTab]);

  useEffect(() => {
    const handleTabChange = (e) => {
      const { tab, subTab } = e.detail || {};
      if (tab) setActiveTab(tab);
      if (subTab) {
        if (tab === 'crm') setCrmSubTab(subTab);
        if (tab === 'billing') setBillingSubTab(subTab);
        if (tab === 'inventory') setInventorySubTab(subTab);
        if (tab === 'hr') setHrSubTab(subTab);
      }
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const fetchMyEmployeeProfile = async () => {
    try {
      const res = await api.get('/api/v1/hr/employees/me');
      setMyEmployeeProfile(res.data.data.employee);
    } catch (err) {
      console.error('Error loading self employee profile:', err);
    }
  };

  const ALLOWED_TABS = {
    ADMIN: ['dashboard', 'hr', 'crm', 'inventory', 'billing', 'reports', 'settings', 'profile'],
    MANAGER: ['dashboard', 'hr', 'crm', 'inventory', 'billing', 'reports', 'settings', 'profile'],
    HR: ['dashboard', 'hr', 'crm', 'profile', 'settings'],
    SALES: ['dashboard', 'crm', 'billing', 'profile', 'settings', 'attendance', 'leave', 'payroll'],
    INVENTORY_MANAGER: ['dashboard', 'inventory', 'profile', 'settings'],
    ACCOUNTANT: ['dashboard', 'billing', 'profile', 'settings'],
    EMPLOYEE: ['dashboard', 'profile', 'attendance', 'leave', 'payroll', 'documents', 'settings']
  };

  const userRole = user?.role || 'EMPLOYEE';
  const allowed = ALLOWED_TABS[userRole] || ['dashboard'];
  const isTabAllowed = allowed.includes(activeTab);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      if (user?.role === 'EMPLOYEE') {
        dispatch(fetchMyAttendance());
        dispatch(fetchMyLeaves());
        dispatch(fetchFollowUps({ assignedTo: user.id || user._id }));
      } else {
        dispatch(fetchDashboardSummary());
        dispatch(fetchDashboardCharts());
        dispatch(fetchDashboardActivities());
      }
    }
  }, [dispatch, activeTab, user]);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      fetchMyEmployeeProfile();

      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socket = io(socketUrl, {
        withCredentials: true
      });

      socket.on('connect', () => {
        console.log('Socket.io connected successfully');
        if (user.id) socket.emit('join', `user_${user.id}`);
        if (user.role) socket.emit('join', `role_${user.role}`);
      });

      socket.on('notification', (payload) => {
        console.log('Realtime notification received:', payload);
        dispatch(addRealtimeNotification(payload));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getSidebarItems = () => {
    const role = user?.role || 'EMPLOYEE';
    switch (role) {
      case 'ADMIN':
      case 'MANAGER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'hr', label: 'HR Module', icon: Users },
          { id: 'crm', label: 'CRM Module', icon: Activity },
          { id: 'inventory', label: 'Inventory Module', icon: Layers },
          { id: 'billing', label: 'Billing Module', icon: FileText },
          { id: 'reports', label: 'Reports Module', icon: FolderLock },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
      case 'HR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employees', icon: Users, targetTab: 'hr', targetSubTab: 'employees' },
          { id: 'departments', label: 'Departments', icon: Layers, targetTab: 'hr', targetSubTab: 'departments' },
          { id: 'attendance', label: 'Attendance', icon: Calendar, targetTab: 'hr', targetSubTab: 'attendance' },
          { id: 'leave', label: 'Leave', icon: FileText, targetTab: 'hr', targetSubTab: 'leaves' },
          { id: 'payroll', label: 'Payroll', icon: DollarSign, targetTab: 'hr', targetSubTab: 'payroll' },
          { id: 'crm', label: 'Assign Tasks', icon: Activity, targetTab: 'crm', targetSubTab: 'followups' }
        ];
      case 'SALES':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'customers', label: 'Customers', icon: Users, targetTab: 'crm', targetSubTab: 'customers' },
          { id: 'leads', label: 'Leads', icon: Activity, targetTab: 'crm', targetSubTab: 'leads' },
          { id: 'deals', label: 'Deals', icon: Layers, targetTab: 'crm', targetSubTab: 'deals' },
          { id: 'invoices', label: 'Invoices', icon: FileText, targetTab: 'billing', targetSubTab: 'invoices' },
          { id: 'attendance', label: 'My Attendance', icon: Calendar, targetTab: 'attendance' },
          { id: 'leave', label: 'My Leave', icon: FileText, targetTab: 'leave' },
          { id: 'payroll', label: 'My Payslips', icon: DollarSign, targetTab: 'payroll' }
        ];
      case 'INVENTORY_MANAGER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'products', label: 'Products', icon: Layers, targetTab: 'inventory', targetSubTab: 'products' },
          { id: 'categories', label: 'Categories', icon: Layers, targetTab: 'inventory', targetSubTab: 'categories' },
          { id: 'suppliers', label: 'Suppliers', icon: Users, targetTab: 'inventory', targetSubTab: 'suppliers' },
          { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText, targetTab: 'inventory', targetSubTab: 'purchase-orders' },
          { id: 'stock', label: 'Stock', icon: HardDrive, targetTab: 'inventory', targetSubTab: 'stock-movements' }
        ];
      case 'ACCOUNTANT':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'invoices', label: 'Invoices', icon: FileText, targetTab: 'billing', targetSubTab: 'invoices' },
          { id: 'payments', label: 'Payments', icon: DollarSign, targetTab: 'billing', targetSubTab: 'payments' }
        ];
      case 'EMPLOYEE':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User, targetTab: 'profile' },
          { id: 'attendance', label: 'My Attendance', icon: Calendar, targetTab: 'attendance' },
          { id: 'leave', label: 'My Leave', icon: FileText, targetTab: 'leave' },
          { id: 'payroll', label: 'My Payslips', icon: DollarSign, targetTab: 'payroll' },
          { id: 'documents', label: 'My Documents', icon: FolderLock, targetTab: 'documents' },
          { id: 'settings', label: 'Settings', icon: Settings, targetTab: 'settings' }
        ];
    }
  };

  const handleSidebarClick = (item) => {
    const target = item.targetTab || item.id;
    setActiveTab(target);
    if (item.targetSubTab) {
      if (target === 'hr') setHrSubTab(item.targetSubTab);
      if (target === 'crm') setCrmSubTab(item.targetSubTab);
      if (target === 'inventory') setInventorySubTab(item.targetSubTab);
      if (target === 'billing') setBillingSubTab(item.targetSubTab);
    }
  };

  const handleViewEmployeeDetails = (empId) => {
    setSelectedEmployeeId(empId);
    setHrSubTab('employee-details');
  };

  const handleBackToEmployeeList = () => {
    setSelectedEmployeeId(null);
    setHrSubTab('employees');
  };

  const handleViewLeadDetails = (leadId) => {
    setSelectedLeadId(leadId);
    setHrSubTab('lead-details'); // reuse or handle separately
    setCrmSubTab('lead-details');
  };

  const handleViewCustomerDetails = (custId) => {
    setSelectedCustomerId(custId);
    setCrmSubTab('customer-details');
  };

  const handleBackToLeadList = () => {
    setSelectedLeadId(null);
    setCrmSubTab('leads');
  };

  const handleBackToCustomerList = () => {
    setSelectedCustomerId(null);
    setCrmSubTab('customers');
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6 text-xs text-gray-700">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {/* Employees */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Employees</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.hr?.totalEmployees || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Active Staff</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {summary?.hr?.totalDepartments || 0} Departments
            </span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.crm?.totalCustomers || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Loyal Clients</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <User className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {summary?.crm?.totalLeads || 0} Leads
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Low Stock alerts</p>
              <h3 className={`text-2xl font-bold mt-1 ${(summary?.inventory?.lowStockProducts || 0) > 0 ? 'text-red-650' : 'text-gray-900'}`}>
                {summary?.inventory?.lowStockProducts || 0}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold">Products Alert</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Shield className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              (summary?.inventory?.lowStockProducts || 0) > 0 
                ? 'text-red-750 bg-red-50 border-red-100' 
                : 'text-green-700 bg-green-50 border-green-100'
            }`}>
              {summary?.inventory?.totalProducts || 0} SKU Total
            </span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{summary?.billing?.revenueMonth || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Current Month</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              {summary?.billing?.paidInvoices || 0} Paid Invoices
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart: Monthly Sales & Revenue */}
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Monthly Billings & Collections</h4>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Realtime invoices vs paid collections totals</p>
          </div>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.billingChartData || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sales" name="Invoiced Sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" name="Paid Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Line Chart */}
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Customer Growth Trend</h4>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">New clients registration metrics timeline</p>
          </div>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.customerChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="customers" name="New Clients" stroke="#2563eb" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities Timeline Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Recent Invoices</h4>
            <span className="text-[8px] bg-blue-50 text-[#2563eb] border border-blue-200 px-1.5 py-0.5 rounded font-bold">Billing</span>
          </div>
          <div className="p-3 divide-y divide-gray-100 flex-1">
            {!activities?.recentInvoices || activities.recentInvoices.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-medium">No recent invoices.</div>
            ) : (
              activities.recentInvoices.map((inv) => (
                <div key={inv._id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{inv.customerId?.customerName || 'Walk-in Client'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2563eb]">₹{inv.grandTotal}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${
                      inv.paymentStatus === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Recent Payments</h4>
            <span className="text-[8px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-bold">Collections</span>
          </div>
          <div className="p-3 divide-y divide-gray-100 flex-1">
            {!activities?.recentPayments || activities.recentPayments.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-medium">No payments received yet.</div>
            ) : (
              activities.recentPayments.map((pay) => (
                <div key={pay._id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{pay.paymentNumber}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{pay.customerId?.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">+₹{pay.amount}</p>
                    <p className="text-[9px] text-gray-400 mt-1">{pay.paymentMethod}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Recent Employees</h4>
            <span className="text-[8px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-bold">HR Onboarding</span>
          </div>
          <div className="p-3 divide-y divide-gray-100 flex-1">
            {!activities?.recentEmployees || activities.recentEmployees.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-medium">No employees onboarded.</div>
            ) : (
              activities.recentEmployees.map((emp) => (
                <div key={emp._id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{emp.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{emp.designation}</p>
                  </div>
                  <span className="text-[9px] text-gray-500 font-medium">
                    {emp.departmentId?.name || 'Unassigned'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHRDashboard = () => (
    <div className="space-y-6 text-xs text-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {/* Total Employees */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Employees</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.hr?.totalEmployees || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Active Staff</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Staff Directory
            </span>
          </div>
        </div>

        {/* Total Departments */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Departments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.hr?.totalDepartments || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Operational Divisions</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Active Corporate
            </span>
          </div>
        </div>

        {/* Clock-In Rate */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Clock-In Rate</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">94%</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Today</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Daily Attendance
            </span>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Leaves</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">3</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Awaiting Approval</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
              Needs Review
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Recent Onboarded Employees</h4>
          </div>
          <div className="p-3 divide-y divide-gray-100 flex-1">
            {!activities?.recentEmployees || activities.recentEmployees.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-medium">No employees onboarded.</div>
            ) : (
              activities.recentEmployees.map((emp) => (
                <div key={emp._id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{emp.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{emp.designation}</p>
                  </div>
                  <span className="text-[9px] text-gray-500 font-medium">
                    {emp.departmentId?.name || 'Unassigned'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesDashboard = () => (
    <div className="space-y-6 text-xs text-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {/* Total Customers */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.crm?.totalCustomers || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Active Clients</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <User className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Loyal Directory
            </span>
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Leads</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.crm?.totalLeads || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Sales Funnel</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Opportunities
            </span>
          </div>
        </div>

        {/* Won Deals */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Won Deals</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{summary?.crm?.wonDeals || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Target Matched</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Closed Deals
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {summary?.crm?.totalDeals > 0 
                  ? ((summary.crm.wonDeals / summary.crm.totalDeals) * 100).toFixed(1) 
                  : '0.0'}%
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold">Average conversion</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
              Performant
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Customer Growth Trend</h4>
          </div>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.customerChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="customers" name="New Clients" stroke="#2563eb" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventoryDashboard = () => (
    <div className="space-y-6 text-xs text-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {/* Total Products */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary?.inventory?.totalProducts || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">SKU Catalog</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <HardDrive className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Active Inventory
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className={`text-2xl font-bold mt-1 ${(summary?.inventory?.lowStockProducts || 0) > 0 ? 'text-red-650' : 'text-gray-900'}`}>
                {summary?.inventory?.lowStockProducts || 0}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold">Requires Reorder</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Shield className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              (summary?.inventory?.lowStockProducts || 0) > 0 
                ? 'text-red-750 bg-red-50 border-red-100' 
                : 'text-green-700 bg-green-50 border-green-100'
            }`}>
              Needs attention
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Categories</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">8</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Scopes</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              Product lines
            </span>
          </div>
        </div>

        {/* Suppliers */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Suppliers</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">6</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Registered Suppliers</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Active vendors
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountantDashboard = () => (
    <div className="space-y-6 text-xs text-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {/* Monthly Revenue */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-[#2563eb] mt-1">₹{summary?.billing?.revenueMonth || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Current Month</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#2563eb]">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Collections Month
            </span>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Paid Invoices</p>
              <h3 className="text-2xl font-bold text-green-700 mt-1">{summary?.billing?.paidInvoices || 0}</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Cleared Transactions</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Check className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              Settled Ledger
            </span>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Outstanding Invoices</p>
              <h3 className="text-2xl font-bold text-red-650 mt-1">4</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Pending Payments</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              Needs Collection
            </span>
          </div>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Outstanding Amount</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹4,850</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Receivables</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
              Pending Ledger
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Billings & Collections</h4>
          </div>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.billingChartData || []}>
                <defs>
                  <linearGradient id="colorSalesAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenueAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="sales" name="Invoiced Sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSalesAcc)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" name="Paid Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenueAcc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => {
    // 1. Clock-in time calculation
    const getLocalDateString = () => {
      const date = new Date();
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
      return adjustedDate.toISOString().split('T')[0];
    };
    const todayStr = getLocalDateString();
    const todayLog = attendanceLogs.find((log) => log.date === todayStr);
    
    // Check if clocked in today
    const clockInTimeStr = todayLog && todayLog.checkIn
      ? new Date(todayLog.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : 'Not clocked in';

    // 2. Leaves Left calculation
    const approvedLeaves = myLeaves.filter((leave) => leave.status === 'APPROVED');
    let daysUsed = 0;
    approvedLeaves.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      daysUsed += diffDays;
    });
    const totalAnnualBalance = 24;
    const leavesLeft = Math.max(0, totalAnnualBalance - daysUsed);
    const leavePercentUsed = Math.round((daysUsed / totalAnnualBalance) * 100);

    // 3. Open Tasks calculation
    const pendingTasks = followups.filter((f) => f.status === 'PENDING');
    const pendingTasksCount = pendingTasks.length;

    const handleToggleTaskStatus = async (taskId, currentStatus) => {
      const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
      await dispatch(updateFollowUp({ id: taskId, data: { status: nextStatus } }));
      dispatch(fetchFollowUps({ assignedTo: user.id || user._id }));
    };

    return (
      <div className="space-y-6 text-xs text-gray-700">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {/* Card 1: Clock-In */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Clock-In Time</p>
                <h3 className={`text-2xl font-bold mt-1 ${todayLog ? 'text-green-600' : 'text-gray-400'}`}>
                  {clockInTimeStr}
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold">Today</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                todayLog 
                  ? 'text-green-700 bg-green-50 border-green-100' 
                  : 'text-gray-500 bg-gray-50 border-gray-100'
              }`}>
                <Check className="w-3 h-3" /> {todayLog ? 'On time' : 'Not checked in'}
              </span>
            </div>
          </div>

          {/* Card 2: Leaves Left */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Leaves Left</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{leavesLeft} {leavesLeft === 1 ? 'Day' : 'Days'}</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Annual Balance</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#2563eb]">
                <Calendar className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {leavePercentUsed}% used
              </span>
            </div>
          </div>

          {/* Card 3: Open Tasks */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Open Tasks</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{pendingTasksCount}</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Assigned Tasks</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <ClipboardList className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTasksModal(true)}
                className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                View tasks <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Unread Alerts */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unread Alerts</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{unreadCount}</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Inbox Notifications</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <Bell className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-purple-100">
                <Check className="w-3 h-3" /> All caught up
              </span>
            </div>
          </div>
        </div>

        {/* Lower Grid (Quick Actions & Announcements) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('leave')}
                className="flex flex-col items-center justify-center text-center p-4 border border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer group bg-slate-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-gray-900 mt-2.5 group-hover:text-blue-600">Apply Leave</div>
                <div className="text-[9px] text-gray-400 font-semibold mt-0.5">Request time off</div>
              </div>

              <div 
                onClick={() => setActiveTab('payroll')}
                className="flex flex-col items-center justify-center text-center p-4 border border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer group bg-slate-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-gray-900 mt-2.5 group-hover:text-blue-600">View Payslips</div>
                <div className="text-[9px] text-gray-400 font-semibold mt-0.5">Check salary slips</div>
              </div>

              <div 
                onClick={() => setActiveTab('documents')}
                className="flex flex-col items-center justify-center text-center p-4 border border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer group bg-slate-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-gray-900 mt-2.5 group-hover:text-blue-600">My Documents</div>
                <div className="text-[9px] text-gray-400 font-semibold mt-0.5">Access documents</div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('profile')}
              className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              Explore all features <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Announcements */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-blue-600" /> Announcements
                </h3>
                <span className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View all</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 border border-gray-100 rounded-xl bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span className="font-bold text-gray-900 text-xs">System Maintenance</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    System will be under maintenance on July 15, 2026 from 10:00 PM to 2:00 AM.
                  </p>
                  <div className="text-[9px] text-gray-400 font-bold">Jul 10, 2026 • IT Team</div>
                </div>

                <div className="p-3 border border-gray-100 rounded-xl bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    <span className="font-bold text-gray-900 text-xs">Annual Appraisal Process</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    Please complete your self-appraisal by July 20, 2026.
                  </p>
                  <div className="text-[9px] text-gray-400 font-bold">Jul 08, 2026 • HR Team</div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-[10px] text-gray-400 font-semibold pt-4">
              © 2026 Nexora CRM. All rights reserved.
            </div>
          </div>
        </div>

        {/* Modal Overlay */}
        {showTasksModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in text-xs text-gray-700">
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">My Open Tasks</h3>
                <button 
                  onClick={() => setShowTasksModal(false)} 
                  className="text-gray-400 hover:text-gray-900 text-lg cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 max-h-[350px] overflow-y-auto space-y-3">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 font-semibold">You have no pending tasks!</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingTasks.map((task) => (
                      <div key={task._id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="font-bold text-gray-900">{task.title}</div>
                          <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-3">
                            <span>Customer: <span className="text-blue-600 font-bold">{task.customer?.companyName || 'Private Client'}</span></span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                          {task.notes && <p className="text-gray-500 text-[10px] italic leading-relaxed mt-0.5">"{task.notes}"</p>}
                        </div>
                        <button
                          onClick={() => handleToggleTaskStatus(task._id, task.status)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-green-50 border border-green-200 text-green-600 rounded hover:bg-green-100 cursor-pointer shrink-0"
                        >
                          Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowTasksModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPortalSubtitle = () => {
    const role = user?.role || 'EMPLOYEE';
    switch (role) {
      case 'ADMIN': return 'Admin Portal';
      case 'MANAGER': return 'General Manager Portal';
      case 'HR': return 'HR Portal';
      case 'SALES': return 'Sales Portal';
      case 'INVENTORY_MANAGER': return 'Inventory Portal';
      case 'ACCOUNTANT': return 'Financial Portal';
      case 'EMPLOYEE':
      default:
        return 'Employee Portal';
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex font-sans antialiased text-xs">
      {/* Sidebar - light gray background, clean border */}
      <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col shrink-0 hidden md:flex">
        {/* Logo/Header */}
        <div className="p-5 border-b border-gray-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center font-bold text-white shadow-sm">N</div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Nexora CRM</h2>
            <p className="text-[9px] text-[#2563eb] font-bold tracking-wider uppercase">{user?.role === 'EMPLOYEE' ? 'Employee Portal' : 'Enterprise Edition'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {getSidebarItems().map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === (item.targetTab || item.id) &&
                              (!item.targetSubTab ||
                               (item.targetTab === 'hr' && hrSubTab === item.targetSubTab) ||
                               (item.targetTab === 'crm' && crmSubTab === item.targetSubTab) ||
                               (item.targetTab === 'inventory' && inventorySubTab === item.targetSubTab) ||
                               (item.targetTab === 'billing' && billingSubTab === item.targetSubTab));
            return (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-white border border-gray-200 text-[#2563eb] shadow-sm font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-gray-200 bg-[#f8f9fa]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-gray-900 truncate">{user?.name}</h4>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center justify-between">
            {/* Left side: Portal Title & Welcome */}
            <div>
              <h1 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5 capitalize">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                Here's what's happening with your account today.
              </p>
            </div>

            {/* Right side: Search, Bell, Dropdown */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search current tab..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="w-48 bg-slate-50 border border-gray-250 rounded-full py-1.5 pl-3.5 pr-8 text-[11px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                />
                <Search className="w-3.5 h-3.5 text-gray-450 absolute right-3 top-2.5" />
              </div>

              {/* Notification Bell Badge Button */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-50 rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0 border border-gray-200 shadow-xs"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#2563eb] text-white font-extrabold text-[8px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Capsule Dropdown */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="relative flex items-center gap-2 px-2 py-1 rounded-full border border-gray-200 bg-slate-50/50 shadow-xs cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] font-extrabold flex items-center justify-center text-xs uppercase shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:flex items-center gap-1">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-900 leading-none">{user?.name}</h4>
                    <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{user?.role?.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                </div>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-30 text-xs font-semibold text-gray-700 animate-fade-in text-left">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('profile');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" /> My Profile
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('settings');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-650 transition-colors flex items-center gap-2 text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-255 text-xs font-semibold text-gray-600 hover:text-gray-950 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body - light gray background, light gray sections */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto bg-[#f8f9fa]">
          {!isTabAllowed ? (
            <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center max-w-md mx-auto py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 border border-red-100 text-red-600">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">403 - Forbidden Access</h3>
              <p className="text-xs text-gray-500 font-medium">
                Your organizational role ({user?.role}) does not have permission to view the {activeTab} section.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="btn-primary px-4 py-2 rounded-lg font-bold cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* DEFAULT REALTIME AGGREGATED DASHBOARD VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 text-xs font-semibold text-gray-700">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-[#eef2ff] border border-blue-100/50 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm animate-fade-in">
                <div className="space-y-2 z-10 text-left">
                  <h2 className="text-xl font-bold text-gray-900 capitalize">
                    {greetingStr}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium max-w-md leading-relaxed">
                    Unified modular monolith database is online. Dynamic organizational role workspace active.
                  </p>
                </div>

                <div className="z-10 shrink-0">
                  {/* SVG 3D-effect Illustration */}
                  <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                    <defs>
                      <filter id="shadow" x="-5" y="-5" width="230" height="160" filterUnits="userSpaceOnUse">
                        <feDropShadow dx="5" dy="8" stdDeviation="8" flood-color="#3b82f6" flood-opacity="0.12"/>
                      </filter>
                      <linearGradient id="cardGrad" x1="0" y1="0" x2="200" y2="130" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="100%" stop-color="#f8faff"/>
                      </linearGradient>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#3b82f6"/>
                        <stop offset="100%" stop-color="#1d4ed8"/>
                      </linearGradient>
                    </defs>

                    <circle cx="170" cy="45" r="30" fill="#60a5fa" opacity="0.25" filter="blur(12px)"/>
                    <circle cx="50" cy="115" r="25" fill="#c084fc" opacity="0.15" filter="blur(10px)"/>

                    <g filter="url(#shadow)">
                      <rect x="25" y="25" width="170" height="100" rx="14" fill="url(#cardGrad)" stroke="#e2e8f0" stroke-width="1.2"/>
                    </g>

                    <circle cx="38" cy="38" r="3.5" fill="#ef4444"/>
                    <circle cx="49" cy="38" r="3.5" fill="#eab308"/>
                    <circle cx="60" cy="38" r="3.5" fill="#22c55e"/>

                    <rect x="38" y="58" width="36" height="36" rx="8" fill="#eff6ff"/>
                    <circle cx="56" cy="71" r="7" fill="#3b82f6"/>
                    <path d="M46 88C46 81.5 50.5 79 56 79C61.5 79 66 81.5 66 88" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>

                    <circle cx="135" cy="68" r="18" stroke="#f1f5f9" stroke-width="5"/>
                    <circle cx="135" cy="68" r="18" stroke="url(#blueGrad)" stroke-width="5" stroke-dasharray="113" stroke-dashoffset="30" stroke-linecap="round"/>
                    <circle cx="135" cy="68" r="7" fill="#3b82f6"/>

                    <rect x="108" y="98" width="5" height="12" rx="2" fill="#3b82f6"/>
                    <rect x="118" y="92" width="5" height="18" rx="2" fill="#10b981"/>
                    <rect x="128" y="95" width="5" height="15" rx="2" fill="#f59e0b"/>
                    <rect x="138" y="100" width="5" height="10" rx="2" fill="#a78bfa"/>
                    <rect x="148" y="90" width="5" height="20" rx="2" fill="#3b82f6"/>

                    <circle cx="185" cy="85" r="5" fill="#3b82f6" opacity="0.5"/>
                    <circle cx="15" cy="55" r="3" fill="#10b981" opacity="0.3"/>
                  </svg>
                </div>
              </div>

              {dashLoading && !summary ? (
                <div className="py-24 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
                </div>
              ) : (
                <>
                  {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && renderAdminDashboard()}
                  {user?.role === 'HR' && renderHRDashboard()}
                  {user?.role === 'SALES' && renderSalesDashboard()}
                  {user?.role === 'INVENTORY_MANAGER' && renderInventoryDashboard()}
                  {user?.role === 'ACCOUNTANT' && renderAccountantDashboard()}
                  {user?.role === 'EMPLOYEE' && renderEmployeeDashboard()}
                </>
              )}
            </div>
          )}

          {/* HR MODULE CONTENT AREA */}
          {activeTab === 'hr' && (
            <div className="space-y-6">
              {/* HR Subtabs */}
              <div className="flex border-b border-gray-200 text-xs font-semibold text-gray-600 gap-1 overflow-x-auto">
                <button
                  onClick={() => { setHrSubTab('employees'); setSelectedEmployeeId(null); }}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    ['employees', 'employee-details'].includes(hrSubTab)
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Employees Directory
                </button>
                <button
                  onClick={() => setHrSubTab('departments')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    hrSubTab === 'departments'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Departments
                </button>
                <button
                  onClick={() => setHrSubTab('attendance')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    hrSubTab === 'attendance'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Attendance logs
                </button>
                <button
                  onClick={() => setHrSubTab('leaves')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    hrSubTab === 'leaves'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Leave Requests
                </button>
                <button
                  onClick={() => setHrSubTab('payroll')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    hrSubTab === 'payroll'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Payroll slips
                </button>
              </div>

              {/* RENDER ACTIVE SUBTAB CONTENT */}
              <div className="animate-fade-in">
                {hrSubTab === 'employees' && (
                  <EmployeeList onViewDetails={handleViewEmployeeDetails} searchQuery={globalSearchQuery} />
                )}
                {hrSubTab === 'employee-details' && (
                  <EmployeeDetail employeeId={selectedEmployeeId} onBack={handleBackToEmployeeList} />
                )}
                {hrSubTab === 'departments' && (
                  <DepartmentList />
                )}
                {hrSubTab === 'attendance' && (
                  <AttendanceLogs />
                )}
                {hrSubTab === 'leaves' && (
                  <LeaveRequests />
                )}
                {hrSubTab === 'payroll' && (
                  <PayrollManager />
                )}
              </div>
            </div>
          )}

          {/* CRM MODULE CONTENT AREA */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* CRM Subtabs */}
              <div className="flex border-b border-gray-200 text-xs font-semibold text-gray-600 gap-1 overflow-x-auto">
                <button
                  onClick={() => { setCrmSubTab('leads'); setSelectedLeadId(null); }}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    ['leads', 'lead-details'].includes(crmSubTab)
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Leads Pipeline
                </button>
                <button
                  onClick={() => { setCrmSubTab('customers'); setSelectedCustomerId(null); }}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    ['customers', 'customer-details'].includes(crmSubTab)
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Customers Directory
                </button>
                <button
                  onClick={() => setCrmSubTab('deals')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    crmSubTab === 'deals'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Deals Manager
                </button>
                <button
                  onClick={() => setCrmSubTab('meetings')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    crmSubTab === 'meetings'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Meetings Scheduler
                </button>
                <button
                  onClick={() => setCrmSubTab('followups')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    crmSubTab === 'followups'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Follow Up Agenda
                </button>
              </div>

              {/* RENDER ACTIVE SUBTAB CONTENT */}
              <div className="animate-fade-in">
                {crmSubTab === 'leads' && (
                  <LeadList onViewDetails={handleViewLeadDetails} searchQuery={globalSearchQuery} />
                )}
                {crmSubTab === 'lead-details' && (
                  <LeadDetail leadId={selectedLeadId} onBack={handleBackToLeadList} />
                )}
                {crmSubTab === 'customers' && (
                  <CustomerList onViewDetails={handleViewCustomerDetails} searchQuery={globalSearchQuery} />
                )}
                {crmSubTab === 'customer-details' && (
                  <CustomerDetail customerId={selectedCustomerId} onBack={handleBackToCustomerList} />
                )}
                {crmSubTab === 'deals' && (
                  <DealManager />
                )}
                {crmSubTab === 'meetings' && (
                  <MeetingList />
                )}
                {crmSubTab === 'followups' && (
                  <FollowUpList />
                )}
              </div>
            </div>
          )}

          {/* INVENTORY MODULE CONTENT AREA */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Inventory Subtabs */}
              <div className="flex border-b border-gray-200 text-xs font-semibold text-gray-600 gap-1 overflow-x-auto">
                <button
                  onClick={() => setInventorySubTab('products')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    inventorySubTab === 'products'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Products Catalog
                </button>
                <button
                  onClick={() => setInventorySubTab('categories')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    inventorySubTab === 'categories'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setInventorySubTab('suppliers')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    inventorySubTab === 'suppliers'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Suppliers
                </button>
                <button
                  onClick={() => setInventorySubTab('purchase-orders')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    inventorySubTab === 'purchase-orders'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Purchase Orders
                </button>
                <button
                  onClick={() => setInventorySubTab('stock-movements')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    inventorySubTab === 'stock-movements'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Stock Movements
                </button>
              </div>

              {/* RENDER ACTIVE SUBTAB CONTENT */}
              <div className="animate-fade-in">
                {inventorySubTab === 'products' && (
                  <ProductList searchQuery={globalSearchQuery} />
                )}
                {inventorySubTab === 'categories' && (
                  <CategoryList />
                )}
                {inventorySubTab === 'suppliers' && (
                  <SupplierList />
                )}
                {inventorySubTab === 'purchase-orders' && (
                  <PurchaseOrderList />
                )}
                {inventorySubTab === 'stock-movements' && (
                  <StockMovementList />
                )}
              </div>
            </div>
          )}

          {/* BILLING MODULE CONTENT AREA */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Billing Subtabs */}
              <div className="flex border-b border-gray-200 text-xs font-semibold text-gray-600 gap-1 overflow-x-auto">
                <button
                  onClick={() => setBillingSubTab('quotations')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    billingSubTab === 'quotations'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Quotations
                </button>
                <button
                  onClick={() => setBillingSubTab('invoices')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    billingSubTab === 'invoices'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setBillingSubTab('payments')}
                  className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${
                    billingSubTab === 'payments'
                      ? 'border-[#2563eb] text-gray-900 font-bold'
                      : 'border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Payments
                </button>
              </div>

              {/* RENDER ACTIVE SUBTAB CONTENT */}
              <div className="animate-fade-in">
                {billingSubTab === 'quotations' && (
                  <QuotationList searchQuery={globalSearchQuery} />
                )}
                {billingSubTab === 'invoices' && (
                  <InvoiceList searchQuery={globalSearchQuery} />
                )}
                {billingSubTab === 'payments' && (
                  <PaymentList />
                )}
              </div>
            </div>
          )}

          {/* REPORTS MODULE CONTENT AREA */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <ReportView />
            </div>
          )}

          {/* EMPLOYEE PORTAL SUB-PAGES */}
          {activeTab === 'profile' && myEmployeeProfile && (
            <div className="animate-fade-in">
              <EmployeeDetail employeeId={myEmployeeProfile._id} />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="animate-fade-in">
              <AttendanceLogs />
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="animate-fade-in">
              <LeaveRequests />
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="animate-fade-in">
              <PayrollManager />
            </div>
          )}

          {activeTab === 'documents' && myEmployeeProfile && (
            <div className="animate-fade-in">
              <MyDocuments employee={myEmployeeProfile} onRefresh={fetchMyEmployeeProfile} />
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <SettingsView />
            </div>
          )}
        </>
      )}
    </main>
      </div>

      <NotificationDrawer 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default Dashboard;

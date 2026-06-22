import React, { useState, useEffect } from 'react';
import { UserProfile, Product, Order } from '../types';
import { 
  updateUserProfile,
  deleteSingleUserFromDb,
  updateProductInDb,
  deleteProductFromDb,
  updateOrderInDb,
  deleteAllOrdersFromDb,
  deleteAllProductsFromDb,
  deleteUsersFromDb,
  registerWithPhone
} from '../services/db';
import {
  ShieldAlert,
  Users,
  Box,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Database,
  Search,
  MapPin,
  TrendingUp,
  LogOut,
  Sliders,
  Sparkles,
  Building2,
  Clock,
  Factory,
  Store,
  Package,
  AlertTriangle,
  FolderTree,
  Megaphone,
  Menu,
  X,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  Settings,
  ChevronRight,
  UserPlus
} from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  allProducts: Product[];
  allOrders: Order[];
  onLogout: () => void;
  onUpdateUserStatus: (uid: string, status: UserProfile['approvalStatus']) => void;
  onResetSystemData: () => void;
}

// Local mock arrays initialized if not exist for complaints, categories, notifications & config
interface Complaint {
  id: string;
  sourceDukandar: string;
  targetSeller: string;
  type: 'Seller Complaint' | 'Fake Product' | 'Wrong Delivery' | 'Bad Behaviour';
  description: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}

interface Broadcast {
  id: string;
  target: 'All Sellers' | 'All Dukandars' | 'Everyone';
  title: string;
  message: string;
  type: 'Server Maintenance' | 'New Feature Added' | 'Holiday Notice' | 'System Alert';
  createdAt: string;
}

export default function OwnerDashboard({
  currentUser,
  allUsers,
  allProducts,
  allOrders,
  onLogout,
  onUpdateUserStatus,
  onResetSystemData
}: OwnerDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'approvals' | 'sellers' | 'products' | 'orders' | 'analytics' | 'categories' | 'reports' | 'notifications' | 'settings' | 'data'
  >('dashboard');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerFilter, setSellerFilter] = useState<'All' | 'Approved' | 'Blocked' | 'Inactive'>('All');
  const [productFilter, setProductFilter] = useState<'All' | 'Active' | 'Sold Out' | 'Inactive'>('All');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');

  // Selected Detail Modal states
  const [selectedSeller, setSelectedSeller] = useState<UserProfile | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 'comp-1',
      sourceDukandar: 'Ramesh Gupta (Gupta Kirana Store)',
      targetSeller: 'Anil Goel (Goel Wholesalers)',
      type: 'Wrong Delivery',
      description: 'The premium atta sack was torn at the bottom and weighed only 42kg instead of 50kg.',
      status: 'Open',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'comp-2',
      sourceDukandar: 'Verma Provision Store',
      targetSeller: 'Suresh Kumar (Suresh & Sons)',
      type: 'Fake Product',
      description: 'The spices supplied do not carry correct expiration details or FSSAI registration.',
      status: 'Open',
      createdAt: new Date(Date.now() - 3.5 * 24 * 3600 * 1000).toISOString()
    }
  ]);

  // Notifications State
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: 'broad-1',
      target: 'Everyone',
      title: 'Monthly Server Maintenance',
      message: 'KirranaBazzar portal will render read-only for 2 hours on Sunday at 11:00 PM.',
      type: 'Server Maintenance',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'broad-2',
      target: 'All Sellers',
      title: 'New Bulk Offer Guidelines',
      message: 'Sellers can now include video loops for visual validation of wholesale sack contents.',
      type: 'New Feature Added',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
    }
  ]);

  const [newNotice, setNewNotice] = useState({ title: '', message: '', target: 'Everyone' as Broadcast['target'], type: 'System Alert' as Broadcast['type'] });

  // Custom Categories
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Rice & Grains', code: 'rice', hidden: false },
    { id: 'cat-2', name: 'Edible Oils & ghee', code: 'oil', hidden: false },
    { id: 'cat-3', name: 'Premium Spices (Masala)', code: 'spices', hidden: false },
    { id: 'cat-4', name: 'Packaged Snacks', code: 'snacks', hidden: false },
    { id: 'cat-5', name: 'Bulk Pulses (Dal)', code: 'pulses', hidden: false }
  ]);
  const [newCatName, setNewCatName] = useState('');

  // App Settings state
  const [appSettings, setAppSettings] = useState({
    appName: 'KirranaBazzar',
    logoText: 'KirranaBazzar B2B',
    bannerText: 'Direct Wholesale Mandi to your shop!',
    tnc: 'Minimum wholesale pack values apply. Only verified retailers registered under Delhi/NCR municipal wards will receive heavy carriage subsidies.',
    privacy: 'Personal verification numbers are securely bound in Firestore hash arrays and are never shared outside verified wholesale channels.'
  });

  // Super Admin: Create Owner Admin State
  const [newOwner, setNewOwner] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [adminStatusMsg, setAdminStatusMsg] = useState('');

  // Data management state
  const [confirmInput, setConfirmInput] = useState('');

  // Dynamically calculate dashboard metrics
  const sellersList = allUsers.filter(u => u.role === 'Seller');
  const activeSellers = sellersList.filter(s => s.approvalStatus === 'approved');
  const pendingSellers = sellersList.filter(s => s.approvalStatus === 'pending');
  const dukandarsList = allUsers.filter(u => u.role === 'Dukandar');
  const pendingDukandars = dukandarsList.filter(d => d.approvalStatus === 'pending');
  
  const pendingUsers = allUsers.filter(u => u.approvalStatus === 'pending');
  const approvedUsers = allUsers.filter(u => u.approvalStatus === 'approved');

  // Order stats
  const totalOrdersCount = allOrders.length;
  
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
  
  const todayRevenue = todayOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalRevenue = allOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Month-to-date revenue
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0,0,0,0);
  const monthlyRevenue = allOrders
    .filter(o => o.status === 'Delivered' && new Date(o.createdAt) >= thisMonthStart)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Top Selling Products calculator
  const productSalesMap: { [product: string]: { qty: number, revenue: number, name: string } } = {};
  allOrders.forEach(ord => {
    if (ord.status === 'Delivered') {
      if (!productSalesMap[ord.productId]) {
        productSalesMap[ord.productId] = { qty: 0, revenue: 0, name: ord.productName };
      }
      productSalesMap[ord.productId].qty += ord.quantity;
      productSalesMap[ord.productId].revenue += ord.totalAmount;
    }
  });
  const topSellingProducts = Object.values(productSalesMap)
    .sort((a,b) => b.qty - a.qty)
    .slice(0, 5);

  // Top Sellers leaderboard
  const sellerRevenueMap: { [sid: string]: { name: string, sales: number, orders: number } } = {};
  allOrders.forEach(ord => {
    if (ord.status === 'Delivered') {
      if (!sellerRevenueMap[ord.sellerId]) {
        const found = allUsers.find(u => u.uid === ord.sellerId);
        sellerRevenueMap[ord.sellerId] = { name: found ? found.name : 'Unknown Seller', sales: 0, orders: 0 };
      }
      sellerRevenueMap[ord.sellerId].sales += ord.totalAmount;
      sellerRevenueMap[ord.sellerId].orders += 1;
    }
  });
  const topSellers = Object.values(sellerRevenueMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Delivery Area Analytics base
  const REGION_STATS = [
    { city: 'Meerut', pincodes: ['250001', '250002'] },
    { city: 'Delhi', pincodes: ['110006', '110001', '110085'] },
    { city: 'Noida', pincodes: ['201301', '201303'] },
    { city: 'Ghaziabad', pincodes: ['201001', '201010'] }
  ].map(reg => {
    const regionalSellersCount = allUsers.filter(u => u.role === 'Seller' && (
      u.address.toLowerCase().includes(reg.city.toLowerCase()) || 
      reg.pincodes.includes(u.pincode)
    )).length;

    const regionalOrdersCount = allOrders.filter(o => 
      o.address.toLowerCase().includes(reg.city.toLowerCase()) || 
      reg.pincodes.includes(o.pincode)
    ).length;

    return {
      name: reg.city,
      sellers: regionalSellersCount || (reg.city === 'Delhi' ? 2 : 1), // seeded helpers
      orders: regionalOrdersCount || (reg.city === 'Delhi' ? 4 : 2)
    };
  });

  // Handle category management
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      code: newCatName.toLowerCase().replace(/\s+/g, '-'),
      hidden: false
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleToggleHideCategory = (id: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, hidden: !c.hidden } : c));
  };

  // Broadcast notices
  const handleSendNotice = () => {
    if (!newNotice.title || !newNotice.message) return;
    const item: Broadcast = {
      id: `broad-${Date.now()}`,
      target: newNotice.target,
      title: newNotice.title,
      message: newNotice.message,
      type: newNotice.type,
      createdAt: new Date().toISOString()
    };
    setBroadcasts([item, ...broadcasts]);
    setNewNotice({ title: '', message: '', target: 'Everyone', type: 'System Alert' });
    alert('Notice broadcast successful!');
  };

  // Save changes to db config settings (simulated save client alert)
  const handleSaveSettings = () => {
    alert('Application Core Parameters updated successfully!');
  };

  // Super Admin: Create Owner Account
  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminStatusMsg('');
    if (!newOwner.name || !newOwner.phone || !newOwner.address || !newOwner.pincode) {
      setAdminStatusMsg('❌ Please fill all fields.');
      return;
    }
    
    try {
      await registerWithPhone({
        name: `${newOwner.name} (Owner)`,
        phone: newOwner.phone,
        whatsapp: newOwner.phone,
        address: newOwner.address,
        pincode: newOwner.pincode,
        role: 'Owner',
        approvalStatus: 'approved'
      });
      setNewOwner({ name: '', phone: '', address: '', pincode: '' });
      setAdminStatusMsg('✅ New Super Admin created successfully!');
    } catch (err: any) {
      setAdminStatusMsg(`❌ Failed: ${err.message || 'Verification mismatch'}`);
    }
  };

  // Delete Old Orders / Erase data actions
  const handleAdminAction = async (type: 'orders' | 'products' | 'users' | 'logs') => {
    if (confirmInput !== 'RESET') {
      alert('Type EXACTLY "RESET" to confirm this database operation.');
      return;
    }

    try {
      if (type === 'orders') {
        await deleteAllOrdersFromDb();
        alert('All marketplace historic orders deleted.');
      } else if (type === 'products') {
        await deleteAllProductsFromDb();
        alert('All retail catalogue SKU database flushed.');
      } else if (type === 'users') {
        await deleteUsersFromDb();
        alert('All normal customer and seller records deleted.');
      } else if (type === 'logs') {
        setComplaints([]);
        alert('System logs and complaints cleared.');
      }
      setConfirmInput('');
    } catch (e) {
      alert('Error during delete action.');
    }
  };

  return (
    <div className="h-full w-full bg-slate-100 flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* SIDEBAR NAVIGATION PANEL (Medium & Large screens) */}
      <aside className="hidden md:flex md:w-64 bg-slate-950 text-slate-200 flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-slate-100 text-lg shadow-md shadow-indigo-500/20">
            ★
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest leading-none font-sans uppercase">
              {appSettings.appName}
            </h1>
            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest font-mono block mt-1">
              Super Admin Console
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Store },
            { id: 'approvals', label: 'Approval Desk', icon: ShieldAlert, badge: pendingUsers.length },
            { id: 'sellers', label: 'Sellers Hub', icon: Factory },
            { id: 'products', label: 'Products SKU', icon: Box },
            { id: 'orders', label: 'Orders Mandi', icon: ShoppingCart },
            { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
            { id: 'categories', label: 'Categories 📂', icon: FolderTree },
            { id: 'reports', label: 'Reports Desk', icon: AlertTriangle, badge: complaints.filter(c => c.status === 'Open').length },
            { id: 'notifications', label: 'Broadcaster 📢', icon: Megaphone },
            { id: 'settings', label: 'App Settings', icon: Settings },
            { id: 'data', label: 'System Flush', icon: Database }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left group cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Session Info Panel */}
        <div className="p-4 bg-slate-900 border-t border-white/5 space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-indigo-500 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono">
              RK
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</h4>
              <p className="text-[9px] text-slate-500 font-mono">9999911111</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/30 font-bold py-2 px-3 text-red-400 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Session
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BUTTON AND PANEL DRAWER */}
      <div className="md:hidden bg-slate-950 text-white flex items-center justify-between px-4 py-3 shrink-0 shadow-lg relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black">
            ★
          </div>
          <h1 className="text-xs font-black tracking-widest">{appSettings.appName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE POPUP NAVIGATION SHEETS */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[52px] bg-slate-950 z-40 flex flex-col justify-between p-4 animate-fade-in select-none">
          <div className="space-y-1.5 overflow-y-auto max-h-[70vh]">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Store },
              { id: 'approvals', label: 'Approval Desk', icon: ShieldAlert, badge: pendingUsers.length },
              { id: 'sellers', label: 'Sellers Hub', icon: Factory },
              { id: 'products', label: 'Products SKU', icon: Box },
              { id: 'orders', label: 'Orders Mandi', icon: ShoppingCart },
              { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
              { id: 'categories', label: 'Categories 📂', icon: FolderTree },
              { id: 'reports', label: 'Reports Desk', icon: AlertTriangle, badge: complaints.filter(c => c.status === 'Open').length },
              { id: 'notifications', label: 'Broadcaster 📢', icon: Megaphone },
              { id: 'settings', label: 'App Settings', icon: Settings },
              { id: 'data', label: 'System Flush', icon: Database }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-950 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900 p-3 rounded-xl flex items-center justify-between border-t border-white/5">
            <span className="text-[11px] text-slate-300 font-bold">{currentUser.name}</span>
            <button
              onClick={onLogout}
              className="text-[10px] text-red-400 uppercase font-bold tracking-widest flex items-center gap-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE INNER CONTENT FRAME */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        
        {/* TAB 1: CENTRAL CONTROL DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">👑 KirranaBazzar Owner Panel</h2>
                <p className="text-xs text-slate-500 mt-1">Hello Owner Rajesh Kumar. Here is the daily summary of all B2b Wholesalers across India.</p>
              </div>
              <div className="bg-white border rounded-xl px-4 py-2 text-right">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">System Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 uppercase">Live Realtime Sync</span>
                </div>
              </div>
            </div>

            {/* Grid Metrics Stats - Top Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Total Sellers</span>
                  <span className="text-lg font-black font-mono">{sellersList.length}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Total Dukandars</span>
                  <span className="text-lg font-black font-mono">{dukandarsList.length}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Total Products</span>
                  <span className="text-lg font-black font-mono">{allProducts.length}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Total Orders</span>
                  <span className="text-lg font-black font-mono">{totalOrdersCount}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-yellow-105 text-yellow-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Today's Orders</span>
                  <span className="text-lg font-black font-mono">{todayOrders.length}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Today's Sales</span>
                  <span className="text-lg font-black font-mono text-emerald-600">₹{todayRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Pending Approvals</span>
                  <span className="text-lg font-black font-mono text-amber-500">{pendingUsers.length}</span>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Active Sellers</span>
                  <span className="text-lg font-black font-mono text-teal-600">{activeSellers.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Bento Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Short Overviews of Verification pipeline */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest font-mono">Verification Pipeline</h3>
                  <button onClick={() => setActiveTab('approvals')} className="text-[10px] text-indigo-600 font-bold hover:underline">
                    Manage →
                  </button>
                </div>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs">No pending approvals at verification desk.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto no-scrollbar">
                    {pendingUsers.map(user => (
                      <div key={user.uid} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{user.phone} ({user.role})</p>
                        </div>
                        <button
                          onClick={() => onUpdateUserStatus(user.uid, 'approved')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-1 px-3 rounded-lg text-[10px] cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Quick Notice Broadcasting Card */}
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-5 rounded-3xl text-white space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest font-mono">Instant Admin Broadcast</h3>
                  <p className="text-xs text-slate-400 mt-1">Broadcast system metrics or vacation updates to sellers & dukandars immediately.</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Notice Subject (eg: Server Maintenance)"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 text-white placeholder-slate-500"
                  />
                  <textarea
                    placeholder="Short notice text..."
                    rows={2}
                    value={newNotice.message}
                    onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 text-white placeholder-slate-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={newNotice.target}
                    onChange={(e) => setNewNotice({ ...newNotice, target: e.target.value as any })}
                    className="bg-white/5 border border-white/10 text-white rounded-xl px-2 py-1.5 text-[10px] focus:outline-none"
                  >
                    <option value="Everyone" className="text-black">Everyone</option>
                    <option value="All Sellers" className="text-black">Sellers Only</option>
                    <option value="All Dukandars" className="text-black font-sans">Dukandars Only</option>
                  </select>
                  <button
                    onClick={handleSendNotice}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 rounded-xl text-xs cursor-pointer text-center"
                  >
                    Broadcast Now!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPROVAL CENTER */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold font-sans">Verification & Approval Center</h2>
              <p className="text-xs text-slate-500">Approve or reject registering wholesale dealers and retail outlets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section A: Sellers requests */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Factory className="w-4 h-4 text-orange-500 animate-pulse" /> Pending Seller Requests ({pendingSellers.length})
                  </h4>
                </div>
                {pendingSellers.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-xs font-semibold">Zero pending seller approvals.</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                    {pendingSellers.map(user => (
                      <div key={user.uid} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-extrabold text-slate-800">{user.name}</h5>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Applied: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="bg-orange-50 border border-orange-200 text-orange-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">Seller B2B</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl text-[11px] font-mono space-y-1 text-slate-600 border">
                          <p><strong className="text-slate-400">PHONE:</strong> {user.phone}</p>
                          <p><strong className="text-slate-400">WHATSAPP:</strong> {user.whatsapp}</p>
                          <p><strong className="text-slate-400">ADDRESS:</strong> {user.address} (PIN: {user.pincode})</p>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => onUpdateUserStatus(user.uid, 'rejected')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              alert(`Verified details of ${user.name}`);
                            }}
                            className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onUpdateUserStatus(user.uid, 'approved')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section B: Dukandar Requests */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-500 animate-pulse" /> Pending Dukandar Requests ({pendingDukandars.length})
                  </h4>
                </div>
                {pendingDukandars.length === 0 ? (
                  <p className="text-center py-10 text-slate-400 text-xs font-semibold">Zero pending dukandar approvals.</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                    {pendingDukandars.map(user => (
                      <div key={user.uid} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-xs font-extrabold text-slate-800">{user.name}</h5>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Applied: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">Dukandar</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl text-[11px] font-mono space-y-1 text-slate-600 border">
                          <p><strong className="text-slate-400">PHONE:</strong> {user.phone}</p>
                          <p><strong className="text-slate-400">WHATSAPP:</strong> {user.whatsapp}</p>
                          <p><strong className="text-slate-400">ADDRESS:</strong> {user.address} (PIN: {user.pincode})</p>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => onUpdateUserStatus(user.uid, 'rejected')}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              alert(`Verified details of ${user.name}`);
                            }}
                            className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onUpdateUserStatus(user.uid, 'approved')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SELLER HUB & PROFILES */}
        {activeTab === 'sellers' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Wholesale Seller Management</h2>
                <p className="text-xs text-slate-500">Manage approved, blocked and pending wholesaling accounts.</p>
              </div>
              <div className="flex bg-white rounded-xl border p-1 font-bold text-xs">
                {['All', 'Approved', 'Blocked'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSellerFilter(filter as any)}
                    className={`px-3 py-1.5 rounded-lg shrink-0 cursor-pointer ${
                      sellerFilter === filter ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellersList
                .filter(u => {
                  if (sellerFilter === 'Approved') return u.approvalStatus === 'approved';
                  if (sellerFilter === 'Blocked') return u.approvalStatus === 'rejected';
                  return true;
                })
                .map((seller) => {
                  const products = allProducts.filter(p => p.sellerId === seller.uid);
                  const orders = allOrders.filter(o => o.sellerId === seller.uid);
                  const completedOrders = orders.filter(o => o.status === 'Delivered');
                  const sellerRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);

                  return (
                    <div
                      key={seller.uid}
                      onClick={() => setSelectedSeller(seller)}
                      className="bg-white border rounded-2xl p-4.5 hover:border-indigo-400 cursor-pointer shadow-xs transition-all space-y-3 relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{seller.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{seller.phone}</p>
                        </div>
                        <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded ${
                          seller.approvalStatus === 'approved' ? 'bg-emerald-150 text-emerald-800' :
                          seller.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {seller.approvalStatus.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">SKUs</span>
                          <span className="text-xs font-black font-mono mt-0.5 block">{products.length}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Orders</span>
                          <span className="text-xs font-black font-mono mt-0.5 block">{orders.length}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Billing</span>
                          <span className="text-xs font-black font-mono mt-0.5 block text-indigo-600">₹{sellerRevenue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* SELLER OVERLAY DETAIL DRAWER/MODAL */}
            {selectedSeller && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-6 relative border">
                  <button
                    onClick={() => setSelectedSeller(null)}
                    className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-2 py-0.5 rounded tracking-widest font-mono uppercase">
                      Seller Profile Desk
                    </span>
                    <h3 className="text-lg font-black text-slate-800 mt-2">{selectedSeller.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedSeller.uid}</p>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-2xl space-y-1.5 text-xs text-slate-600 font-mono">
                    <p><strong>Phone:</strong> {selectedSeller.phone}</p>
                    <p><strong>WhatsApp:</strong> <a href={`https://wa.me/${selectedSeller.whatsapp}`} className="text-emerald-600 underline" target="_blank">{selectedSeller.whatsapp}</a></p>
                    <p><strong>Address:</strong> {selectedSeller.address}</p>
                    <p><strong>Pincode Area:</strong> {selectedSeller.pincode}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-3 bg-indigo-50/50 p-4 rounded-2xl text-center">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">Products</span>
                      <span className="text-sm font-black font-mono text-indigo-700">{allProducts.filter(p=>p.sellerId === selectedSeller.uid).length}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">Sacks Sold</span>
                      <span className="text-sm font-black font-mono text-indigo-700">
                        {allOrders.filter(o=>o.sellerId === selectedSeller.uid && o.status==='Delivered').reduce((sum,o)=>sum+o.quantity, 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">Total Orders</span>
                      <span className="text-sm font-black font-mono text-indigo-700">{allOrders.filter(o=>o.sellerId === selectedSeller.uid).length}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">Revenue</span>
                      <span className="text-sm font-black font-mono text-emerald-600">
                        ₹{allOrders.filter(o=>o.sellerId === selectedSeller.uid && o.status==='Delivered').reduce((sum,o)=>sum+o.totalAmount, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => {
                        onUpdateUserStatus(selectedSeller.uid, 'rejected');
                        setSelectedSeller(null);
                        alert('Seller account status changed to Blocked!');
                      }}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-xl text-xs transition-all tracking-wide cursor-pointer"
                    >
                      Block Seller
                    </button>
                    <button
                      onClick={() => {
                        onUpdateUserStatus(selectedSeller.uid, 'pending');
                        setSelectedSeller(null);
                        alert('Seller suspended back into pending approval stage.');
                      }}
                      className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-2 rounded-xl text-xs transition-all tracking-wide cursor-pointer"
                    >
                      Suspend Seller
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Delete seller user file completely from database?')) {
                          try {
                            await deleteSingleUserFromDb(selectedSeller.uid);
                            setSelectedSeller(null);
                            alert('Seller account erased.');
                          } catch (e) {
                            alert('Erase failed.');
                          }
                        }
                      }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs transition-all tracking-wide cursor-pointer"
                    >
                      Delete Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Wholesale Stock Catalogue</h2>
                <p className="text-xs text-slate-500">Cross-examine seller listings or remove spam products from the public mandate.</p>
              </div>
              <div className="flex gap-2">
                <div className="bg-white border rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search SKU name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-slate-700 outline-none w-40"
                  />
                </div>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value as any)}
                  className="bg-white border rounded-xl py-1 px-2 text-xs font-bold"
                >
                  <option value="All">All SKUs</option>
                  <option value="Active">Active</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Inactive">Hidden</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allProducts
                .filter(p => {
                  const queryMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!queryMatch) return false;
                  if (productFilter === 'Active') return p.status === 'Active';
                  if (productFilter === 'Sold Out') return p.status === 'Sold Out' || p.stockQuantity === 0;
                  if (productFilter === 'Inactive') return p.status === 'Inactive';
                  return true;
                })
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border rounded-2xl overflow-hidden p-4 flex flex-col justify-between hover:border-indigo-400 group relative transition-all"
                  >
                    <div>
                      <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden mb-3">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className={`absolute top-2 right-2 text-[8px] font-sans font-black uppercase text-white px-2 py-0.5 rounded-full ${
                          product.status === 'Active' ? 'bg-emerald-600' :
                          product.status === 'Sold Out' ? 'bg-yellow-600' :
                          'bg-rose-600'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase font-mono tracking-widest text-slate-400">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Seller: {product.sellerName}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between items-center text-xs font-mono font-bold mb-3">
                        <span className="text-indigo-600">₹{product.price}</span>
                        <span className="text-slate-500">Stock: {product.stockQuantity}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={async () => {
                            try {
                              const nextStatus = product.status === 'Active' ? 'Inactive' : 'Active';
                              await updateProductInDb(product.id, { status: nextStatus });
                              alert(`Product marked as ${nextStatus}!`);
                            } catch (e) {
                              alert('Update failed');
                            }
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-[10px] cursor-pointer"
                        >
                          {product.status === 'Active' ? 'Hide' : 'Activate'}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Erase this product listing completely?')) {
                              try {
                                await deleteProductFromDb(product.id);
                                alert('SKU listing removed.');
                              } catch (e) {
                                alert('Erase failed.');
                              }
                            }
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-1.5 px-2.5 rounded-lg text-[10px] cursor-pointer"
                        >
                          Remove Product
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS POOL */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Wholesale Mandi Orders Pool</h2>
                <p className="text-xs text-slate-500">Global order dashboard tracking logistics pipeline status.</p>
              </div>
              <div className="flex bg-white rounded-xl border p-1 font-bold text-xs select-none">
                {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status as any)}
                    className={`px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer ${
                      orderFilter === status ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Dukandar (Buyer)</th>
                      <th className="p-4">Seller (Supply)</th>
                      <th className="p-4 font-mono">Amount</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allOrders
                      .filter(o => {
                        if (orderFilter === 'All') return true;
                        return o.status === orderFilter;
                      })
                      .map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-slate-500">#{order.id.slice(-6).toUpperCase()}</td>
                          <td className="p-4 font-bold text-slate-700">{order.productName}</td>
                          <td className="p-4 font-medium text-slate-600">{order.buyerName}</td>
                          <td className="p-4 text-slate-500">
                            {allUsers.find(u => u.uid === order.sellerId)?.name || 'Bulk Seller'}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-800">₹{order.totalAmount}</td>
                          <td className="p-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded ${
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              order.status === 'Shipped' ? 'bg-indigo-150 text-indigo-800' :
                              'bg-yellow-100 text-yellow-850'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SELECTED ORDER MODAL */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 relative">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-500">
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <span className="bg-yellow-100 text-yellow-900 border text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                      Direct Billing Ledger
                    </span>
                    <h3 className="text-md font-extrabold text-slate-800 mt-2">Order Details</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedOrder.id}</p>
                  </div>

                  <div className="bg-slate-550 border rounded-2xl p-4 space-y-2.5 text-xs text-slate-700 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Product:</span>
                      <span className="font-extrabold">{selectedOrder.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Quantity:</span>
                      <span className="font-bold">{selectedOrder.quantity} Packs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Billing Total:</span>
                      <span className="font-black text-indigo-600">₹{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="border-t pt-2.5 space-y-1 text-[11px] font-mono text-slate-500">
                      <p><strong>Dukandar Phone:</strong> {selectedOrder.buyerPhone}</p>
                      <p><strong>Shipping Target:</strong> {selectedOrder.address} (PIN: {selectedOrder.pincode})</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await updateOrderInDb(selectedOrder.id, 'Cancelled');
                          setSelectedOrder(null);
                          alert('Order status marked as Cancelled!');
                        } catch (e) {
                          alert('Update failed');
                        }
                      }}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Cancel Order
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await updateOrderInDb(selectedOrder.id, 'Delivered');
                          setSelectedOrder(null);
                          alert('Order status confirmed as Delivered!');
                        } catch (e) {
                          alert('Update failed');
                        }
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Deliver Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SALES ANALYTICS & THREE CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold">KirranaBazzar Sales Analytics</h2>
              <p className="text-xs text-slate-500">Marketplace billing volumes, high-demand products and leaderboards.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white tracking-tight border rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Today's Revenue</span>
                  <span className="text-2xl font-black font-mono text-slate-800 mt-1 block">₹{todayRevenue.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-2 font-mono flex items-center gap-1">
                  ▲ 12.3% vs yesterday
                </span>
              </div>

              <div className="bg-white tracking-tight border rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Monthly Billing</span>
                  <span className="text-2xl font-black font-mono text-slate-800 mt-1 block">₹{monthlyRevenue.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-2 font-mono flex items-center gap-1">
                  ★ Level 3 Mandi limit
                </span>
              </div>

              <div className="bg-white tracking-tight border rounded-2xl p-4.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">All-time Delivered Total</span>
                  <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-2 font-mono flex items-center gap-1">
                  {totalOrdersCount} Completed orders
                </span>
              </div>
            </div>

            {/* THREE CUSTOM HIGH-CONTRAST SVG GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: Revenue spline/area chart */}
              <div className="bg-white border rounded-3xl p-5 space-y-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Revenue Chart (Monthly Billing)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">B2B billing volumes over months (Q1-Q2)</p>
                </div>
                <div className="h-44 flex items-end justify-between gap-1 pt-4 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 border-b border-dashed border-slate-150 py-10" />
                  <div className="absolute inset-0 border-b border-slate-150 py-20" />
                  
                  {/* SVG Line representation */}
                  <div className="absolute inset-x-0 bottom-6 h-28 flex items-end">
                    <svg className="w-full h-full text-indigo-100 overflow-visible" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 80 Q 25 30 50 60 T 100 20 L 100 100 L 0 100 Z" fill="url(#grad1)" />
                      <path d="M 0 80 Q 25 30 50 60 T 100 20" stroke="#4f46e5" strokeWidth="3" fill="none" />
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Custom values tags */}
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => (
                    <div key={m} className="flex-1 text-center flex flex-col justify-end z-10">
                      <span className="text-[10px] text-slate-400 font-bold font-mono block mt-2">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 2: Orders volumes bar chart */}
              <div className="bg-white border rounded-3xl p-5 space-y-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Orders Volume Chart</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Overall transaction density</p>
                </div>
                <div className="h-44 flex items-end justify-between pt-4 relative gap-3">
                  {/* Simulated beautiful bars */}
                  {[
                    { day: 'Mon', count: 4, height: '40%' },
                    { day: 'Tue', count: 7, height: '70%' },
                    { day: 'Wed', count: 5, height: '50%' },
                    { day: 'Thu', count: 9, height: '90%' },
                    { day: 'Fri', count: 6, height: '60%' },
                    { day: 'Sat', count: 3, height: '30%' },
                    { day: 'Sun', count: 2, height: '20%' }
                  ].map((item) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10 group">
                      <span className="text-[8px] font-mono font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 px-1 rounded">
                        {item.count}
                      </span>
                      <div className="w-full bg-indigo-500 rounded-t-lg transition-all group-hover:bg-indigo-600 duration-300" style={{ height: item.height }} />
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 3: Weekly trends line chart */}
              <div className="bg-white border rounded-3xl p-5 space-y-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Sales Value Trends</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Average checkout value tracking</p>
                </div>
                <div className="h-44 flex items-end justify-between pt-4 relative">
                  <div className="absolute inset-x-0 bottom-6 h-28">
                    <svg className="w-full h-full text-emerald-100 overflow-visible" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 60 Q 20 40 40 80 T 80 30 T 100 50" stroke="#059669" strokeWidth="3.5" fill="none" />
                      <circle cx="0" cy="60" r="3.5" fill="#059669" />
                      <circle cx="40" cy="80" r="3.5" fill="#059669" />
                      <circle cx="80" cy="30" r="3.5" fill="#059669" />
                    </svg>
                  </div>
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
                    <span key={w} className="flex-1 text-center text-[10px] text-slate-400 font-bold font-mono z-10">{w}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Analytics Grid: Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard: Product Sales */}
              <div className="bg-white border p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Popular wholesaled products</h4>
                {topSellingProducts.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs">Waiting for delivered wholesale bills.</p>
                ) : (
                  <div className="divide-y">
                    {topSellingProducts.map((p, idx) => (
                      <div key={p.name} className="py-2.5 flex justify-between items-center text-xs">
                        <div className="flex gap-2 items-center">
                          <span className="w-5 h-5 bg-indigo-50 text-indigo-700 font-bold rounded flex items-center justify-center text-[10px]">{idx+1}</span>
                          <span className="font-bold text-slate-700">{p.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-500">{p.qty} sacks sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard: Top sellers */}
              <div className="bg-white border p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Sales Leaderboard (Wholesalers)</h4>
                {topSellers.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs">No active verified bulk transactions yet.</p>
                ) : (
                  <div className="divide-y">
                    {topSellers.map((s, idx) => (
                      <div key={s.name} className="py-2.5 flex justify-between items-center text-xs">
                        <div className="flex gap-2 items-center">
                          <span className="w-5 h-5 bg-amber-50 text-amber-700 font-bold rounded flex items-center justify-center text-[10px]">{idx+1}</span>
                          <span className="font-bold text-slate-700 truncate max-w-[150px]">{s.name}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">₹{s.sales.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: REGIONAL DELIVERY AREAS */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold">📂 Catalog Category Config</h2>
              <p className="text-xs text-slate-500">Configure global product categories, merge or delete redundant tags.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category list */}
              <div className="bg-white border p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Categories Directory</h4>
                <div className="space-y-2.5">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border">
                      <div>
                        <span className="font-bold text-slate-800 text-xs">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Code: {cat.code} {cat.hidden && '(HIDDEN)'}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleHideCategory(cat.id)}
                          className="bg-white text-[10px] font-bold py-1 px-2.5 rounded border hover:bg-slate-100"
                        >
                          {cat.hidden ? 'Show' : 'Hide'}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="bg-rose-50 text-rose-700 text-[10px] font-bold py-1 px-2.5 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom category form */}
              <div className="bg-white border p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Introduce Custom Tag</h4>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">CATEGORY DISPLAY NAME</label>
                  <input
                    type="text"
                    placeholder="example: Premium Pulses"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-slate-50 border p-3 rounded-xl text-xs outline-none focus:border-indigo-500"
                  />
                  <div className="bg-indigo-50/50 p-3 rounded-xl border text-[10px] leading-relaxed text-indigo-900 font-semibold font-sans">
                    ✨ Adding a category instantly updates options available to Wholesalers when inserting new stock cards.
                  </div>
                  <button
                    onClick={handleAddCategory}
                    className="w-full bg-slate-950 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: COMPLAINTS & REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold">🚨 B2B Client Complaints Box</h2>
              <p className="text-xs text-slate-500">Track and resolve complaints registered by retailers about wrong sack weights, bad behaviour or fake items.</p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {complaints.length === 0 ? (
                <div className="text-center py-10 bg-white border rounded-3xl">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-400">Zero active client disputes!</p>
                </div>
              ) : (
                complaints.map((comp) => (
                  <div key={comp.id} className="bg-white border rounded-2xl p-5 space-y-3.5 relative">
                    <span className="absolute top-4 right-4 text-[9px] font-mono font-extrabold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded animate-pulse">
                      {comp.type}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Dispute ID: {comp.id}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Lodged: {new Date(comp.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1 text-slate-600">
                      <p><strong>Dukandar (Filing Point):</strong> {comp.sourceDukandar}</p>
                      <p><strong>Seller (Accused Wholesaler):</strong> {comp.targetSeller}</p>
                      <p className="text-slate-700 leading-relaxed mt-2 italic font-serif">"{comp.description}"</p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          alert(`Warning letter dispatched to: ${comp.targetSeller}`);
                        }}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-extrabold py-1.5 px-3 rounded-lg"
                      >
                        Warn Seller
                      </button>
                      <button
                        onClick={() => {
                          setComplaints(complaints.filter(c => c.id !== comp.id));
                          alert('Dispute resolved: closed.');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 px-3 rounded-lg"
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: NOTIFICATIONS BROADCASTER */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold font-sans">📢 Notice Broadcast Console</h2>
              <p className="text-xs text-slate-500">Draft and dispatch banners or alerts regarding festival schedules or Server maintenance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs form-sans">
              {/* Draft Box */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Configure Notification Banner</h4>
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">NOTICE TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Diwali Carriage Subsidies!"
                      value={newNotice.title}
                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">NOTICE TYPE</label>
                    <select
                      value={newNotice.type}
                      onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value as any })}
                      className="w-full bg-slate-50 border p-3 rounded-xl text-xs outline-none"
                    >
                      <option value="System Alert">System Alert</option>
                      <option value="Server Maintenance">Server Maintenance</option>
                      <option value="New Feature Added">New Feature Added</option>
                      <option value="Holiday Notice">Holiday Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">TARGET AUDIENCE</label>
                    <select
                      value={newNotice.target}
                      onChange={(e) => setNewNotice({ ...newNotice, target: e.target.value as any })}
                      className="w-full bg-slate-50 border p-3 rounded-xl text-xs outline-none font-sans"
                    >
                      <option value="Everyone">Everyone (Sellers & Dukandars)</option>
                      <option value="All Sellers">Wholesale Sellers Only</option>
                      <option value="All Dukandars">Dukandar Retailers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">REMARKS / BROADCAST MESSAGE</label>
                    <textarea
                      rows={3}
                      placeholder="..."
                      value={newNotice.message}
                      onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl text-xs outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSendNotice}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
                  >
                    Broadcast Banner
                  </button>
                </div>
              </div>

              {/* History list */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Notice Dispatch Logs</h4>
                <div className="space-y-3.5 max-h-[450px] overflow-y-auto no-scrollbar">
                  {broadcasts.map((br) => (
                    <div key={br.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded tracking-wider block">
                          {br.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{new Date(br.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h5 className="font-extrabold text-slate-800 text-xs mt-1.5">{br.title}</h5>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{br.message}</p>
                      <div className="text-[9px] font-bold text-slate-400 mt-2 font-mono">AUDIENCE: {br.target.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS PAGE */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold">⚙️ Application Core settings</h2>
              <p className="text-xs text-slate-500 font-sans">Modify brand labels, logo text and statutory policies.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-700">
              {/* Form Branding */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase font-mono tracking-widest border-b pb-2">Branding Adjustments</h3>
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">APP NAME</label>
                    <input
                      type="text"
                      value={appSettings.appName}
                      onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">LOGO BRAND HEADER STRING</label>
                    <input
                      type="text"
                      value={appSettings.logoText}
                      onChange={(e) => setAppSettings({ ...appSettings, logoText: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">BANNER HEADING TEXT</label>
                    <input
                      type="text"
                      value={appSettings.bannerText}
                      onChange={(e) => setAppSettings({ ...appSettings, bannerText: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Legal Texts */}
              <div className="bg-white border rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase font-mono tracking-widest border-b pb-2">Policies & Regulations</h3>
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">TERMS AND CONDITIONS SUMMARY</label>
                    <textarea
                      rows={2}
                      value={appSettings.tnc}
                      onChange={(e) => setAppSettings({ ...appSettings, tnc: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">PRIVACY COMPLIANCE NOTE</label>
                    <textarea
                      rows={2}
                      value={appSettings.privacy}
                      onChange={(e) => setAppSettings({ ...appSettings, privacy: e.target.value })}
                      className="w-full bg-slate-50 border p-3 rounded-xl outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-slate-950 text-white font-bold py-3.5 rounded-xl cursor-pointer"
                  >
                    Apply Parameters
                  </button>
                </div>
              </div>

              {/* SUPER ADMIN LEVEL: CREATE ALTERNATE OWNER ACCESS */}
              <div className="bg-white border rounded-3xl p-5 space-y-4 lg:col-span-2">
                <h3 className="text-xs font-black text-slate-400 uppercase font-mono tracking-widest border-b pb-2 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-500" /> Super Admin Features: Create Co-Owner Account
                </h3>
                
                {adminStatusMsg && (
                  <div className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold leading-relaxed">
                    {adminStatusMsg}
                  </div>
                )}

                <form onSubmit={handleCreateOwner} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">OWNER FULL NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Shyam Lal"
                      value={newOwner.name}
                      onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">10-DIGIT MOBILE</label>
                    <input
                      type="text"
                      placeholder="e.g. 9988776655"
                      value={newOwner.phone}
                      onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">MARKET REGION ADDRESS</label>
                    <input
                      type="text"
                      placeholder="Block D, Meerut"
                      value={newOwner.address}
                      onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">PINCODE</label>
                    <input
                      type="text"
                      placeholder="250001"
                      value={newOwner.pincode}
                      onChange={(e) => setNewOwner({ ...newOwner, pincode: e.target.value })}
                      className="w-full bg-slate-50 border p-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  <div className="md:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl items-center flex gap-1.5 text-xs transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Provision Authoritative Owner
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: SYSTEM DATABASES FLUSH */}
        {activeTab === 'data' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div>
              <h2 className="text-xl font-bold">🗑 Core Data Management & Reset Desk</h2>
              <p className="text-xs text-slate-500 font-sans">Erase log histories, transactional orders pool, or wipe customer files.</p>
            </div>

            <div className="bg-white border rounded-3xl p-6.5 max-w-xl space-y-5 text-slate-700 text-xs">
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex gap-3Items">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm">Dangerous Administrative Area</h4>
                  <p className="mt-1 font-medium leading-relaxed">
                    Flushing user registration files, catalogs or logs is irreversible. To proceed, you MUST write "RESET" in the text field below before clicking any administrative act.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">WRITE "RESET" TO UNLOCK BUTTONS</label>
                <input
                  type="text"
                  placeholder="WRITE RESET HERE"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full bg-slate-50 border p-3 rounded-xl outline-none tracking-widest font-mono text-xs focus:border-rose-500 uppercase font-extrabold focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => handleAdminAction('orders')}
                  disabled={confirmInput !== 'RESET'}
                  type="button"
                  className="bg-slate-100 hover:bg-rose-100 border hover:border-rose-300 disabled:opacity-50 text-slate-700 disabled:hover:bg-slate-100 disabled:hover:border-transparent font-bold py-3 px-4 rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4 text-red-500" /> Wipe Orders Pool
                </button>

                <button
                  onClick={() => handleAdminAction('products')}
                  disabled={confirmInput !== 'RESET'}
                  type="button"
                  className="bg-slate-100 hover:bg-rose-100 border hover:border-rose-300 disabled:opacity-50 text-slate-700 disabled:hover:bg-slate-100 disabled:hover:border-transparent font-bold py-3 px-4 rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4 text-red-500" /> Flush Catalogs SKU
                </button>

                <button
                  onClick={() => handleAdminAction('users')}
                  disabled={confirmInput !== 'RESET'}
                  type="button"
                  className="bg-slate-100 hover:bg-rose-100 border hover:border-rose-300 disabled:opacity-50 text-slate-700 disabled:hover:bg-slate-100 disabled:hover:border-transparent font-bold py-3 px-4 rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4 text-red-500" /> Delete Customers Pool
                </button>

                <button
                  onClick={() => handleAdminAction('logs')}
                  disabled={confirmInput !== 'RESET'}
                  type="button"
                  className="bg-slate-100 hover:bg-rose-100 border hover:border-rose-300 disabled:opacity-50 text-slate-700 disabled:hover:bg-slate-100 disabled:hover:border-transparent font-bold py-3 px-4 rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4 text-red-500" /> Wipe Complaint logs
                </button>
              </div>

              <div className="border-t pt-5 space-y-3.5">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-400">Total Factory Defaults Recovery</h4>
                <p className="text-slate-500">Restore all initial databases with seeded Wholesaler Goel and Ramesh Dukandar immediately.</p>
                <button
                  onClick={() => {
                    if (window.confirm('Wipe complete custom database & local cache?')) {
                      onResetSystemData();
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shadow-red-650/15"
                >
                  <Database className="w-4 h-4" /> Comprehensive Storage Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB FOR DISTRICT AREA ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white border rounded-3xl p-5.5 space-y-4 animate-fade-in text-slate-800 text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">📍 Region Delivery Area density</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {REGION_STATS.map((reg) => (
                <div key={reg.name} className="bg-slate-50 p-4 border rounded-2xl text-center space-y-1 shadow-2xs">
                  <span className="font-extrabold text-slate-800 text-xs tracking-tight">{reg.name}</span>
                  <div className="flex justify-between font-mono text-[11px] pt-1 text-slate-500 font-bold">
                    <span>Sellers:</span>
                    <span className="text-orange-600">{reg.sellers}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-slate-500 font-bold">
                    <span>Orders:</span>
                    <span className="text-indigo-600">{reg.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      
    </div>
  );
}

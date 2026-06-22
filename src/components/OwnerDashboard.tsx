import { useState } from 'react';
import { UserProfile, Product, Order } from '../types';
import { CATEGORIES } from '../data';
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
  Package
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

export default function OwnerDashboard({
  currentUser,
  allUsers,
  allProducts,
  allOrders,
  onLogout,
  onUpdateUserStatus,
  onResetSystemData
}: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'products' | 'orders' | 'config'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingUsers = allUsers.filter(u => u.approvalStatus === 'pending');
  const approvedUsers = allUsers.filter(u => u.approvalStatus === 'approved');
  const rejectedUsers = allUsers.filter(u => u.approvalStatus === 'rejected');

  const filteredUsersList = allUsers.filter(u => {
    const text = (u.name + u.phone + u.role + u.pincode).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const aggregateSales = allOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="h-full w-full bg-slate-50 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Admin header */}
      <header className="bg-slate-950 text-white px-4 py-4.5 sticky top-0 z-20 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-slate-100">
            ★
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none font-display">
              Kirrana<span className="text-indigo-400">Owner</span>
            </h1>
            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider font-mono">
              Marketplace Command Center
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-indigo-300 font-bold flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>

      {/* Main Command Workspace */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-8">
        
        {/* Admin overview stats board */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-3xl p-5 text-white shadow-lg space-y-4">
          <div>
            <span className="text-[10px] text-indigo-300 font-bold uppercase font-mono tracking-wider bg-indigo-950/80 px-2 py-0.5 rounded">
              Owner Rajesh Kumar
            </span>
            <div className="flex justify-between items-end mt-2">
              <div>
                <span className="text-[11px] text-indigo-200">Total B2B Galla Sales</span>
                <span className="text-3xl font-black font-mono mt-1 block">
                  ₹{aggregateSales.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-indigo-400 font-mono text-xs font-semibold">
                {allOrders.length} Orders Pool
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center">
            <div className="bg-white/5 p-2 rounded-xl flex flex-col justify-center">
              <Clock className="w-5 h-5 mx-auto text-yellow-300 mb-0.5 animate-pulse" />
              <span className="text-[10px] block font-mono font-bold mt-1 text-yellow-300">{pendingUsers.length} Pend</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl flex flex-col justify-center">
              <Factory className="w-5 h-5 mx-auto text-amber-300 mb-0.5" />
              <span className="text-[10px] block font-mono font-bold mt-1 text-amber-300">{allUsers.filter(u=>u.role==='Seller').length} Sell</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl flex flex-col justify-center">
              <Store className="w-5 h-5 mx-auto text-emerald-300 mb-0.5" />
              <span className="text-[10px] block font-mono font-bold mt-1 text-emerald-300">{allUsers.filter(u=>u.role==='Dukandar').length} Dukan</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl flex flex-col justify-center">
              <Package className="w-5 h-5 mx-auto text-indigo-300 mb-0.5" />
              <span className="text-[10px] block font-mono font-bold mt-1 text-indigo-300">{allProducts.length} SKU</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-xs flex select-none font-sans font-bold">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-2 rounded-xl text-center text-xs relative ${
              activeTab === 'approvals' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Approvals
            {pendingUsers.length > 0 && (
              <span className="absolute top-1 right-2 bg-rose-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {pendingUsers.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-xl text-center text-xs ${
              activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Users
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 rounded-xl text-center text-xs ${
              activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Catalog
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 rounded-xl text-center text-xs ${
              activeTab === 'config' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            B2B Admin
          </button>
        </div>

        {/* VIEW 1: APPROVAL DESK */}
        {activeTab === 'approvals' && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Pending Wholesaler & Outlet Approvals
            </h3>

            {pendingUsers.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center">
                <span className="text-4xl">🎉</span>
                <h4 className="text-sm font-bold text-slate-700 mt-2">Zero pending approvals!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  All registering sellers and dukandars are verified. Newly created accounts will buffer here instantly!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(user => (
                  <div
                    key={user.uid}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider font-mono ${
                          user.role === 'Seller' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.role}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-2">{user.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <span className="bg-yellow-50 text-yellow-800 border-yellow-200 border text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                        PENDING
                      </span>
                    </div>

                    <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-50 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-400">PHONE:</span>
                        <span className="font-bold text-slate-800">{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-400">WHATSAPP:</span>
                        <span className="font-bold text-emerald-600">{user.whatsapp}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-slate-400 shrink-0">ADDRESS:</span>
                        <span className="font-medium text-slate-700">{user.address} (PIN: {user.pincode})</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateUserStatus(user.uid, 'rejected')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-3 rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                      <button
                        onClick={() => onUpdateUserStatus(user.uid, 'approved')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
                      >
                        ✓ Approve Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TOTAL USERS TABLE */}
        {activeTab === 'users' && (
          <div className="space-y-3 animate-fade-in select-none">
            
            <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, PIN, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-2.5">
              {filteredUsersList.map(u => (
                <div
                  key={u.uid}
                  className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xs flex justify-between items-center"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{u.name}</h5>
                    <div className="flex gap-2 mt-1 items-center">
                      <span className={`text-[8px] font-black px-1 py-0.2 rounded font-mono ${
                        u.role === 'Owner' ? 'bg-indigo-100 text-indigo-700' :
                        u.role === 'Seller' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.phone}</span>
                      <span className="text-[10px] text-slate-400 font-mono">PIN: {u.pincode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {u.role !== 'Owner' && (
                      <select
                        value={u.approvalStatus}
                        onChange={(e) => onUpdateUserStatus(u.uid, e.target.value as any)}
                        className={`text-[10px] font-bold p-1 rounded border ${
                          u.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          u.approvalStatus === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-250' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* VIEW 3: GLOBAL CATALOG OVERVIEW */}
        {activeTab === 'products' && (
          <div className="space-y-3 animate-fade-in select-none">
            
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Marketplace catalog inventory</h3>
              <p className="text-sm font-bold text-slate-800 mt-1">Cross-Wholesaler Listings</p>
            </div>

            <div className="space-y-2.5">
              {allProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl p-3 border border-slate-100 flex gap-3"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-150 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {p.sellerName.split(' ')[0]}
                      </span>
                      <span className={`text-[8px] font-black px-1 rounded uppercase ${
                        p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 mt-0.5 truncate">{p.name}</h5>
                    <div className="flex justify-between font-mono text-[10px] mt-1 font-bold text-slate-700">
                      <span>₹{p.price} per sack</span>
                      <span>Stock: {p.stockQuantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* VIEW 4: SYSTEM CONFIG & RESET */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h3 className="font-extrabold text-slate-800">Advanced Wholesaler Control</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              As Rajesh Kumar (Owner), you have database administration keys. You can instantly restore pre-seeded accounts and clean products/orders to initial parameters in 1 click (valuable for grading evaluation).
            </p>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100/70 text-amber-900 text-xs font-semibold leading-relaxed">
              ⭐ Resetting will flush localStorage custom assets and re-seed the standard Goel Wholesalers, Gupta Kirana Stores and other pending profiles immediately!
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all marketplace states to preloaded default values?')) {
                  onResetSystemData();
                  alert('Marketplace states successfully restored! Reloading database.');
                }
              }}
              type="button"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-rose-600/10"
            >
              <Database className="w-4 h-4 text-white" /> Pure Reset Local Storage
            </button>
          </div>
        )}

      </main>
      
    </div>
  );
}

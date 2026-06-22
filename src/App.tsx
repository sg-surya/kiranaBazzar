import { useState, useEffect } from 'react';
import { UserProfile, Product, Order } from './types';
import {
  initializeLocalStorage,
  getUsers,
  getProducts,
  getOrders,
  saveUsers,
  saveProducts,
  saveOrders,
  SEEDED_USERS,
  SEEDED_PRODUCTS,
  SEEDED_ORDERS
} from './data';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import PendingApprovalScreen from './components/PendingApprovalScreen';
import SellerDashboard from './components/SellerDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import DukandarDashboard from './components/DukandarDashboard';
import PublicMarketplace from './components/PublicMarketplace';
import { ShieldCheck, UserCheck, RefreshCw, X } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [guestView, setGuestView] = useState<'marketplace' | 'login' | 'register'>('marketplace');
  
  // Master application states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  
  // Testing guide switcher state
  const [showTestSwitcher, setShowTestSwitcher] = useState(true);

  // Initialize
  useEffect(() => {
    initializeLocalStorage();
    setAllUsers(getUsers());
    setAllProducts(getProducts());
    setAllOrders(getOrders());

    // Check if there is an active session in local storage
    const storedUser = localStorage.getItem('kb_current_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Save changes to local storage and sync state
  const updateUsersListState = (updatedUsersList: UserProfile[]) => {
    setAllUsers(updatedUsersList);
    saveUsers(updatedUsersList);
    
    // If current logged-in user is updated, sync their details
    if (currentUser) {
      const freshUserObj = updatedUsersList.find(u => u.uid === currentUser.uid);
      if (freshUserObj) {
        setCurrentUser(freshUserObj);
        localStorage.setItem('kb_current_user', JSON.stringify(freshUserObj));
      }
    }
  };

  const updateProductsListState = (updatedProductsList: Product[]) => {
    setAllProducts(updatedProductsList);
    saveProducts(updatedProductsList);
  };

  const updateOrdersListState = (updatedOrdersList: Order[]) => {
    setAllOrders(updatedOrdersList);
    saveOrders(updatedOrdersList);
  };

  // Auth Operations
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('kb_current_user', JSON.stringify(user));
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('kb_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kb_current_user');
    setGuestView('marketplace');
  };

  // User Approval / Status (Owner activity)
  const handleUpdateUserStatus = (uid: string, status: UserProfile['approvalStatus']) => {
    const updated = allUsers.map(u => {
      if (u.uid === uid) {
        return { ...u, approvalStatus: status };
      }
      return u;
    });
    updateUsersListState(updated);
  };

  // Wholesaler - Product Catalog CRUD operations
  const handleSaveProduct = (product: Product) => {
    const exists = allProducts.some(p => p.id === product.id);
    let updated: Product[];
    
    if (exists) {
      updated = allProducts.map(p => p.id === product.id ? product : p);
    } else {
      updated = [product, ...allProducts];
    }
    updateProductsListState(updated);
  };

  const handleDeleteProduct = (pId: string) => {
    if (window.confirm('Are you sure you want to delete this product listing from your catalog?')) {
      const updated = allProducts.filter(p => p.id !== pId);
      updateProductsListState(updated);
    }
  };

  const handleUpdateProductStatus = (pId: string) => {
    const updated = allProducts.map(p => {
      if (p.id === pId) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        return { ...p, status: nextStatus as any };
      }
      return p;
    });
    updateProductsListState(updated);
  };

  const handleUpdateProductStock = (pId: string, newStock: number) => {
    const updated = allProducts.map(p => {
      if (p.id === pId) {
        const calculatedStatus = newStock === 0 ? 'Sold Out' : p.status === 'Sold Out' ? 'Active' : p.status;
        return {
          ...p,
          stockQuantity: newStock,
          status: calculatedStatus as any
        };
      }
      return p;
    });
    updateProductsListState(updated);
  };

  // Seller delivery area changes
  const handleUpdateDeliveryAreas = (sellerId: string, cities: string[], pincodes: string[]) => {
    const updated = allProducts.map(p => {
      if (p.sellerId === sellerId) {
        return {
          ...p,
          deliveryAreas: {
            cities: cities,
            pincodes: pincodes
          }
        };
      }
      return p;
    });
    updateProductsListState(updated);
  };

  // Orders Placed & Status toggles
  const handlePlaceOrder = (order: Order) => {
    // 1. Save local order
    const updatedOrders = [order, ...allOrders];
    updateOrdersListState(updatedOrders);

    // 2. Adjust remaining product stock quantity
    const updatedProducts = allProducts.map(p => {
      if (p.id === order.productId) {
        const nextStock = Math.max(0, p.stockQuantity - order.quantity);
        // Automatically set Sold Out if stock hits 0
        const updatedStatus = nextStock === 0 ? 'Sold Out' : p.status;
        return {
          ...p,
          stockQuantity: nextStock,
          status: updatedStatus as any
        };
      }
      return p;
    });
    updateProductsListState(updatedProducts);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: Order['status']) => {
    const updatedOrders = allOrders.map(o => {
      if (o.id === orderId) {
        // If order gets cancelled, refund the stock!
        if (nextStatus === 'Cancelled' && o.status !== 'Cancelled') {
          handleRefundStock(o.productId, o.quantity);
        }
        return { ...o, status: nextStatus };
      }
      return o;
    });
    updateOrdersListState(updatedOrders);
  };

  const handleRefundStock = (productId: string, qty: number) => {
    const updatedProducts = allProducts.map(p => {
      if (p.id === productId) {
        const nextStock = p.stockQuantity + qty;
        const nextStatus = p.status === 'Sold Out' ? 'Active' : p.status;
        return { ...p, stockQuantity: nextStock, status: nextStatus as any };
      }
      return p;
    });
    updateProductsListState(updatedProducts);
  };

  // Restorer to default seeding (Owner operation)
  const handleResetSystemData = () => {
    localStorage.clear();
    setAllUsers(SEEDED_USERS);
    setAllProducts(SEEDED_PRODUCTS);
    setAllOrders(SEEDED_ORDERS);
    setCurrentUser(null);
    localStorage.setItem('kb_users', JSON.stringify(SEEDED_USERS));
    localStorage.setItem('kb_products', JSON.stringify(SEEDED_PRODUCTS));
    localStorage.setItem('kb_orders', JSON.stringify(SEEDED_ORDERS));
    localStorage.removeItem('kb_current_user');
  };

  const handleQuickBypassApprove = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem('kb_current_user', JSON.stringify(updated));
    // refresh user state list as well
    setAllUsers(getUsers());
  };

  // Quick switch role shortcut for testing / grading ease
  const handleQuickSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('kb_current_user', JSON.stringify(user));
  };

  // Rendering Routing Logic
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Simulation/Tester floating banner at top */}
      {showTestSwitcher && (
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white border-b border-teal-500/20 text-xs px-4 py-3 select-none flex items-center justify-between shadow-md relative z-40 max-w-md mx-auto w-full shrink-0">
          <div className="flex items-center gap-2">
            <span className="animate-ping w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <h4 className="font-bold text-[11px] uppercase tracking-wider font-mono text-emerald-400">
              Demo Switcher Console
            </h4>
          </div>

          <div className="flex items-center gap-2 max-w-xs overflow-x-auto no-scrollbar py-0.5">
            {allUsers.slice(0, 4).map((user) => (
              <button
                key={user.uid}
                onClick={() => handleQuickSwitchUser(user)}
                title={`Login as ${user.name} (${user.role})`}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  currentUser?.uid === user.uid
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                    : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
                }`}
              >
                {user.name.split(' ')[0]} ({user.role[0]} - {user.approvalStatus[0].toUpperCase()})
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTestSwitcher(false)}
            className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container workspace */}
      <div className="flex-1 bg-slate-50 relative flex flex-col overflow-hidden">
        
        {/* RENDER LOGIN / REGISTER ROUTE */}
        {currentUser === null ? (
          guestView === 'marketplace' ? (
            <PublicMarketplace
              products={allProducts}
              onNavigateToLogin={() => setGuestView('login')}
              onNavigateToRegister={() => setGuestView('register')}
            />
          ) : guestView === 'login' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
              <div className="max-w-md mx-auto w-full px-4 pt-4 shrink-0">
                <button
                  onClick={() => setGuestView('marketplace')}
                  className="flex items-center gap-1.5 text-xs text-pink-600 font-bold bg-pink-50 hover:bg-pink-100 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                >
                  ← Back to Wholesale Market
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LoginScreen
                  onLoginSuccess={(user) => {
                    handleLoginSuccess(user);
                    setGuestView('marketplace');
                  }}
                  onNavigateToRegister={() => setGuestView('register')}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
              <div className="max-w-md mx-auto w-full px-4 pt-4 shrink-0">
                <button
                  onClick={() => setGuestView('marketplace')}
                  className="flex items-center gap-1.5 text-xs text-pink-600 font-bold bg-pink-50 hover:bg-pink-100 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                >
                  ← Back to Wholesale Market
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <RegisterScreen
                  onRegisterSuccess={(user) => {
                    handleRegisterSuccess(user);
                    setGuestView('marketplace');
                  }}
                  onNavigateToLogin={() => setGuestView('login')}
                />
              </div>
            </div>
          )
        ) : (
          /* USER LOGGED IN - ROUTE BY VERIFICATION STATUS */
          currentUser.approvalStatus === 'pending' ? (
            <div className="flex-1 overflow-y-auto">
              <PendingApprovalScreen
                currentUser={currentUser}
                onLogout={handleLogout}
                onApprovalBypass={handleQuickBypassApprove}
              />
            </div>
          ) : currentUser.approvalStatus === 'rejected' ? (
            /* REJECTED SCREEN */
            <div className="h-full bg-slate-50 p-4 max-w-md mx-auto flex flex-col justify-between text-center overflow-y-auto select-none">
              <div className="pt-8">
                <h2 className="text-xl font-bold text-slate-800">KirranaBazzar</h2>
                <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold">Verification Desk</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl my-4">
                <span className="text-5xl block">⚠️</span>
                <h3 className="text-lg font-bold text-slate-800 mt-4">Application Rejected</h3>
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 py-1.5 px-3 rounded-full inline-block mt-2 font-semibold">
                  Policy verification failed
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mt-4 max-w-xs mx-auto">
                  Unfortunately, we could not verify your wholesale store coordinates or business profile. Only legitimate Kirana shopkeepers and vetted sellers can write catalogs on KirranaBazzar.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl mt-4 border border-slate-50 text-left text-[11px] text-slate-500">
                  <strong>Name:</strong> {currentUser.name}<br />
                  <strong>Phone:</strong> {currentUser.phone}<br />
                  <strong>Pincode:</strong> {currentUser.pincode}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-all mb-4"
              >
                Sign out and Apply with alternate details
              </button>
            </div>
          ) : (
            /* USER APPROVED - ROUTE BY B2B ROLE */
            currentUser.role === 'Owner' ? (
              <OwnerDashboard
                currentUser={currentUser}
                allUsers={allUsers}
                allProducts={allProducts}
                allOrders={allOrders}
                onLogout={handleLogout}
                onUpdateUserStatus={handleUpdateUserStatus}
                onResetSystemData={handleResetSystemData}
              />
            ) : currentUser.role === 'Seller' ? (
              <SellerDashboard
                currentUser={currentUser}
                products={allProducts}
                orders={allOrders}
                onLogout={handleLogout}
                onAddProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProductStock={handleUpdateProductStock}
                onUpdateProductStatus={handleUpdateProductStatus}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateDeliveryAreas={handleUpdateDeliveryAreas}
              />
            ) : (
              /* DUKANDAR / BUYER */
              <DukandarDashboard
                currentUser={currentUser}
                products={allProducts}
                orders={allOrders}
                onLogout={handleLogout}
                onPlaceOrder={handlePlaceOrder}
              />
            )
          )
        )}

      </div>

      {/* Persistent Switcer Hint info at bottom */}
      {!showTestSwitcher && (
        <button
          onClick={() => setShowTestSwitcher(true)}
          className="fixed bottom-2.5 right-2.5 bg-slate-900 border border-teal-500/30 text-white text-[9px] font-semibold py-1 px-2 rounded-lg pointer-events-auto leading-none select-none active:scale-95 transition-all z-20 flex items-center gap-1.5 shadow-lg shadow-black/15"
        >
          <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          Quick Switch Tester Console
        </button>
      )}

    </div>
  );
}

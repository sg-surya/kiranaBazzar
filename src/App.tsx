import { useState, useEffect } from 'react';
import { UserProfile, Product, Order } from './types';
import {
  updateUserProfile,
  addProductToDb,
  updateProductInDb,
  deleteProductFromDb,
  placeOrderInDb,
  updateOrderInDb,
  logOutUser
} from './services/db';
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
  
  // Initialize and Sync Realtime Collections from Express Backend Proxy (Hides Secrets)
  useEffect(() => {
    let active = true;

    const syncData = async () => {
      try {
        const response = await fetch('/api/sync');
        if (!response.ok) throw new Error('Data sync failure');
        const data = await response.json();
        
        if (!active) return;

        // 1. Sync users
        if (data.users) {
          setAllUsers(data.users);
          
          // Auto-sync current logged-in user details if any changes occur in DB (e.g. Owner approves)
          const stored = localStorage.getItem('kb_current_user');
          if (stored) {
            const parsed = JSON.parse(stored) as UserProfile;
            const dbUser = data.users.find((u: any) => u.uid === parsed.uid);
            if (dbUser) {
              setCurrentUser(dbUser);
              localStorage.setItem('kb_current_user', JSON.stringify(dbUser));
            }
          }
        }

        // 2. Sync products
        if (data.products) {
          setAllProducts(data.products);
        }

        // 3. Sync orders (sorted by newest placement)
        if (data.orders) {
          const sortedOrders = [...data.orders];
          sortedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAllOrders(sortedOrders);
        }
      } catch (err) {
        console.error('Error syncing backend database:', err);
      }
    };

    // Initial load
    syncData();

    // Responsive polling interval (every 3 seconds) for a native Realtime database feel
    const intervalId = setInterval(syncData, 3000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  // Auth Operations
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('kb_current_user', JSON.stringify(user));
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('kb_current_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('kb_current_user');
    setGuestView('marketplace');
  };

  // User Approval / Status (Owner activity)
  const handleUpdateUserStatus = async (uid: string, status: UserProfile['approvalStatus']) => {
    try {
      await updateUserProfile(uid, { approvalStatus: status });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  // Wholesaler - Product Catalog CRUD operations
  const handleSaveProduct = async (product: Product) => {
    try {
      if (product.id.startsWith('new-') || !allProducts.some(p => p.id === product.id)) {
        const { id, ...cleanProduct } = product;
        await addProductToDb(cleanProduct);
      } else {
        const { id, ...cleanProduct } = product;
        await updateProductInDb(id, cleanProduct);
      }
    } catch (err) {
      console.error('Error saving product catalog:', err);
    }
  };

  const handleDeleteProduct = async (pId: string) => {
    if (window.confirm('Are you sure you want to delete this product listing from your catalog?')) {
      try {
        await deleteProductFromDb(pId);
      } catch (err) {
        console.error('Error deleting product from database:', err);
      }
    }
  };

  const handleUpdateProductStatus = async (pId: string) => {
    const prod = allProducts.find(p => p.id === pId);
    if (!prod) return;
    const nextStatus = prod.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateProductInDb(pId, { status: nextStatus as any });
    } catch (err) {
      console.error('Error updating product status in DB:', err);
    }
  };

  const handleUpdateProductStock = async (pId: string, newStock: number) => {
    const prod = allProducts.find(p => p.id === pId);
    if (!prod) return;
    const calculatedStatus = newStock === 0 ? 'Sold Out' : prod.status === 'Sold Out' ? 'Active' : prod.status;
    try {
      await updateProductInDb(pId, {
        stockQuantity: newStock,
        status: calculatedStatus as any
      });
    } catch (err) {
      console.error('Error updating product stock in DB:', err);
    }
  };

  // Seller delivery area changes
  const handleUpdateDeliveryAreas = async (sellerId: string, cities: string[], pincodes: string[]) => {
    const sellerProds = allProducts.filter(p => p.sellerId === sellerId);
    for (const p of sellerProds) {
      try {
        await updateProductInDb(p.id, {
          deliveryAreas: {
            cities: cities,
            pincodes: pincodes
          }
        });
      } catch (err) {
        console.error('Error updating product delivery areas:', err);
      }
    }
  };

  // Orders Placed & Status toggles
  const handlePlaceOrder = async (order: Order) => {
    try {
      const { id, ...cleanOrder } = order;
      await placeOrderInDb(cleanOrder);
      
      const prod = allProducts.find(p => p.id === order.productId);
      if (prod) {
        const nextStock = Math.max(0, prod.stockQuantity - order.quantity);
        const updatedStatus = nextStock === 0 ? 'Sold Out' : prod.status;
        await updateProductInDb(prod.id, {
          stockQuantity: nextStock,
          status: updatedStatus as any
        });
      }
    } catch (err) {
      console.error('Error placing order in Firestore:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: Order['status']) => {
    try {
      const ordObj = allOrders.find(o => o.id === orderId);
      if (ordObj && nextStatus === 'Cancelled' && ordObj.status !== 'Cancelled') {
        await handleRefundStock(ordObj.productId, ordObj.quantity);
      }
      await updateOrderInDb(orderId, nextStatus);
    } catch (err) {
      console.error('Error updating order status in DB:', err);
    }
  };

  const handleRefundStock = async (productId: string, qty: number) => {
    const prod = allProducts.find(p => p.id === productId);
    if (!prod) return;
    const nextStock = prod.stockQuantity + qty;
    const nextStatus = prod.status === 'Sold Out' ? 'Active' : prod.status;
    try {
      await updateProductInDb(productId, { stockQuantity: nextStock, status: nextStatus as any });
    } catch (e) {
      console.error('Error refunding stock:', e);
    }
  };

  const handleResetSystemData = async () => {
    try {
      await logOutUser();
    } catch (err) {
      console.error(err);
    }
    localStorage.clear();
    setCurrentUser(null);
    setGuestView('marketplace');
  };

  const handleQuickBypassApprove = async (updated: UserProfile) => {
    try {
      await updateUserProfile(updated.uid, { approvalStatus: 'approved' });
    } catch (err) {
      console.error('Error quick bypass approving:', err);
    }
  };

  // Rendering Routing Logic
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col justify-between overflow-hidden select-none">
      
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

    </div>
  );
}

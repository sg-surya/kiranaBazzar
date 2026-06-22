import React, { useState } from 'react';
import { Product, Order, UserProfile } from '../types';
import { CATEGORIES } from '../data';
import ProductListScreen from './ProductListScreen';
import InventoryScreen from './InventoryScreen';
import AddProductScreen from './AddProductScreen';
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Warehouse,
  MapPin,
  User,
  LogOut,
  ChevronRight,
  TrendingUp,
  Sliders,
  Bell,
  CheckCircle,
  Truck,
  RotateCcw,
  PlusSquare,
  Building,
  Menu,
  X,
  Plus
} from 'lucide-react';

interface SellerDashboardProps {
  currentUser: UserProfile;
  products: Product[];
  orders: Order[];
  onLogout: () => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProductStock: (id: string, newStock: number) => void;
  onUpdateProductStatus: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateDeliveryAreas: (sellerId: string, cities: string[], pincodes: string[]) => void;
}

export default function SellerDashboard({
  currentUser,
  products,
  orders,
  onLogout,
  onAddProduct,
  onDeleteProduct,
  onUpdateProductStock,
  onUpdateProductStatus,
  onUpdateOrderStatus,
  onUpdateDeliveryAreas
}: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'delivery' | 'profile'>('dashboard');
  const [isAddingOrEditingProd, setIsAddingOrEditingProd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter products by current seller
  const sellerProducts = products.filter((p) => p.sellerId === currentUser.uid);
  
  // Filter orders related to seller's products
  const sellerOrders = orders.filter((o) => o.sellerId === currentUser.uid);

  // Statistics calculation
  const totalProductsCount = sellerProducts.length;
  const totalOrdersCount = sellerOrders.length;
  const activeProductsCount = sellerProducts.filter((p) => p.status === 'Active').length;
  const soldProductsCount = sellerProducts.filter((p) => p.status === 'Sold Out' || p.stockQuantity === 0).length;
  const totalSalesRevenue = sellerOrders
    .filter((o) => o.status === 'Delivered')
    .reduce((r, o) => r + o.totalAmount, 0);

  // Delivery Areas
  const [newCity, setNewCity] = useState('');
  const [newPin, setNewPin] = useState('');
  
  // Union of all cities / pincodes of current seller products
  const distinctCities = Array.from(new Set(sellerProducts.flatMap((p) => p.deliveryAreas?.cities || [])));
  const distinctPincodes = Array.from(new Set(sellerProducts.flatMap((p) => p.deliveryAreas?.pincodes || [])));

  const handleCreateOrUpdateProduct = (prod: Product) => {
    onAddProduct(prod);
    setIsAddingOrEditingProd(false);
    setEditingProduct(null);
    setActiveTab('products');
  };

  const triggerEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingOrEditingProd(true);
  };

  const triggerAddProduct = () => {
    setEditingProduct(null);
    setIsAddingOrEditingProd(true);
  };

  const handleUpdateDeliveries = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity.trim()) {
      const updatedCities = Array.from(new Set([...distinctCities, newCity.trim()]));
      onUpdateDeliveryAreas(currentUser.uid, updatedCities, distinctPincodes);
      setNewCity('');
    }
  };

  const handleAddDeliveryPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPin.trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      const updatedPins = Array.from(new Set([...distinctPincodes, cleanPin]));
      onUpdateDeliveryAreas(currentUser.uid, distinctCities, updatedPins);
      setNewPin('');
    }
  };

  const removeCityArea = (city: string) => {
    const updatedCities = distinctCities.filter(c => c !== city);
    onUpdateDeliveryAreas(currentUser.uid, updatedCities, distinctPincodes);
  };

  const removePinArea = (pin: string) => {
    const updatedPins = distinctPincodes.filter(p => p !== pin);
    onUpdateDeliveryAreas(currentUser.uid, distinctCities, updatedPins);
  };

  if (isAddingOrEditingProd) {
    return (
      <AddProductScreen
        sellerId={currentUser.uid}
        sellerName={currentUser.name}
        editingProduct={editingProduct}
        onSave={handleCreateOrUpdateProduct}
        onCancel={() => {
          setIsAddingOrEditingProd(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products Catalog', icon: Box },
    { id: 'orders', name: 'Orders Queue', icon: ShoppingCart },
    { id: 'inventory', name: 'Inventory Sheets', icon: Warehouse },
    { id: 'delivery', name: 'Delivery Areas', icon: MapPin },
    { id: 'profile', name: 'Seller Profile', icon: User },
  ] as const;

  return (
    <div className="h-full w-full bg-slate-50 max-w-md mx-auto flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white px-4 py-4 sticky top-0 z-20 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-900">
            K
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none font-display">
              Kirrana<span className="text-emerald-400">Bazzar</span>
            </h1>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
              Seller Wholesale Panel
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className="text-slate-300 font-semibold text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-24 truncate">{currentUser.name.split(' ')[0]}</span>
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8.5 h-8.5 rounded-lg hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 active:scale-95 cursor-pointer leading-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Floating Menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 flex justify-end">
          <div className="w-64 bg-slate-900 text-white h-full p-5 shadow-2.5xl flex flex-col justify-between select-none animate-slide-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white">{currentUser.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {currentUser.uid.substring(0, 10)}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-rose-900/20 text-rose-400 border border-white/5 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Shop
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-8">
        
        {/* TABS 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Quick Stats banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <LayoutDashboard className="w-48 h-48" />
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-200 font-bold bg-emerald-900/40 px-2.5 py-1 rounded-full">
                    Approved wholesale vendor
                  </span>
                  <div className="mt-3">
                    <span className="text-[11px] text-emerald-100 font-semibold block">Total Delivered Sales</span>
                    <h3 className="text-3xl font-black font-mono tracking-tight mt-1 text-white">
                      ₹{totalSalesRevenue.toLocaleString('en-IN')}
                    </h3>
                  </div>
                </div>
                
                <div className="bg-white/10 px-2.5 py-1.5 rounded-2xl border border-white/10 text-right">
                  <span className="text-[9px] text-emerald-200 uppercase font-mono tracking-wider font-bold">Today's Pool</span>
                  <p className="text-xs font-bold mt-0.5">{distinctPincodes.length} PINs Active</p>
                </div>
              </div>
            </div>

            {/* Matrix Board */}
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-1 mb-2">
                Operational Matrix
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all active:scale-98"
                >
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Products</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-2xl font-black font-mono text-slate-900">{totalProductsCount}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      {activeProductsCount} Live
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all active:scale-98"
                >
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Total Orders</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-2xl font-black font-mono text-slate-900">{totalOrdersCount}</span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      {sellerOrders.filter(o => o.status === 'Pending').length} Pending
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('inventory')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all active:scale-98"
                >
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Sold Out SKUs</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-2xl font-black font-mono text-rose-600">{soldProductsCount}</span>
                    <span className="text-[9px] text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded-full font-bold">
                      Gatta Restock
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('delivery')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all active:scale-98"
                >
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Coverage Regions</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-1.5xl font-black text-slate-800 truncate">
                      {distinctCities.length > 0 ? distinctCities.join(', ') : 'No areas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Dock */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider font-mono">Wholesaler Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={triggerAddProduct}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-2xl text-xs shadow-sm transition-all text-center justify-center cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 shrink-0" /> List Wholesale stock
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-2xl text-xs transition-all text-center justify-center cursor-pointer active:scale-95"
                >
                  <Warehouse className="w-4 h-4 shrink-0 text-emerald-400" /> Fast-Check Inventory
                </button>
              </div>
            </div>

            {/* Recent Orders queue */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Recent B2B Orders</h4>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              {sellerOrders.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No orders placed yet. Products are listed and active in {distinctPincodes.length || 0} pincodes!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sellerOrders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{o.productName}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Ordered: x{o.quantity} units by {o.buyerName.split(' ')[0]}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-bold text-slate-800 font-mono block">₹{o.totalAmount}</span>
                        <span className={`text-[9px] font-bold px-1 py-0.1 select-none rounded uppercase ${
                          o.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TABS 2: PRODUCT MANAGE */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <ProductListScreen
              products={sellerProducts}
              onEdit={triggerEditProduct}
              onDelete={onDeleteProduct}
              onToggleStatus={onUpdateProductStatus}
              onTriggerAdd={triggerAddProduct}
            />
          </div>
        )}

        {/* TABS 3: ORDERS QUEUE */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in select-none">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Dukandar wholesale orders</h3>
                <p className="text-xs text-slate-400">Manage order status, dispatch, and delivery receipts</p>
              </div>
              <span className="bg-slate-900 text-white font-black text-xs font-mono px-3 py-1 rounded-xl">
                {sellerOrders.length} Orders
              </span>
            </div>

            {sellerOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
                🛒
                <h4 className="text-xs font-bold text-slate-700 mt-2">No wholesale order requests yet</h4>
                <p className="text-[11px] text-slate-400 mt-1">Dukandars from your delivery areas will see your active listings!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-slate-100 text-slate-800 text-[9px] font-mono font-bold py-0.5 px-1.5 rounded">
                          ORDER #{ord.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{ord.productName}</h4>
                      </div>

                      <span className={`text-[10px] font-bold px-1.5 rounded uppercase ${
                        ord.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-50 space-y-1.5 text-slate-600">
                      <div className="flex justify-between font-medium">
                        <span>Units Ordered:</span>
                        <span className="font-bold text-slate-800 font-mono">x{ord.quantity} bags/sacks</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Bill Value:</span>
                        <span className="font-bold text-slate-900 font-mono">₹{ord.totalAmount}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-1.5 mt-1">
                        <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest font-mono">Buyer Shop</p>
                        <p className="font-bold text-slate-800 mt-0.5">{ord.buyerName}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                          📌 {ord.address} (PIN: {ord.pincode})
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold font-mono mt-0.5">📱 Mob: {ord.buyerPhone}</p>
                      </div>
                    </div>

                    {/* Order Status Action controls */}
                    <div className="flex gap-1.5 pt-1.5">
                      {ord.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'Shipped')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" /> Dispatch / Ship
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'Cancelled')}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-2 rounded-xl text-[11px] transition-all cursor-pointer"
                          >
                            Cancel B2B
                          </button>
                        </>
                      )}

                      {ord.status === 'Shipped' && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'Delivered')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Complete / Delivered
                        </button>
                      )}

                      {ord.status === 'Delivered' && (
                        <div className="w-full text-center py-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 rounded-lg flex items-center justify-center gap-1 select-none">
                          ✓ Wholesale Order Completed & Paid
                        </div>
                      )}

                      {ord.status === 'Cancelled' && (
                        <div className="w-full text-center py-1 text-rose-500 font-bold text-[11px] bg-rose-50 rounded-lg select-none">
                          ✕ Order Cancelled / Stock Refunded
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TABS 4: INVENTORY SHEETS */}
        {activeTab === 'inventory' && (
          <div className="space-y-4 animate-fade-in">
            <InventoryScreen
              products={sellerProducts}
              orders={sellerOrders}
              onUpdateStock={onUpdateProductStock}
            />
          </div>
        )}

        {/* TABS 5: DELIVERY AREAS */}
        {activeTab === 'delivery' && (
          <div className="space-y-4 animate-fade-in select-none">
            
            {/* Header Area info */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Regions of wholesale operations</h3>
              <p className="text-xs text-slate-400">Only retailers residing in these cities/pincodes can order bulk stock</p>
            </div>

            {/* Manage cities */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Cities Supported</h4>
              
              <form onSubmit={handleUpdateDeliveries} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type city name (eg. Gurgaon)"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-bold text-xs px-4 rounded-xl cursor-pointer hover:bg-slate-800 active:scale-95"
                >
                  Add
                </button>
              </form>

              {distinctCities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {distinctCities.map((city) => (
                    <span
                      key={city}
                      className="bg-slate-50 border border-slate-200 rounded-full py-1 px-3 text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => removeCityArea(city)}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600 font-medium">⚠️ No delivery cities set. Dukandars might not find your catalog!</p>
              )}
            </div>

            {/* Manage pincodes */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Pincodes Supported</h4>
              
              <form onSubmit={handleAddDeliveryPin} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6-digit pincode (eg. 110001)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-bold text-xs px-4 rounded-xl cursor-pointer hover:bg-slate-800 active:scale-95 font-sans"
                >
                  Add Pin
                </button>
              </form>

              {distinctPincodes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {distinctPincodes.map((pin) => (
                    <span
                      key={pin}
                      className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-700 flex items-center gap-1 font-mono"
                    >
                      {pin}
                      <button
                        type="button"
                        onClick={() => removePinArea(pin)}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600 font-medium">⚠️ Please configure some pincodes so local outlets can place order pools!</p>
              )}
            </div>

          </div>
        )}

        {/* TABS 6: SELLER PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5 animate-fade-in select-none">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-extrabold text-2xl mx-auto">
                🏭
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mt-3">{currentUser.name}</h3>
              <p className="text-xs text-slate-400 font-medium">Wholesale Business Owner</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold">REGISTERED USERNAME</span>
                <span className="text-slate-800 font-bold">{currentUser.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-mono text-[11px]">
                <span className="text-slate-400 font-bold font-sans">PHONE NUMBER</span>
                <span className="text-slate-800 font-bold">{currentUser.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-mono text-[11px]">
                <span className="text-slate-400 font-bold font-sans">WHATSAPP NUMBER</span>
                <span className="text-slate-800 font-bold text-emerald-600">✓ {currentUser.whatsapp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold">WAREHOUSE PINCODE</span>
                <span className="text-slate-800 font-bold font-mono">{currentUser.pincode}</span>
              </div>
              <div className="py-1.5">
                <span className="text-slate-400 font-bold block mb-1">MAIN OFFICE ADDRESS</span>
                <p className="text-slate-800 leading-normal font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-50">
                  {currentUser.address}
                </p>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">AUTHENTICATION STATE</span>
                <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider select-none">
                  Approved & Verified
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-6 w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all active:scale-[0.98] select-none hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out Account
            </button>
          </div>
        )}

      </main>

      {/* Tab Menu Bar sticked to bottom */}
      <nav className="bg-white border-t border-slate-200 py-2 px-3 flex justify-between items-center sticky bottom-0 z-10 shadow-lg shrink-0">
        <button
          onClick={() => setActiveTab('dashboard')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-1 font-semibold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'products' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Box className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-1 font-semibold">Products</span>
        </button>

        {/* Floating Stock Adder */}
        <button
          onClick={triggerAddProduct}
          type="button"
          className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg -translate-y-5 transition-transform active:scale-90 cursor-pointer"
          title="Add product listing"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer relative ${
            activeTab === 'orders' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-5 h-5 shrink-0" />
          {sellerOrders.filter(o => o.status === 'Pending').length > 0 && (
            <span className="absolute top-0 right-1/4 bg-amber-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {sellerOrders.filter(o => o.status === 'Pending').length}
            </span>
          )}
          <span className="text-[10px] mt-1 font-semibold">Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          type="button"
          className={`flex-1 flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'inventory' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Warehouse className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-1 font-semibold">Stock</span>
        </button>
      </nav>

    </div>
  );
}

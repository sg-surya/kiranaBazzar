import { useState } from 'react';
import { Product, Order, UserProfile, Category } from '../types';
import { CATEGORIES } from '../data';
import {
  Search,
  ShoppingCart,
  Store,
  MapPin,
  TrendingUp,
  Sliders,
  ShieldCheck,
  CheckCircle,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DukandarDashboardProps {
  currentUser: UserProfile;
  products: Product[];
  orders: Order[];
  onLogout: () => void;
  onPlaceOrder: (order: Order) => void;
}

export default function DukandarDashboard({
  currentUser,
  products,
  orders,
  onLogout,
  onPlaceOrder
}: DukandarDashboardProps) {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'orders' | 'profile'>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart management (item matching)
  const [orderQuantity, setOrderQuantity] = useState<{ [prodId: string]: number }>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering products delivering to current Dukandar's location
  const availableProducts = products.filter((p) => {
    // Location validation: checked if cities or pincodes match current Dukandar's registered location
    const matchedCity = p.deliveryAreas?.cities?.some(c => c.toLowerCase() === currentUser.address.toLowerCase() || currentUser.address.toLowerCase().includes(c.toLowerCase()));
    const matchedPincode = p.deliveryAreas?.pincodes?.includes(currentUser.pincode);
    
    // By B2B policy, they must reside within target delivery regions
    const inRegion = matchedCity || matchedPincode || p.deliveryAreas?.pincodes?.length === 0;
    
    if (!inRegion) return false;

    // Filter by Category
    if (selectedCategory && p.category !== selectedCategory) return false;

    // Filter by Search Query
    if (searchQuery.trim()) {
      const txt = (p.name + p.description + p.sellerName).toLowerCase();
      if (!txt.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  // Track Dukandar's personal placed orders
  const myOrders = orders.filter((o) => o.buyerId === currentUser.uid);

  const handleIncrementQty = (pId: string, maxStock: number) => {
    const currentQty = orderQuantity[pId] || 0;
    if (currentQty < maxStock) {
      setOrderQuantity({ ...orderQuantity, [pId]: currentQty + 1 });
    }
  };

  const handleDecrementQty = (pId: string) => {
    const currentQty = orderQuantity[pId] || 0;
    if (currentQty > 0) {
      setOrderQuantity({ ...orderQuantity, [pId]: currentQty - 1 });
    }
  };

  const handlePlaceOrder = (product: Product) => {
    const qty = orderQuantity[product.id] || 0;
    if (qty <= 0) {
      alert('Please select at least 1 unit to order.');
      return;
    }

    if (qty > product.stockQuantity) {
      alert('Cannot exceed available wholesale stock.');
      return;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId,
      buyerId: currentUser.uid,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      address: currentUser.address,
      pincode: currentUser.pincode,
      price: product.price,
      quantity: qty,
      totalAmount: product.price * qty,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    onPlaceOrder(newOrder);

    // Reset qty
    setOrderQuantity({ ...orderQuantity, [product.id]: 0 });

    // Show success message
    setSuccessMsg(`Congratulations! Your B2B bulk order for x${qty} units of ${product.name} has been submitted!`);
    setTimeout(() => setSuccessMsg(''), 4500);

    // Redirect to orders
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto flex flex-col justify-between relative select-none">
      
      {/* Retail Header */}
      <header className="bg-emerald-600 text-white px-4 py-4 sticky top-0 z-20 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            🏪
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none font-display">
              Kirrana<span className="text-slate-900">Bazzar</span>
            </h1>
            <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-wider font-mono">
              Verified Retail Outlet
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-emerald-100 font-bold block max-w-28 truncate">{currentUser.name.split(' ')[0]}</span>
            <span className="text-[9px] text-emerald-200 font-mono font-bold block">PIN: {currentUser.pincode}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
        
        {successMsg && (
          <div className="bg-emerald-950 text-emerald-300 p-3.5 rounded-2xl border border-emerald-500/30 text-xs font-semibold leading-relaxed flex gap-2 items-start shadow-md animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: B2B MARKETPLACE BROWSER */}
        {activeTab === 'marketplace' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Search Input */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center gap-2.5 shadow-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Grains, Oils, Atta, or Wholesaler Brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Category horizontal track */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Categories</span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-105 hover:border-slate-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wholesale Products List */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Sasta B2B Daal & Grocery Lot
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  {availableProducts.length} Wholesale Lots Near You
                </span>
              </div>

              {availableProducts.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-3xl border border-slate-105/90 text-slate-400 text-xs">
                  🌾
                  <h4 className="text-xs font-bold text-slate-700 mt-2">No wholesale stock active for {currentUser.pincode}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Please try modifying your category selection or clear search values!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {availableProducts.map((p) => {
                    const selQty = orderQuantity[p.id] || 0;
                    const isSoldOut = p.stockQuantity === 0 || p.status === 'Sold Out';

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors relative overflow-hidden"
                      >
                        {/* Upper image and meta */}
                        <div className="flex gap-4.5">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {isSoldOut && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-center">
                                <span className="bg-rose-600 text-white text-[8px] font-black uppercase px-1 py-0.5 rounded">
                                  Sold Out
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black tracking-wider uppercase bg-slate-100/80 px-2 py-0.5 rounded text-slate-500 font-mono">
                                {p.sellerName.split(' ')[0]} Wholesale
                              </span>
                              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded font-sans">
                                High Margin
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mt-1">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-relaxed line-clamp-2">
                              {p.description}
                            </p>
                          </div>
                        </div>

                        {/* Financial and Cart checkout actions */}
                        <div className="flex justify-between items-end border-t border-slate-50/80 pt-3.5 mt-3.5">
                          {/* Financial tags */}
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                              Wholesale Rate
                            </span>
                            <div className="flex items-baseline gap-1 bg-slate-50/50 px-2 py-0.5 rounded-lg border border-slate-50">
                              <span className="text-base font-black text-slate-900 font-mono">₹{p.price}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">/sack</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold block font-mono pl-1">
                              ({p.stockQuantity} Left in Mandi)
                            </span>
                          </div>

                          {/* Purchase drawer */}
                          {isSoldOut ? (
                            <button
                              disabled
                              className="bg-slate-100 text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl cursor-not-allowed uppercase font-mono tracking-wider font-sans border border-slate-200"
                            >
                              Sold Out
                            </button>
                          ) : (
                            <div className="flex flex-col gap-1.5 items-end">
                              {/* Quantity select triggers */}
                              <div className="bg-slate-50 border border-slate-155 rounded-xl p-0.5 flex items-center select-none shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementQty(p.id)}
                                  className="w-8 h-8 rounded-lg text-slate-500 hover:bg-white flex items-center justify-center font-bold font-sans active:scale-90 transition-all cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-7 text-center text-xs font-black font-mono text-slate-800">
                                  {selQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleIncrementQty(p.id, p.stockQuantity)}
                                  className="w-8 h-8 rounded-lg text-slate-500 hover:bg-white flex items-center justify-center font-bold font-sans active:scale-90 transition-all cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Checkout trigger */}
                              {selQty > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handlePlaceOrder(p)}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer font-sans"
                                >
                                  Buy ₹{(selQty * p.price).toLocaleString()} <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: PLACED ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in select-none">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-105 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Your Placed B2B Orders</h3>
                <p className="text-xs text-slate-400">Track delivery status from wholesale warehouses</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full font-mono">
                {myOrders.length} Orders
              </span>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">No active orders placed yet.</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Browse products, specify quantity, and press "Buy" to trigger instant order logs to wholesalers!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                          B2B ORDER ID: #{ord.id.split('-')[1] || ord.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5">{ord.productName}</h4>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        ord.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 bg-slate-50/60 p-3 rounded-xl border border-slate-50 text-xs text-slate-600">
                      <div>
                        <span className="text-[9px] font-bold block text-slate-400 uppercase tracking-wider font-mono">Quantity</span>
                        <p className="font-bold text-slate-800 mt-0.5">{ord.quantity} bags</p>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold block text-slate-400 uppercase tracking-wider font-mono">Invoice Value</span>
                        <p className="font-black text-emerald-700 mt-0.5 font-mono">₹{ord.totalAmount}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium">
                      🚚 Delivering to shop: <strong>{ord.address}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 3: OUTLET PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5 animate-fade-in select-none">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-2xl mx-auto">
                🏪
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg mt-3">{currentUser.name}</h3>
              <p className="text-xs text-slate-400 font-medium">Verified Retailer Account</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold">OUTLET TITLE</span>
                <span className="text-slate-800 font-bold">{currentUser.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-mono text-[11px]">
                <span className="text-slate-400 font-sans font-bold">MOBILE PHONE</span>
                <span className="text-slate-800 font-bold">{currentUser.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50 font-mono text-[11px]">
                <span className="text-slate-400 font-sans font-bold">WHATSAPP PORT</span>
                <span className="text-slate-800 font-bold text-emerald-600">✓ {currentUser.whatsapp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold">RETAIL PINCODE</span>
                <span className="text-slate-800 font-bold font-mono">{currentUser.pincode}</span>
              </div>
              <div className="py-1.5">
                <span className="text-slate-400 font-bold block mb-1">SHOP PHYSICAL ADDRESS</span>
                <p className="text-slate-800 leading-normal font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-50">
                  {currentUser.address}
                </p>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">B2B MANDI STATUS</span>
                <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
                  Approved & live
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-6 w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all active:scale-[0.98] select-none hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer leading-none"
            >
              Sign Out Shop Account
            </button>
          </div>
        )}

      </main>

      {/* Tab Menu Bar sticked to bottom */}
      <nav className="bg-white border-t border-slate-200 py-3 px-3 flex justify-around items-center sticky bottom-0 z-10 shadow-lg shrink-0 select-none">
        <button
          onClick={() => setActiveTab('marketplace')}
          type="button"
          className={`flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'marketplace' ? 'text-emerald-600 font-bold animate-pulse' : 'text-slate-400'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold">Buy Galla</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          type="button"
          className={`flex flex-col items-center justify-center relative cursor-pointer ${
            activeTab === 'orders' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-5 h-5 animate-none" />
          {myOrders.filter(o => o.status === 'Pending').length > 0 && (
            <span className="absolute top-0 right-[-4px] bg-emerald-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {myOrders.filter(o => o.status === 'Pending').length}
            </span>
          )}
          <span className="text-[10px] mt-1 font-semibold">My Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          type="button"
          className={`flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-semibold">Outlet</span>
        </button>
      </nav>

    </div>
  );
}

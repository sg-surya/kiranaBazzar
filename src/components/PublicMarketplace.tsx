import React, { useState } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../data';
import {
  Search,
  ChevronRight,
  TrendingUp,
  MapPin,
  Share2,
  Copy,
  Check,
  Building2,
  Phone,
  Truck,
  DollarSign,
  UserCheck,
  ShoppingBag,
  ExternalLink,
  Users,
  Percent,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface PublicMarketplaceProps {
  products: Product[];
  onNavigateToLogin: () => void;
  onNavigateToRegister: (role?: 'Dukandar' | 'Seller') => void;
}

export default function PublicMarketplace({
  products,
  onNavigateToLogin,
  onNavigateToRegister
}: PublicMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pincodeCheck, setPincodeCheck] = useState<{ [productId: string]: string }>({});
  const [pincodeStatus, setPincodeStatus] = useState<{ [productId: string]: { success: boolean; message: string } }>({});
  
  // Selected product for detailed modal view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Reselling margin planner states
  const [resellProduct, setResellProduct] = useState<Product | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);

  // Auth prompt drawer/modal when Guest tries to order or register
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateMessage, setAuthGateMessage] = useState('');

  // Active products listed by actual wholesalers
  const activeProducts = products.filter(p => p.status === 'Active' || p.status === 'Sold Out');

  // Filtered list
  const filteredProducts = activeProducts.filter(p => {
    // Search
    if (searchQuery.trim()) {
      const matchText = `${p.name} ${p.description} ${p.sellerName}`.toLowerCase();
      if (!matchText.includes(searchQuery.toLowerCase())) return false;
    }
    // Category
    if (selectedCategory && p.category !== selectedCategory) return false;
    return true;
  });

  const checkDelivery = (product: Product) => {
    const pin = pincodeCheck[product.id] || '';
    if (!pin.trim()) {
      setPincodeStatus({
        ...pincodeStatus,
        [product.id]: { success: false, message: 'Please enter a valid pincode' }
      });
      return;
    }

    const availablePincodes = product.deliveryAreas?.pincodes || [];
    const availableCities = product.deliveryAreas?.cities || [];
    
    // Check match (simple mock or direct pincode checking)
    const isPincodeMatched = availablePincodes.includes(pin);
    
    if (isPincodeMatched) {
      setPincodeStatus({
        ...pincodeStatus,
        [product.id]: { 
          success: true, 
          message: `✅ Delivers to ${pin}! Free Direct B2B Shipping with Cash on Delivery (COD).` 
        }
      });
    } else {
      setPincodeStatus({
        ...pincodeStatus,
        [product.id]: { 
          success: false, 
          message: `❌ Currently not delivering here. Covered zone: ${availableCities.join(', ') || 'Delhi NCR'}` 
        }
      });
    }
  };

  const openResellPlanner = (product: Product) => {
    setResellProduct(product);
    setCustomPrice(Math.round(product.price * 1.15)); // Default 15% margin
    setIsCopied(false);
  };

  const copyResellDetails = () => {
    if (!resellProduct) return;
    const margin = customPrice - resellProduct.price;
    const shareText = `🔥 *CHALLENGING WHOLESALE DEALS* 🔥\n\n🛍️ *Product:* ${resellProduct.name}\n📦 *Spec:* Standard Wholesale Pack\n💰 *Special Retail Deal For You:* ₹${customPrice}\n🚛 *Delivery:* Free doorstep shipping with Cash on Delivery available!\n\n💬 Reply to this message to book your stock right away! Quality checked by KirranaBazzar.`;
    
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const triggerAuthGate = (msg: string) => {
    setAuthGateMessage(msg);
    setShowAuthGate(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-16">
      
      {/* MEESHO-STYLE HEADER IN PINK / ROSE AESTHETICS */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 leading-none">
                KirranaBazzar
              </h1>
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-pink-500 block mt-0.5">
                Meesho B2B Portal
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search wholesale grain sacks, spices, oils listed by direct sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-pink-500 outline-hidden py-2 pl-10 pr-4 rounded-xl text-xs text-slate-800 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Auth triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToLogin}
              className="py-2 px-3.5 rounded-xl border border-pink-100 hover:bg-pink-50 text-pink-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => onNavigateToRegister('Dukandar')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Join Free
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-50">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search items listed by sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 outline-hidden py-2.5 pl-10 pr-4 rounded-xl text-xs text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </header>

      {/* PROMOTIONAL HERO BANNER */}
      <section className="bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 py-6 px-4 border-b border-rose-100/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 font-bold animate-pulse" /> Direct Seller Marketplace
            </div>
            <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 leading-tight">
              Meesho Jaisa <span className="text-pink-600">B2B Wholesale</span> Market!
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
              Explore bulk prices directly listed by verified wholesalers from Delhi & NCR Sadar Gate. Share with high profit margins, build trust, and order without full pre-payment!
            </p>
            
            {/* Step badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-white/50 text-center">
                <span className="text-base block mb-1">🔍</span>
                <span className="text-[10px] font-bold text-slate-700 block leading-tight">1. Browse Catalog</span>
                <span className="text-[9px] text-slate-400">Zero commission</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-white/50 text-center">
                <span className="text-base block mb-1">📢</span>
                <span className="text-[10px] font-bold text-slate-700 block leading-tight">2. Share Margin</span>
                <span className="text-[9px] text-slate-400">Add retail profit</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-white/50 text-center">
                <span className="text-base block mb-1">🚛</span>
                <span className="text-[10px] font-bold text-slate-700 block leading-tight">3. COD Delivery</span>
                <span className="text-[9px] text-slate-400">Doorstep shipping</span>
              </div>
            </div>
          </div>

          {/* Quick Stats sidebar widget */}
          <div className="bg-white rounded-2xl border border-pink-100/70 p-4 shadow-xl shadow-rose-100/30 w-full md:max-w-xs shrink-0 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Live Marketplace Activity
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Active Wholesalers:</span>
                <span className="font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">14+ Registered</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Direct Products Listed:</span>
                <span className="font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">{activeProducts.length} Listings</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Covered Pincodes:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Delhi, Noida, Lko</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 flex items-start gap-1.5">
              <span className="text-emerald-500 text-sm">✓</span>
              <span>Become a seller by signing up as a verified Wholesaler merchant!</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES NAVIGATION BAR */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider font-mono">
            Browse Wholesale Categories
          </h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-pink-600 text-xs font-bold hover:underline"
            >
              Clear Filter ×
            </button>
          )}
        </div>
        
        {/* Categories sliding row */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === null
                ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-100'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            🌟 All Items ({activeProducts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = activeProducts.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-100'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS DISPLAY GRID */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span>🛍️ Direct wholesale items listed by Sellers</span>
            <span className="bg-pink-100 text-pink-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {filteredProducts.length} Items Found
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Directly listed, zero intermediate brokerage charges
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-150 max-w-lg mx-auto shadow-sm my-8">
            <span className="text-5xl">🌾</span>
            <h3 className="text-base font-bold text-slate-800 mt-4">No wholesale items match your filters</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
              Our sellers post new whole-sell stocks frequently. Try searching without filter or selection.
            </p>
            <button
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
              className="mt-4 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Reset Search & Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const originalMrp = Math.round(product.price * 1.25);
              const marginAmt = Math.round(product.price * 0.15); // Show average resell profit margins
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image banner with seller status */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden group">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Left overlay badge of seller */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono uppercase tracking-wider font-bold py-1 px-2.5 rounded-lg flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-pink-400" />
                        Direct Wholesale
                      </span>
                      {product.status === 'Sold Out' ? (
                        <span className="bg-rose-600 text-white text-[10px] font-bold py-0.5 px-2 rounded-md">
                          Sold Out
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold py-0.5 px-2 rounded-md">
                          In Stock ({product.stockQuantity} bags/units)
                        </span>
                      )}
                    </div>

                    {/* Right top category badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-white/95 text-slate-700 text-[10px] font-semibold py-1 px-2.5 rounded-full shadow-xs">
                        {CATEGORIES.find(c => c.id === product.category)?.icon || '🌾'}{' '}
                        {CATEGORIES.find(c => c.id === product.category)?.name || 'Grain'}
                      </span>
                    </div>

                    {/* Price deal flash bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                      <p className="text-[10px] text-rose-300 font-bold tracking-wider uppercase">Wholesale Price Offer</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black">₹{product.price}</span>
                        <span className="text-xs text-slate-300 line-through">₹{originalMrp}</span>
                        <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-md font-bold">25% OFF</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Seller Tag */}
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                        <div className="flex items-center gap-1.5 text-pink-600 font-semibold">
                          <Users className="w-3.5 h-3.5 text-pink-500" />
                          <span>Seller: {product.sellerName.split(' ')[0]}</span>
                        </div>
                        <span>Delhi Sadar Row</span>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {/* Product Description */}
                      <p className="text-slate-500 text-[11px] leading-normal line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    {/* Interactive Pincode Checker inside Card */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> Check area availability
                        </span>
                        <span className="text-[9px] text-slate-400">(Delhi NCR, Rohini)</span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit Pincode"
                          value={pincodeCheck[product.id] || ''}
                          onChange={(e) => setPincodeCheck({
                            ...pincodeCheck,
                            [product.id]: e.target.value.replace(/\D/g, '')
                          })}
                          className="bg-white border border-slate-200 focus:border-pink-500 text-[10px] px-2 py-1 rounded-md outline-hidden flex-1 font-semibold"
                        />
                        <button
                          onClick={() => checkDelivery(product)}
                          className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md cursor-pointer hover:bg-slate-850"
                        >
                          Check
                        </button>
                      </div>

                      {pincodeStatus[product.id] && (
                        <p className={`text-[9px] font-bold leading-normal pt-0.5 ${pincodeStatus[product.id].success ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {pincodeStatus[product.id].message}
                        </p>
                      )}
                    </div>

                    {/* Resell Earnings & Share row (Meesho focus!) */}
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50/50 p-3 rounded-xl border border-pink-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                          Meesho Profit Idea
                        </span>
                        <span className="font-bold text-slate-800">
                          Resell at <span className="text-emerald-600">₹{product.price + marginAmt}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                          Your Direct Margin
                        </span>
                        <span className="font-extrabold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded">
                          +₹{marginAmt} Profit
                        </span>
                      </div>
                    </div>

                    {/* Operational CTAs */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Resell Tool */}
                      <button
                        onClick={() => openResellPlanner(product)}
                        className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Calculator className="w-3.5 h-3.5 text-rose-400" />
                        Sell & Share
                      </button>

                      {/* Buy Action */}
                      <button
                        onClick={() => triggerAuthGate(`To buy this stock or place direct wholesale delivery with Cash-on-Delivery, you'll need to sign up for a KirranaBazzar Buyer/Dukandari profile.`)}
                        className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Order Direct
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DETAILED FAQ / METADATA SUMMARY FOR TRUST */}
      <section className="bg-white border-t border-slate-200 mt-12 py-8 px-4 text-slate-600 text-xs">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest font-mono">
              Faqs about KirranaBazzar guest browsing
            </h3>
            <p className="text-slate-400 font-medium">Have queries regarding our direct merchant-seller catalogs?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h5 className="font-black text-slate-800">Who lists these commercial goods?</h5>
              <p className="leading-relaxed text-slate-500 text-[11px]">
                These wholesale items are actively listed by vetted Wholesale Sellers from SADAR Market and Galla Mandis who are registered merchants on our platform.
              </p>
            </div>
            
            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h5 className="font-black text-slate-800">How do I verify the delivery area?</h5>
              <p className="leading-relaxed text-slate-500 text-[11px]">
                Type the delivery pincode in the box. Traditional areas in Delhi (110001, 110085 etc.) are fully supported directly by primary wholesalers!
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h5 className="font-black text-slate-800">Can I earn profit margins like Meesho?</h5>
              <p className="leading-relaxed text-slate-500 text-[11px]">
                Yes! That is the primary benefit. Click "Sell & Share" on any listing, add your expected margin, copy the generated customer offer details, and post them directly in local retailing WhatsApp circles.
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h5 className="font-black text-slate-800">Do I need an approved profile to order?</h5>
              <p className="leading-relaxed text-slate-500 text-[11px]">
                Yes, our system limits transactions to legitimate Kirana shops to prevent retail misuse. Approval is fast, secure, and entirely free of cost!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL 1: RESELLING MARGIN PLANNER */}
      {resellProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black flex items-center gap-1.5">
                    <Calculator className="w-5 h-5 text-white" />
                    Meesho Resell Planner
                  </h3>
                  <p className="text-[10px] text-pink-100 font-mono uppercase tracking-wider font-bold">Configure Margin Profit</p>
                </div>
                <button
                  onClick={() => setResellProduct(null)}
                  className="bg-white/10 hover:bg-white/20 text-white py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              
              {/* Product Info Summary */}
              <div className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <img
                  src={resellProduct.image}
                  alt={resellProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-250 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded-md uppercase">
                    Wholesale Price Base
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{resellProduct.name}</h4>
                  <p className="text-xs font-black text-slate-900">₹{resellProduct.price} <span className="text-[9px] text-slate-400 font-medium">per unit</span></p>
                </div>
              </div>

              {/* Input for selling price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  Assign Your Retail Selling Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={resellProduct.price}
                    max={resellProduct.price * 2}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Math.max(resellProduct.price, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 py-2.5 pl-7 pr-3 rounded-xl text-sm font-black text-slate-800 outline-hidden transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Add custom margin so your local customers pay you. Base cost of standard packaging is ₹{resellProduct.price}.
                </p>
              </div>

              {/* Profit feedback card */}
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-emerald-800 uppercase font-bold block">
                    Your Resell Profit Earned
                  </span>
                  <span className="text-lg font-black text-emerald-800">
                    ₹{Math.max(0, customPrice - resellProduct.price)}
                  </span>
                </div>
                <div className="bg-emerald-600 text-white font-extrabold text-[10px] py-1 px-2.5 rounded-lg">
                  {Math.round(((customPrice - resellProduct.price) / resellProduct.price) * 100) || 0}% Margin Rate!
                </div>
              </div>

              {/* Shareable text preview panel */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  WhatsApp Broadcast Preview
                </span>
                <div className="bg-slate-900 text-zinc-300 p-3 rounded-2xl text-[10px] font-mono leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
                  <p className="text-emerald-400 font-bold">🔥 CHALLENGING WHOLESALE DEALS 🔥</p>
                  <p><b className="text-white">Product:</b> {resellProduct.name}</p>
                  <p><b className="text-white">Spec:</b> Standard Wholesale Pack</p>
                  <p><b className="text-white">Special Retail Deal:</b> ₹{customPrice}</p>
                  <p className="text-slate-400">🚛 Doorstep shipping with Cash on Delivery available!</p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={copyResellDetails}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-100 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    Copy & Share on WhatsApp
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: AUTHENTICATE LOCKOUT GATE */}
      {showAuthGate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-800">Wholesale Account Required</h3>
            
            <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
              {authGateMessage}
            </p>

            <div className="space-y-2 mt-5">
              <button
                onClick={() => {
                  setShowAuthGate(false);
                  onNavigateToRegister('Dukandar');
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-rose-100 cursor-pointer transition-all"
              >
                Sign Up as Kirana Shop (Buyer)
              </button>
              
              <button
                onClick={() => {
                  setShowAuthGate(false);
                  onNavigateToRegister('Seller');
                }}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                Become a Wholesaler (Seller)
              </button>
              
              <button
                onClick={() => {
                  setShowAuthGate(false);
                  onNavigateToLogin();
                }}
                className="w-full text-pink-600 hover:underline font-bold text-xs pt-2 block"
              >
                Already have an account? Sign In here
              </button>
            </div>

            <button
              onClick={() => setShowAuthGate(false)}
              className="mt-4 text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 hover:text-slate-600 block mx-auto py-1"
            >
              Cancel & Continue Browsing
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

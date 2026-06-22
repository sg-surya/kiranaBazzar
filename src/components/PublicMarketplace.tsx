import React, { useState } from 'react';
import { Product } from '../types';
import {
  Menu,
  X,
  Search,
  CheckCircle,
  MapPin,
  ArrowRight,
  ChevronRight,
  Star,
  Check,
  Lock,
  TrendingUp,
  Building2,
  Truck,
  ShoppingBag,
  Bell,
  Heart,
  LayoutGrid,
  Wheat,
  Activity,
  Flame,
  Droplets,
  Cookie,
  Home,
  Coffee,
  UserCheck,
  User,
  ExternalLink,
  ShieldAlert,
  Plus,
  Minus,
  Percent,
  Coins,
  Info,
  Store
} from 'lucide-react';

interface PublicMarketplaceProps {
  products: Product[];
  onNavigateToLogin: () => void;
  onNavigateToRegister: (role?: 'Dukandar' | 'Seller') => void;
}

// Custom curated categories with Lucide Icons (Absolutely NO raw emojis)
const CURATED_CATEGORIES = [
  { id: 'rice_atta', name: 'Rice & Atta', icon: Wheat, count: '140+ Items', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'spices_masalas', name: 'Spices', icon: Flame, count: '110+ Items', color: 'bg-red-50 text-red-650 border-red-100' },
  { id: 'beverages', name: 'Beverages', icon: Coffee, count: '230+ Items', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'snacks', name: 'Snacks', icon: Cookie, count: '180+ Items', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { id: 'household', name: 'Household', icon: Home, count: '90+ Items', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'dairy', name: 'Dairy', icon: Droplets, count: '75+ Items', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'personal_care', name: 'Personal Care', icon: UserCheck, count: '120+ Items', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { id: 'more', name: 'More Categories', icon: LayoutGrid, count: 'Browse All', color: 'bg-slate-50 text-slate-600 border-slate-100' }
];

// Curated lists matching the Blinkit + Meesho Layout
const TRENDING_PRODUCTS = [
  {
    id: 'tr-1',
    name: 'India Gate Basmati Rice Premium',
    price: 1250,
    unit: 'Per Bag',
    stock: '120 Units',
    seller: 'Sharma Traders',
    verified: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tr-2',
    name: 'Saffola Gold Blended Oil (15L Tin)',
    price: 1560,
    unit: 'Per Carton',
    stock: '80 Units',
    seller: 'Gupta Wholesale',
    verified: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tr-3',
    name: 'Tata Tea Premium Masala Assam Pack',
    price: 320,
    unit: 'Per Pack',
    stock: '200 Units',
    seller: 'Verma Traders',
    verified: true,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'tr-4',
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    price: 270,
    unit: 'Per Pack',
    stock: '150 Units',
    seller: 'Kumar Suppliers',
    verified: true,
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400'
  }
];

const GROCERY_PRODUCTS = [
  { id: 'g-1', name: 'Premium Chana Dal Extra Bold', price: 110, unit: 'Per Kg', image: 'https://images.unsplash.com/photo-1585993002677-742bc56b06e9?auto=format&fit=crop&q=80&w=250' },
  { id: 'g-2', name: 'Toor Dal Desi Polished Pure', price: 120, unit: 'Per Kg', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=250' },
  { id: 'g-3', name: 'Lokwan Quality Wheat Flour', price: 36, unit: 'Per Kg', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=250' },
  { id: 'g-4', name: 'M-30 White Crystal Sugar Sacks', price: 42, unit: 'Per Kg', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250' },
  { id: 'g-5', name: 'Premium Thick Poha Sourced Indore', price: 48, unit: 'Per Kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=250' },
  { id: 'g-6', name: 'Sujata High Quality Besan Flour', price: 75, unit: 'Per Kg', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=250' }
];

const BEVERAGE_PRODUCTS = [
  { id: 'b-1', name: 'Coca Cola Original Refreshing 2L', price: 96, unit: 'Per Bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250' },
  { id: 'b-2', name: 'Pepsi Fizz Cola Carbonated 2L', price: 90, unit: 'Per Bottle', image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=250' },
  { id: 'b-3', name: 'Sprite Lemon Lime Soft Soda 2L', price: 85, unit: 'Per Bottle', image: 'https://images.unsplash.com/photo-1527960471264-93a839ddb2f5?auto=format&fit=crop&q=80&w=250' },
  { id: 'b-4', name: 'Frooti Real Mango Pulp Tonic 1L', price: 55, unit: 'Per Bottle', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=250' },
  { id: 'b-5', name: 'Maaza Alphonso Juicy Mango 1L', price: 60, unit: 'Per Bottle', image: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?auto=format&fit=crop&q=80&w=250' },
  { id: 'b-6', name: 'Red Bull Energy Tonic Can 250ml', price: 115, unit: 'Per Can', image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=250' }
];

const SNACK_PRODUCTS = [
  { id: 's-1', name: 'Lays Classic Salted Potato Chips', price: 20, unit: 'Per Pack', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=250' },
  { id: 's-2', name: 'Kurkure Masala Munch Crunchy Twist', price: 20, unit: 'Per Pack', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&q=80&w=250' },
  { id: 's-3', name: 'Parle-G Gluco Original Biscuits', price: 40, unit: 'Per Pack', image: 'https://images.unsplash.com/photo-1558961309-dbdf05697d5b?auto=format&fit=crop&q=80&w=250' },
  { id: 's-4', name: 'Britannia 50-50 Sweet & Salty Biscuit', price: 50, unit: 'Per Pack', image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=250' },
  { id: 's-5', name: 'Haldirams Bhujia Sev Classic Mixture', price: 30, unit: 'Per Pack', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=250' },
  { id: 's-6', name: 'Bingo Mad Angles Achaari Masti Pack', price: 30, unit: 'Per Pack', image: 'https://images.unsplash.com/photo-1613903141384-76cbdc743f68?auto=format&fit=crop&q=80&w=250' }
];

const MOCK_TOP_SELLERS = [
  { id: 'ts-1', name: 'Sharma Traders', rating: '4.8', products: '350+ Products', initials: 'ST', color: 'bg-emerald-600 text-white' },
  { id: 'ts-2', name: 'Gupta Wholesale', rating: '4.7', products: '280+ Products', initials: 'GW', color: 'bg-slate-900 text-white' },
  { id: 'ts-3', name: 'Verma Traders', rating: '4.6', products: '210+ Products', initials: 'VT', color: 'bg-indigo-600 text-white' },
  { id: 'ts-4', name: 'Kumar Suppliers', rating: '4.7', products: '185+ Products', initials: 'KS', color: 'bg-blue-600 text-white' }
];

const DELIVERY_CITIES = ['Meerut', 'Delhi NCR', 'Hapur', 'Ghaziabad', 'Noida', 'Gurugram'];

export default function PublicMarketplace({
  products,
  onNavigateToLogin,
  onNavigateToRegister
}: PublicMarketplaceProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Meerut');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Authentication Lock Modal state
  const [authLockModal, setAuthLockModal] = useState<{
    isOpen: boolean;
    productName: string;
    productPrice: number;
    sellerName: string;
  } | null>(null);

  // Product Detail dynamic state
  const [selectedProductDetails, setSelectedProductDetails] = useState<any | null>(null);
  const [productDetailQty, setProductDetailQty] = useState<number>(10);
  const [profitMarkupPercent, setProfitMarkupPercent] = useState<number>(15);

  const displayAuthGate = (name: string, price: number, seller: string) => {
    setAuthLockModal({
      isOpen: true,
      productName: name,
      productPrice: price,
      sellerName: seller
    });
  };

  const handleOpenProductDetails = (product: any) => {
    setSelectedProductDetails({
      id: product.id || `p-${Date.now()}`,
      name: product.name,
      price: product.price,
      unit: product.unit || 'Per Unit',
      stock: product.stock || '100 Units',
      seller: product.seller || 'Verified Wholesaler',
      verified: product.verified !== undefined ? product.verified : true,
      image: product.image,
      category: product.category || 'Wholesale Goods',
      description: product.description || 'Premium B2B grade wholesale inventory sourced directly from central mandi hubs. Evaluated for quality, standard compliance, and guaranteed weight specifications. Perfect for retail markup.'
    });
    setProductDetailQty(10);
    setProfitMarkupPercent(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F6F8FC] flex-1 h-full overflow-y-auto text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">

      {/* SECTION 1: HEADER (Sticky top & Hamburger menu) */}
      <nav id="b2b-header" className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left elements: Logo + Tagline */}
            <div className="flex items-center gap-3">
              <button
                id="hamburger-trigger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => { setActiveCategory(null); setSearchQuery(''); }}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tracking-tight text-emerald-600 font-sans">
                    Kirrana<span className="text-slate-900">Bazzar</span>
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1 py-0.5 rounded-sm tracking-wider">
                    B2B ONLY
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                  Trusted B2B Wholesale Marketplace
                </span>
              </div>
            </div>

            {/* Desktop Center: Live Search bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  id="desktop-search-input"
                  type="text"
                  placeholder="Search wholesale products, categories or sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-xs px-4 py-2.5 pl-10 rounded-xl outline-hidden font-medium text-slate-700 transition-colors"
                />
              </div>
            </div>

            {/* Right Side: Simple Actions */}
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <button
                id="notification-trigger"
                onClick={() => alert('Sign up to view custom live price alerts & dispatched status.')}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-all relative"
                aria-label="Alerts"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              <button
                id="desktop-login-button"
                onClick={onNavigateToLogin}
                className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-all py-1.5 px-3 rounded-lg"
              >
                Login
              </button>
              
              <button
                id="desktop-register-button"
                onClick={() => onNavigateToRegister('Dukandar')}
                className="hidden sm:inline-block bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Become Dukandar
              </button>
            </div>

          </div>
        </div>

        {/* Slide navigation drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 lg:hidden animate-fade-in z-50">
            <div className="space-y-1 pb-3">
              <p className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-wider mb-2">Exclusive B2B Actions</p>
              
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToLogin(); }}
                className="w-full text-left font-bold text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-750 py-2.5 px-3 rounded-xl flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Login to My Account</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToRegister('Dukandar'); }}
                className="w-full text-left font-bold text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-750 py-2.5 px-3 rounded-xl flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Become a Verified Dukandar</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToRegister('Seller'); }}
                className="w-full text-left font-bold text-sm text-slate-705 hover:bg-emerald-50 hover:text-emerald-750 py-2.5 px-3 rounded-xl flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Become a Verified Seller</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-bold p-1">
              📞 Direct Mandi Support Helpline: +91 999 000 1234
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 2: DELIVERING ZONE row & Search (Blinkit Style) */}
      <div id="delivering-zone-bar" className="bg-emerald-600 text-white py-3 px-4 sticky top-16 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Near Town Selector */}
          <div className="flex items-center gap-2 text-xs font-bold relative">
            <MapPin className="w-4 h-4 text-emerald-250 animate-bounce" />
            <span>Delivering in</span>
            <button
              id="city-dropdown-trigger"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white.5 font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <span className="underline decoration-dotted underline-offset-4">{selectedCity}</span>
              <span className="text-[9px] text-emerald-200">▼</span>
            </button>

            {/* List Cities */}
            {showLocationDropdown && (
              <div className="absolute top-7 left-24 bg-white text-slate-850 rounded-xl shadow-xl border border-slate-100 p-2 w-44 space-y-0.5 z-55">
                <p className="text-[8px] text-slate-400 font-black uppercase px-2 py-1 tracking-wider">Select Mandi Town</p>
                {DELIVERY_CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                      selectedCity === city ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Sticky Search for Mobile */}
          <div className="flex-1 max-w-md relative md:hidden">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 pointer-events-none">
              <Search className="w-4 h-4 text-slate-550" />
            </span>
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search products, categories or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs px-3 py-2 pl-9 rounded-xl outline-hidden font-bold border border-emerald-500 shadow-inner"
            />
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-black text-emerald-100">
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>Exclusively for verified Dukandars. Normal customers not allowed.</span>
          </div>

        </div>
      </div>

      {selectedProductDetails ? (
        <section className="py-6 px-4 max-w-7xl mx-auto animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-white py-3 px-4 rounded-xl border border-slate-100 shadow-3xs">
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="text-emerald-600 hover:text-emerald-705 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              ← Back to Wholesale Market
            </button>
            <span>/</span>
            <span className="capitalize font-semibold text-slate-400">{selectedProductDetails.category || 'Mandi Catalogs'}</span>
            <span>/</span>
            <span className="font-extrabold text-slate-800 line-clamp-1">{selectedProductDetails.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Box: Product Image & Standard Badging */}
            <div className="md:col-span-5 bg-white rounded-3xl p-4 border border-slate-150 shadow-sm space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                <img
                  src={selectedProductDetails.image}
                  alt={selectedProductDetails.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold py-1 px-2.5 rounded-lg">
                  Mandi Dispatch Active
                </div>
                <div className="absolute top-3 right-3 bg-emerald-650 text-white text-[10px] font-extrabold py-1 px-2.5 rounded-lg shadow-md">
                  STOCK: {selectedProductDetails.stock || '120 Units'}
                </div>
              </div>

              {/* B2B Sourcing Badges */}
              <div className="pt-2 grid grid-cols-1 gap-2.5 text-xs text-slate-600 font-semibold font-sans">
                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-[11px]">Direct Same-Day Transit</p>
                    <p className="text-[10px] text-slate-400">Leaves Meerut Warehouse directly</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-[11px]">100% Quality Mandi Shield</p>
                    <p className="text-[10px] text-slate-400">No adulteration, guaranteed net weight</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Product Detail Description, Margin Slider Calculator, Buying buttons */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-6 text-left">
              
              {/* Category, Trust, Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider border border-emerald-100">
                    {selectedProductDetails.category || 'Mandi Catalog'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                    <span>Supplied by:</span>
                    <strong className="text-slate-800">{selectedProductDetails.seller}</strong>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans leading-tight">
                  {selectedProductDetails.name}
                </h1>
                
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {selectedProductDetails.description}
                </p>
              </div>

              {/* LIVE PRICING & QUANTITY CONFIGURATION */}
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 grid grid-cols-2 gap-4 items-center">
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Wholesale Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-650">₹{selectedProductDetails.price}</span>
                    <span className="text-[10px] text-slate-500 font-bold">/ {selectedProductDetails.unit || 'Bag'}</span>
                  </div>
                  <p className="text-[9px] text-slate-450 mt-1 font-semibold">* Rate is exclusive of GST & transit toll</p>
                </div>

                {/* Counter */}
                <div className="space-y-1.5 text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block text-right">Select Trade Quantity</span>
                  <div className="inline-flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => setProductDetailQty(prev => Math.max(10, prev - 10))}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-850 text-xs flex items-center justify-center font-bold border border-slate-150 shadow-3xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className="text-[11px] font-black font-mono text-slate-900 px-1 min-w-16 text-center">
                      {productDetailQty} Units
                    </span>
                    <button
                      onClick={() => setProductDetailQty(prev => prev + 10)}
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-850 text-xs flex items-center justify-center font-bold border border-slate-150 shadow-3xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                  <p className="text-[9px] text-amber-800 font-extrabold block text-right">Min wholesale trade order: 10 units</p>
                </div>
              </div>

              {/* INTERACTIVE B2B DUKANDAR MARGIN PREVIEW CALCULATOR */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-800 font-bold text-xs uppercase tracking-tight">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>Dukandar Profit Calculator</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                    Target {profitMarkupPercent}% Markup
                  </span>
                </div>

                <p className="text-[10px] text-slate-450 leading-normal font-semibold">
                  Set the markup you want to keep at your local shop and instantly preview your high-profit margin calculation:
                </p>

                {/* Markup range slider or quick selection tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 15, 20, 25, 30].map(val => (
                    <button
                      key={val}
                      onClick={() => setProfitMarkupPercent(val)}
                      className={`text-[10px] font-black py-1 px-3 rounded-lg border transition-all cursor-pointer ${
                        profitMarkupPercent === val
                          ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-3xs scale-105'
                          : 'bg-white border-slate-200 text-slate-505 hover:bg-slate-100'
                      }`}
                    >
                      +{val}% Margin
                    </button>
                  ))}
                </div>

                {/* Live math projection readout */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dashed border-slate-205 text-xs text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Wholesale Cost (Total)</span>
                    <strong className="font-extrabold text-slate-800 text-xs font-mono">₹{selectedProductDetails.price * productDetailQty}</strong>
                  </div>
                  
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-slate-400 font-bold block text-right">Profit Margin per Pack</span>
                    <strong className="font-extrabold text-emerald-600 text-xs font-mono">+₹{Math.round(selectedProductDetails.price * (profitMarkupPercent / 100))}</strong>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">Recommended Retail Rate</span>
                    <strong className="font-extrabold text-slate-800 text-xs font-mono">₹{Math.round(selectedProductDetails.price * (1 + profitMarkupPercent / 100))} / {selectedProductDetails.unit || 'Bag'}</strong>
                  </div>

                  <div className="space-y-0.5 text-right bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/10">
                    <span className="text-[9px] text-emerald-800 uppercase font-black block text-right font-sans">Total Profit Earned</span>
                    <strong className="text-sm font-black text-emerald-700 font-mono text-right block">
                      +₹{Math.round(selectedProductDetails.price * (profitMarkupPercent / 100) * productDetailQty)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* ACTIONS: B2B LOGIN GATE DISPATCH TRIGGER */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => displayAuthGate(selectedProductDetails.name, selectedProductDetails.price, selectedProductDetails.seller)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 shadow-3xs"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>Add to B2B Cart</span>
                </button>

                <button
                  onClick={() => displayAuthGate(selectedProductDetails.name, selectedProductDetails.price, selectedProductDetails.seller)}
                  className="bg-emerald-600 hover:bg-emerald-750 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-650/15"
                >
                  <Truck className="w-4 h-4 text-emerald-250 animate-bounce" />
                  <span>Wholesale Buy Now</span>
                </button>
              </div>

              {/* SPECIFICATIONS ADVANCED SPECS */}
              <div className="pt-2 text-left">
                <h4 className="text-[11px] uppercase font-mono tracking-wider font-extrabold text-slate-400 mb-2">Technical B2B Specifications</h4>
                <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-155 text-[11px]">
                  <div className="grid grid-cols-3 p-2.5 bg-slate-50/50">
                    <span className="text-slate-400 font-bold">Standard SKU Code</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800 uppercase">KB-{selectedProductDetails.id}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5">
                    <span className="text-slate-400 font-bold">Minimum Batch</span>
                    <span className="col-span-2 font-bold text-slate-800">10 standard factory packets / weight bags</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 bg-slate-50/50">
                    <span className="text-slate-400 font-bold">Seller Verification</span>
                    <span className="col-span-2 font-bold text-emerald-700 flex items-center gap-1">
                      <span>GST Invoiced & Trade Verified</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5">
                    <span className="text-slate-400 font-bold">Mandi Logistics Status</span>
                    <span className="col-span-2 font-semibold text-slate-600 text-left">Active - Ships within average of 4-6 hours to Meerut NCR</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      ) : (
        <>
          {/* SECTION 3: HERO BANNER (Meesho style layout flat) */}
          <section id="hero-banner" className="py-6 px-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-lg border border-emerald-850">
          
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[9px] font-mono font-extrabold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" /> Direct Mandi Pricing Active
            </div>

            <h1 className="text-3xl sm:text-4.15xl font-black leading-tight tracking-tight">
              Wholesale Products <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300">
                Direct From Verified Sellers
              </span>
            </h1>

            <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
              Connect directly with verified whole-sellers, flour mill distributors and bulk grocery manufacturers. Buy and sell at bulk wholesale prices.
            </p>

            {/* Verification badges */}
            <div className="grid grid-cols-3 gap-y-1.5 gap-x-2 pt-2 text-[10px] text-zinc-300 font-bold font-mono">
              <div className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified Sellers</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Best Prices</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-join-seller"
                onClick={() => onNavigateToRegister('Seller')}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Join as Seller
              </button>
              
              <button
                id="hero-join-dukandar"
                onClick={() => onNavigateToRegister('Dukandar')}
                className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer animate-pulse"
              >
                Join as Dukandar
              </button>
            </div>

          </div>

          {/* Right illustration style overlays */}
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none hidden lg:flex items-center justify-end pr-10">
            <Wheat className="w-48 h-48 text-emerald-400" />
          </div>

        </div>
      </section>

      {/* SECTION 4: CURATED CATEGORIES (Circle layouts with clear icons and count, NO EMOJIS) */}
      <section id="categories-grid" className="py-6 bg-white border-y border-slate-100 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
              Categories
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-[10px] font-black text-rose-600 hover:underline cursor-pointer"
              >
                Clear Category Filter ×
              </button>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            
            {/* Show All */}
            <button
              onClick={() => setActiveCategory(null)}
              className="flex flex-col items-center gap-1.5 shrink-0 text-center cursor-pointer group focus:outline-hidden"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                activeCategory === null
                  ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-150'
              }`}>
                <Star className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className={`text-[11px] font-black block leading-none ${activeCategory === null ? 'text-emerald-600' : 'text-slate-700'}`}>
                  All
                </span>
                <span className="text-[8px] text-slate-400 font-bold">1000+ Items</span>
              </div>
            </button>

            {CURATED_CATEGORIES.map(cat => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'more') {
                      setActiveCategory(null);
                      alert('Showing our complete wholesale catalog now!');
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0 text-center cursor-pointer group focus:outline-hidden"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-110'
                      : 'bg-slate-50 group-hover:bg-slate-100 text-slate-700 border border-slate-150'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="leading-tight text-center">
                    <span className={`text-[11px] font-extrabold block leading-none ${isActive ? 'text-emerald-600 font-black' : 'text-slate-700 font-bold'}`}>
                      {cat.name}
                    </span>
                    <span className="text-[8px] text-slate-400 font-semibold">{cat.count}</span>
                  </div>
                </button>
              );
            })}

          </div>

        </div>
      </section>

      {/* SECTION 5: TRENDING PRODUCTS (Meesho style horizontal product cards) */}
      <section id="trending-products-section" className="py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Trending Products
              </h2>
            </div>
            
            <button
              onClick={() => alert('Search or register to view our 10,000+ products')}
              className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRENDING_PRODUCTS.map(product => {
              // Standard wholesale reselling projection model
              const suggestedProfit = Math.round(product.price * 0.15);
              const retailPrice = product.price + suggestedProfit;

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenProductDetails({ ...product, description: `${product.name} is a top certified premium grade wholesale item sourced from the prime regional mandi. Specially processed for optimum store shelf placement and long retention life.` })}
                  className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  
                  {/* Image area */}
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-extrabold py-0.5 px-2 rounded-md">
                      Mandi Dispatch
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-emerald-600 text-white text-[9px] font-extrabold py-0.5 px-2 rounded-md uppercase tracking-wider">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>

                  {/* Body information */}
                  <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Seller and verification info */}
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <span>{product.seller}</span>
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      </div>

                      <h3 className="text-xs font-black text-slate-800 leading-tight line-clamp-1">
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-xs font-bold text-slate-400">Rate:</span>
                        <span className="text-sm font-black text-emerald-650">₹{product.price}</span>
                        <span className="text-[10px] text-slate-400">/ {product.unit}</span>
                      </div>
                    </div>

                    {/* Reselling Margin tip */}
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-[8px] text-amber-800 uppercase font-black block">Resell Suggestion</span>
                        <span className="font-bold text-slate-800">Sell at ₹{retailPrice}</span>
                      </div>
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black py-0.5 px-1.5 rounded-md">
                        +₹{suggestedProfit} Profit
                      </span>
                    </div>

                    {/* Main CTA button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProductDetails({ ...product, description: `${product.name} is a top certified premium grade wholesale item sourced from the prime regional mandi. Specially processed for optimum store shelf placement and long retention life.` }); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Info className="w-3.5 h-3.5 text-emerald-200" />
                      <span>View Details & Profit</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 6: PRODUCT CATEGORY SECTIONS (Grocery, Beverages, Snacks with horizontal scroll) */}
      <section id="horizontal-catalogs-scroll" className="py-6 bg-white px-4 border-t border-slate-150">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* GROCERY SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wheat className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-905">
                  Grocery Products
                </h2>
              </div>
              <button
                onClick={() => alert('Sign up to view our complete list of 230+ grocery grains & pulses.')}
                className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
              {GROCERY_PRODUCTS.map(g => (
                <div
                  key={g.id}
                  onClick={() => handleOpenProductDetails({ ...g, seller: 'Mandi Seller', stock: '150 Units', description: `${g.name} is a high-grade grocery product sourced directly from local distributor hubs. Packaged with quality seals for premium shelf lifespan.` })}
                  className="w-44 bg-slate-50 border border-slate-150 rounded-2xl p-2 shrink-0 flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all text-left"
                >
                  <div className="relative h-28 bg-slate-100 rounded-xl overflow-hidden mb-2">
                    <img src={g.image} alt={g.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-800 leading-tight line-clamp-1">{g.name}</h4>
                    <p className="text-xs font-black text-slate-900">₹{g.price} <span className="text-[10px] text-slate-400 font-semibold">/ {g.unit}</span></p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProductDetails({ ...g, seller: 'Mandi Seller', stock: '150 Units', description: `${g.name} is a high-grade grocery product sourced directly from local distributor hubs. Packaged with quality seals for premium shelf lifespan.` }); }}
                      className="w-full mt-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BEVERAGES SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Coffee className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-black text-slate-905">
                  Beverages
                </h2>
              </div>
              <button
                onClick={() => alert('Sign up to view our complete list of cold drinks, sodas & tea packaging.')}
                className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
              {BEVERAGE_PRODUCTS.map(b => (
                <div
                  key={b.id}
                  onClick={() => handleOpenProductDetails({ ...b, seller: 'Beverage Depot', stock: '500 Cases', description: `${b.name} is distributed by elite beverage partners. Authenticated original stock with standard freshness seals and long expiry support.` })}
                  className="w-44 bg-slate-50 border border-slate-150 rounded-2xl p-2 shrink-0 flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all text-left"
                >
                  <div className="relative h-28 bg-slate-100 rounded-xl overflow-hidden mb-2">
                    <img src={b.image} alt={b.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-800 leading-tight line-clamp-1">{b.name}</h4>
                    <p className="text-xs font-black text-slate-900">₹{b.price} <span className="text-[10px] text-slate-400 font-semibold">/ {b.unit}</span></p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProductDetails({ ...b, seller: 'Beverage Depot', stock: '500 Cases', description: `${b.name} is distributed by elite beverage partners. Authenticated original stock with standard freshness seals and long expiry support.` }); }}
                      className="w-full mt-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SNACKS SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cookie className="w-5 h-5 text-pink-650" />
                <h2 className="text-base font-black text-slate-905">
                  Snacks
                </h2>
              </div>
              <button
                onClick={() => alert('Sign up to view our complete list of biscuits, chips, & packaged confectionery.')}
                className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
              {SNACK_PRODUCTS.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleOpenProductDetails({ ...s, seller: 'Snacks Distributor', stock: '320 Boxes', description: `${s.name} is a high-demand snacks inventory. Stored at climate-controlled depots to preserve perfect taste and optimal crispiness.` })}
                  className="w-44 bg-slate-50 border border-slate-150 rounded-2xl p-2 shrink-0 flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all text-left"
                >
                  <div className="relative h-28 bg-slate-100 rounded-xl overflow-hidden mb-2">
                    <img src={s.image} alt={s.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-slate-800 leading-tight line-clamp-1">{s.name}</h4>
                    <p className="text-xs font-black text-slate-900">₹{s.price} <span className="text-[10px] text-slate-400 font-semibold">/ {s.unit}</span></p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProductDetails({ ...s, seller: 'Snacks Distributor', stock: '320 Boxes', description: `${s.name} is a high-demand snacks inventory. Stored at climate-controlled depots to preserve perfect taste and optimal crispiness.` }); }}
                      className="w-full mt-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: TOP SELLERS */}
      <section id="top-sellers-section" className="py-8 bg-[#FAFBFD] border-y border-slate-150 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Top Sellers</span>
            </h3>
            
            <button
              onClick={() => alert('Search for local mandi sellers in your city.')}
              className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_TOP_SELLERS.map(seller => (
              <div
                key={seller.id}
                className="bg-white rounded-2xl border border-slate-150 p-4 shadow-xs relative flex items-center gap-3.5 hover:shadow-md transition-all cursor-pointer"
                onClick={() => alert(`Browse unique catalog from ${seller.name} after logging in.`)}
              >
                {/* Initials avatar banner */}
                <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${seller.color}`}>
                  {seller.initials}
                </div>
                
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-slate-800 leading-tight">
                      {seller.name}
                    </h4>
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <span className="text-amber-500 font-bold font-mono">★ {seller.rating}</span>
                    <span>•</span>
                    <span>{seller.products}</span>
                  </div>
                </div>

                <div className="absolute right-3.5 text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 8: BEST DEALS TODAY (Large Product Grid with Pincode Support checks) */}
      <section id="best-deals-today" className="py-10 bg-white px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="border-b border-indigo-50 pb-3 flex justify-between items-center">
            <div>
              <span className="bg-amber-100 text-amber-850 text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-sm uppercase tracking-wider block w-fit mb-1">
                ⭐ best deals today
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                Best Deals Today
              </h2>
            </div>
            
            <span className="text-[10px] font-extrabold text-slate-400 font-mono">
              Live Mandi Updates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRENDING_PRODUCTS.map(product => {
              const suggestedProfit = Math.round(product.price * 0.12);
              const retailPrice = product.price + suggestedProfit;

              return (
                <div
                  key={`deal-${product.id}`}
                  onClick={() => handleOpenProductDetails({ ...product, description: `Special direct trade deal for ${product.name}, available at unmatched wholesale rates for a limited time limit. Packed safely and tracked straight from the central warehouse.` })}
                  className="bg-slate-50/50 hover:bg-white rounded-3xl p-3 border border-slate-150 transition-all flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-sm text-left"
                >
                  <div className="relative h-40 rounded-2xl bg-white overflow-hidden mb-3">
                    <img src={product.image} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-md">
                      SAVE 15%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                      <span>{product.seller}</span>
                      <span className="text-emerald-600 font-extrabold underline">Exclusive Deal</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 leading-tight line-clamp-1">
                      {product.name}
                    </h4>

                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-semibold text-slate-400">Wholesale Price</span>
                      <span className="text-sm font-black text-slate-850">₹{product.price}</span>
                    </div>

                    <div className="flex justify-between items-baseline text-[10px] text-emerald-700 font-bold bg-emerald-500/10 p-1.5 rounded-lg">
                      <span>Resell Margin Guideline</span>
                      <span>₹{retailPrice}</span>
                    </div>

                    <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                      * Verification of Shop GST certificate or Trade credential requested upon placing order.
                    </p>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProductDetails({ ...product, description: `Special direct trade deal for ${product.name}, available at unmatched wholesale rates for a limited time limit. Packed safely and tracked straight from the central warehouse.` }); }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-300" />
                      <span>View Details & Profit</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>
        </>
      )}

      {/* SECTION 9: BOTTOM REGISTRATION CTA */}
      <section id="bottom-cta" className="py-12 bg-slate-900 text-white px-4 border-t border-slate-850 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-emerald-900/10" />
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <h2 className="text-2xl sm:text-3.5xl font-black text-white">
            Start Buying Wholesale
          </h2>
          <p className="text-xs text-zinc-300 max-w-sm mx-auto font-medium">
            Join thousands of verified Indian local Kirana Dukandars. Direct trade access with zero broker interference.
          </p>

          <button
            onClick={() => onNavigateToRegister('Dukandar')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all shadow-md inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Register Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SECTION 10: SIMPLE FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-8 px-4 text-center text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-center flex-wrap gap-4 font-bold text-slate-400">
            <button onClick={() => alert('About Us: KirranaBazzar B2B provides verified listings direct from sadar bazaar.')} className="hover:text-emerald-500">About Us</button>
            <button onClick={() => alert('Support helpline: +91 999 000 1234')} className="hover:text-emerald-500">Contact</button>
            <button onClick={() => alert('All listing profiles are checked to guarantee trade protection.')} className="hover:text-emerald-500">Privacy Policy</button>
            <button onClick={() => alert('Authentic Business Trade certificate or local registered license requested for order submission.')} className="hover:text-emerald-450">Terms</button>
          </div>
          <p className="text-[10px] font-semibold text-slate-600">
            © 2026 KirranaBazzar B2B Marketplace Pvt Ltd. All wholesale directory listings strictly verified.
          </p>
        </div>
      </footer>

      {/* RETAIL BLOCKED / LOGIN GATE MODAL */}
      {authLockModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animation-fade-in animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative space-y-4">
            
            <button
              onClick={() => setAuthLockModal(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs"
              aria-label="Close"
            >
              ×
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-1">
                <Store className="w-6 h-6 text-amber-600 animate-pulse" />
              </div>
              
              <h3 className="text-sm font-black text-slate-905">
                Dukandar (Buyer) Login Chahiye
              </h3>
              
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Saman kharidne ke liye aapko <strong className="text-emerald-700">Dukandar (Kharidar / Retailer)</strong> profile se login karna hoga. Wholesale Seller accounts se kharidari nahi ho sakti.
              </p>
              
              <p className="text-[10px] text-slate-400 font-medium">
                Sourcing wholesale stock of <strong className="text-slate-700">"{authLockModal.productName}"</strong> requires a verified Dukandar membership.
              </p>
            </div>

            <div className="space-y-2 pt-1 font-sans">
              <button
                onClick={() => { setAuthLockModal(null); onNavigateToLogin(); }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-colors"
              >
                Log In as Dukandar (Buyer)
              </button>
              
              <button
                onClick={() => { setAuthLockModal(null); onNavigateToRegister('Dukandar'); }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-colors"
              >
                Create New Dukandar Account
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-400 font-semibold leading-normal text-center">
              🛡️ Exclusive platform for registered shopkeepers. Verification is quick and completely free.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

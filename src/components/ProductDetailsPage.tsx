import React, { useState, useEffect, useRef } from 'react';
import { Product, Order, UserProfile } from '../types';
import { 
  Heart, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Play, 
  Volume2, 
  VolumeX, 
  Star, 
  MapPin, 
  ChevronRight, 
  ShoppingBag, 
  X, 
  Maximize2,
  Check,
  AlertCircle
} from 'lucide-react';

interface ProductDetailsPageProps {
  product: Product;
  allProducts: Product[];
  currentUser: UserProfile | null;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onBack: () => void;
  // Callback when authenticated buy completes
  onPlaceOrder?: (order: Order) => void;
  onSelectProduct?: (product: Product) => void;
}

export default function ProductDetailsPage({
  product,
  allProducts,
  currentUser,
  onNavigateToLogin,
  onNavigateToRegister,
  onBack,
  onPlaceOrder,
  onSelectProduct
}: ProductDetailsPageProps) {
  // Swipeable media gallery states
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Accordion states
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

  // Social actions states (Wishlisted, Likes)
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [likesCount, setLikesCount] = useState(145);
  const [dislikesCount, setDislikesCount] = useState(4);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  // Interactive purchase states
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);

  // Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayVideoRef = useRef<HTMLVideoElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Simulated stock levels
  const currentStock = product.stockQuantity ?? 0;
  const isSoldOut = currentStock === 0 || product.status === 'Sold Out';

  // Fallback high quality illustration images based on the product category or name for premium slider experience
  const mediaGallery = [
    { type: 'image', url: product.image },
    { type: 'image', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600' },
    // Demo Mp4 for premium B2B Wholesale Kirana demonstration 
    { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-bag-of-flour-falling-on-a-table-32986-large.mp4', poster: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600' },
  ];

  // Set randomized likes on startup uniquely for this product ID
  useEffect(() => {
    const seed = product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1);
    setLikesCount(100 + (seed % 250));
    setDislikesCount(1 + (seed % 15));
    setIsWishlisted(false);
    setUserVote(null);
    setActiveMediaIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  // Touch handlers for swipeable gallery tracking
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeMediaIndex < mediaGallery.length - 1) {
      setActiveMediaIndex(prev => prev + 1);
    }
    if (isRightSwipe && activeMediaIndex > 0) {
      setActiveMediaIndex(prev => prev - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Synthetic beep click sound to guarantee 100% stable tactile haptic experience without external assets
  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz beep
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15); // sweep down
      
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.16);
    } catch (e) {
      console.warn("Audio Context failed to boot.", e);
    }
  };

  // Device vibration haptic simulation
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(60); // 60ms subtle mobile buzz
      } catch (e) {
        // Safe bypass
      }
    }
  };

  const handleLike = () => {
    playClickSound();
    triggerVibration();
    if (userVote === 'like') {
      setLikesCount(prev => prev - 1);
      setUserVote(null);
    } else {
      if (userVote === 'dislike') {
        setDislikesCount(prev => prev - 1);
      }
      setLikesCount(prev => prev + 1);
      setUserVote('like');
    }
  };

  const handleDislike = () => {
    playClickSound();
    triggerVibration();
    if (userVote === 'dislike') {
      setDislikesCount(prev => prev - 1);
      setUserVote(null);
    } else {
      if (userVote === 'like') {
        setLikesCount(prev => prev - 1);
      }
      setDislikesCount(prev => prev + 1);
      setUserVote('dislike');
    }
  };

  const handleShare = async () => {
    playClickSound();
    triggerVibration();
    const shareText = `Check out high margin bulk rates for "${product.name}" at ₹${product.price} offered by ${product.sellerName} on KirranaBazzar!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KirranaBazzar Wholesale product',
          text: shareText,
          url: window.location.href,
        });
      } catch (e) {
        // Safe bypass
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Product details copied to clipping board!');
      } catch (err) {
        // fallback
      }
    }
  };

  const handleToggleWishlist = () => {
    playClickSound();
    triggerVibration();
    setIsWishlisted(!isWishlisted);
  };

  // Triggering the main B2B order flow 
  const handleOrderSubmit = async () => {
    playClickSound();
    triggerVibration();

    if (!currentUser) {
      setShowAuthGate(true);
      return;
    }

    if (isSoldOut) return;

    if (purchaseQuantity > currentStock) {
      alert(`Cannot exceed available warehouse stock of ${currentStock} units.`);
      return;
    }

    setIsOrdering(true);

    // Dynamic delay for real-time transactional feeling
    const orderId = `ord-details-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId,
      buyerId: currentUser.uid,
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone,
      address: currentUser.address,
      pincode: currentUser.pincode,
      price: product.price,
      quantity: purchaseQuantity,
      totalAmount: product.price * purchaseQuantity,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      if (onPlaceOrder) {
        onPlaceOrder(newOrder);
      }
      setIsOrdering(false);
      setOrderSuccess(orderId);
    }, 1200);
  };

  // Extract other products from same category or same seller for Similar Products section
  const similarProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.sellerId === product.sellerId))
    .slice(0, 6);

  // Safe Specs layout items
  const brandValue = product.name.split(' ')[0] || 'Premium B2B';
  const weightValue = product.unit?.toLowerCase().includes('kg') ? product.unit : 'Standard Pack';
  const packagingValue = product.name.toLowerCase().includes('oil') ? 'Tin / Carton' : 'Heavy Bag';
  
  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 pb-24 font-sans select-none antialiased flex flex-col relative w-full h-full overflow-y-auto">
      
      {/* ----------------- STICKY HEADER ----------------- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 flex items-center justify-between px-4 py-3.5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <button 
            id="product-back-btn"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all outline-none"
          >
            ←
          </button>
          <div>
            <h1 className="text-xs font-black tracking-tight text-slate-450 uppercase leading-none font-mono">
              B2B Kirana Hub
            </h1>
            <p className="text-sm font-extrabold text-slate-900 leading-tight">
              Product Details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Wishlist toggle */}
          <button 
            id="pdetail-wishlist-toggle"
            onClick={handleToggleWishlist}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              isWishlisted 
                ? 'bg-rose-50 border-rose-200 text-rose-500 scale-105' 
                : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button 
            id="pdetail-share-btn"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-600 hover:text-slate-800 flex items-center justify-center transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ----------------- PRODUCT MEDIA GALLERY ----------------- */}
      <section className="bg-white border-b border-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Swipe tracks */}
        <div 
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full relative flex items-center justify-center"
          style={{ height: '40vh', minHeight: '320px' }}
        >
          {mediaGallery.map((media, idx) => {
            const isActive = idx === activeMediaIndex;
            if (!isActive) return null;

            if (media.type === 'video') {
              return (
                <div key={idx} className="w-full h-full relative flex items-center justify-center bg-black/95">
                  {isPlaying ? (
                    <video
                      ref={videoRef}
                      src={media.url}
                      autoPlay
                      muted={isMuted}
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                      onWaiting={() => setIsVideoLoading(true)}
                      onPlaying={() => setIsVideoLoading(false)}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full relative flex items-center justify-center">
                      <img 
                        src={media.poster} 
                        alt="Video Thumbnail"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <button
                        onClick={() => {
                          playClickSound();
                          setIsPlaying(true);
                        }}
                        className="absolute w-16 h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all text-xl"
                      >
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Playback action items overlay */}
                  {isPlaying && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2.5 rounded-full bg-black/65 text-white backdrop-blur-md"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setIsPlaying(false)}
                        className="p-2.5 rounded-full bg-black/65 text-white backdrop-blur-md text-xs font-black"
                      >
                        Pause Demonstration
                      </button>
                    </div>
                  )}

                  {isVideoLoading && (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white text-xs font-bold">
                      Loading video demo...
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div 
                key={idx} 
                className="w-full h-full cursor-zoom-in relative flex items-center justify-center p-4"
                onClick={() => setIsFullscreenGalleryOpen(true)}
              >
                <img 
                  src={media.url} 
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain rounded-2xl"
                />
                
                <div className="absolute bottom-3 right-3 bg-black/55 text-white text-[10px] font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3" />
                  <span>Tap to Zoom</span>
                </div>
              </div>
            );
          })}

          {/* Quick arrow overrides for desktop testing */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-2">
            <button 
              onClick={() => {
                playClickSound();
                setActiveMediaIndex(prev => Math.max(0, prev - 1));
              }}
              disabled={activeMediaIndex === 0}
              className="w-8 h-8 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-sm disabled:opacity-0"
            >
              ‹
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button 
              onClick={() => {
                playClickSound();
                setActiveMediaIndex(prev => Math.min(mediaGallery.length - 1, prev + 1));
              }}
              disabled={activeMediaIndex === mediaGallery.length - 1}
              className="w-8 h-8 rounded-full bg-white/80 text-slate-800 flex items-center justify-center shadow-sm disabled:opacity-0"
            >
              ›
            </button>
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className="py-3 flex items-center justify-center gap-1.5">
          {mediaGallery.map((media, idx) => (
            <button
              key={idx}
              onClick={() => {
                playClickSound();
                setActiveMediaIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeMediaIndex 
                  ? 'w-5 bg-emerald-600' 
                  : 'w-2 bg-slate-200'
              }`}
            >
              {media.type === 'video' && idx === activeMediaIndex && (
                <span className="sr-only">🎥</span>
              )}
            </button>
          ))}
          <span className="text-[10px] font-bold text-slate-400 pl-1 font-mono">
            {activeMediaIndex + 1}/{mediaGallery.length}
          </span>
        </div>
      </section>

      {/* ----------------- MAIN INFO CONTAINER ----------------- */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        
        {/* PRODUCT BASIC INFORMATION */}
        <section className="bg-white rounded-3xl p-5 border border-orange-50 shadow-xs text-left relative">
          <div className="flex items-center justify-between mb-1.5 label-wrap">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase py-1 px-3 rounded-full border border-emerald-100 tracking-wider">
              {product.category || 'Mandi Stock'}
            </span>

            {/* Warehouse Stock Badge */}
            {isSoldOut ? (
              <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span>🔴</span> Sold Out
              </span>
            ) : currentStock <= 15 ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <span>🟡</span> Low Stock ({currentStock} Units Left)
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span>🟢</span> In Stock
              </span>
            )}
          </div>

          <h2 className="text-lg font-black text-slate-900 leading-snug tracking-tight font-sans">
            {product.name}
          </h2>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-650 tracking-tight font-mono">₹{product.price}</span>
            <span className="text-xs text-slate-500 font-extrabold">/ {product.unit || 'Pack'}</span>
            <span className="text-[10px] text-slate-450 line-through pl-1">₹{Math.round(product.price * 1.25)}</span>
            <span className="text-[10px] font-extrabold text-[#F02F84] bg-pink-50 py-0.5 px-2 rounded-md tracking-wider">
              20% SAVE
            </span>
          </div>

          {!isSoldOut && (
            <p className="text-[11px] font-extrabold text-slate-450 mt-1 font-mono">
              ★ Wholesale Volume: <span className="text-slate-850">{currentStock} Units Available</span> for express trade loading
            </p>
          )}
        </section>

        {/* ----------------- LIKES / DISLIKING ----------------- */}
        <section className="bg-white rounded-3xl p-4 border border-slate-100 flex items-center justify-between shadow-3xs">
          <span className="text-xs font-bold text-slate-500">Retailer Feedback:</span>
          
          <div className="flex items-center gap-3">
            {/* Like */}
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 py-1.5 px-4 rounded-full border text-xs font-black transition-all active:scale-95 ${
                userVote === 'like' 
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-650' 
                  : 'bg-slate-50 border-slate-100 text-slate-600'
              }`}
            >
              <span>❤️</span> {likesCount}
            </button>

            {/* Dislike */}
            <button 
              onClick={handleDislike}
              className={`flex items-center gap-1.5 py-1.5 px-4 rounded-full border text-xs font-black transition-all active:scale-95 ${
                userVote === 'dislike' 
                  ? 'bg-rose-50 border-rose-250 text-rose-650' 
                  : 'bg-slate-50 border-slate-100 text-slate-600'
              }`}
            >
              <span>👎</span> {dislikesCount}
            </button>
          </div>
        </section>

        {/* ----------------- SELLER CARD ----------------- */}
        <section 
          onClick={() => setShowSellerModal(true)}
          className="bg-white rounded-3xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-inner">
              {product.sellerName ? product.sellerName.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-extrabold text-slate-800 leading-none group-hover:text-emerald-700">
                  {product.sellerName || 'Sharma Traders'}
                </h4>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold py-0.5 px-2 rounded-sm uppercase tracking-wider">
                  Verified ✅
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold leading-none">4.8</span>
                </div>
                <span className="text-slate-350">•</span>
                <span className="text-[10px] text-slate-450 font-bold">350+ Products Listed</span>
                <span className="text-slate-350">•</span>
                <span className="text-[10px] font-black text-emerald-650">🟢 Active</span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-all" />
        </section>

        {/* ----------------- ACCORDION: PRODUCT DESCRIPTION ----------------- */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-3xs text-left">
          <button
            onClick={() => {
              playClickSound();
              setIsDescOpen(!isDescOpen);
            }}
            className="w-full px-5 py-4 flex items-center justify-between bg-white text-sm font-black text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>▼</span> Product Description
            </span>
            {isDescOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isDescOpen && (
            <div className="px-5 pb-5 pt-1 text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-50">
              <p>
                {product.description || 'Premium quality wholesale inventory evaluated carefully for high-yield grocery storage. Best shelf stability with zero moisture retention risks. Cleaned manually without chemical polishers.'}
              </p>
              <div className="mt-3 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-850">
                ⭐ <strong>B2B Standard Guarantee:</strong> Fresh batch packaged directly from central agricultural Mandis. Standard tax invoice added under GST.
              </div>
            </div>
          )}
        </section>

        {/* ----------------- ACCORDION: SPECIFICATIONS ----------------- */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-3xs text-left">
          <button
            onClick={() => {
              playClickSound();
              setIsSpecsOpen(!isSpecsOpen);
            }}
            className="w-full px-5 py-4 flex items-center justify-between bg-white text-sm font-black text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>▼</span> Specifications
            </span>
            {isSpecsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isSpecsOpen && (
            <div className="px-5 pb-5 pt-1 border-t border-slate-50 text-xs text-left">
              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex py-2.5">
                  <span className="w-1/3 text-slate-400 font-bold">Brand</span>
                  <span className="w-2/3 text-slate-800 font-semibold">{brandValue}</span>
                </div>
                <div className="flex py-2.5">
                  <span className="w-1/3 text-slate-400 font-bold">Weight</span>
                  <span className="w-2/3 text-slate-800 font-semibold">{weightValue}</span>
                </div>
                <div className="flex py-2.5">
                  <span className="w-1/3 text-slate-400 font-bold">Packaging</span>
                  <span className="w-2/3 text-slate-800 font-semibold">{packagingValue}</span>
                </div>
                <div className="flex py-2.5">
                  <span className="w-1/3 text-slate-400 font-bold">Category</span>
                  <span className="w-2/3 text-slate-800 font-semibold">{product.category}</span>
                </div>
                <div className="flex py-2.5">
                  <span className="w-1/3 text-slate-400 font-bold">Min MOQ</span>
                  <span className="w-2/3 text-slate-800 font-black text-emerald-650">10 Packs</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ----------------- ACCORDION: DELIVERY AREAS ----------------- */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-3xs text-left">
          <button
            onClick={() => {
              playClickSound();
              setIsDeliveryOpen(!isDeliveryOpen);
            }}
            className="w-full px-5 py-4 flex items-center justify-between bg-white text-sm font-black text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>📍 Delivery Areas (Meerut, Ghaziabad...)</span>
            </span>
            {isDeliveryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isDeliveryOpen && (
            <div className="px-5 pb-5 pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-450 font-bold mb-3 uppercase tracking-wider">
                Delivers to standard regional cities:
              </p>
              
              <div className="flex flex-wrap gap-2">
                {(product.deliveryAreas?.cities && product.deliveryAreas.cities.length > 0) ? (
                  product.deliveryAreas.cities.map((city, cidx) => (
                    <span key={cidx} className="text-xs font-black text-slate-700 bg-emerald-50 border border-emerald-100 py-1.5 px-3.5 rounded-full">
                      📍 {city}
                    </span>
                  ))
                ) : (
                  ['Meerut', 'Delhi', 'Ghaziabad', 'Noida-NCR', 'Hapur'].map((city, cidx) => (
                    <span key={cidx} className="text-xs font-black text-slate-700 bg-emerald-50 border border-emerald-100 py-1.5 px-3.5 rounded-full">
                      📍 {city}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[10px] text-amber-800 font-extrabold leading-normal">
                  Our B2B delivery fleet dispatches orders daily directly to your kirana store step with zero loading charges.
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ----------------- DEDICATED DEMONSTRATION PLAYBAR ----------------- */}
        <section className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-3xs text-left space-y-3">
          <h4 className="text-xs font-mono font-black uppercase text-slate-400 flex items-center gap-1.5">
            <span>🎥</span> Product Demonstration
          </h4>
          <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
            See exactly how our premium grains are packed and quality-inspected directly in the wholesale depot:
          </p>

          <div className="aspect-video rounded-2xl bg-black overflow-hidden relative flex items-center justify-center border border-slate-150">
            {isPlaying ? (
              <video
                ref={overlayVideoRef}
                src="https://assets.mixkit.co/videos/preview/mixkit-bag-of-flour-falling-on-a-table-32986-large.mp4"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full relative flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" 
                  alt="Video Demonstration"
                  className="w-full h-full object-cover opacity-75"
                />
                <button
                  onClick={() => {
                    playClickSound();
                    setIsPlaying(true);
                  }}
                  className="absolute w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md text-lg hover:scale-105 transition-all"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
            )}

            {isPlaying && (
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/60 text-white"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => setIsPlaying(false)}
                  className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-black"
                >
                  Pause
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ----------------- SIMILAR PRODUCTS ----------------- */}
        {similarProducts.length > 0 && (
          <section className="space-y-3.5 text-left pt-2 pb-6">
            <h3 className="text-sm font-black text-slate-800 tracking-tight pl-1">
              You May Also Like
            </h3>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {similarProducts.map((p) => {
                const isSimilarSoldOut = p.stockQuantity === 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      playClickSound();
                      if (onSelectProduct) onSelectProduct(p);
                    }}
                    className="w-36 bg-white rounded-2xl p-2.5 border border-slate-100 flex flex-col justify-between shrink-0 cursor-pointer hover:border-slate-350 transition-colors shadow-3xs"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-50">
                      <img 
                        src={p.image} 
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSimilarSoldOut && (
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-center">
                          <span className="bg-rose-600 text-white text-[8px] font-black uppercase px-1 py-0.5 rounded scale-90">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-left space-y-1">
                      <h4 className="text-[11px] font-extrabold text-slate-800 line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold truncate">
                        By {p.sellerName.split(' ')[0]}
                      </p>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-slate-900 font-mono">₹{p.price}</span>
                        {isSimilarSoldOut ? (
                          <span className="text-[9px] bg-red-100 text-red-700 py-0.5 px-1.5 rounded-sm font-extrabold uppercase scale-90">
                            SOLD
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 py-0.5 px-1.5 rounded-sm font-extrabold uppercase scale-90">
                            IN STOCK
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* ----------------- STICKY ORDER BAR ----------------- */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 p-3.5 shadow-xl max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-slate-400 uppercase font-black tracking-wide font-mono">
            Wholesale Price ({purchaseQuantity} Packs)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-650 font-mono">₹{product.price * purchaseQuantity}</span>
            <span className="text-[10px] text-slate-400 font-bold">/ Total</span>
          </div>

          {/* Quick Counter to adjust item count */}
          {!isSoldOut && (
            <div className="flex items-center gap-2 mt-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200 max-w-fit scale-90 -ml-1">
              <button 
                onClick={() => {
                  playClickSound();
                  setPurchaseQuantity(prev => Math.max(1, prev - 1));
                }}
                className="w-5 h-5 bg-white rounded-md text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 active:scale-90"
              >
                -
              </button>
              <span className="text-[10px] font-black text-slate-800 px-1 min-w-4 text-center font-mono">
                {purchaseQuantity}
              </span>
              <button 
                onClick={() => {
                  playClickSound();
                  setPurchaseQuantity(prev => Math.min(currentStock, prev + 1));
                }}
                className="w-5 h-5 bg-white rounded-md text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 active:scale-90"
              >
                +
              </button>
            </div>
          )}
        </div>

        {isSoldOut ? (
          <button 
            disabled
            className="flex-1 max-w-[240px] bg-slate-100 border border-slate-200 text-slate-400 font-bold py-3.5 rounded-full text-xs cursor-not-allowed uppercase tracking-wider text-center"
          >
            Currently Unavailable
          </button>
        ) : (
          <button
            id="pdetail-order-btn"
            onClick={handleOrderSubmit}
            disabled={isOrdering}
            className="flex-1 max-w-[240px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-full text-xs shadow-md shadow-emerald-700/15 transform active:scale-96 transition-all duration-150 uppercase tracking-widest text-center"
          >
            {isOrdering ? 'Processing Order...' : 'Order Now'}
          </button>
        )}
      </footer>

      {/* ----------------- SUB-MODAL: IMAGE FULLSCREEN ZOOM ----------------- */}
      {isFullscreenGalleryOpen && (
        <div className="fixed inset-0 z-55 bg-black/98 flex flex-col justify-between p-4 animate-fade-in">
          <div className="flex justify-end p-2">
            <button 
              onClick={() => {
                playClickSound();
                setIsFullscreenGalleryOpen(false);
                setIsZoomed(false);
              }}
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center text-lg active:scale-95"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img 
              src={mediaGallery[activeMediaIndex]?.type === 'image' ? mediaGallery[activeMediaIndex].url : product.image}
              alt="Zoomed Product Details"
              referrerPolicy="no-referrer"
              className={`max-w-full max-h-[80vh] object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>

          <div className="pb-8 text-center text-xs text-white/70">
            <p className="font-extrabold">{product.name}</p>
            <p className="text-[10px] text-white/50 mt-1">Double tap or click anywhere on the image to activate 1.5x zoom mode</p>
          </div>
        </div>
      )}

      {/* ----------------- SUB-MODAL: VERIFIED SELLER MODAL ----------------- */}
      {showSellerModal && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end justify-center p-4 animate-fade-in" onClick={() => setShowSellerModal(false)}>
          <div 
            className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-slide-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5Title">
                <span>Verified B2B Seller Profile</span>
              </h3>
              <button 
                onClick={() => {
                  playClickSound();
                  setShowSellerModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white font-black flex items-center justify-center text-lg shadow-inner">
                  {product.sellerName ? product.sellerName.slice(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">{product.sellerName || 'Sharma Traders'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-slate-700 bg-amber-100 py-0.5 px-2 rounded">
                      ⭐ 4.8 Rating
                    </span>
                    <span className="text-xs font-bold text-slate-450">Active on Mandi Hub</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-2.5 text-xs text-slate-600">
                <p className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wide">🔒 Direct Wholesale Contact Rules:</p>
                <p>
                  To prevent unauthorized retail leakage and spam calls, the exact contact details of the wholesaler, including <strong>phone number</strong> and <strong>exact office dispatch location</strong>, are confidential by B2B policy regulations.
                </p>
                <div className="p-3 bg-emerald-50 text-emerald-800 font-extrabold rounded-xl border border-emerald-100">
                  ⚡ <strong>Revealed Instantly:</strong> These details will be added to your receipt manifest and dispatch tracker immediately after confirmation of order placement!
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowSellerModal(false)}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-extrabold py-3.5 text-xs rounded-xl transition-all"
                >
                  Return to Product Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-MODAL: AUTHENTICATION LOCK MODAL ----------------- */}
      {showAuthGate && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <span className="text-5xl block animate-bounce">🔒</span>
            <h3 className="text-lg font-black text-slate-800">Dukandar Account Required</h3>
            
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Wholesale pricing is exclusively for registered and verified Kirana Dukandars. Normal guest customers cannot place trade orders.
            </p>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-left text-slate-600 space-y-1">
              <strong>Product:</strong> {product.name}<br />
              <strong>Rate:</strong> ₹{product.price} / {product.unit || 'Pack'}<br />
              <strong>Wholesale Partner:</strong> {product.sellerName}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowAuthGate(false);
                  onNavigateToLogin();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all tracking-wider uppercase"
              >
                Sign in to Place Order
              </button>

              <button
                onClick={() => {
                  setShowAuthGate(false);
                  onNavigateToRegister();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3.5 rounded-xl text-xs transition-all tracking-wider uppercase"
              >
                Register Verified Store
              </button>

              <button
                onClick={() => setShowAuthGate(false)}
                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-1"
              >
                Cancel and Browse Market
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- HIGH PREMIUM ORDER SUCCESS FULLSCREEN VIEW ----------------- */}
      {orderSuccess && (
        <div className="fixed inset-0 z-55 bg-white flex flex-col justify-between p-6 animate-fade-in select-none">
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
            
            {/* Pulsing check mark circle */}
            <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 font-sans">
                Congratulations, Order Placed!
              </h3>
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 py-1 px-4 rounded-full inline-block font-extrabold">
                B2B Bulk Dispatch Confirmed
              </p>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto pt-2.5 font-semibold">
                Your trade order for <strong className="text-slate-800">{purchaseQuantity} Packs</strong> of <span className="text-slate-800">{product.name}</span> has been securely submitted!
              </p>
            </div>

            {/* Receipt invoice card details */}
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl w-full max-w-xs text-left space-y-2 text-xs">
              <p className="text-[10px] font-mono uppercase text-slate-400 font-black tracking-wider">Receipt Invoice Summary</p>
              <div className="flex justify-between">
                <span className="text-slate-450">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-850">{orderSuccess}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Item Total:</span>
                <span className="text-slate-850 font-bold">₹{product.price * purchaseQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Destination PIN:</span>
                <span className="text-slate-850 font-bold font-mono">{currentUser?.pincode || '110006'}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-205 pt-2.5 text-[11px] font-extrabold">
                <span className="text-slate-850 uppercase">Live Carrier Status:</span>
                <span className="text-emerald-750">⚡ Loading Dispatch Truck</span>
              </div>
            </div>

            {/* Micro contacts info shown now that order is confirmed! */}
            <div className="bg-gradient-to-tr from-amber-50 to-amber-100/50 p-3.5 border border-amber-200 rounded-2xl w-full max-w-xs text-left text-xs space-y-1">
              <p className="font-black text-amber-850 uppercase text-[9px] tracking-wide">📞 Confirmed Wholesaler Hotline:</p>
              <p className="text-slate-700 font-semibold leading-relaxed">
                Contact <strong className="text-slate-900">{product.sellerName}</strong> live at: 
                <span className="block font-mono font-black text-indigo-700 text-sm mt-0.5">9999911111 / 8888822222</span>
              </p>
            </div>
          </div>

          <div className="pb-4 w-full max-w-xs mx-auto">
            <button
              onClick={() => {
                playClickSound();
                setOrderSuccess(null);
                onBack();
              }}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-extrabold py-3.5 text-xs rounded-xl transition-all shadow-md uppercase tracking-wider"
            >
              Back to Wholesale Market
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

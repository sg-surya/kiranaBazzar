import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Store, ShieldCheck, TrendingUp, Truck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-between p-6 z-50 text-white select-none mobile-container">
      {/* Background Decorative patterns */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/40 via-transparent to-transparent opacity-70 pointer-events-none" />

      {/* Top Brand Tag */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 tracking-wider uppercase font-mono"
      >
        <ShieldCheck className="w-3.5 h-3.5" /> B2B Wholesaler Network
      </motion.div>

      {/* Center Brand and Logo */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
          className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-900/30 ring-4 ring-emerald-500/20 relative"
        >
          <Store className="w-13 h-13 text-white" />
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md font-mono">
            B2B
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-4xl font-black font-display tracking-tight text-white mt-6"
        >
          Kirrana<span className="text-emerald-500">Bazzar</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-slate-400 text-center font-medium mt-3 px-4 leading-relaxed"
        >
          Sasta Daam, Seedha Dukaan Tak.<br />
          <span className="text-emerald-400 font-semibold">100% Genuine Wholesale Marketplace</span>
        </motion.p>
      </div>

      {/* Bottom Features & Loading */}
      <div className="w-full max-w-xs mb-8 flex flex-col items-center">
        {/* Animated Loading Bar */}
        <div className="w-28 h-1 bg-slate-800 rounded-full overflow-hidden mb-8">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-1/2 h-full bg-emerald-500 rounded-full relative"
          />
        </div>

        {/* Dynamic Value Badges */}
        <div className="grid grid-cols-3 gap-4 text-center w-full">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">High Margins</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Direct Delivery</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 font-sans">Verified B2B</span>
          </div>
        </div>
      </div>
    </div>
  );
}

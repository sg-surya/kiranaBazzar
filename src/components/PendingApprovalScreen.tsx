import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { Clock, ShieldAlert, Phone, MapPin, Signpost, LogOut, CheckCircle2, Key } from 'lucide-react';

interface PendingApprovalScreenProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onApprovalBypass: (updatedUser: UserProfile) => void;
}

export default function PendingApprovalScreen({ currentUser, onLogout, onApprovalBypass }: PendingApprovalScreenProps) {
  
  const handleInstantApprove = () => {
    // Trigger callback with the approved profile, which writes to Firebase Firestore
    onApprovalBypass({ ...currentUser, approvalStatus: 'approved' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 max-w-md mx-auto relative select-none">
      
      {/* Upper Brand Info */}
      <div className="pt-6 text-center">
        <h2 className="text-xl font-black font-display text-slate-800 tracking-tight">
          Kirrana<span className="text-emerald-600">Bazzar</span>
        </h2>
        <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mt-1">
          Wholesale Verification Desk
        </p>
      </div>

      {/* Main Status Container */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 my-4 text-center flex-1 flex flex-col justify-center">
        
        {/* Animated Hourglass/Clock widget */}
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200/40 flex items-center justify-center text-amber-500 relative mb-5">
          <Clock className="w-10 h-10 animate-pulse" />
          <span className="absolute bottom-0 right-0 bg-amber-500 text-white p-1 rounded-full text-[9px] font-bold">
            ⏳
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Registration Pending!
        </h3>
        <p className="text-xs text-amber-800 font-medium bg-amber-50/70 py-1.5 px-3 rounded-full mt-2 border border-amber-100/50 inline-block mx-auto max-w-xs">
          Awaiting validation by Rajesh Kumar (Owner)
        </p>

        <p className="text-xs text-slate-400 leading-relaxed mt-4 max-w-sm mx-auto">
          We verify all B2B distributors, wholesalers and local Kirana Dukandars manually to prevent consumers from buying at wholesale prices. Your account is typically verified within <strong>2 hours</strong>.
        </p>

        {/* User Application summary */}
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mt-6 text-left space-y-2.5">
          <div className="flex gap-2 items-start text-xs">
            <span className="text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono">
              {currentUser.role}
            </span>
            <span className="font-bold text-slate-800 break-words">{currentUser.name}</span>
          </div>
          
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Ph: {currentUser.phone}</span>
            </div>
            
            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-tight">Addr: {currentUser.address}, (PIN: {currentUser.pincode})</span>
            </div>
          </div>
        </div>

        {/* Bypass panel */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-left">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide font-mono">
                Admin Testing Console
              </h4>
            </div>
            <p className="text-[10px] text-indigo-800 leading-relaxed">
              If evaluating this applet, click below to instantly approve your registered profile as an Owner action.
            </p>
            <button
              onClick={handleInstantApprove}
              type="button"
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Instant Approve My Account
            </button>
          </div>
        </div>

      </div>

      {/* Logout Navigation */}
      <div className="pb-2">
        <button
          onClick={onLogout}
          type="button"
          className="w-full bg-slate-200 hover:bg-slate-300 active:scale-[0.98] text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out from This Phone
        </button>
      </div>
      
    </div>
  );
}

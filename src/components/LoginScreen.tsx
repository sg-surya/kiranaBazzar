import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { getUsers } from '../data';
import { Phone, Lock, Store, Key, UserCheck, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const registeredUsers = getUsers();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Find user
      const foundUser = registeredUsers.find(u => u.phone === phone || u.phone === phone.replace('+91', '').trim());
      setLoading(false);

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        setError(`This number is not registered on KirranaBazzar yet. Registered number or choose a demo account below!`);
      }
    }, 800);
  };

  const handleQuickLogin = (user: UserProfile) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 max-w-md mx-auto relative select-none">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/15">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold font-display tracking-tight text-slate-900 mt-4">
          Kirrana<span className="text-emerald-600">Bazzar</span>
        </h2>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full mt-1.5 tracking-wider uppercase font-mono">
          B2B Wholesale Portal
        </span>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100 flex-1 flex flex-col justify-center my-4">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Dukan Aur Seller Login</h3>
          <p className="text-xs text-slate-400 mt-1">Enter your registered 10-digit mobile number to access your marketplace dashboard.</p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 font-mono">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhone(val);
                }}
                placeholder="98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-4 text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
              />
              <Phone className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-300 disabled:scale-100 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/15 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-4 h-4" /> Send OTP & Login
              </>
            )}
          </button>
        </form>

        <div className="relative my-7 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Or Quick Login for Testers
          </span>
        </div>

        {/* Demo Quick Logins */}
        <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
          {registeredUsers.map((user) => (
            <button
              key={user.uid}
              type="button"
              onClick={() => handleQuickLogin(user)}
              className="w-full bg-slate-50 border border-slate-100 hover:border-emerald-500/35 hover:bg-emerald-50/20 p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  user.role === 'Owner' ? 'bg-indigo-100 text-indigo-700' :
                  user.role === 'Seller' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {user.role[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</h4>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500 font-mono">{user.phone}</span>
                    <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                      user.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      user.approvalStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {user.approvalStatus}
                    </span>
                  </div>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Signup Navigation */}
      <div className="text-center pb-4">
        <p className="text-slate-500 text-xs">
          New wholesaler or Dukandar?
        </p>
        <button
          onClick={onNavigateToRegister}
          className="text-emerald-600 hover:text-emerald-700 font-extrabold text-sm mt-1 inline-flex items-center gap-1 focus:outline-none focus:underline"
        >
          Create Business Account &rarr;
        </button>
      </div>
    </div>
  );
}

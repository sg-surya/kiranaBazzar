import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserRole } from '../types';
import { registerWithPhone } from '../services/db';
import { Store, User, Phone, MapPin, CheckCircle, Info, ChevronLeft, ArrowRight, MessageSquareCode, Factory } from 'lucide-react';

interface RegisterScreenProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [role, setRole] = useState<UserRole>('Dukandar');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSameAsPhone, setIsSameAsPhone] = useState(true);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !address || !pincode) {
      setError('Please fill in all the required fields.');
      return;
    }

    if (phone.length < 10) {
      setError('Phone number must be at least 10 digits.');
      return;
    }

    const finalWhatsapp = isSameAsPhone ? phone : whatsapp;
    if (!isSameAsPhone && finalWhatsapp.length < 10) {
      setError('Please enter a valid WhatsApp number or check "Same as phone".');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerWithPhone({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: finalWhatsapp.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        role,
        approvalStatus: 'pending' // strict B2B policy rule
      });
      setLoading(false);
      onRegisterSuccess(newUser);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed inside Firebase services.');
    }
  };

  const fillSample = (roleType: 'Seller' | 'Dukandar') => {
    if (roleType === 'Seller') {
      setName('Karan Agro Wholesale Mandi');
      setPhone('9810012345');
      setWhatsapp('9810012345');
      setIsSameAsPhone(true);
      setAddress('Shed No 45, Galla Wholesale Market, Rohtak Road');
      setPincode('124001');
      setRole('Seller');
    } else {
      setName('Jai Hanuman General Store');
      setPhone('9820012345');
      setWhatsapp('9820012345');
      setIsSameAsPhone(true);
      setAddress('Shop 1, Near Hanuman Mandir, Sector 15');
      setPincode('110089');
      setRole('Dukandar');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 max-w-md mx-auto relative select-none">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4 mb-3">
        <button
          onClick={onNavigateToLogin}
          type="button"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Create B2B Account</h2>
          <p className="text-xs text-slate-400">Join KirranaBazzar Wholesaler-Retailer Web</p>
        </div>
      </div>

      {/* Register Form Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-100 border border-slate-100 flex-1 my-2 overflow-y-auto no-scrollbar">
        {/* Sample Autofillers */}
        <div className="mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-wrap items-center justify-between gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono pl-1">
            ⚡ Quick Fill for test:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => fillSample('Seller')}
              type="button"
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-xl transition-colors cursor-pointer"
            >
              + Seller Form
            </button>
            <button
              onClick={() => fillSample('Dukandar')}
              type="button"
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-1 rounded-xl transition-colors cursor-pointer"
            >
              + Dukandar Form
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-100 p-3 rounded-2xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Seller')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  role === 'Seller'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Factory className="w-6 h-6 text-emerald-600 mb-0.5" />
                  <span className="text-xs font-bold">Wholesale Seller</span>
                  <span className="text-[9px] opacity-75">I want to sell bulk items</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('Dukandar')}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  role === 'Dukandar'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 text-center font-sans">
                  <Store className="w-6 h-6 text-emerald-600 mb-0.5" />
                  <span className="text-xs font-bold">Dukandar (Buy)</span>
                  <span className="text-[9px] opacity-75">I want to buy for my shop</span>
                </div>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Full Name / Business Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="eg. Shankar Kirana Stores"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-11 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPhone(val);
                    if (isSameAsPhone) setWhatsapp(val);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-11 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white font-mono transition-all"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  WhatsApp Number *
                </label>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSameAsPhone}
                    onChange={(e) => {
                      setIsSameAsPhone(e.target.checked);
                      if (e.target.checked) setWhatsapp(phone);
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer accent-emerald-600"
                  />
                  Same as Phone
                </label>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  required={!isSameAsPhone}
                  disabled={isSameAsPhone}
                  placeholder={isSameAsPhone ? phone || "WhatsApp number" : "10-digit WhatsApp"}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-11 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white font-mono disabled:opacity-75 disabled:bg-slate-100 transition-all"
                />
                <MessageSquareCode className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>
          </div>

          {/* Full Shop Address */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Shop / Warehouse Full Address *
            </label>
            <div className="relative">
              <textarea
                required
                rows={2}
                placeholder="Door No, Street Name, Mandi Area, Landmark, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 pl-11 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            </div>
          </div>

          {/* Area Pincode */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Pincode *
            </label>
            <div className="relative">
              <input
                type="tel"
                maxLength={6}
                required
                placeholder="6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-11 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white font-mono transition-all"
              />
              <CheckCircle className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 flex gap-2.5 text-[11px] text-amber-800 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>B2B policy guidelines:</strong> All registrations go to <strong>Pending Approval</strong> state. The marketplace Owner Rajesh Kumar verifies and approves accounts manually to ensure wholesale trust.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Submit Application <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center py-2">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-emerald-600 hover:text-emerald-700 font-bold"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

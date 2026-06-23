import React, { useState } from 'react';
import { UserProfile } from '../types';
import { updateUserProfile } from '../services/db';
import {
  Building,
  MapPin,
  Camera,
  ShoppingBag,
  DollarSign,
  ArrowRight,
  Globe,
  Plus,
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface SellerOnboardingProps {
  currentUser: UserProfile;
  onOnboardingComplete: (updatedUser: UserProfile) => void;
}

const PRESET_SHOP_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
    label: 'Grain Mandi Warehouse'
  },
  {
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400',
    label: 'Wholesale B2B Depot'
  },
  {
    url: 'https://images.unsplash.com/photo-1604719312563-8912e9227c6a?auto=format&fit=crop&q=80&w=400',
    label: 'Supermarket Stockroom'
  },
  {
    url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=400',
    label: 'Provisions Storehouse'
  }
];

export default function SellerOnboarding({ currentUser, onOnboardingComplete }: SellerOnboardingProps) {
  const [shopName, setShopName] = useState(currentUser.name);
  const [address, setAddress] = useState(currentUser.address);
  const [shopPhoto, setShopPhoto] = useState(currentUser.shopPhoto || PRESET_SHOP_PHOTOS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [gstNumber, setGstNumber] = useState(currentUser.gstNumber || '');
  const [minOrderValue, setMinOrderValue] = useState<number>(currentUser.minOrderValue || 5000);
  
  // Deliverable cities and pincodes management
  const [cities, setCities] = useState<string[]>(currentUser.deliverableCities || ['Delhi', 'Gurgaon']);
  const [pincodes, setPincodes] = useState<string[]>(currentUser.deliverablePincodes || ['110001', '122001']);
  
  const [cityInput, setCityInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCity = cityInput.trim();
    if (cleanCity && !cities.some(c => c.toLowerCase() === cleanCity.toLowerCase())) {
      setCities([...cities, cleanCity]);
      setCityInput('');
    }
  };

  const handleAddPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeInput.trim().replace(/\D/g, '');
    if (cleanPin.length === 6 && !pincodes.includes(cleanPin)) {
      setPincodes([...pincodes, cleanPin]);
      setPincodeInput('');
    }
  };

  const removeCity = (index: number) => {
    setCities(cities.filter((_, i) => i !== index));
  };

  const removePincode = (index: number) => {
    setPincodes(pincodes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shopName.trim()) {
      setError('Please provide your wholesale shop name.');
      return;
    }

    if (!address.trim()) {
      setError('Please provide your warehouse/office physical address.');
      return;
    }

    if (cities.length === 0 && pincodes.length === 0) {
      setError('Please add at least one deliverable city or pincode.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        name: shopName.trim(),
        address: address.trim(),
        shopPhoto: customPhotoUrl.trim() || shopPhoto,
        gstNumber: gstNumber.trim(),
        minOrderValue: Number(minOrderValue),
        deliverableCities: cities,
        deliverablePincodes: pincodes,
        onboarded: true
      };

      await updateUserProfile(currentUser.uid, updates);
      
      const updatedUser: UserProfile = {
        ...currentUser,
        ...updates
      };
      
      onOnboardingComplete(updatedUser);
    } catch (err: any) {
      setError(err.message || 'Onboarding failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 max-w-md mx-auto relative select-none">
      
      {/* Header */}
      <div className="text-center pt-6 pb-2 shrink-0">
        <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto shadow-md">
          🏡
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-3">
          Onboard Your B2B Shop
        </h2>
        <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-mono font-bold block mt-1">
          Complete Wholesaler Profile Setup
        </span>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-5 shadow-xl shadow-slate-200 border border-slate-100 flex-1 my-3 overflow-y-auto no-scrollbar space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Wholesale Business / Shop Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="eg. Balaji Grain Traders"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-11 text-sm text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <Building className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Shop Photo */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Shop / Warehouse Photo *
            </label>
            
            {/* Display active photo */}
            <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 relative mb-2 bg-slate-50">
              <img
                src={customPhotoUrl.trim() || shopPhoto}
                alt="Shop Banner"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-3">
                <span className="text-white text-[10px] font-bold font-mono tracking-widest uppercase">Active Banner Preview</span>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {PRESET_SHOP_PHOTOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setShopPhoto(p.url);
                    setCustomPhotoUrl('');
                  }}
                  className={`h-11 rounded-xl overflow-hidden border-2 relative transition-all ${
                    shopPhoto === p.url && !customPhotoUrl
                      ? 'border-emerald-500 scale-95'
                      : 'border-slate-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

            {/* Custom Photo URL Input */}
            <div className="relative">
              <input
                type="url"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="Or paste custom image URL..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pl-10 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </div>
          </div>

          {/* Shop Physical Address */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Shop Warehouse / Office Address *
            </label>
            <div className="relative">
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Physical warehouse address for offline stock pickups"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 pl-11 text-sm text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
              />
              <MapPin className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3" />
            </div>
          </div>

          {/* Deliverable Cities Manager */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deliverable Cities * (Region of operations)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type city (eg. Noida)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCity}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {cities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cities.map((city, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-2 rounded-lg py-1 flex items-center gap-1 animate-fade-in"
                  >
                    {city}
                    <button
                      type="button"
                      onClick={() => removeCity(idx)}
                      className="text-emerald-500 hover:text-rose-600 font-bold ml-0.5 cursor-pointer text-xs leading-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 font-semibold">⚠️ Add at least 1 city where you can deliver retail batches.</p>
            )}
          </div>

          {/* Deliverable Pincodes Manager */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deliverable Pincodes *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit PIN code (eg. 110045)"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddPincode}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Pin
              </button>
            </div>

            {pincodes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                {pincodes.map((pin, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    {pin}
                    <button
                      type="button"
                      onClick={() => removePincode(idx)}
                      className="text-slate-400 hover:text-rose-600 font-bold ml-0.5 cursor-pointer text-xs leading-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 font-semibold font-sans">⚠️ Specify delivery pin codes to filter local orders.</p>
            )}
          </div>

          {/* GST Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                GSTIN registration (Optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="eg. 07AAAAA0000A1Z5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 placeholder-slate-400 font-mono tracking-wide uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Min Order Value (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 pl-7 text-xs font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-400 absolute left-3 top-2.5 text-xs font-bold font-mono">₹</span>
              </div>
            </div>
          </div>

          {/* Guarantee info */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex gap-2 text-[11px] text-emerald-800 leading-normal font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              By setting up your wholesale coordinates, local Dukandars in {cities.length || 0} cities can view and pool bulk deliveries with your warehouse directly.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] text-xs flex items-center justify-center gap-1"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Let's Enter Wholesale Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}

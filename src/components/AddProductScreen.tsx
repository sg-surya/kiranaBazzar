import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { CATEGORIES, MOCK_PRODUCT_PRESETS } from '../data';
import { ArrowLeft, Plus, Trash2, Tag, ShoppingCart, Layers, Globe, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

interface AddProductScreenProps {
  sellerId: string;
  sellerName: string;
  editingProduct?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export default function AddProductScreen({
  sellerId,
  sellerName,
  editingProduct,
  onSave,
  onCancel
}: AddProductScreenProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [category, setCategory] = useState('grains_pulses');
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Sold Out'>('Active');
  
  // Delivery areas
  const [selectedCities, setSelectedCities] = useState<string[]>(['Delhi']);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodes, setPincodes] = useState<string[]>(['110001', '110085']);

  const PRESET_CITIES = ['Delhi', 'Noida', 'Gurugram', 'Lucknow', 'Mumbai', 'Bengaluru'];

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setPrice(editingProduct.price);
      setStockQuantity(editingProduct.stockQuantity);
      setCategory(editingProduct.category);
      setImage(editingProduct.image);
      setVideoUrl(editingProduct.videoUrl || '');
      setStatus(editingProduct.status);
      setSelectedCities(editingProduct.deliveryAreas?.cities || []);
      setPincodes(editingProduct.deliveryAreas?.pincodes || []);
    } else {
      // Default image to first preset
      setImage(MOCK_PRODUCT_PRESETS[0].image);
    }
  }, [editingProduct]);

  // Adjust status based on stock level
  useEffect(() => {
    if (stockQuantity === 0 || stockQuantity === '0') {
      setStatus('Sold Out');
    } else if (editingProduct && editingProduct.stockQuantity === 0 && stockQuantity > 0) {
      setStatus('Active');
    }
  }, [stockQuantity, editingProduct]);

  const handleApplyPreset = (preset: typeof MOCK_PRODUCT_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setPrice(preset.price);
    setDescription(preset.description);
    setImage(preset.image);
    if (stockQuantity === '' || stockQuantity === 0) {
      setStockQuantity(50); // Give default stock
    }
  };

  const handleAddPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincodeInput.trim().replace(/\D/g, '');
    if (clean.length === 6 && !pincodes.includes(clean)) {
      setPincodes([...pincodes, clean]);
      setPincodeInput('');
    }
  };

  const removePincode = (pin: string) => {
    setPincodes(pincodes.filter(p => p !== pin));
  };

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || stockQuantity === '') {
      alert('Please fill out Name, Price and Stock Quantity.');
      return;
    }

    if (pincodes.length === 0 && selectedCities.length === 0) {
      alert('Please specify at least one City or Pincode for wholesale distribution.');
      return;
    }

    const finalStatus = Number(stockQuantity) === 0 ? 'Sold Out' : status;

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category,
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      videoUrl: videoUrl.trim() || undefined,
      deliveryAreas: {
        cities: selectedCities,
        pincodes: pincodes
      },
      sellerId,
      sellerName,
      status: finalStatus,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    onSave(productData);
  };

  return (
    <div className="bg-slate-50 min-h-screen max-w-md mx-auto flex flex-col justify-between select-none">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4.5 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {editingProduct ? 'Edit B2B Product' : 'Add New Wholsale Stock'}
          </h2>
        </div>
        <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase">
          {sellerName.split('(')[0]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {/* Preset selector helper for Wholesalers */}
        {!editingProduct && (
          <div className="bg-gradient-to-br from-emerald-900 to-slate-950 rounded-2xl p-4 text-white shadow-md">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
              <h3 className="text-xs font-black uppercase font-mono tracking-widest text-emerald-300">
                Kirana Autofill Presets
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal mb-3">
              Wholesaler setup is simple. Select a high-demand item profile below to autofill beautiful images, prices, and specs!
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {MOCK_PRODUCT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="bg-white/10 hover:bg-white/15 text-white active:scale-95 text-[11px] font-semibold py-1.5 px-3 rounded-xl border border-white/10 shrink-0 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{p.name.split(' ')[0]}</span>
                  <span className="text-emerald-400 font-mono">₹{p.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pb-12">
          
          {/* General Fields Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                      category === cat.id
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/10'
                        : 'border-slate-100 bg-slate-50/50 text-slate-500'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-bold mt-1 line-clamp-1 leading-none">{cat.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="eg. Premium Mustard Oil (15L Tin)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Financial Parameters */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Wholesale Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="1200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-sm text-slate-900 font-bold font-mono focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Total Bulk Stock *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="50"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 font-bold font-mono focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Product Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Warehouse Status *
              </label>
              <div className="flex gap-2">
                {['Active', 'Inactive', 'Sold Out'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === st
                        ? st === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                          : st === 'Inactive'
                          ? 'bg-slate-200 text-slate-700 border-slate-400'
                          : 'bg-rose-100 text-rose-800 border-rose-500'
                        : 'bg-slate-50 text-slate-400 border-slate-100 font-medium'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                B2B Bulk Description
              </label>
              <textarea
                rows={3}
                placeholder="Minimum order requirements, pack sizes, weight, grain quality grades..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all resize-none font-medium"
              />
            </div>
            
          </div>

          {/* Media / Asset Container (Meesho/Blinkit style) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wide">
              Product Media Showcase
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Primary Product Image (URL) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 pl-11 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
              
              {image && (
                <div className="mt-3 w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 mx-auto relative group">
                  <img
                    src={image}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-bold bg-slate-900/80 px-2 py-1 rounded">Preset Verified</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Product Video Link <span className="text-[10px] text-slate-400 font-medium font-sans">(Optional YouTube / MP4 video)</span>
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Delivery & Logistics Areas */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wide">
              Logistics & Delivery Areas
            </h3>
            
            {/* Target Cities */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Selected Supply Cities
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CITIES.map((city) => {
                  const active = selectedCities.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`py-1.5 px-3 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Pincodes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Specific Pincodes Allowed
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="eg. 110085"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddPincode}
                  className="bg-slate-950 text-white font-bold px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer hover:bg-slate-900 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add PIN
                </button>
              </div>

              {pincodes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {pincodes.map((pin) => (
                    <span
                      key={pin}
                      className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono shadow-xs"
                    >
                      {pin}
                      <button
                        type="button"
                        onClick={() => removePincode(pin)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-amber-600 mt-2 font-medium">
                  ⚠️ No specific PIN restrictions set. Product will be live in whole city selection.
                </div>
              )}
            </div>
          </div>

          {/* Submit container */}
          <div className="pt-4 flex gap-3">
            <button
              onClick={onCancel}
              type="button"
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4.5 h-4.5" /> Save Product
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

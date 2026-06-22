import { Product, Category } from '../types';
import { CATEGORIES } from '../data';
import { Edit3, Trash2, Eye, EyeOff, AlertTriangle, PackageOpen, Truck, MapPin } from 'lucide-react';

interface ProductListScreenProps {
  products: Product[];
  categoryFilter?: string;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onTriggerAdd: () => void;
}

export default function ProductListScreen({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onTriggerAdd
}: ProductListScreenProps) {
  
  const getCategoryName = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.name || catId;
  };

  const getCategoryIcon = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.icon || '📦';
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* List Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Your Catalog</h3>
          <p className="text-xs text-slate-400">Total {products.length} wholesale profiles live</p>
        </div>
        <button
          onClick={onTriggerAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <span>+ Add Stock</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">No active products found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            You haven't listed any wholesale listings yet. Tap "Add Stock" to list your first grain, ghee, or tea sacks!
          </p>
          <button
            onClick={onTriggerAdd}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
          >
            Create product now &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex gap-3.5 relative overflow-hidden group hover:border-slate-300 transition-colors"
            >
              {/* Product Image Container */}
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Category Icon Badge */}
                <span className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {getCategoryIcon(p.category)}
                </span>

                {/* Left Mini Stock Status */}
                {p.stockQuantity === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-rose-500 text-white font-black uppercase text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded shadow-xs">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                      {getCategoryName(p.category)}
                    </span>
                    
                    {/* Status Badge */}
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      p.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Inactive'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mt-1">
                    {p.name}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-1.5 leading-snug font-medium mt-1">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-end justify-between mt-3.5 border-t border-slate-100/70 pt-2 bg-gradient-to-t from-slate-50/50 to-transparent p-1.5 rounded-lg">
                  {/* Financial Metrics */}
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      Wholesale Pool
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ₹{p.price}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">
                        ({p.stockQuantity} Left)
                      </span>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="flex gap-1.5 shrink-0">
                    {/* Toggle state bypass */}
                    <button
                      onClick={() => onToggleStatus(p.id)}
                      type="button"
                      title={p.status === 'Active' ? 'Set Inactive' : 'Set Active'}
                      className="w-7 h-7 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {p.status === 'Active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEdit(p)}
                      type="button"
                      title="Edit details"
                      className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(p.id)}
                      type="button"
                      title="Remove listing"
                      className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Delivery Logistics Snippet */}
                {(p.deliveryAreas?.cities?.length > 0 || p.deliveryAreas?.pincodes?.length > 0) && (
                  <div className="text-[9px] text-slate-400 bg-slate-50/50 p-1.5 rounded-lg border border-slate-50 flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                    <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Delivering to: {p.deliveryAreas.cities.concat(p.deliveryAreas.pincodes).join(', ')}
                    </span>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}

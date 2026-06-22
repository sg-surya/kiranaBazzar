import { useState } from 'react';
import { Product, Order } from '../types';
import { Package, TrendingUp, RefreshCw, Layers3, AlertCircle, ShoppingCart } from 'lucide-react';

interface InventoryScreenProps {
  products: Product[];
  orders: Order[];
  onUpdateStock: (productId: string, newStock: number) => void;
}

export default function InventoryScreen({ products, orders, onUpdateStock }: InventoryScreenProps) {
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [customStock, setCustomStock] = useState<string>('');

  // Calculate sold quantity per product from actual orders
  const getSoldQuantity = (prodId: string) => {
    return orders
      .filter((o) => o.productId === prodId && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.quantity, 0);
  };

  const getPercentageLeft = (rem: number, sold: number) => {
    const tot = rem + sold;
    if (tot === 0) return 0;
    return Math.round((rem / tot) * 100);
  };

  const startAdjusting = (p: Product) => {
    setAdjustingId(p.id);
    setCustomStock(p.stockQuantity.toString());
  };

  const saveCustomStock = (pId: string) => {
    const parsed = parseInt(customStock, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateStock(pId, parsed);
    }
    setAdjustingId(null);
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* Overview Stat Widgets */}
      <div className="bg-slate-900 rounded-3xl p-4.5 text-white shadow-lg space-y-4">
        <div>
          <h3 className="text-xs font-black uppercase font-mono tracking-widest text-emerald-400">
            Grain & Grocery Stock Engine
          </h3>
          <p className="text-sm font-bold text-slate-100 mt-1">Real-time Wholseale Inventory</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Total SKUs</span>
            <span className="text-2xl font-black font-mono text-white mt-1 block">
              {products.length}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Gatta Units</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
              {products.reduce((sum, p) => sum + p.stockQuantity, 0)}
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">B2B Ordered</span>
            <span className="text-2xl font-black font-mono text-yellow-400 mt-1 block">
              {orders.reduce((sum, o) => sum + o.quantity, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stock Table / Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Stock Sheet
        </h4>

        {products.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100/80 text-slate-400 text-xs font-medium">
            No products available to track inventory.
          </div>
        ) : (
          products.map((p) => {
            const soldQty = getSoldQuantity(p.id);
            const remaining = p.stockQuantity;
            const totalStockRecorded = remaining + soldQty;
            const pct = getPercentageLeft(remaining, soldQty);

            return (
              <div
                key={p.id}
                className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-4"
              >
                {/* Product Title and Category Badge */}
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{p.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono font-bold">
                      ID: {p.id.split('-')[1] || p.id} • {p.category.replace('_', ' ')}
                    </p>
                  </div>

                  {remaining === 0 ? (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-rose-200">
                      Sold Out
                    </span>
                  ) : remaining <= 5 ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-amber-200 animate-pulse">
                      Low Stock
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-emerald-200">
                      In Stock
                    </span>
                  )}
                </div>

                {/* Stock Level Bar Chart */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Remaining Ratio</span>
                    <span className="text-slate-800 font-bold font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        remaining === 0 ? 'bg-rose-500' : remaining <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Technical quantities row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">
                      Warehouse Lot
                    </span>
                    <span className="text-xs font-black font-mono text-slate-700 block mt-0.5">
                      {totalStockRecorded}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">
                      Sold out (B2B)
                    </span>
                    <span className="text-xs font-black font-mono text-slate-700 block mt-0.5">
                      {soldQty}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">
                      Left Stock
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-600 block mt-0.5">
                      {remaining}
                    </span>
                  </div>
                </div>

                {/* Direct Adjuster drawer */}
                <div className="pt-2 border-t border-slate-100">
                  {adjustingId === p.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-black font-mono text-slate-800 focus:outline-none focus:border-emerald-500 text-center"
                        value={customStock}
                        onChange={(e) => setCustomStock(e.target.value)}
                      />
                      <button
                        onClick={() => saveCustomStock(p.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
                      >
                        Apply Stock
                      </button>
                      <button
                        onClick={() => setAdjustingId(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-2 px-3 rounded-xl text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-100/30 p-2 rounded-xl transition-all border border-transparent hover:border-slate-100">
                      <span className="text-[11px] text-slate-400 font-semibold font-mono pl-1">
                        Tap +/- to change stock count
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateStock(p.id, Math.max(0, remaining - 5))}
                          className="w-10 h-8 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-slate-600 text-xs font-black transition-all font-mono shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => onUpdateStock(p.id, Math.max(0, remaining - 1))}
                          className="w-10 h-8 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-slate-600 text-xs font-black transition-all font-mono shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => onUpdateStock(p.id, remaining + 1)}
                          className="w-10 h-8 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 text-xs font-black transition-all font-mono shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onUpdateStock(p.id, remaining + 10)}
                          className="w-10 h-8 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 text-xs font-black transition-all font-mono shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => startAdjusting(p)}
                          className="ml-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-extrabold cursor-pointer"
                        >
                          Custom
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

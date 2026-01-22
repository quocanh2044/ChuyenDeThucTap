import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus, Minus, ShoppingBasket, Loader2 } from "lucide-react";
import { ConcessionItem, SelectedConcession } from "../types";
import { getConcessions } from "../services/api";

interface ConcessionSelectorProps {
  onBack: () => void;
  onContinue: (selected: SelectedConcession[], total: number) => void;
}

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:10000";

const ConcessionSelector: React.FC<ConcessionSelectorProps> = ({ onBack, onContinue }) => {
  const [concessionItems, setConcessionItems] = useState<ConcessionItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConcessions()
      .then((res) => setConcessionItems(res.concessions || res || []))
      .catch((err) => console.error("Lỗi:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  const getSelectedItems = (): SelectedConcession[] =>
    concessionItems
      .filter((item) => (quantities[item.id] || 0) > 0)
      .map((item) => ({ ...item, quantity: quantities[item.id] }));

  const selectedTotal = concessionItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || 0),
    0
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-950 pb-32 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bắp nước & Combo</h2>
            <p className="text-xs text-gray-500">Thêm vị cho buổi xem phim hoàn hảo</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {concessionItems.map((item) => {
            const qty = quantities[item.id] || 0;
            return (
              <div 
                key={item.id} 
                className={`group bg-gray-900 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1
                  ${qty > 0 ? "border-yellow-500 ring-1 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : "border-white/5 hover:border-white/20"}
                `}
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                  <img
                    src={`${IMAGE_URL}/${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  {qty > 0 && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black font-black px-3 py-1 rounded-full text-sm shadow-xl">
                      x{qty}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-black text-yellow-500">
                      {item.price.toLocaleString()} <span className="text-xs uppercase">đ</span>
                    </span>

                    <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      <button
                        onClick={() => handleUpdateQuantity(item.id.toString(), -1)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${qty > 0 ? "bg-gray-800 text-white hover:bg-gray-700" : "text-gray-600 cursor-not-allowed"}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-white text-lg">{qty}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id.toString(), 1)}
                        className="w-8 h-8 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl flex items-center justify-center transition-all active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 pl-4">
            <div className="hidden sm:flex w-12 h-12 bg-yellow-500/10 rounded-2xl items-center justify-center text-yellow-500">
              <ShoppingBasket />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Tạm tính</p>
              <p className="text-2xl font-black text-white leading-none">
                {selectedTotal.toLocaleString("vi-VN")} <span className="text-sm font-normal text-yellow-500">đ</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onContinue(getSelectedItems(), selectedTotal)}
            className="flex-1 sm:flex-none px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            TIẾP TỤC
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component cho trạng thái Loading nhìn xịn hơn
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-950 p-8">
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-gray-900 rounded-3xl p-4 h-80 animate-pulse border border-white/5">
          <div className="bg-gray-800 rounded-2xl w-full h-1/2 mb-4" />
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default ConcessionSelector;
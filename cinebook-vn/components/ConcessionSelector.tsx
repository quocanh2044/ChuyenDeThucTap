import React, { useState, useEffect } from "react";
import { ConcessionItem, SelectedConcession } from "../types";
import { getConcessions } from "../services/api";

interface ConcessionSelectorProps {
  onBack: () => void;
  onContinue: (selected: SelectedConcession[], total: number) => void;
}

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5001";

const ConcessionSelector: React.FC<ConcessionSelectorProps> = ({
  onBack,
  onContinue,
}) => {
  const [concessionItems, setConcessionItems] = useState<ConcessionItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD CONCESSIONS
  ========================= */
  useEffect(() => {
    getConcessions()
      .then((res) => {
        setConcessionItems(res.concessions || res || []);
      })
      .catch((err) => {
        console.error("Lỗi tải bắp nước:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     QUANTITY HANDLER
  ========================= */
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      return { ...prev, [itemId]: Math.max(0, current + delta) };
    });
  };

  /* =========================
     SELECTED ITEMS
  ========================= */
  const getSelectedItems = (): SelectedConcession[] =>
    concessionItems
      .filter((item) => (quantities[item.id] || 0) > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantities[item.id],
        description: item.description,
        image: item.image,
        type: item.type,
      }));

  const calculateTotal = () =>
    concessionItems.reduce(
      (sum, item) => sum + item.price * (quantities[item.id] || 0),
      0
    );

  const selectedTotal = calculateTotal();

  /* =========================
     LOADING UI
  ========================= */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
        <p>Đang tải danh sách bắp nước...</p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-24 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Quay lại chọn ghế
        </button>
        <h2 className="text-2xl font-bold text-white uppercase">
          Bắp nước & Combo
        </h2>
        <div className="w-20" />
      </div>

      {/* Concessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concessionItems.map((item) => {
          const qty = quantities[item.id] || 0;

          return (
            <div
              key={item.id}
              className={`bg-cinema-800 rounded-2xl overflow-hidden border transition-all
                ${qty > 0
                  ? "border-yellow-500 shadow-lg shadow-yellow-500/20"
                  : "border-white/10 hover:border-white/30"
                }`}
            >
              <div className="flex h-32">
                {/* IMAGE */}
                <div className="w-1/3 bg-gray-900 relative">
                  <img
                    src={`${IMAGE_URL}/${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.png";
                    }}
                  />
                  {qty > 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {qty}
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-yellow-500">
                      {item.price.toLocaleString()} đ
                    </span>

                    <div className="flex items-center bg-cinema-900 rounded-lg border border-gray-700">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id.toString(), -1)
                        }
                        disabled={qty === 0}
                        className="w-8 h-8 text-white disabled:text-gray-600"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-white">
                        {qty}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id.toString(), 1)
                        }
                        className="w-8 h-8 text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-cinema-900/95 border-t border-white/10 p-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-xl font-bold text-yellow-500">
            Tổng cộng: {selectedTotal.toLocaleString("vi-VN")} đ
          </p>
          <button
            onClick={() =>
              onContinue(getSelectedItems(), selectedTotal)
            }
            className="px-8 py-3 rounded-full bg-yellow-500 text-black font-bold hover:bg-yellow-400"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConcessionSelector;

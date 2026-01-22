import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { ConcessionItem } from "../types";
import { getConcessions } from "../services/api";

interface ConcessionSelectorProps {
  onBack: () => void;
  browseOnly?: boolean; // Dùng để chỉ xem không chọn
}

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:10000";

const ConcessionSelector: React.FC<ConcessionSelectorProps> = ({ onBack, browseOnly }) => {
  const [concessionItems, setConcessionItems] = useState<ConcessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConcessions()
      .then((res) => setConcessionItems(res.concessions || res || []))
      .catch((err) => console.error("Lỗi:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-950 pb-12 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            Bắp nước & Combo
          </h2>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {concessionItems.map((item) => (
            <div
              key={item.id}
              className="group bg-gray-900 rounded-3xl overflow-hidden border border-white/5 transition-all duration-300 transform hover:-translate-y-1 hover:border-white/20"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                <img
                  src={`${IMAGE_URL}/${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10 leading-relaxed">
                  {item.description}
                </p>

                <span className="text-xl font-black text-yellow-500">
                  {item.price.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs uppercase">đ</span>
                </span>

                {/* 🍿 Nút + trừ và checkout ẩn khi browseOnly = true */}
                {!browseOnly && (
                  <button
                    className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition"
                  >
                    Chọn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-950 p-8">
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="bg-gray-900 rounded-3xl p-4 h-80 animate-pulse border border-white/5"
        >
          <div className="bg-gray-800 rounded-2xl w-full h-1/2 mb-4" />
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default ConcessionSelector;

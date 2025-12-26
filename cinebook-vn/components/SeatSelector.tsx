import React, { useState, useEffect } from 'react';
import { Seat } from '../types';

interface SeatSelectorProps {
  price: number;
  onContinue: (selectedSeats: Seat[], total: number) => void;
  onBack: () => void;
}

const ROWS = 8;
const COLS = 10;

const SeatSelector: React.FC<SeatSelectorProps> = ({ price, onContinue, onBack }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Generate seats on mount
  useEffect(() => {
    const newSeats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    
    rows.forEach((row, rowIndex) => {
      for (let i = 1; i <= COLS; i++) {
        const isVip = rowIndex >= 5; // Rows F, G, H are VIP
        const isReserved = Math.random() < 0.2; // 20% random reserved seats
        
        newSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type: isVip ? 'vip' : 'standard',
          price: isVip ? price + 20000 : price,
          isReserved
        });
      }
    });
    setSeats(newSeats);
  }, [price]);

  const toggleSeat = (id: string, isReserved: boolean) => {
    if (isReserved) return;
    
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectedSeatObjects = seats.filter(s => selectedIds.has(s.id));
  const total = selectedSeatObjects.reduce((acc, s) => acc + s.price, 0);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
         <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          ← Quay lại
        </button>
        <h2 className="text-2xl font-bold text-white">Chọn ghế ngồi</h2>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* Screen Visual */}
      <div className="mb-10 relative">
        <div className="h-2 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full mb-4 shadow-[0_10px_30px_-5px_rgba(255,255,255,0.3)]"></div>
        <p className="text-center text-gray-500 text-sm uppercase tracking-widest">Màn hình chiếu</p>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto pb-8">
        <div className="grid grid-cols-10 gap-2 min-w-[600px] w-full max-w-[800px] mx-auto">
          {seats.map((seat) => (
            <button
              key={seat.id}
              disabled={seat.isReserved}
              onClick={() => toggleSeat(seat.id, seat.isReserved)}
              className={`
                aspect-square rounded-t-lg rounded-b-md text-xs font-medium transition-all duration-200 relative group
                flex items-center justify-center
                ${seat.isReserved 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600' 
                  : selectedIds.has(seat.id)
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50 scale-110 border border-yellow-400 z-10'
                    : seat.type === 'vip'
                      ? 'bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-700'
                      : 'bg-cinema-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                }
              `}
            >
              <span className="group-hover:hidden">{seat.row}{seat.number}</span>
              <span className="hidden group-hover:block">{seat.price/1000}k</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-400">
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-cinema-800 border border-gray-700 rounded"></div> Thường</div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-purple-900/50 border border-purple-700 rounded"></div> VIP</div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-yellow-500 rounded"></div> Đang chọn</div>
        <div className="flex items-center gap-2"><div className="w-5 h-5 bg-gray-700 border border-gray-600 rounded"></div> Đã đặt</div>
      </div>

      {/* Footer / Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-cinema-900/95 backdrop-blur border-t border-white/10 p-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-gray-400 text-sm">Ghế đang chọn: <span className="text-white font-medium">{selectedSeatObjects.map(s => s.id).join(', ') || 'Chưa chọn'}</span></p>
            <p className="text-xl font-bold text-yellow-500">Tổng cộng: {total.toLocaleString('vi-VN')} đ</p>
          </div>
          <button
            onClick={() => onContinue(selectedSeatObjects, total)}
            disabled={selectedIds.size === 0}
            className={`
              w-full sm:w-auto px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all
              ${selectedIds.size === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105 shadow-yellow-500/30'
              }
            `}
          >
            Tiếp tục
          </button>
        </div>
      </div>
      <div className="h-24"></div> {/* Spacer for fixed footer */}
    </div>
  );
};

export default SeatSelector;
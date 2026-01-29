import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Armchair, CheckCircle2, CreditCard, Info, Heart } from "lucide-react";
import { fetchMovieById, getShowtimes } from "../services/api";
import ConcessionSelector from "./ConcessionSelector";

/* ================= TYPES & CONSTANTS ================= */
type BookingStep = "seats" | "concessions" | "confirm";

const BASE_TICKET_PRICE = 55000;
const COUPLE_PRICE = 120000; // Tổng cho 2 ghế

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEAT_COLS = [1, 2, 3, 4, 5, 6, 7, 8];

// Cấu trúc lại COUPLE_SEATS để dễ quản lý theo cặp
const COUPLE_PAIRS = [
  ["E3", "E4"],
  ["E5", "E6"],
];
// Danh sách phẳng để kiểm tra nhanh
const ALL_COUPLE_SEATS = COUPLE_PAIRS.flat();

/* ================= COMPONENT ================= */
const BookingPage: React.FC<any> = ({ onCompleteBooking }) => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [step, setStep] = useState<BookingStep>("seats");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedConcessions, setSelectedConcessions] = useState<any[]>([]);
  const [concessionsTotal, setConcessionsTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchMovieById(id), getShowtimes(id)])
      .then(([movieRes, showtimeRes]) => {
        setMovie(movieRes);
        setShowtimes(Array.isArray(showtimeRes) ? showtimeRes : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const currentShowtime = showtimes.find((s) => s.id === selectedShowtimeId);

  /* ================= LOGIC CHỌN GHẾ MỚI ================= */
  const handleSeatClick = (seatId: string) => {
    const isCouple = ALL_COUPLE_SEATS.includes(seatId);
    let pair = isCouple ? COUPLE_PAIRS.find(p => p.includes(seatId)) || [] : [seatId];

    // Kiểm tra nếu ghế đã chọn thì bỏ chọn (cả cặp hoặc đơn)
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => !pair.includes(s)));
      return;
    }

    // Kiểm tra ghế đã có người đặt chưa
    const isAnyBooked = pair.some(s => currentShowtime?.bookedSeats.includes(s));
    if (isAnyBooked) return;

    // Logic kiểm tra liền kề cho ghế đơn (giữ nguyên yêu cầu cũ của bạn)
    if (!isCouple && selectedSeats.length > 0) {
      const row = seatId[0];
      const col = Number(seatId.slice(1));
      const isAdjacent = selectedSeats.some(s => {
        return s[0] === row && Math.abs(Number(s.slice(1)) - col) === 1;
      });
      if (!isAdjacent) {
        alert("⚠️ Vui lòng chọn ghế liền kề!");
        return;
      }
    }

    setSelectedSeats(prev => [...prev, ...pair]);
  };

  // Tính toán tiền vé dựa trên số lượng ghế đôi đã chọn
  const calculateTicketTotal = () => {
    let total = 0;
    let tempSelected = [...selectedSeats];
    
    COUPLE_PAIRS.forEach(pair => {
      if (pair.every(s => tempSelected.includes(s))) {
        total += COUPLE_PRICE;
        tempSelected = tempSelected.filter(s => !pair.includes(s));
      }
    });
    
    total += tempSelected.length * BASE_TICKET_PRICE;
    return total;
  };

  const ticketTotal = calculateTicketTotal();
  const finalTotal = ticketTotal + concessionsTotal;

  if (loading || !movie) return <div className="h-screen flex items-center justify-center text-white">Đang tải...</div>;

  /* ================= UI RENDER ================= */
  if (step === "concessions") return <ConcessionSelector onBack={() => setStep("seats")} onContinue={(items, total) => { setSelectedConcessions(items); setConcessionsTotal(total); setStep("confirm"); }} />;

  if (step === "confirm") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white"><CreditCard className="text-yellow-500" /> Thanh toán</h2>
          <div className="space-y-4 bg-gray-800/50 p-5 rounded-2xl mb-6">
            <div className="flex justify-between text-white"><span>Phim:</span><span className="font-bold uppercase">{movie.title}</span></div>
            <div className="flex justify-between text-white"><span>Ghế:</span><span className="text-yellow-500 font-bold">{selectedSeats.sort().join(", ")}</span></div>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-gray-700">
            <span className="text-white">Tổng cộng:</span>
            <span className="text-3xl font-black text-yellow-500">{finalTotal.toLocaleString()}đ</span>
          </div>
          <button onClick={() => onCompleteBooking(movie, selectedShowtimeId, selectedSeats, selectedConcessions, finalTotal, currentShowtime?.time)} className="mt-8 w-full py-4 bg-yellow-500 text-black font-black rounded-2xl">XÁC NHẬN</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Màn hình */}
          <div className="relative mb-16">
            <div className="w-full h-1 bg-yellow-500/50 rounded-full blur-sm"></div>
            <p className="text-center text-[10px] text-gray-500 tracking-[1em] mt-2 uppercase">Màn hình</p>
          </div>

          {/* Sơ đồ ghế */}
          <div className="flex flex-col gap-4 items-center">
            {SEAT_ROWS.map((row) => (
              <div key={row} className="flex gap-4 items-center">
                <span className="w-6 text-sm font-bold text-gray-600">{row}</span>
                <div className="flex gap-2">
                  {SEAT_COLS.map((col) => {
                    const seatId = `${row}${col}`;
                    const isBooked = currentShowtime?.bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isCouple = ALL_COUPLE_SEATS.includes(seatId);
                    
                    // Logic xác định viền cho ghế đôi để trông như một khối
                    const isLeftOfPair = COUPLE_PAIRS.some(p => p[0] === seatId);
                    const isRightOfPair = COUPLE_PAIRS.some(p => p[1] === seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isBooked || !selectedShowtimeId}
                        onClick={() => handleSeatClick(seatId)}
                        className={`
                          w-10 h-10 md:w-12 md:h-12 text-xs font-bold transition-all relative
                          ${isLeftOfPair ? "rounded-l-2xl border-r border-black/20" : isRightOfPair ? "rounded-r-2xl" : "rounded-xl"}
                          ${isBooked ? "bg-gray-800 text-gray-600 cursor-not-allowed" 
                            : isSelected ? "bg-yellow-500 text-black z-10 scale-105 shadow-lg"
                            : isCouple ? "bg-pink-600 text-white hover:bg-pink-500" 
                            : "bg-gray-700 text-white hover:bg-gray-600"}
                        `}
                      >
                        {isCouple && <Heart size={10} className="absolute top-1 left-1/2 -translate-x-1/2 opacity-50" />}
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Chú thích mới */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 p-6 bg-gray-900/50 rounded-3xl border border-gray-800">
            <LegendItem color="bg-gray-700" label="Ghế đơn" price="55k" />
            <LegendItem color="bg-pink-600" label="Ghế đôi (Sweetbox)" price="120k/cặp" isCouple />
            <LegendItem color="bg-yellow-500" label="Đang chọn" />
            <LegendItem color="bg-gray-800 opacity-50" label="Đã bán" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 h-fit sticky top-6">
          <h3 className="text-gray-500 text-xs font-black uppercase mb-4 tracking-widest">Suất chiếu</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {showtimes.map(st => (
              <button key={st.id} onClick={() => { setSelectedShowtimeId(st.id); setSelectedSeats([]); }} className={`py-3 rounded-xl font-bold ${selectedShowtimeId === st.id ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400"}`}>{st.time}</button>
            ))}
          </div>
          {selectedShowtimeId && (
            <div className="space-y-4 border-t border-gray-800 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Ghế: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "---"}</span>
                <span className="text-yellow-500 font-bold">{ticketTotal.toLocaleString()}đ</span>
              </div>
              <button disabled={selectedSeats.length === 0} onClick={() => setStep("concessions")} className="w-full py-4 bg-yellow-500 disabled:bg-gray-800 text-black rounded-2xl font-black">TIẾP TỤC</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, price, isCouple }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-6 h-6 ${color} ${isCouple ? "rounded-l-sm rounded-r-sm border-x border-black/20" : "rounded-lg"}`}></div>
    <div>
      <p className="text-[11px] text-white font-bold leading-tight">{label}</p>
      {price && <p className="text-[10px] text-gray-500">{price}</p>}
    </div>
  </div>
);

export default BookingPage;

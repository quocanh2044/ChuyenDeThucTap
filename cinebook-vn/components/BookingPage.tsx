import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Armchair, CheckCircle2, CreditCard, Info, AlertCircle } from "lucide-react";
import { fetchMovieById, getShowtimes } from "../services/api";
import ConcessionSelector from "./ConcessionSelector";

/* ================= TYPES ================= */
type BookingStep = "seats" | "concessions" | "confirm";

interface SelectedConcession {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Showtime {
  id: number;
  time: string;
  bookedSeats: string[];
}

/* ================= CONST ================= */
const BASE_TICKET_PRICE = 55000;
const COUPLE_PRICE = 120000; // 60k mỗi ghế * 2

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEAT_COLS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Định nghĩa GHẾ ĐÔI */
const COUPLE_SEATS = ["E3-E4", "E5-E6"];

/* ================= COMPONENT ================= */
const BookingPage: React.FC<any> = ({ onCompleteBooking }) => {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [step, setStep] = useState<BookingStep>("seats");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);

  /** 🔥 MULTI SEATS */
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [selectedConcessions, setSelectedConcessions] = useState<SelectedConcession[]>([]);
  const [concessionsTotal, setConcessionsTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([fetchMovieById(id), getShowtimes(id)])
      .then(([movieRes, showtimeRes]) => {
        setMovie(movieRes);
        setShowtimes(Array.isArray(showtimeRes) ? showtimeRes : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const currentShowtime = showtimes.find((s) => s.id === selectedShowtimeId);

  /* ================= HELPERS ================= */

  const isAdjacentSeat = (seat: string, selected: string[]) => {
    if (selected.length === 0) return true;
    const row = seat[0];
    const col = Number(seat.slice(1));
    return selected.every((s) => {
      const sRow = s[0];
      const sCol = Number(s.slice(1));
      return sRow === row && Math.abs(sCol - col) === 1;
    });
  };

  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }
    if (selectedSeats.length === 0) {
      setSelectedSeats([seatId]);
      return;
    }
    if (!isAdjacentSeat(seatId, selectedSeats)) {
      alert("⚠️ Chỉ được chọn ghế liền kề nhau");
      return;
    }
    setSelectedSeats((prev) => [...prev, seatId]);
  };

  const isCoupleSeat =
    selectedSeats.length === 2 &&
    (COUPLE_SEATS.includes(`${selectedSeats[0]}-${selectedSeats[1]}`) ||
      COUPLE_SEATS.includes(`${selectedSeats[1]}-${selectedSeats[0]}`));

  const ticketTotal = isCoupleSeat
    ? COUPLE_PRICE
    : selectedSeats.length * BASE_TICKET_PRICE;

  const finalTotal = ticketTotal + concessionsTotal;

  if (loading || !movie) {
    return <div className="h-screen flex items-center justify-center text-white font-medium">Đang tải dữ liệu phim...</div>;
  }

  /* ================= CONCESSIONS ================= */
  if (step === "concessions") {
    return (
      <ConcessionSelector
        onBack={() => setStep("seats")}
        onContinue={(items, total) => {
          setSelectedConcessions(items);
          setConcessionsTotal(total);
          setStep("confirm");
        }}
      />
    );
  }

  /* ================= CONFIRM ================= */
  if (step === "confirm") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
            <CreditCard className="text-yellow-500" /> Xác nhận thanh toán
          </h2>

          <div className="space-y-4 text-sm mb-6 bg-gray-800/50 p-5 rounded-2xl">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Phim</span>
              <span className="font-bold text-white uppercase">{movie.title}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Suất chiếu</span>
              <span className="font-bold text-white">{currentShowtime?.time}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Ghế đã chọn</span>
              <span className="text-yellow-500 font-bold uppercase">
                {selectedSeats.sort().join(", ")}
              </span>
            </div>
            {isCoupleSeat && (
              <div className="flex items-center gap-2 text-pink-500 font-bold animate-pulse">
                <span>💕 Ưu đãi Ghế đôi (Sweetbox) đã áp dụng</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white">
              <span>Tiền vé ({selectedSeats.length})</span>
              <span className="font-mono">{ticketTotal.toLocaleString()}đ</span>
            </div>
            {selectedConcessions.map((c) => (
              <div key={c.id} className="flex justify-between text-gray-400 italic">
                <span>{c.quantity}x {c.name}</span>
                <span className="font-mono">{(c.price * c.quantity).toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
            <span className="text-lg font-bold text-white">Tổng cộng</span>
            <span className="text-3xl font-black text-yellow-500">{finalTotal.toLocaleString()}đ</span>
          </div>

          <button
            onClick={() =>
              onCompleteBooking(
                movie,
                selectedShowtimeId,
                selectedSeats,
                selectedConcessions,
                finalTotal,
                currentShowtime?.time
              )
            }
            className="mt-8 w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            THANH TOÁN NGAY
          </button>
        </div>
      </div>
    );
  }

  /* ================= SEAT SELECT ================= */
  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* KHU VỰC GHẾ */}
        <div className="lg:col-span-2 space-y-12">
          {/* Màn hình */}
          <div className="relative mb-16">
            <div className="w-full h-2 bg-gradient-to-b from-yellow-500/50 to-transparent rounded-full blur-sm"></div>
            <div className="w-[80%] mx-auto h-1 bg-gray-700 shadow-[0_0_20px_rgba(234,179,8,0.3)]"></div>
            <p className="text-center text-[10px] text-gray-500 tracking-[1em] mt-2 uppercase">Màn hình chính</p>
          </div>

          <div className="flex flex-col gap-5 items-center">
            {SEAT_ROWS.map((row) => (
              <div key={row} className="flex gap-4 items-center">
                <span className="w-6 text-sm font-bold text-gray-600">{row}</span>
                <div className="flex gap-3">
                  {SEAT_COLS.map((col) => {
                    const seatId = `${row}${col}`;
                    const isBooked = currentShowtime?.bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isCouple = COUPLE_SEATS.some((c) => c.includes(seatId));

                    return (
                      <button
                        key={seatId}
                        disabled={isBooked || !selectedShowtimeId}
                        onClick={() => handleSeatClick(seatId)}
                        className={`
                          w-10 h-10 md:w-11 md:h-11 rounded-xl text-xs font-bold transition-all duration-200
                          ${isBooked
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                            : isSelected
                            ? "bg-yellow-500 text-black scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)] rotate-3"
                            : isCouple
                            ? "bg-pink-600 text-white hover:bg-pink-500"
                            : "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"}
                        `}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CHÚ THÍCH (LEGEND) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-900/50 rounded-3xl border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-700 rounded-lg"></div>
              <div>
                <p className="text-xs text-white font-bold">Ghế thường</p>
                <p className="text-[10px] text-gray-400">55.000đ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-pink-600 rounded-lg"></div>
              <div>
                <p className="text-xs text-white font-bold">Ghế đôi</p>
                <p className="text-[10px] text-gray-400">60.000đ / ghế</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-lg"></div>
              <p className="text-xs text-white font-bold">Ghế bạn chọn</p>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-6 h-6 bg-gray-800 rounded-lg border border-gray-700"></div>
              <p className="text-xs text-white font-bold">Ghế đã bán</p>
            </div>
          </div>

          {/* LƯU Ý QUAN TRỌNG */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex gap-4">
            <Info className="text-blue-400 shrink-0" size={24} />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-blue-300">Thông tin lưu ý</h4>
              <ul className="text-xs text-blue-200/70 space-y-1 list-disc pl-4">
                <li>Ghế đôi (E3-E4, E5-E6) chỉ được bán theo cặp.</li>
                <li>Hệ thống chỉ cho phép chọn các ghế nằm cạnh nhau.</li>
                <li>Vui lòng kiểm tra kỹ suất chiếu và ghế trước khi thanh toán.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SIDEBAR TỔNG KẾT */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 sticky top-6 shadow-xl">
            <h3 className="text-xs font-black uppercase mb-6 text-gray-500 tracking-widest flex items-center gap-2">
              <CheckCircle2 size={14} className="text-yellow-500" /> Suất chiếu hiện có
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {showtimes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedShowtimeId(st.id);
                    setSelectedSeats([]);
                  }}
                  className={`py-3 rounded-2xl font-bold transition-all ${
                    selectedShowtimeId === st.id
                      ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {st.time}
                </button>
              ))}
            </div>

            {selectedShowtimeId && (
              <div className="space-y-4 border-t border-gray-800 pt-6 animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Số ghế</p>
                    <p className="text-white font-black text-lg">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "---"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Tạm tính</p>
                    <p className="text-yellow-500 font-black text-xl">{ticketTotal.toLocaleString()}đ</p>
                  </div>
                </div>

                <button
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep("concessions")}
                  className="w-full py-4 bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-2xl font-black transition-all hover:bg-yellow-400"
                >
                  TIẾP TỤC CHỌN COMBO
                </button>
              </div>
            )}
            
            {!selectedShowtimeId && (
              <div className="text-center py-4 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                <p className="text-xs text-gray-500 italic">Vui lòng chọn suất chiếu để tiếp tục</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

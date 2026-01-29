import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Armchair, CheckCircle2, CreditCard, Info } from "lucide-react";
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
const COUPLE_PRICE = 120000;

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
      .finally(() => setLoading(false));
  }, [id]);

  const currentShowtime = showtimes.find((s) => s.id === selectedShowtimeId);

  /* ================= HELPERS ================= */

  /** Check ghế liền kề */
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

  /** Click ghế */
  const handleSeatClick = (seatId: string) => {
    // bỏ chọn
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      return;
    }

    // ghế đầu tiên
    if (selectedSeats.length === 0) {
      setSelectedSeats([seatId]);
      return;
    }

    // không liền kề
    if (!isAdjacentSeat(seatId, selectedSeats)) {
      alert("⚠️ Chỉ được chọn ghế liền kề nhau");
      return;
    }

    setSelectedSeats((prev) => [...prev, seatId]);
  };

  /** Check ghế đôi */
  const isCoupleSeat =
    selectedSeats.length === 2 &&
    COUPLE_SEATS.includes(`${selectedSeats[0]}-${selectedSeats[1]}`) ||
    COUPLE_SEATS.includes(`${selectedSeats[1]}-${selectedSeats[0]}`);

  const ticketTotal = isCoupleSeat
    ? COUPLE_PRICE
    : selectedSeats.length * BASE_TICKET_PRICE;

  const finalTotal = ticketTotal + concessionsTotal;

  /* ================= LOADING ================= */
  if (loading || !movie) {
    return <div className="h-screen flex items-center justify-center text-white">Đang tải...</div>;
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
        <div className="bg-gray-900 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <CreditCard /> Xác nhận thanh toán
          </h2>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span>Phim</span>
              <span className="font-bold">{movie.title}</span>
            </div>
            <div className="flex justify-between">
              <span>Suất chiếu</span>
              <span className="font-bold">{currentShowtime?.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Ghế</span>
              <span className="text-yellow-500 font-bold">
                {selectedSeats.join(", ")}
              </span>
            </div>
            {isCoupleSeat && (
              <div className="text-pink-500 font-bold">💕 Ghế đôi</div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tiền vé</span>
              <span>{ticketTotal.toLocaleString()}đ</span>
            </div>
            {selectedConcessions.map((c) => (
              <div key={c.id} className="flex justify-between text-gray-400">
                <span>{c.quantity}x {c.name}</span>
                <span>{(c.price * c.quantity).toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 text-xl font-black">
            <span>Tổng</span>
            <span className="text-yellow-500">{finalTotal.toLocaleString()}đ</span>
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
            className="mt-6 w-full py-4 bg-yellow-500 text-black font-black rounded-2xl"
          >
            THANH TOÁN
          </button>
        </div>
      </div>
    );
  }

  /* ================= SEAT SELECT ================= */
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* SEATS */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4 items-center">
            {SEAT_ROWS.map((row) => (
              <div key={row} className="flex gap-3 items-center">
                <span className="w-5 text-xs text-gray-500">{row}</span>
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
                        w-10 h-10 rounded-lg text-xs font-bold transition-all
                        ${isBooked
                          ? "bg-gray-800 text-gray-600"
                          : isSelected
                          ? "bg-yellow-500 text-black scale-110"
                          : isCouple
                          ? "bg-pink-600 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"}
                      `}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-3xl">
            <h3 className="text-xs uppercase mb-4 text-gray-400">Suất chiếu</h3>
            <div className="grid grid-cols-3 gap-2">
              {showtimes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedShowtimeId(st.id);
                    setSelectedSeats([]);
                  }}
                  className={`py-2 rounded-xl font-bold ${
                    selectedShowtimeId === st.id
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800"
                  }`}
                >
                  {st.time}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={selectedSeats.length < 2}
            onClick={() => setStep("concessions")}
            className="w-full py-4 bg-yellow-500 disabled:bg-gray-800 rounded-2xl font-black"
          >
            CHỌN BẮP NƯỚC
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

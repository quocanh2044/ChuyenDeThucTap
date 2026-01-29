import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { fetchMovieById, getShowtimes } from "../services/api";
import ConcessionSelector from "./ConcessionSelector";

/* ================= CONFIG ================= */
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";

const BASE_TICKET_PRICE = 55000;
const COUPLE_PRICE = 120000;

const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEAT_COLS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ================= TYPES ================= */
type BookingStep = "seats" | "concessions" | "confirm";
type SeatType = "NORMAL" | "COUPLE";

interface Seat {
  id: string;      // A1 | E3-E4
  row: string;
  cols: number[];
  type: SeatType;
}

interface Showtime {
  id: number;
  time: string;
  bookedSeats: string[];
}

interface SelectedConcession {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/* ================= SEAT MAP ================= */
/**
 * GHẾ ĐÔI chiếm chỗ E3-E4 và E5-E6
 * => BỎ E3, E4, E5, E6 khỏi ghế thường
 */
const COUPLE_SEATS: Seat[] = [
  { id: "E3-E4", row: "E", cols: [3, 4], type: "COUPLE" },
  { id: "E5-E6", row: "E", cols: [5, 6], type: "COUPLE" },
];

const NORMAL_SEATS: Seat[] = SEAT_ROWS.flatMap((row) =>
  SEAT_COLS
    .filter(
      (col) =>
        !(
          row === "E" &&
          [3, 4, 5, 6].includes(col)
        )
    )
    .map((col) => ({
      id: `${row}${col}`,
      row,
      cols: [col],
      type: "NORMAL",
    }))
);

const SEATS: Seat[] = [...NORMAL_SEATS, ...COUPLE_SEATS];

/* ================= COMPONENT ================= */
const BookingPage: React.FC<any> = ({ onCompleteBooking }) => {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [step, setStep] = useState<BookingStep>("seats");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const [selectedConcessions, setSelectedConcessions] = useState<SelectedConcession[]>([]);
  const [concessionsTotal, setConcessionsTotal] = useState(0);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!id) return;

    Promise.all([fetchMovieById(id), getShowtimes(id)])
      .then(([movieRes, showtimeRes]) => {
        setMovie(movieRes);
        setShowtimes(Array.isArray(showtimeRes) ? showtimeRes : []);
      });
  }, [id]);

  const currentShowtime = showtimes.find((s) => s.id === selectedShowtimeId);

  /* ================= PRICE ================= */
  const ticketPrice =
    selectedSeat?.type === "COUPLE" ? COUPLE_PRICE : BASE_TICKET_PRICE;

  const finalTotal = ticketPrice + concessionsTotal;

  if (!movie) {
    return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
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
        <div className="bg-gray-900 p-8 rounded-3xl">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <CreditCard /> Xác nhận đơn hàng
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
              <span className="text-yellow-500 font-bold">{selectedSeat?.id}</span>
            </div>
            {selectedSeat?.type === "COUPLE" && (
              <div className="text-pink-500 font-bold">💕 Ghế đôi</div>
            )}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tiền vé</span>
              <span>{ticketPrice.toLocaleString()}đ</span>
            </div>
            {selectedConcessions.map((c) => (
              <div key={c.id} className="flex justify-between text-gray-400">
                <span>{c.quantity}x {c.name}</span>
                <span>{(c.price * c.quantity).toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xl font-black mt-6">
            <span>Tổng</span>
            <span className="text-yellow-500">{finalTotal.toLocaleString()}đ</span>
          </div>

          <button
            onClick={() =>
              onCompleteBooking(
                movie,
                selectedShowtimeId,
                selectedSeat,
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
        {/* SEAT MAP */}
        <div className="lg:col-span-2 space-y-4">
          {SEAT_ROWS.map((row) => (
            <div key={row} className="flex gap-3 items-center">
              <span className="w-6 text-gray-500">{row}</span>
              {SEATS.filter((s) => s.row === row).map((seat) => {
                const isBooked = currentShowtime?.bookedSeats.includes(seat.id);
                const isSelected = selectedSeat?.id === seat.id;

                return (
                  <button
                    key={seat.id}
                    disabled={isBooked || !selectedShowtimeId}
                    onClick={() => setSelectedSeat(seat)}
                    className={`
                      h-10 rounded-xl text-xs font-bold transition-all
                      ${seat.type === "COUPLE" ? "w-[90px]" : "w-10"}
                      ${isBooked
                        ? "bg-gray-800 text-gray-600"
                        : isSelected
                        ? "bg-yellow-500 text-black scale-105"
                        : seat.type === "COUPLE"
                        ? "bg-pink-600 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"}
                    `}
                  >
                    {seat.type === "COUPLE" ? "💕" : seat.cols[0]}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-3xl">
            <h3 className="text-xs uppercase text-gray-400 mb-4">Suất chiếu</h3>
            <div className="grid grid-cols-3 gap-2">
              {showtimes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedShowtimeId(st.id);
                    setSelectedSeat(null);
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

          <div className="bg-gray-900 p-6 rounded-3xl">
            <img
              src={`${IMAGE_URL}/${movie.image}`}
              alt={movie.title}
              className="w-24 h-32 object-cover rounded-xl mb-3"
            />
            <h4 className="font-bold">{movie.title}</h4>
            <p className="text-sm text-gray-400">
              {movie.duration} phút • {movie.ageRating}
            </p>
          </div>

          <button
            disabled={!selectedSeat}
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

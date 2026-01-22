import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Monitor, Info, Armchair, CheckCircle2, CreditCard } from "lucide-react";
import { fetchMovieById, getShowtimes } from "../services/api";
import ConcessionSelector from "./ConcessionSelector";

// Interfaces & Types
type BookingStep = 'seats' | 'concessions' | 'confirm';
interface SelectedConcession { id: string; name: string; price: number; quantity: number; }
interface Showtime { id: number; time: string; bookedSeats: string[]; }

const BASE_TICKET_PRICE = 55000;
const SEAT_ROWS = ["A", "B", "C", "D", "E"];
const SEAT_COLS = [1, 2, 3, 4, 5, 6, 7, 8];

const BookingPage: React.FC<any> = ({ onCompleteBooking }) => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<any>(null);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [step, setStep] = useState<BookingStep>('seats');
    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [selectedConcessions, setSelectedConcessions] = useState<SelectedConcession[]>([]);
    const [concessionsTotal, setConcessionsTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [movieRes, showtimeRes] = await Promise.all([fetchMovieById(id), getShowtimes(id)]);
                setMovie(movieRes);
                setShowtimes(Array.isArray(showtimeRes) ? showtimeRes : []);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        loadData();
    }, [id]);

    const currentShowtime = showtimes.find(st => st.id === selectedShowtimeId);
    const finalTotal = BASE_TICKET_PRICE + concessionsTotal;

    // Render Steps Indicator
    const renderSteps = () => (
        <div className="flex items-center justify-center mb-10 space-x-4">
            {[ 
                { id: 'seats', label: 'Chọn ghế', icon: <Armchair size={18}/> },
                { id: 'concessions', label: 'Bắp nước', icon: <Info size={18}/> },
                { id: 'confirm', label: 'Thanh toán', icon: <CheckCircle2 size={18}/> }
            ].map((s, idx) => (
                <React.Fragment key={s.id}>
                    <div className={`flex items-center gap-2 ${step === s.id ? 'text-yellow-500' : 'text-gray-500'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === s.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700'}`}>
                            {s.icon}
                        </span>
                        <span className="text-sm font-bold hidden md:block">{s.label}</span>
                    </div>
                    {idx < 2 && <div className="w-12 h-[1px] bg-gray-800" />}
                </React.Fragment>
            ))}
        </div>
    );

    if (loading || !movie) return <div className="h-screen flex items-center justify-center text-white">Đang tải...</div>;

    // --- RENDER CONCESSIONS ---
    if (step === 'concessions') {
        return (
            <ConcessionSelector
                onBack={() => setStep('seats')}
                onContinue={(items, total) => {
                    setSelectedConcessions(items);
                    setConcessionsTotal(total);
                    setStep('confirm');
                }}
            />
        );
    }

    // --- RENDER CONFIRMATION ---
    if (step === 'confirm') {
        return (
            <div className="max-w-2xl mx-auto p-6 animate-in zoom-in duration-300">
                <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl"><CreditCard size={32}/></div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Xác nhận đơn hàng</h2>
                            <p className="text-gray-400">Vui lòng kiểm tra lại thông tin</p>
                        </div>
                    </div>

                    <div className="space-y-4 border-b border-white/5 pb-6 mb-6">
                        <div className="flex justify-between"><span className="text-gray-400">Phim</span><span className="text-white font-bold">{movie.title}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Suất chiếu</span><span className="text-white font-bold">{currentShowtime?.time}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Ghế đã chọn</span><span className="text-yellow-500 font-bold">{selectedSeat}</span></div>
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Giá vé</span><span>{BASE_TICKET_PRICE.toLocaleString()}đ</span></div>
                        {selectedConcessions.map(c => (
                            <div key={c.id} className="flex justify-between text-sm text-gray-400">
                                <span>{c.quantity}x {c.name}</span>
                                <span>{(c.price * c.quantity).toLocaleString()}đ</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl mb-8">
                        <span className="font-bold">Tổng cộng</span>
                        <span className="text-3xl font-black text-yellow-500">{finalTotal.toLocaleString()}đ</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setStep('concessions')} className="py-4 rounded-2xl bg-gray-800 font-bold hover:bg-gray-700 transition-all">Quay lại</button>
                        <button onClick={() => onCompleteBooking(movie, selectedShowtimeId, selectedSeat, selectedConcessions, finalTotal, currentShowtime?.time)} 
                                className="py-4 rounded-2xl bg-yellow-500 text-black font-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all">
                            THANH TOÁN
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER SEAT SELECTION ---
    return (
        <div className="max-w-6xl mx-auto p-6">
            {renderSteps()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Seat Map */}
                <div className="lg:col-span-2">
                    <div className="mb-10 text-center">
                        <div className="w-full h-2 bg-gradient-to-b from-yellow-500/50 to-transparent rounded-full mb-2 blur-sm" />
                        <p className="text-xs text-yellow-500/50 tracking-[1em] uppercase">Màn hình</p>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        {SEAT_ROWS.map(row => (
                            <div key={row} className="flex gap-3 items-center">
                                <span className="w-5 text-gray-600 font-bold text-xs">{row}</span>
                                {SEAT_COLS.map(col => {
                                    const seatId = `${row}${col}`;
                                    const isBooked = currentShowtime?.bookedSeats?.includes(seatId);
                                    const isSelected = selectedSeat === seatId;
                                    
                                    return (
                                        <button
                                            key={seatId}
                                            disabled={isBooked || !selectedShowtimeId}
                                            onClick={() => setSelectedSeat(seatId)}
                                            className={`
                                                w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                                                ${isBooked ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 
                                                  isSelected ? 'bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/40' : 
                                                  'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'}
                                            `}
                                        >
                                            {col}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Seat Legend */}
                    <div className="flex justify-center gap-6 mt-12 text-xs text-gray-400">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded" /> Trống</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded" /> Đang chọn</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-800 rounded" /> Đã đặt</div>
                    </div>
                </div>

                {/* Right: Showtime & Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-3xl p-6 border border-white/5">
                        <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">1. Chọn suất chiếu</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {showtimes.map(st => (
                                <button 
                                    key={st.id}
                                    onClick={() => { setSelectedShowtimeId(st.id); setSelectedSeat(null); }}
                                    className={`py-2 rounded-xl text-sm font-bold transition-all ${selectedShowtimeId === st.id ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                >
                                    {st.time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-3xl p-6 border border-white/5">
                        <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">2. Thông tin vé</h3>
                        <div className="flex gap-4 mb-4">
                            <img src={movie.image} className="w-20 h-28 object-cover rounded-xl shadow-lg" alt="" />
                            <div>
                                <h4 className="font-bold text-white line-clamp-1">{movie.title}</h4>
                                <p className="text-xs text-gray-500 mb-2">{movie.duration} phút • {movie.ageRating}</p>
                                {selectedSeat && (
                                    <div className="inline-block bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                                        Ghế: {selectedSeat}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Tạm tính:</span>
                            <span className="text-2xl font-black text-white">{selectedSeat ? BASE_TICKET_PRICE.toLocaleString() : 0}đ</span>
                        </div>
                    </div>

                    <button
                        disabled={!selectedSeat}
                        onClick={() => setStep('concessions')}
                        className="w-full py-4 bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-black font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-yellow-500/10"
                    >
                        CHỌN BẮP NƯỚC
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
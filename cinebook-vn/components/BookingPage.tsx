// components/BookingPage.tsx (Đã fix logic hiển thị và xử lý lỗi)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieById, getShowtimes } from "../services/api";
import ConcessionSelector from "./ConcessionSelector";

// Các interface đã định nghĩa (Giữ nguyên)
interface SelectedConcession {
    id: string;
    name: string;
    price: number;
    quantity: number;
}
type BookingStep = 'selectSeats' | 'selectConcessions' | 'confirmBooking';

interface Showtime {
    id: number;
    time: string;
    bookedSeats: string[];
}

interface BookingPageProps {
    onCompleteBooking: (
        movie: any,
        selectedShowtimeId: number,
        selectedSeat: string,
        concessions: SelectedConcession[],
        finalTotal: number,
        time: string
    ) => void;
}

const BASE_TICKET_PRICE = 55000;

const seats = [
    "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8",
    "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8",
    "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
    "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8",
    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8",
];

const BookingPage: React.FC<BookingPageProps> = ({ onCompleteBooking }) => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<any>(null);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);

    const [step, setStep] = useState<BookingStep>('selectSeats');
    const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [currentBookedSeats, setCurrentBookedSeats] = useState<string[]>([]);
    const [selectedConcessions, setSelectedConcessions] = useState<SelectedConcession[]>([]);
    const [concessionsTotal, setConcessionsTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedShowtimeDetails, setSelectedShowtimeDetails] = useState<Showtime | null>(null);


    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const movieRes = await fetchMovieById(id);
                // Đã fix logic xử lý kết quả getShowtimes
                const showtimeRes = await getShowtimes(id);

                setMovie(movieRes);
                // Lấy trực tiếp kết quả trả về, không dùng .showtimes và đảm bảo nó là mảng
                setShowtimes(Array.isArray(showtimeRes) ? showtimeRes : []);

                setError(null);
            } catch (err: any) {
                console.error("Lỗi tải dữ liệu phim/suất chiếu:", err);
                setError(`Lỗi tải dữ liệu: ${err.message}. Vui lòng kiểm tra console Server (Lỗi 500).`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleShowtimeSelect = (showtime: Showtime) => {
        if (step !== 'selectSeats') return;

        setSelectedShowtimeId(showtime.id);
        setSelectedShowtimeDetails(showtime);
        // Đảm bảo bookedSeats là mảng
        setCurrentBookedSeats(Array.isArray(showtime.bookedSeats) ? showtime.bookedSeats : []);
        setSelectedSeat(null);
    };

    const handleContinueToConcessions = () => {
        if (!selectedSeat) {
            alert("Vui lòng chọn ghế trước khi tiếp tục!");
            return;
        }
        setStep('selectConcessions');
    };

    const handleConcessionsBack = () => {
        setStep('selectSeats');
    };

    const handleConcessionsContinue = (selected: SelectedConcession[], total: number) => {
        setSelectedConcessions(selected);
        setConcessionsTotal(total);
        setStep('confirmBooking');
    };

    const handleConfirmAndPay = () => {
        if (!movie || !selectedShowtimeId || !selectedSeat || !selectedShowtimeDetails) return;

        const ticketPrice = BASE_TICKET_PRICE;
        const finalTotal = ticketPrice + concessionsTotal;

        onCompleteBooking(
            movie,
            selectedShowtimeId,
            selectedSeat,
            selectedConcessions,
            finalTotal,
            selectedShowtimeDetails.time
        );
    };


    if (error) return <p className="text-red-500 p-4 font-bold">⚠️ {error}</p>;
    if (loading || !movie) return <p className="text-white p-4">Đang tải...</p>;


    // Logic chuyển bước render (Giữ nguyên)
    if (step === 'selectConcessions') {
        return (
            <ConcessionSelector
                onBack={handleConcessionsBack}
                onContinue={handleConcessionsContinue}
            />
        );
    }
    if (step === 'confirmBooking') {
        const ticketPrice = BASE_TICKET_PRICE;
        const finalTotal = ticketPrice + concessionsTotal;
        return (
            <div className="p-6 text-white max-w-lg mx-auto bg-cinema-800 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-yellow-500">Xác nhận đơn hàng</h1>
                <p className="text-lg mb-2">Phim: <span className="font-semibold">{movie.title}</span></p>
                <p className="mb-4">Ghế: <span className="font-semibold text-green-400">{selectedSeat}</span></p>

                <h2 className="text-xl font-semibold mt-4 mb-2 border-b border-gray-700 pb-1">Chi tiết thanh toán</h2>

                <div className="flex justify-between text-gray-300">
                    <span>Vé người lớn (1x)</span>
                    <span>{ticketPrice.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="mt-4">
                    <h3 className="font-medium text-white mb-2">Bắp nước & Combo:</h3>
                    {selectedConcessions.length > 0 ? (
                        <ul>
                            {selectedConcessions.map(c => (
                                <li key={c.id} className="flex justify-between text-gray-300 text-sm ml-2">
                                    <span>{c.quantity} x {c.name}</span>
                                    <span>{(c.price * c.quantity).toLocaleString('vi-VN')} đ</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-sm ml-2">Không chọn bắp nước.</p>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <p className="text-xl font-bold">Tổng Thanh Toán:</p>
                    <p className="text-2xl font-bold text-yellow-500">{finalTotal.toLocaleString('vi-VN')} đ</p>
                </div>

                <div className="flex justify-between gap-4 mt-6">
                    <button onClick={handleConcessionsBack} className="flex-1 py-2 rounded font-medium bg-gray-600 hover:bg-gray-500">
                        ← Quay lại
                    </button>
                    <button
                        onClick={handleConfirmAndPay}
                        className="flex-1 py-3 rounded font-bold text-lg bg-red-600 hover:bg-red-500"
                        disabled={loading}
                    >
                        Chọn Phương Thức
                    </button>
                </div>
            </div>
        );
    }

    // 🟢 LOGIC POSTER FALLBACK VÀ FIX TÊN TRƯỜNG 
    const fallbackPoster = "https://via.placeholder.com/300x450?text=MOVIE+POSTER+Missing";

    // 💡 ĐÃ SỬA: Lấy từ movie.image (Backend) thay vì movie.poster
    const posterUrl = movie.image && typeof movie.image === 'string' && movie.image.length > 5
        ? movie.image
        : fallbackPoster;

    return (
        <div className="p-6 text-white max-w-6xl mx-auto">

            {/* KHỐI HIỂN THỊ CHI TIẾT PHIM (Giữ nguyên) */}
            <div className="bg-cinema-800 p-6 rounded-xl shadow-2xl mb-8 flex flex-col md:flex-row gap-6 border border-white/10">
                <img
                    src={posterUrl} // Đã sử dụng posterUrl đã sửa
                    alt={movie.title}
                    className="w-full md:w-48 h-64 object-cover rounded-lg shadow-lg flex-shrink-0"
                    onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = fallbackPoster;
                    }}
                />
                {/* ... (Phần chi tiết phim) ... */}
                <div>
                    <h1 className="text-4xl font-extrabold text-yellow-500 mb-2">{movie.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                        <span className="bg-red-600 px-2 py-0.5 rounded font-bold text-xs">{movie.ageRating || 'C13'}</span>
                        <span>Thời lượng: **{movie.duration} phút**</span>
                        <span>Đánh giá: **{movie.rating}** ★</span>
                    </div>

                    <h2 className="text-xl font-semibold mt-4 mb-2">Tóm tắt:</h2>
                    <p className="text-gray-300 line-clamp-4">{movie.description || 'Đang cập nhật tóm tắt phim.'}</p>

                    <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                        <p className="text-gray-400">Thể loại: {movie.genres?.join(', ') || 'Hành động, Phiêu lưu'}</p>
                        <p className="text-gray-400">Đạo diễn: {movie.director || 'Chưa rõ'}</p>
                    </div>

                </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold border-b border-gray-700 pb-2">1. Chọn suất chiếu và Ghế</h2>

            {/* Suất chiếu */}
            <h3 className="mt-6 text-lg font-semibold">Chọn suất chiếu</h3>
            <div className="flex flex-wrap gap-3 mt-2">
                {showtimes.length > 0 ? (
                    showtimes.map((st) => (
                        <button
                            key={st.id}
                            onClick={() => handleShowtimeSelect(st)}
                            className={`px-4 py-2 rounded font-medium transition-colors ${selectedShowtimeId === st.id
                                ? "bg-yellow-500 text-black shadow-md"
                                : "bg-gray-700 hover:bg-gray-600"
                                }`}
                        >
                            {st.time}
                        </button>
                    ))
                ) : (
                    <p className="text-gray-400">Không có suất chiếu nào cho phim này. Vui lòng kiểm tra dữ liệu showtimes.</p>
                )}
            </div>

            {/* Chọn ghế */}
            {selectedShowtimeId && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold">Chọn ghế</h3>
                    <p className="text-sm text-gray-400 mb-3">
                        Giá vé cơ bản: <span className="font-semibold text-white">{BASE_TICKET_PRICE.toLocaleString('vi-VN')} đ</span>/ghế.
                    </p>

                    <div className="grid grid-cols-8 gap-2 mt-2 max-w-lg mx-auto p-4 bg-cinema-900 rounded-lg border border-gray-700">
                        <div className="col-span-8 text-center text-xs text-yellow-500 mb-4 py-2 border-b-4 border-yellow-500/50">MÀN HÌNH</div>

                        {seats.map((seat) => {
                            // ĐẢM BẢO currentBookedSeats LUÔN LÀ MẢNG
                            const isBooked = Array.isArray(currentBookedSeats) && currentBookedSeats.includes(seat);

                            let buttonClass = "bg-gray-700 hover:bg-gray-600";
                            let onClickHandler = () => setSelectedSeat(seat);

                            if (isBooked) {
                                buttonClass = "bg-red-900 cursor-not-allowed text-white opacity-50";
                                onClickHandler = () => { };
                            } else if (selectedSeat === seat) {
                                buttonClass = "bg-green-500 hover:bg-green-600";
                            }

                            return (
                                <button
                                    key={seat}
                                    onClick={onClickHandler}
                                    className={`px-2 py-2 rounded text-sm font-bold ${buttonClass} transition-all duration-150`}
                                    disabled={isBooked}
                                >
                                    {seat}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Nút chuyển bước */}
            <button
                onClick={handleContinueToConcessions}
                className="mt-8 w-full bg-yellow-500 py-3 rounded text-lg font-bold text-black hover:bg-yellow-400 transition-transform transform hover:scale-[1.005]"
                disabled={loading || !selectedSeat}
            >
                {selectedSeat ? `Tiếp tục chọn Bắp nước & Combo (Ghế: ${selectedSeat})` : 'Vui lòng chọn ghế để tiếp tục'}
            </button>
        </div>
    );
};

export default BookingPage;
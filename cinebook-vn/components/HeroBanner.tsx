import React, { useState, useEffect } from "react";
// 🟢 IMPORT HOOK TỪ REACT ROUTER
import { useNavigate } from 'react-router-dom';
import { Movie } from "../types";

interface HeroBannerProps {
  movies: Movie[];
  onBookNow: (movie: Movie) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onBookNow }) => {
  // 🟢 KHAI BÁO HOOK CHUYỂN HƯỚNG
  const navigate = useNavigate();

  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ===== LỌC ĐÚNG isNowPlaying =====
  useEffect(() => {
    if (movies && movies.length > 0) {
      // Dùng kiểm tra nghiêm ngặt (===) là an toàn nhất nếu bạn biết kiểu dữ liệu của Backend
      const filtered = movies.filter((m) => m.isNowPlaying === true || m.isNowPlaying === 1);
      setNowPlayingMovies(filtered);
    }
  }, [movies]);

  // Auto slide mỗi 4 giây
  useEffect(() => {
    if (nowPlayingMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === nowPlayingMovies.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [nowPlayingMovies]);

  if (nowPlayingMovies.length === 0)
    return <div className="text-white p-10">Không có phim đang chiếu</div>;

  const movie = nowPlayingMovies[currentIndex];

  // ===========================================
  // ✨ HÀM KIỂM TRA ĐĂNG NHẬP VÀ ĐẶT VÉ
  // ===========================================
  const handleBookNow = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // 1. Thông báo cho người dùng
      alert("Vui lòng đăng nhập để đặt vé.");

      // 2. Chuyển hướng đến trang đăng nhập
      navigate('/login');

      return;
    }

    // 3. Nếu ĐÃ đăng nhập, thực hiện hành động mặc định (chuyển đến trang đặt vé)
    onBookNow(movie);
  };
  // ===========================================


  const poster =
    movie.image ||
    movie.bannerUrl ||
    movie.poster ||
    "https://via.placeholder.com/1600x600?text=No+Banner+Image";

  return (
    <div className="relative w-full h-[420px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-xl shadow-xl">

      {/* Background Image */}
      <img
        src={poster}
        alt={movie.title}
        className="w-full h-full object-cover transition-all duration-700"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
        <div className="px-6 md:px-12 lg:px-20 max-w-xl space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            {movie.title}
          </h2>
          <p className="text-white/80 hidden md:block text-lg line-clamp-3">
            {movie.description}
          </p>

          <button
            // 🟢 GẮN HÀM KIỂM TRA ĐĂNG NHẬP VÀO NÚT
            onClick={handleBookNow}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition"
          >
            Đặt vé ngay
          </button>
        </div>
      </div>

      {/* Small Index Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {nowPlayingMovies.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? "bg-red-500 scale-125" : "bg-white/40"
              }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
import React from "react";
import { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {

  // ====== FIX ẢNH ======
  const poster = movie.image
    ? movie.image
    : "https://placehold.co/400x600?text=No+Image";

  // ====== FIX RATING KHÔNG PHẢI NUMBER ======
  const ratingValue = Number(movie.rating) || 0;

  const duration = movie.duration ?? 0;
  const isComingSoon = Boolean(movie.releaseDate);

  const releaseDateText = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
    : "";

  return (
    <div
      onClick={() => onClick(movie)}
      className="
        group relative bg-cinema-800 rounded-xl overflow-hidden shadow-lg 
        transition-all duration-300 hover:scale-[1.02]
        hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer
      "
    >
      <div className="relative aspect-[2/3] overflow-hidden">

        <img
          src={poster}
          alt={movie.title}
          loading="lazy"
          className={`
            w-full h-full object-cover transition-transform duration-500 
            group-hover:scale-110
            ${isComingSoon ? "grayscale-[30%] group-hover:grayscale-0" : ""}
          `}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80" />

        {isComingSoon && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Sắp chiếu
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{movie.title}</h3>

          <div className="flex items-center justify-between text-sm text-gray-300">
            {isComingSoon ? (
              <span className="text-yellow-400 font-medium">
                {releaseDateText}
              </span>
            ) : (
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                {ratingValue.toFixed(1)} ★
              </span>
            )}

            <span>{duration} phút</span>
          </div>
        </div>
      </div>

      <div className="
        absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]
        opacity-0 group-hover:opacity-100 transition-opacity
      ">
        <button
          className={`
            font-bold py-2 px-6 rounded-full transform scale-90 group-hover:scale-100 
            transition-transform shadow-lg
            ${isComingSoon
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-yellow-500 text-black shadow-yellow-500/50"}
          `}
        >
          {isComingSoon ? "Xem Chi Tiết" : "Đặt Vé Ngay"}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;

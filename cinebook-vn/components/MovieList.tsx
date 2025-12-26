// components/MovieList.tsx
import { useEffect, useState } from "react";
import { getNowPlaying, getUpcoming } from "../services/api";
import MovieCard from "./MovieCard";
import { Movie } from "../types";

// 🟢 KHAI BÁO PROPS CHO ĐIỀU HƯỚNG
interface MovieListProps {
    onBookNow: (movieId: number) => void;
}

// 🟢 NHẬN PROPS ONBOOKNOW
const MovieList: React.FC<MovieListProps> = ({ onBookNow }) => {
    const [tab, setTab] = useState("now");
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        const fetchMovies = async () => {
            const data = tab === "now"
                ? await getNowPlaying()
                : await getUpcoming();

            const fixedMovies = (data.movies || []).map((m: any) => ({
                ...m,
                rating: m.rating ? Number(m.rating) : 0,
                isNowPlaying: tab === "now"
            }));

            setMovies(fixedMovies);
        };

        fetchMovies();
    }, [tab]);

    // 🟢 GỌI PROP ONBOOKNOW ĐỂ ĐIỀU HƯỚNG
    const handleClickMovie = (movie: Movie) => {
        onBookNow(Number(movie.id));
    };

    return (
        <div className="pt-8 px-6 max-w-7xl mx-auto">
            {/* Tabs (Giữ nguyên) */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    className={`text-lg font-semibold pb-1 border-b-2 transition-all ${tab === "now"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-transparent text-gray-400"
                        }`}
                    onClick={() => setTab("now")}
                >
                    🎬 Đang chiếu
                </button>

                <button
                    className={`text-lg font-semibold pb-1 border-b-2 transition-all ${tab === "upcoming"
                        ? "border-yellow-500 text-yellow-400"
                        : "border-transparent text-gray-400"
                        }`}
                    onClick={() => setTab("upcoming")}
                >
                    🎞 Sắp chiếu
                </button>
            </div>

            {/* Grid phim */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onClick={handleClickMovie} />
                ))}
            </div>

            {movies.length === 0 && (
                <p className="text-gray-400 mt-10 text-center text-lg">Đang tải phim...</p>
            )}
        </div>
    );
};

export default MovieList;
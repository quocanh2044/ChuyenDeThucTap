// components/SearchResultsPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { Movie } from '../types';
import MovieCard from './MovieCard';

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                // 🟢 Gọi API tìm kiếm (Giả định hàm này tồn tại trong services/api.ts)
                const data = await searchMovies(query);

                setResults(data.movies || []);

            } catch (err) {
                console.error("Lỗi tìm kiếm phim:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    // Hàm điều hướng khi click vào phim trong kết quả tìm kiếm
    const handleMovieClick = (movie: Movie) => {
        navigate(`/movie/${movie.id}`);
    };

    if (loading) {
        return <p className="text-white text-center p-10">Đang tìm kiếm...</p>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6">
                Kết quả tìm kiếm cho: <span className="text-yellow-500">"{query}"</span>
            </h1>

            {results.length === 0 ? (
                <p className="text-lg text-gray-400">Không tìm thấy phim nào khớp với từ khóa "{query}".</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {results.map(movie => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={handleMovieClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
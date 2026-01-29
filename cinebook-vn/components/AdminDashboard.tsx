import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Movie, User } from "../types";
import {
  getAllUsers,
  deleteUser,
  addMovieApi,
  deleteMovieApi,
  getRevenueAdmin,
} from "../services/api";

type Tab = "dashboard" | "movies" | "users";

const FALLBACK_POSTER = "https://via.placeholder.com/300x450?text=No+Image";
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showMovieForm, setShowMovieForm] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: "",
    poster: "",
    genre: "",
    price: 80000,
    duration: 120,
    status: "now" as "now" | "upcoming",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, revenueData] = await Promise.all([
        getAllUsers(),
        getRevenueAdmin(),
      ]);

      setUsers(Array.isArray(userData) ? userData : []);

      const mappedMovies = (revenueData || []).map((m: any) => {
        const rawImage = m.image || m.poster;
        let poster = FALLBACK_POSTER;

        if (rawImage) {
          poster = rawImage.startsWith("http")
            ? rawImage
            : `${BASE_URL}/uploads/${rawImage}`;
        }

        return {
          id: m.id,
          title: m.title,
          genre: m.genre || "Chưa phân loại",
          poster,
          sold: Number(m.sold || 0),
          revenue: Number(m.revenue || 0),
          isNowPlaying: m.isNowPlaying,
          upcoming: m.upcoming,
        };
      });

      setMovies(mappedMovies);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    return {
      revenue: movies.reduce((s, m) => s + m.revenue, 0),
      tickets: movies.reduce((s, m) => s + m.sold, 0),
      movieCount: movies.length,
      userCount: users.length,
    };
  }, [movies, users]);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: movieForm.title,
      genre: movieForm.genre,
      image: movieForm.poster,
      price: movieForm.price,
      duration: movieForm.duration,
      isNowPlaying: movieForm.status === "now" ? 1 : 0,
      upcoming: movieForm.status === "upcoming" ? 1 : 0,
    };

    try {
      await addMovieApi(payload);
      alert("Thêm phim thành công!");
      setShowMovieForm(false);
      setMovieForm({
        title: "",
        poster: "",
        genre: "",
        price: 80000,
        duration: 120,
        status: "now",
      });
      fetchData();
    } catch {
      alert("Lỗi thêm phim");
    }
  };

  const handleDeleteMovie = async (id: number | string) => {
    if (!confirm("Xác nhận xóa phim?")) return;
    await deleteMovieApi(id);
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-72 bg-cinema-800 p-8 border-r border-white/5">
        <h2 className="text-2xl font-black text-yellow-500 mb-10">
          CINEMA ADMIN
        </h2>
        {["dashboard", "movies", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`w-full mb-3 px-5 py-4 rounded-2xl font-bold ${
              activeTab === tab
                ? "bg-yellow-500 text-black"
                : "hover:bg-white/5 text-gray-400"
            }`}
          >
            {tab === "dashboard"
              ? "📊 Dashboard"
              : tab === "movies"
              ? "🎬 Quản lý phim"
              : "👥 Người dùng"}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "movies" && (
          <>
            <div className="flex justify-between mb-10">
              <h2 className="text-3xl font-bold italic">QUẢN LÝ PHIM</h2>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-green-600 px-6 py-3 rounded-xl font-bold"
              >
                + Thêm phim
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="bg-cinema-800 rounded-3xl overflow-hidden border border-white/5"
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={m.poster}
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          FALLBACK_POSTER)
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <h4 className="font-bold line-clamp-2">{m.title}</h4>
                    <p className="text-xs text-gray-400">
                      🎭 Thể loại: <b>{m.genre}</b>
                    </p>
                    <p className="text-sm text-yellow-500">
                      💰 {m.revenue.toLocaleString()}đ
                    </p>
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="w-full bg-red-600/20 hover:bg-red-600 py-3 rounded-xl text-xs font-bold"
                    >
                      XÓA PHIM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ADD MOVIE MODAL */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <form
            onSubmit={handleAddMovie}
            className="bg-cinema-800 p-10 rounded-3xl w-full max-w-lg space-y-4"
          >
            <h3 className="text-xl font-black text-yellow-500 text-center">
              THÊM PHIM
            </h3>

            <input
              required
              placeholder="Tên phim"
              className="w-full p-4 rounded-xl bg-cinema-900"
              value={movieForm.title}
              onChange={(e) =>
                setMovieForm({ ...movieForm, title: e.target.value })
              }
            />

            <input
              required
              placeholder="Thể loại (Hành động, Kinh dị...)"
              className="w-full p-4 rounded-xl bg-cinema-900"
              value={movieForm.genre}
              onChange={(e) =>
                setMovieForm({ ...movieForm, genre: e.target.value })
              }
            />

            <input
              required
              placeholder="URL hoặc tên ảnh"
              className="w-full p-4 rounded-xl bg-cinema-900"
              value={movieForm.poster}
              onChange={(e) =>
                setMovieForm({ ...movieForm, poster: e.target.value })
              }
            />

            <button className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black">
              LƯU PHIM
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { User } from "../types";
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

  // ================= FETCH DATA (FIX MẤT USER + DOANH THU) =================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, revenueData] = await Promise.all([
        getAllUsers(),
        getRevenueAdmin(),
      ]);

      // USERS
      setUsers(Array.isArray(userData) ? userData : []);

      // MOVIES + REVENUE
      const mappedMovies = (Array.isArray(revenueData) ? revenueData : []).map(
        (m: any) => {
          const rawImage = m.image || m.poster;
          let finalPoster = FALLBACK_POSTER;

          if (rawImage) {
            if (rawImage.startsWith("http")) finalPoster = rawImage;
            else finalPoster = `${BASE_URL}/uploads/${rawImage}`;
          }

          return {
            id: m.id,
            title: m.title,
            genre: m.genre || "Chưa phân loại",
            price: Number(m.price) || 0,
            duration: Number(m.duration) || 0,
            poster: finalPoster,
            sold: Number(m.sold || 0),
            revenue: Number(m.revenue || 0),
            isNowPlaying: m.isNowPlaying,
            upcoming: m.upcoming,
          };
        }
      );

      setMovies(mappedMovies);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= STATS =================
  const stats = useMemo(() => {
    return {
      revenue: movies.reduce((sum, m) => sum + m.revenue, 0),
      tickets: movies.reduce((sum, m) => sum + m.sold, 0),
      movieCount: movies.length,
      userCount: users.length,
    };
  }, [movies, users]);

  // ================= ADD MOVIE =================
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    const movieData = {
      title: movieForm.title,
      genre: movieForm.genre,
      image: movieForm.poster,
      price: Number(movieForm.price),
      duration: Number(movieForm.duration),
      isNowPlaying: movieForm.status === "now" ? 1 : 0,
      upcoming: movieForm.status === "upcoming" ? 1 : 0,
    };

    try {
      await addMovieApi(movieData);
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

  // ================= DELETE =================
  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Xác nhận xóa phim?")) return;
    await deleteMovieApi(id);
    fetchData();
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Xác nhận xóa khách hàng?")) return;
    await deleteUser(id);
    fetchData();
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Đang tải dữ liệu...
      </div>
    );

  // ================= UI =================
  return (
    <div className="flex min-h-screen bg-cinema-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-72 bg-cinema-800 p-8 border-r border-white/5">
        {["dashboard", "movies", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`w-full mb-3 px-5 py-4 rounded-2xl font-bold ${
              activeTab === tab
                ? "bg-yellow-500 text-black"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            {tab === "dashboard"
              ? "📊 Dashboard"
              : tab === "movies"
              ? "🎬 Quản lý phim"
              : "👥 Khách hàng"}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-4 gap-6">
            <StatCard title="Doanh thu" value={`${stats.revenue.toLocaleString()}đ`} />
            <StatCard title="Vé bán" value={stats.tickets} />
            <StatCard title="Phim" value={stats.movieCount} />
            <StatCard title="Người dùng" value={stats.userCount} />
          </div>
        )}

        {/* MOVIES */}
        {activeTab === "movies" && (
          <>
            <button
              onClick={() => setShowMovieForm(true)}
              className="mb-6 bg-green-600 px-6 py-3 rounded-xl font-bold"
            >
              + Thêm phim
            </button>

            <div className="grid grid-cols-4 gap-8">
              {movies.map((m) => (
                <div key={m.id} className="bg-cinema-800 rounded-3xl overflow-hidden">
                  <img
                    src={m.poster}
                    className="aspect-[3/4] object-cover w-full"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = FALLBACK_POSTER)
                    }
                  />
                  <div className="p-4">
                    <h4 className="font-bold">{m.title}</h4>
                    <p className="text-xs text-gray-400">🎭 {m.genre}</p>
                    <p className="text-yellow-500 text-sm mt-1">
                      {m.revenue.toLocaleString()}đ
                    </p>
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="mt-3 w-full bg-red-600/20 text-red-400 py-2 rounded-xl"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <table className="w-full">
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-4">{u.name}</td>
                  <td className="py-4">{u.email}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-500"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* ADD MOVIE MODAL */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <form
            onSubmit={handleAddMovie}
            className="bg-cinema-800 p-8 rounded-3xl space-y-4 w-[420px]"
          >
            <input
              placeholder="Tên phim"
              value={movieForm.title}
              onChange={(e) =>
                setMovieForm({ ...movieForm, title: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-cinema-900"
              required
            />
            <input
              placeholder="Thể loại"
              value={movieForm.genre}
              onChange={(e) =>
                setMovieForm({ ...movieForm, genre: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-cinema-900"
              required
            />
            <input
              placeholder="Poster / URL ảnh"
              value={movieForm.poster}
              onChange={(e) =>
                setMovieForm({ ...movieForm, poster: e.target.value })
              }
              className="w-full p-3 rounded-xl bg-cinema-900"
              required
            />

            <div className="flex gap-3">
              <button className="flex-1 bg-yellow-500 text-black py-3 rounded-xl">
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowMovieForm(false)}
                className="flex-1 bg-gray-700 py-3 rounded-xl"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: any }) => (
  <div className="bg-cinema-800 p-6 rounded-3xl">
    <p className="text-gray-400 text-xs uppercase">{title}</p>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

export default AdminDashboard;

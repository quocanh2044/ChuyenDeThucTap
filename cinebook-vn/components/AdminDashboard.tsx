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
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showMovieForm, setShowMovieForm] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: "",
    poster: "",
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
        const movieRevenue = Number(m.revenue || 0);
        const ticketsSold = Number(m.sold || 0);

        const rawImage = m.image || m.poster;
        let finalPoster = FALLBACK_POSTER;

        if (rawImage) {
          if (rawImage.startsWith('http')) finalPoster = rawImage;
          else finalPoster = `${BASE_URL}/uploads/${rawImage}`;
        }

        return {
          id: m.id,
          title: m.title,
          price: Number(m.price) || 0,
          duration: Number(m.duration) || 0,
          poster: finalPoster,
          sold: ticketsSold,
          revenue: movieRevenue,
          isNowPlaying: m.isNowPlaying,
          upcoming: m.upcoming,
        };
      });

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

  const stats = useMemo(() => {
    const totalRevenue = movies.reduce((sum, m) => sum + m.revenue, 0);
    const totalTickets = movies.reduce((sum, m) => sum + m.sold, 0);
    return {
      revenue: totalRevenue,
      tickets: totalTickets,
      movieCount: movies.length,
      userCount: users.length,
    };
  }, [movies, users]);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    const movieData = {
      title: movieForm.title,
      price: Number(movieForm.price),
      duration: Number(movieForm.duration),
      image: movieForm.poster,
      isNowPlaying: movieForm.status === "now" ? 1 : 0,
      upcoming: movieForm.status === "upcoming" ? 1 : 0,
    };

    try {
      await addMovieApi(movieData);
      alert("Thêm phim thành công!");
      setShowMovieForm(false);
      setMovieForm({ title: "", poster: "", price: 80000, duration: 120, status: "now" });
      fetchData();
    } catch (err) {
      alert("Lỗi: Kiểm tra lại dữ liệu nhập vào (400)");
    }
  };

  const handleDeleteMovie = async (id: string | number) => {
    if (!confirm("Xác nhận xóa phim? Tất cả đơn hàng liên quan sẽ bị ảnh hưởng!")) return;
    try {
      await deleteMovieApi(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      alert("Đã xóa phim thành công");
    } catch {
      alert("Không thể xóa phim");
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    if (!confirm("Xác nhận xóa khách hàng?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Không thể xóa người dùng");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-cinema-900 text-white font-black italic uppercase tracking-widest">
        Đang trích xuất dữ liệu tài chính...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white font-sans">
      <aside className="w-72 bg-cinema-800 p-8 border-r border-white/5 flex flex-col">
        <div className="mb-12">
          <h2 className="text-2xl font-black text-yellow-500 tracking-tighter italic">CINEMA ADMIN</h2>
        </div>
        <nav className="space-y-3 flex-1">
          {["dashboard", "movies", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-bold ${
                activeTab === tab
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                  : "hover:bg-white/5 text-gray-400"
              }`}
            >
              {tab === "dashboard"
                ? "📊 Dashboard"
                : tab === "movies"
                ? "🎬 Quản lý phim"
                : "👥 Khách hàng"}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold">Thống kê tài chính</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Tổng doanh thu" value={`${stats.revenue.toLocaleString()}đ`} color="text-yellow-500" />
              <StatCard title="Vé đã xuất" value={stats.tickets} color="text-blue-400" />
              <StatCard title="Phim trong kho" value={stats.movieCount} color="text-purple-400" />
              <StatCard title="Thành viên" value={stats.userCount} color="text-green-400" />
            </div>

            <div className="bg-cinema-800 p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <h3 className="text-lg font-black mb-8 italic flex items-center gap-2">
                <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                TOP PHIM DOANH THU CAO
              </h3>
              <div className="space-y-6">
                {movies
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((m) => (
                    <div key={m.id}>
                      <div className="flex justify-between text-sm mb-2 font-bold">
                        <span>{m.title}</span>
                        <span className="text-yellow-500">{m.revenue.toLocaleString()} đ</span>
                      </div>
                      <div className="w-full bg-cinema-900 rounded-full h-3">
                        <div
                          className="bg-yellow-500 h-3 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                          style={{ width: `${(m.revenue / (stats.revenue || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                {movies.length === 0 && (
                  <p className="text-center text-gray-500 italic py-10">
                    Chưa có giao dịch thành công.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "movies" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold italic">QUẢN LÝ KHO PHIM</h2>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-green-600/20"
              >
                + THÊM PHIM
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="bg-cinema-800 rounded-3xl overflow-hidden border border-white/5 flex flex-col group transition-all"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_POSTER)}
                    />

                    <div className="absolute top-2 left-2 px-3 py-1 rounded-xl text-xs font-bold shadow-lg bg-black/70">
                      {m.isNowPlaying ? (
                        <span className="text-green-400">Đang chiếu</span>
                      ) : m.upcoming ? (
                        <span className="text-blue-400">Sắp chiếu</span>
                      ) : (
                        <span className="text-gray-400">Không rõ</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-lg line-clamp-2 mb-4 h-12 italic tracking-tight">
                        {m.title}
                      </h4>
                      <div className="bg-cinema-900/50 p-4 rounded-2xl mb-6 space-y-1">
                        <p className="text-sm font-bold">Đã bán: {m.sold} vé</p>
                        <p className="text-sm font-bold text-yellow-500">
                          Tiền: {m.revenue.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                      Xóa phim này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-cinema-800 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="p-6">Thông tin khách hàng</th>
                  <th className="p-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-gray-500 italic">{u.email}</p>
                    </td>
                    <td className="p-6 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 font-bold text-xs uppercase hover:underline underline-offset-4"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showMovieForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <form
            onSubmit={handleAddMovie}
            className="bg-cinema-800 p-10 rounded-[40px] w-full max-w-lg space-y-6 border border-white/10 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-yellow-500 italic text-center uppercase tracking-widest">
              Cấu hình phim mới
            </h3>

            <div className="space-y-4">
              <input
                className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all"
                placeholder="Tiêu đề phim"
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                required
              />
              <input
                className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all"
                placeholder="URL hoặc Tên file ảnh (vd: movie.jpg)"
                value={movieForm.poster}
                onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                required
              />

              <select
                className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold"
                value={movieForm.status}
                onChange={(e) =>
                  setMovieForm({ ...movieForm, status: e.target.value as "now" | "upcoming" })
                }
              >
                <option value="now">🎬 Đang chiếu</option>
                <option value="upcoming">⏳ Sắp chiếu</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  className="p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all"
                  value={movieForm.price}
                  onChange={(e) => setMovieForm({ ...movieForm, price: Number(e.target.value) })}
                />
                <input
                  type="number"
                  className="p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all"
                  value={movieForm.duration}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, duration: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowMovieForm(false)}
                className="flex-1 bg-white/5 py-5 rounded-2xl font-bold"
              >
                Hủy
              </button>
              <button type="submit" className="flex-1 bg-yellow-500 text-black py-5 rounded-2xl font-black">
                Lưu phim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-cinema-800 p-8 rounded-[32px] border border-white/5">
    <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{title}</p>
    <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
  </div>
);

export default AdminDashboard;

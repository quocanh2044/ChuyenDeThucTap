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

  /* ================= FETCH DATA ================= */
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
          sold: Number(m.sold || 0),
          revenue: Number(m.revenue || 0),
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

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      revenue: movies.reduce((sum, m) => sum + m.revenue, 0),
      tickets: movies.reduce((sum, m) => sum + m.sold, 0),
      movieCount: movies.length,
      userCount: users.length,
    };
  }, [movies, users]);

  /* ================= ACTIONS ================= */
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
      <div className="h-screen flex items-center justify-center bg-cinema-900 text-white font-black italic uppercase tracking-[0.3em]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          Đang trích xuất dữ liệu...
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white font-sans selection:bg-yellow-500 selection:text-black">
      {/* SIDEBAR */}
      <aside className="w-72 bg-cinema-800 p-8 border-r border-white/5 flex flex-col sticky top-0 h-screen">
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
              {tab === "dashboard" ? "📊 Dashboard" : tab === "movies" ? "🎬 Quản lý phim" : "👥 Khách hàng"}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black italic">BÁO CÁO TÀI CHÍNH</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Tổng doanh thu" value={`${stats.revenue.toLocaleString()}đ`} color="text-yellow-500" />
              <StatCard title="Vé đã xuất" value={stats.tickets} color="text-blue-400" />
              <StatCard title="Phim trong kho" value={stats.movieCount} color="text-purple-400" />
              <StatCard title="Thành viên" value={stats.userCount} color="text-green-400" />
            </div>

            {/* PERFORMANCE CHART SIMULATION */}
            <div className="bg-cinema-800 p-8 rounded-[40px] border border-white/5 shadow-2xl">
              <h3 className="text-lg font-black mb-8 italic flex items-center gap-2 uppercase tracking-widest text-gray-400">
                <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
                Top hiệu suất phim
              </h3>
              <div className="space-y-8">
                {movies.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((m) => (
                  <div key={m.id} className="group">
                    <div className="flex justify-between text-sm mb-3 font-bold group-hover:text-yellow-500 transition-colors">
                      <span>{m.title}</span>
                      <span>{m.revenue.toLocaleString()} đ</span>
                    </div>
                    <div className="w-full bg-cinema-900 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(m.revenue / (stats.revenue || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "movies" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Quản lý kho phim</h2>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 transition-all active:scale-95"
              >
                + Thêm phim mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {movies.map((m) => (
                <div key={m.id} className="bg-cinema-800 rounded-3xl overflow-hidden border border-white/5 flex flex-col group hover:border-white/20 transition-all shadow-xl">
                  {/* POSTER CLEAN - NO LABELS */}
                  <div className="relative aspect-[3/4.5] overflow-hidden">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_POSTER)}
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-lg line-clamp-2 mb-4 h-12 italic tracking-tight uppercase group-hover:text-yellow-500 transition-colors">
                        {m.title}
                      </h4>
                      <div className="bg-cinema-900/50 p-4 rounded-2xl mb-6 flex justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500 font-black uppercase">Đã bán</p>
                          <p className="font-bold">{m.sold}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Doanh thu</p>
                          <p className="font-bold text-yellow-500">{m.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                    >
                      Xóa dữ liệu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-cinema-800 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in duration-500">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-8">Khách hàng hội viên</th>
                  <th className="p-8 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-8">
                      <p className="font-bold text-lg">{u.name}</p>
                      <p className="text-xs text-gray-500 italic font-medium">{u.email}</p>
                    </td>
                    <td className="p-8 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white px-6 py-2 rounded-full border border-red-500/20 transition-all"
                        >
                          Gỡ quyền
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

      {/* MODAL THÊM PHIM */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <form
            onSubmit={handleAddMovie}
            className="bg-cinema-800 w-full max-w-4xl rounded-[40px] border border-white/10 shadow-3xl overflow-hidden flex flex-col md:flex-row transition-all"
          >
            {/* LIVE PREVIEW - NO LABELS */}
            <div className="w-full md:w-80 bg-black/40 border-r border-white/5 p-8 flex flex-col items-center justify-center">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6">Live Preview</p>
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-cinema-900 flex items-center justify-center border border-white/5">
                {movieForm.poster ? (
                  <img src={movieForm.poster} className="w-full h-full object-cover animate-in zoom-in duration-500" onError={(e) => (e.currentTarget.src = FALLBACK_POSTER)} />
                ) : (
                  <div className="text-gray-700 text-center p-4">
                    <span className="text-4xl block mb-2">🎞️</span>
                    <span className="text-[10px] font-bold uppercase italic">Chờ liên kết ảnh...</span>
                  </div>
                )}
              </div>
            </div>

            {/* FORM INPUTS */}
            <div className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black text-yellow-500 italic uppercase tracking-tighter">Cấu hình phim mới</h3>
                  <div className="h-1 w-12 bg-yellow-500 mt-2 rounded-full"></div>
                </div>
                <button type="button" onClick={() => setShowMovieForm(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Tên phim thương mại</label>
                  <input
                    className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold text-lg text-white"
                    placeholder="Tên phim..."
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Đường dẫn Poster (URL)</label>
                  <input
                    className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all text-xs font-mono text-white"
                    placeholder="https://..."
                    value={movieForm.poster}
                    onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Trạng thái công chiếu</label>
                    <select
                      className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold text-sm cursor-pointer text-white"
                      value={movieForm.status}
                      onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value as any })}
                    >
                      <option value="now" className="bg-cinema-800">Đang chiếu (Now Playing)</option>
                      <option value="upcoming" className="bg-cinema-800">Sắp ra mắt (Upcoming)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Giá vé (đ)</label>
                      <input
                        type="number"
                        className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold text-white"
                        value={movieForm.price}
                        onChange={(e) => setMovieForm({ ...movieForm, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Phút</label>
                      <input
                        type="number"
                        className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold text-white"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowMovieForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-5 rounded-[20px] font-bold uppercase text-[10px] tracking-widest transition-all"
                >
                  Hủy cấu hình
                </button>
                <button type="submit" className="flex-[2] bg-yellow-500 hover:bg-yellow-400 text-black py-5 rounded-[20px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-yellow-500/10 transition-all active:scale-95">
                  Lưu phim vào kho
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <div className="bg-cinema-800 p-8 rounded-[32px] border border-white/5 hover:border-white/10 transition-all">
    <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest opacity-60">{title}</p>
    <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
  </div>
);

export default AdminDashboard;

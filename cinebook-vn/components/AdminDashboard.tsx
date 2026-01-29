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

// Danh sách thể loại mẫu dựa trên SQL của bạn
const GENRES = ["Action", "Superhero", "Adventure", "Drama", "Romance", "Animation", "Family", "Sci-Fi", "Monster"];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showMovieForm, setShowMovieForm] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: "",
    poster: "",
    genre: "Action",
    price: 55000,
    duration: 120,
    status: "now" as "now" | "upcoming",
  });

  // ================================================
  // 🟢 LOGIC LẤY VÀ XỬ LÝ DỮ LIỆU (FIX GENRE)
  // ================================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, revenueData] = await Promise.all([
        getAllUsers(),
        getRevenueAdmin(),
      ]);

      setUsers(Array.isArray(userData) ? userData : []);

      const mappedMovies = (revenueData || []).map((m: any) => {
        // Xử lý ảnh Poster
        const rawImage = m.image || m.poster;
        let finalPoster = FALLBACK_POSTER;
        if (rawImage) {
          finalPoster = rawImage.startsWith('http') ? rawImage : `${BASE_URL}/uploads/${rawImage}`;
        }

        return {
          id: m.id,
          title: m.title,
          // ✅ FIX: Xử lý chuỗi "Action,Superhero" từ SQL của bạn thành "Action | Superhero"
          genre: m.genre ? String(m.genre).replace(/,/g, " | ") : "Chưa phân loại",
          price: Number(m.price) || 0,
          duration: Number(m.duration) || 0,
          poster: finalPoster,
          sold: Number(m.sold) || 0,
          revenue: Number(m.revenue) || 0,
          isNowPlaying: m.isNowPlaying === 1 || m.isNowPlaying === true,
          upcoming: m.upcoming === 1 || m.upcoming === true,
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

  // ================================================
  // THAO TÁC (THÊM/XÓA)
  // ================================================
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    const movieData = {
      title: movieForm.title,
      genre: movieForm.genre,
      price: movieForm.price,
      duration: movieForm.duration,
      image: movieForm.poster,
      isNowPlaying: movieForm.status === "now" ? 1 : 0,
      upcoming: movieForm.status === "upcoming" ? 1 : 0,
    };

    try {
      await addMovieApi(movieData);
      alert("Thêm phim thành công!");
      setShowMovieForm(false);
      setMovieForm({ title: "", poster: "", genre: "Action", price: 55000, duration: 120, status: "now" });
      fetchData();
    } catch (err) {
      alert("Lỗi server: Kiểm tra lại API thêm phim");
    }
  };

  const handleDeleteMovie = async (id: string | number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phim này?")) return;
    try {
      await deleteMovieApi(id);
      setMovies(prev => prev.filter(m => m.id !== id));
    } catch {
      alert("Không thể xóa phim");
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    if (!confirm("Xóa tài khoản khách hàng này?")) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Lỗi khi xóa người dùng");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-cinema-900 text-white font-black italic tracking-widest animate-pulse">
      ĐANG ĐỒNG BỘ DỮ LIỆU HỆ THỐNG...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white font-sans selection:bg-yellow-500/30">
      {/* SIDEBAR FIXED */}
      <aside className="w-64 bg-cinema-800 p-6 border-r border-white/5 fixed h-full z-50">
        <div className="mb-10 px-4">
          <h2 className="text-xl font-black text-yellow-500 italic tracking-tighter">CINEMA CONTROL</h2>
        </div>
        <nav className="space-y-2">
          {["dashboard", "movies", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                activeTab === tab 
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab === "dashboard" ? "📊 Thống kê" : tab === "movies" ? "🎬 Phim" : "👥 Thành viên"}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-10 ml-64">
        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-3xl font-black uppercase italic tracking-tight">Dashboard</h1>
            
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="Doanh thu" value={`${stats.revenue.toLocaleString()}đ`} color="text-yellow-500" />
              <StatCard title="Vé xuất kho" value={stats.tickets} color="text-blue-400" />
              <StatCard title="Phim hiện hữu" value={stats.movieCount} color="text-purple-400" />
              <StatCard title="Người dùng" value={stats.userCount} color="text-green-400" />
            </div>

            <div className="bg-cinema-800 p-8 rounded-[32px] border border-white/5 shadow-2xl">
              <h3 className="font-black mb-8 text-xs italic text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-1 h-4 bg-yellow-500"></span> Xếp hạng doanh thu
              </h3>
              <div className="space-y-6">
                {movies.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map(m => (
                  <div key={m.id} className="group">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="group-hover:text-yellow-500 transition-colors uppercase">{m.title}</span>
                      <span className="text-yellow-500 italic">{m.revenue.toLocaleString()}đ</span>
                    </div>
                    <div className="w-full bg-cinema-900 h-2 rounded-full">
                      <div 
                        className="bg-yellow-500 h-full rounded-full shadow-[0_0_10px_rgba(234,179,8,0.4)] transition-all duration-1000" 
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
              <h2 className="text-3xl font-black uppercase italic tracking-tight">Quản lý kho phim</h2>
              <button 
                onClick={() => setShowMovieForm(true)} 
                className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-xl font-black text-xs transition-all shadow-xl shadow-green-600/20 active:scale-95"
              >
                + THÊM PHIM MỚI
              </button>
            </div>

            <div className="grid grid-cols-4 gap-8">
              {movies.map((m) => (
                <div key={m.id} className="bg-cinema-800 rounded-3xl overflow-hidden border border-white/5 flex flex-col group hover:border-yellow-500/40 transition-all duration-500 shadow-xl">
                  <div className="relative aspect-[3/4.5] overflow-hidden">
                    <img 
                      src={m.poster} 
                      alt={m.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_POSTER)} 
                    />
                    
                    {/* ✅ BADGE THỂ LOẠI TỪ SQL CỦA BẠN */}
                    <div className="absolute bottom-4 left-4 right-4 px-3 py-2 rounded-xl text-[10px] font-black bg-yellow-500 text-black shadow-2xl uppercase text-center leading-tight">
                      {m.genre}
                    </div>

                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[9px] font-black bg-black/80 backdrop-blur-md border border-white/10 uppercase">
                      {m.isNowPlaying ? <span className="text-green-400">Đang chiếu</span> : <span className="text-blue-400">Sắp chiếu</span>}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-base line-clamp-2 mb-4 h-12 italic uppercase tracking-tighter">{m.title}</h4>
                      <div className="bg-cinema-900/50 p-4 rounded-2xl mb-6 space-y-2 text-[11px] border border-white/5">
                        <div className="flex justify-between text-gray-400 italic">
                          <span>Thời lượng:</span> <span className="text-white font-bold">{m.duration}m</span>
                        </div>
                        <div className="flex justify-between text-gray-400 italic">
                          <span>Đã bán:</span> <span className="text-white font-bold">{m.sold} vé</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 text-right font-black text-yellow-500 text-sm">
                          {m.revenue.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteMovie(m.id)} 
                      className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Xóa khỏi hệ thống
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
           <div className="bg-cinema-800 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                   <th className="p-8">Thành viên</th>
                   <th className="p-8">Vai trò</th>
                   <th className="p-8 text-right">Thao tác</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {users.map((u) => (
                   <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                     <td className="p-8">
                       <p className="font-bold text-lg group-hover:text-yellow-500 transition-colors">{u.name}</p>
                       <p className="text-xs text-gray-500 italic">{u.email}</p>
                     </td>
                     <td className="p-8">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${u.role === 'admin' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                         {u.role}
                       </span>
                     </td>
                     <td className="p-8 text-right">
                       {u.role !== "admin" && (
                         <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 font-black text-xs uppercase hover:underline underline-offset-8">Xóa tài khoản</button>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </main>

      {/* FORM MODAL FIXED */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <form onSubmit={handleAddMovie} className="bg-cinema-800 p-10 rounded-[40px] w-full max-w-lg space-y-6 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-yellow-500 italic text-center uppercase tracking-widest mb-4">Cấu hình phim mới</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Tiêu đề gốc</label>
                <input className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Thể loại chính</label>
                <select className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">File Ảnh Poster (Ví dụ: endgame.jpg)</label>
                <input className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 transition-all" value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Trạng thái</label>
                  <select className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl font-bold" value={movieForm.status} onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value as any })}>
                    <option value="now">🎬 ĐANG CHIẾU</option>
                    <option value="upcoming">⏳ SẮP CHIẾU</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Giá vé niêm yết</label>
                  <input type="number" className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl font-bold" value={movieForm.price} onChange={(e) => setMovieForm({ ...movieForm, price: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">Thời lượng (Phút)</label>
                <input type="number" className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl font-bold" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => setShowMovieForm(false)} className="flex-1 bg-white/5 py-5 rounded-2xl font-bold hover:bg-white/10 transition-colors uppercase text-xs tracking-widest">HỦY BỎ</button>
              <button type="submit" className="flex-1 bg-yellow-500 text-black py-5 rounded-2xl font-black shadow-lg shadow-yellow-500/20 active:scale-95 transition-all uppercase text-xs tracking-widest">XÁC NHẬN LƯU</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string; }) => (
  <div className="bg-cinema-800 p-8 rounded-[32px] border border-white/5 shadow-xl hover:border-white/10 transition-all">
    <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{title}</p>
    <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
  </div>
);

export default AdminDashboard;

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { User } from "../types";
import {
  getAllUsers,
  deleteUser,
  addMovieApi,
  deleteMovieApi,
  getRevenueAdmin,
} from "../services/api";
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Plus, 
  Trash2, 
  Star, 
  Clock, 
  DollarSign,
  X 
} from "lucide-react";

type Tab = "dashboard" | "movies" | "users";

const FALLBACK_POSTER = "https://via.placeholder.com/300x450?text=No+Image";
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showMovieForm, setShowMovieForm] = useState(false);
  
  // 🔥 KHỞI TẠO STATE THEO CHUẨN SQL CỦA BẠN
  const [movieForm, setMovieForm] = useState({
    title: "",
    genre: "",
    director: "",
    description: "",
    duration: 120,
    image: "", 
    upcoming: 0,
    rating: 5.0,
    isNowPlaying: 1,
    price: 55000,
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
        let finalPoster = FALLBACK_POSTER;
        if (rawImage) {
          finalPoster = rawImage.startsWith('http') ? rawImage : `${BASE_URL}/uploads/${rawImage}`;
        }

        return {
          ...m,
          poster: finalPoster,
          revenue: Number(m.revenue || 0),
          sold: Number(m.sold || 0),
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

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ép kiểu dữ liệu để khớp với Backend SQL
      const submitData = {
        ...movieForm,
        price: Number(movieForm.price),
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
        isNowPlaying: Number(movieForm.isNowPlaying),
        upcoming: Number(movieForm.upcoming)
      };

      await addMovieApi(submitData);
      setShowMovieForm(false);
      setMovieForm({
        title: "", genre: "", director: "", description: "",
        duration: 120, image: "", upcoming: 0, rating: 5.0,
        isNowPlaying: 1, price: 55000
      });
      fetchData();
    } catch (err) {
      alert("Lỗi khi lưu phim. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phim này?")) return;
    try {
      await deleteMovieApi(id);
      fetchData();
    } catch {
      alert("Không thể xóa phim");
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = movies.reduce((sum, m) => sum + m.revenue, 0);
    const totalTickets = movies.reduce((sum, m) => sum + m.sold, 0);
    return { revenue: totalRevenue, tickets: totalTickets, movieCount: movies.length, userCount: users.length };
  }, [movies, users]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-950 text-yellow-500 font-bold uppercase tracking-widest">
      <div className="animate-pulse">Đang tải dữ liệu hệ thống...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-900/50 backdrop-blur-md border-r border-white/5 p-8 flex flex-col sticky top-0 h-screen">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black italic">C</div>
          <h2 className="text-xl font-black text-white italic tracking-tighter">ADMIN CORE</h2>
        </div>
        <nav className="space-y-2 flex-1">
          <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard size={20}/>} label="Báo cáo" />
          <TabButton active={activeTab === "movies"} onClick={() => setActiveTab("movies")} icon={<Film size={20}/>} label="Kho Phim" />
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users size={20}/>} label="Thành viên" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Hệ thống doanh thu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Doanh thu" value={`${stats.revenue.toLocaleString()}đ`} color="text-yellow-500" />
              <StatCard title="Vé bán ra" value={stats.tickets} color="text-blue-400" />
              <StatCard title="Tổng phim" value={stats.movieCount} color="text-purple-400" />
              <StatCard title="Hội viên" value={stats.userCount} color="text-green-400" />
            </div>

            {/* TOP MOVIES CHART */}
            <div className="bg-gray-900 border border-white/5 p-8 rounded-[32px]">
               <h3 className="text-sm font-bold text-gray-400 uppercase mb-8 flex items-center gap-2">
                 <div className="w-1 h-4 bg-yellow-500 rounded-full"></div> Phim dẫn đầu doanh thu
               </h3>
               <div className="space-y-6">
                 {movies.sort((a,b) => b.revenue - a.revenue).slice(0, 5).map(m => (
                   <div key={m.id} className="group">
                     <div className="flex justify-between text-xs font-bold mb-2 group-hover:text-yellow-500 transition-colors">
                       <span>{m.title}</span>
                       <span>{m.revenue.toLocaleString()}đ</span>
                     </div>
                     <div className="w-full bg-gray-950 h-1.5 rounded-full overflow-hidden">
                       <div 
                        className="bg-yellow-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${(m.revenue / (stats.revenue || 1)) * 100}%` }}
                       />
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
              <h2 className="text-3xl font-black italic uppercase">Kho phim thương mại</h2>
              <button 
                onClick={() => setShowMovieForm(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-yellow-500/20"
              >
                <Plus size={18} /> THÊM PHIM MỚI
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {movies.map(m => (
                <div key={m.id} className="bg-gray-900 border border-white/5 rounded-[24px] overflow-hidden group hover:border-white/20 transition-all">
                  <div className="relative aspect-[2/3]">
                    <img src={m.poster} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 rounded-lg text-[10px] font-bold">
                      {m.isNowPlaying ? <span className="text-green-400">Đang chiếu</span> : <span className="text-blue-400">Sắp chiếu</span>}
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <h4 className="font-bold text-sm h-10 line-clamp-2 uppercase italic">{m.title}</h4>
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl text-[10px]">
                        <div><p className="text-gray-500">Vé bán</p><p className="font-bold text-white">{m.sold}</p></div>
                        <div className="text-right"><p className="text-gray-500">D.Thu</p><p className="font-bold text-yellow-500">{m.revenue.toLocaleString()}</p></div>
                    </div>
                    <button onClick={() => handleDeleteMovie(m.id)} className="w-full py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase">Xóa Phim</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-gray-900 rounded-[32px] border border-white/5 overflow-hidden animate-in fade-in duration-500">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                  <th className="p-6 pl-10">Danh tính hội viên</th>
                  <th className="p-6">Vai trò</th>
                  <th className="p-6 text-right pr-10">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 pl-10">
                      <p className="font-bold">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="p-6 text-[10px] font-bold uppercase text-blue-400">{u.role || 'Member'}</td>
                    <td className="p-6 text-right pr-10">
                      {u.role !== 'admin' && (
                        <button onClick={() => deleteUser(u.id).then(fetchData)} className="text-red-500 text-[10px] font-bold uppercase hover:underline">Gỡ bỏ</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 🔥 MODAL ADD MOVIE - CẤU TRÚC SQL HOÀN CHỈNH */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddMovie}
            className="bg-gray-900 w-full max-w-5xl border border-white/10 rounded-[40px] flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {/* Cột Trái: Ảnh Preview */}
            <div className="w-full md:w-80 bg-black/20 p-10 flex flex-col items-center border-r border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Ảnh Poster</p>
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                    <img 
                      src={movieForm.image || FALLBACK_POSTER} 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.src = FALLBACK_POSTER)}
                    />
                </div>
            </div>

            {/* Cột Phải: Form nhập liệu */}
            <div className="flex-1 p-10 overflow-y-auto space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-yellow-500 italic uppercase">Cấu hình Database Phim</h3>
                <button type="button" onClick={() => setShowMovieForm(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nhóm 1: Thông tin chữ */}
                <div className="space-y-4">
                  <InputField label="Tiêu đề phim" value={movieForm.title} onChange={v => setMovieForm({...movieForm, title: v})} placeholder="Endgame..." />
                  <InputField label="Đạo diễn" value={movieForm.director} onChange={v => setMovieForm({...movieForm, director: v})} placeholder="Christopher Nolan" />
                  <InputField label="Thể loại (Genre)" value={movieForm.genre} onChange={v => setMovieForm({...movieForm, genre: v})} placeholder="Hành động, Viễn tưởng" />
                  <InputField label="Link Poster (URL)" value={movieForm.image} onChange={v => setMovieForm({...movieForm, image: v})} placeholder="https://..." />
                </div>

                {/* Nhóm 2: Thông số & Trạng thái */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Giá vé (đ)" type="number" value={movieForm.price.toString()} onChange={v => setMovieForm({...movieForm, price: Number(v)})} />
                    <InputField label="Thời lượng (p)" type="number" value={movieForm.duration.toString()} onChange={v => setMovieForm({...movieForm, duration: Number(v)})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 ml-2 mb-1 block">Trạng thái</label>
                      <select 
                        className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl font-bold text-sm outline-none focus:border-yellow-500 transition-all"
                        value={movieForm.isNowPlaying}
                        onChange={e => {
                            const val = Number(e.target.value);
                            setMovieForm({...movieForm, isNowPlaying: val, upcoming: val === 1 ? 0 : 1});
                        }}
                      >
                        <option value={1}>🎬 Đang chiếu</option>
                        <option value={0}>⏳ Sắp chiếu</option>
                      </select>
                    </div>
                    <InputField label="Đánh giá (1-5)" type="number" step="0.1" value={movieForm.rating.toString()} onChange={v => setMovieForm({...movieForm, rating: Number(v)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2 mb-1 block">Tóm tắt nội dung</label>
                    <textarea 
                      className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl h-24 text-sm outline-none focus:border-yellow-500"
                      value={movieForm.description}
                      onChange={e => setMovieForm({...movieForm, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowMovieForm(false)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">Hủy bỏ</button>
                <button type="submit" className="flex-[2] py-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-yellow-500/20">Lưu vào hệ thống</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* --- MINI COMPONENTS --- */
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${active ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10" : "text-gray-400 hover:bg-white/5"}`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, color }: any) => (
  <div className="bg-gray-900 p-8 rounded-[32px] border border-white/5">
    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">{title}</p>
    <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</p>
  </div>
);

const InputField = ({ label, type = "text", ...props }: any) => (
  <div>
    <label className="text-[10px] font-black uppercase text-gray-500 ml-2 mb-1 block">{label}</label>
    <input 
      type={type}
      className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl font-bold text-sm outline-none focus:border-yellow-500 transition-all placeholder:text-gray-700"
      {...props}
      required
    />
  </div>
);

export default AdminDashboard;

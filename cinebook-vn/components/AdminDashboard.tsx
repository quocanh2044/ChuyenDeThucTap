import React, { useEffect, useMemo, useState, useCallback } from "react";
import { 
  FiLayout, FiFilm, FiUsers, FiPlus, FiTrash2, FiTrendingUp, 
  FiClock, FiDollarSign, FiX, FiCheckCircle, FiImage, FiUploadCloud 
} from "react-icons/fi";
import { 
  getAllUsers, 
  deleteUser, 
  addMovieApi, 
  deleteMovieApi, 
  getRevenueAdmin 
} from "../services/api";

type Tab = "dashboard" | "movies" | "users";

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovieForm, setShowMovieForm] = useState(false);

  // Form state được cải tiến để bao gồm cả mô tả và thể loại
  const [movieForm, setMovieForm] = useState({
    title: "",
    poster: "",
    price: 80000,
    duration: 120,
    status: "now" as "now" | "upcoming",
    description: "",
    genre: "Hành Động"
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
        const finalPoster = rawImage?.startsWith('http') 
          ? rawImage 
          : rawImage ? `${BASE_URL}/uploads/${rawImage}` : FALLBACK_POSTER;

        return {
          ...m,
          poster: finalPoster,
          revenue: Number(m.revenue || 0),
          sold: Number(m.sold || 0)
        };
      });
      setMovies(mappedMovies);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 800); // Tạo độ trễ mượt cho animation
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    revenue: movies.reduce((sum, m) => sum + m.revenue, 0),
    tickets: movies.reduce((sum, m) => sum + m.sold, 0),
    movieCount: movies.length,
    userCount: users.length,
  }), [movies, users]);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMovieApi({
        ...movieForm,
        image: movieForm.poster,
        isNowPlaying: movieForm.status === "now" ? 1 : 0,
        upcoming: movieForm.status === "upcoming" ? 1 : 0,
      });
      setShowMovieForm(false);
      setMovieForm({ title: "", poster: "", price: 80000, duration: 120, status: "now", description: "", genre: "Hành Động" });
      fetchData();
    } catch (err) {
      alert("Lỗi cấu hình dữ liệu. Vui lòng kiểm tra lại các trường.");
    }
  };

  const handleDeleteMovie = async (id: any) => {
    if (!window.confirm("❗ Xóa phim sẽ xóa toàn bộ lịch chiếu liên quan. Tiếp tục?")) return;
    try {
      await deleteMovieApi(id);
      setMovies(prev => prev.filter(m => m.id !== id));
    } catch {
      alert("Xóa thất bại.");
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#0a0a0b] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-yellow-500 font-black tracking-[0.3em] animate-pulse uppercase text-xs">CineSystem Syncing...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0f0f12] text-gray-100 font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* SIDEBAR - TỐI GIẢN & HIỆN ĐẠI */}
      <aside className="w-24 lg:w-72 bg-[#16161a] border-r border-white/5 flex flex-col transition-all duration-300">
        <div className="p-8 mb-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4">
            <FiFilm className="text-black text-2xl" />
          </div>
          <h2 className="hidden lg:block text-xl font-black italic tracking-tighter">CINE<span className="text-yellow-500">PRO</span></h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavBtn active={activeTab === "dashboard"} icon={<FiLayout />} label="Dashboard" onClick={() => setActiveTab("dashboard")} />
          <NavBtn active={activeTab === "movies"} icon={<FiFilm />} label="Phim Ảnh" onClick={() => setActiveTab("movies")} />
          <NavBtn active={activeTab === "users"} icon={<FiUsers />} label="Hội Viên" onClick={() => setActiveTab("users")} />
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="hidden lg:block bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Hệ thống</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">V{new Date().getFullYear()}.1.0 - Stable</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
        
        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            <header>
              <h1 className="text-4xl font-black tracking-tight mb-2">Báo Cáo Tổng Quan</h1>
              <p className="text-gray-500 font-medium">Chào mừng trở lại, Admin CinePro.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Doanh Thu" value={stats.revenue.toLocaleString() + "đ"} icon={<FiDollarSign />} color="bg-yellow-500" />
              <StatCard title="Vé Bán Ra" value={stats.tickets} icon={<FiCheckCircle />} color="bg-blue-500" />
              <StatCard title="Tổng Số Phim" value={stats.movieCount} icon={<FiFilm />} color="bg-purple-500" />
              <StatCard title="Khách Hàng" value={stats.userCount} icon={<FiUsers />} color="bg-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#16161a] p-8 rounded-[32px] border border-white/5">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-lg font-black italic flex items-center gap-3 uppercase tracking-wider">
                    <FiTrendingUp className="text-yellow-500" /> Top Doanh Thu
                  </h3>
                </div>
                <div className="space-y-8">
                  {movies.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((m, idx) => (
                    <div key={m.id} className="relative group">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="font-bold text-gray-300">0{idx + 1}. {m.title}</span>
                        <span className="text-yellow-500 font-black">{m.revenue.toLocaleString()}đ</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000"
                          style={{ width: `${(m.revenue / (stats.revenue || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-500 p-8 rounded-[32px] text-black flex flex-col justify-between overflow-hidden relative group">
                  <div className="relative z-10">
                    <h4 className="font-black text-2xl mb-2 italic">MỞ RỘNG<br/>THỊ TRƯỜNG</h4>
                    <p className="text-sm font-bold opacity-70">Thêm phim ngay để tối ưu doanh thu tuần này.</p>
                  </div>
                  <button onClick={() => setActiveTab("movies")} className="relative z-10 mt-8 bg-black text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all">
                    Đi tới kho phim
                  </button>
                  <FiFilm className="absolute -bottom-10 -right-10 text-[200px] opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "movies" && (
          <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-4xl font-black tracking-tighter italic uppercase">Kho Phim <span className="text-yellow-500">Digital</span></h2>
                <p className="text-gray-500 text-sm mt-1">Quản lý nội dung và trạng thái công chiếu.</p>
              </div>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-white text-black hover:bg-yellow-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-3"
              >
                <FiPlus size={18} /> Thêm phim mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {movies.map((m) => (
                <div key={m.id} className="bg-[#16161a] rounded-[28px] overflow-hidden border border-white/5 group hover:border-yellow-500/30 transition-all duration-500 shadow-xl">
                  <div className="relative aspect-[3/4.2] overflow-hidden">
                    <img 
                      src={m.poster} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 blur-[0.5px] group-hover:blur-0" 
                      alt={m.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-transparent to-transparent opacity-90" />
                    <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${m.isNowPlaying ? 'bg-green-500 text-black' : 'bg-blue-600 text-white'}`}>
                      {m.isNowPlaying ? "• Now Playing" : "Upcoming"}
                    </div>
                  </div>

                  <div className="p-6 -mt-12 relative z-10">
                    <h4 className="font-black text-lg line-clamp-1 italic tracking-tight mb-4 group-hover:text-yellow-500 transition-colors uppercase">
                      {m.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Đã bán</p>
                        <p className="text-sm font-black">{m.sold}</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">D.Thu</p>
                        <p className="text-sm font-black text-yellow-500">{Math.floor(m.revenue/1000)}K</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="w-full py-4 rounded-xl text-red-500 font-black text-[10px] uppercase tracking-[0.2em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    >
                      Gỡ khỏi rạp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB USERS - Tối giản */}
        {activeTab === "users" && (
           <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
             <div className="bg-[#16161a] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5">
                 <h3 className="font-black text-xl italic uppercase tracking-widest">Danh sách hội viên</h3>
               </div>
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                     <th className="p-8">Khách hàng</th>
                     <th className="p-8">Vai trò</th>
                     <th className="p-8 text-right">Hành động</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {users.map((u) => (
                     <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="p-8">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center font-black">
                             {u.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-gray-200">{u.name}</p>
                             <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400'}`}>
                            {u.role}
                          </span>
                       </td>
                       <td className="p-8 text-right">
                         {u.role !== "admin" && (
                           <button onClick={() => handleDeleteUser(u.id)} className="opacity-0 group-hover:opacity-100 p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                             <FiTrash2 size={16} />
                           </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </main>

      {/* MODAL THÊM PHIM - NÂNG CẤP */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#16161a] w-full max-w-4xl rounded-[40px] border border-white/10 shadow-3xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            
            {/* Ảnh Preview bên trái */}
            <div className="w-full md:w-80 bg-black/50 border-r border-white/5 relative flex items-center justify-center overflow-hidden">
                {movieForm.poster ? (
                  <img src={movieForm.poster} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <FiImage size={48} className="mx-auto text-gray-700" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-loose">Ảnh Preview <br/> sẽ hiện ở đây</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] to-transparent" />
            </div>

            <div className="flex-1 p-8 lg:p-12 relative">
              <button onClick={() => setShowMovieForm(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                <FiX size={24} />
              </button>

              <h3 className="text-2xl font-black italic text-yellow-500 uppercase tracking-tighter mb-8">Cấu hình rạp chiếu</h3>

              <form onSubmit={handleAddMovie} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Tiêu đề gốc</label>
                    <input className="w-full bg-[#0f0f12] border border-white/5 p-4 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold" 
                           placeholder="Vd: Spider-Man" 
                           value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Poster URL</label>
                    <div className="relative">
                      <input className="w-full bg-[#0f0f12] border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-yellow-500 transition-all font-bold text-xs" 
                             placeholder="http://..." 
                             value={movieForm.poster} onChange={e => setMovieForm({...movieForm, poster: e.target.value})} required />
                      <FiUploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Mô tả phim</label>
                   <textarea rows={3} className="w-full bg-[#0f0f12] border border-white/5 p-4 rounded-2xl outline-none focus:border-yellow-500 transition-all text-sm leading-relaxed" 
                             placeholder="Viết tóm tắt phim..." 
                             value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Giá vé (đ)</label>
                    <input type="number" className="w-full bg-[#0f0f12] border border-white/5 p-4 rounded-xl text-sm font-bold" 
                           value={movieForm.price} onChange={e => setMovieForm({...movieForm, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Phút</label>
                    <input type="number" className="w-full bg-[#0f0f12] border border-white/5 p-4 rounded-xl text-sm font-bold" 
                           value={movieForm.duration} onChange={e => setMovieForm({...movieForm, duration: Number(e.target.value)})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Trạng thái</label>
                    <select className="w-full bg-[#0f0f12] border border-white/5 p-4 rounded-xl text-sm font-bold outline-none" 
                            value={movieForm.status} onChange={e => setMovieForm({...movieForm, status: e.target.value as any})}>
                      <option value="now">Hiện thị: Đang chiếu</option>
                      <option value="upcoming">Hiển thị: Sắp chiếu</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                   <button type="submit" className="flex-[2] bg-yellow-500 text-black py-5 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-yellow-500/10 hover:bg-yellow-400 transition-all">
                      Xác nhận lưu phim
                   </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components để code sạch hơn
const NavBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${active ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
    <span className="text-xl">{icon}</span>
    <span className="hidden lg:block text-sm uppercase tracking-wider">{label}</span>
  </button>
);

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-[#16161a] p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-white/5`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
  </div>
);

export default AdminDashboard;

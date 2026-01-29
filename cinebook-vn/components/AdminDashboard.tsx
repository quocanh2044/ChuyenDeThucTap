import React, { useEffect, useMemo, useState, useCallback } from "react";
import { User } from "../types";
import { getAllUsers, deleteUser, addMovieApi, deleteMovieApi, getRevenueAdmin } from "../services/api";

type Tab = "dashboard" | "movies" | "users";
const GENRES = ["Action", "Superhero", "Adventure", "Drama", "Romance", "Animation", "Family", "Sci-Fi", "Monster"];

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: "", poster: "", genre: "Action", price: 55000, duration: 120, status: "now" as "now" | "upcoming"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, revenueData] = await Promise.all([getAllUsers(), getRevenueAdmin()]);
      setUsers(Array.isArray(userData) ? userData : []);
      setMovies(revenueData || []);
    } catch (err) {
      console.error("Lỗi đồng bộ:", err);
    } finally {
      setLoading(false);
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
        ...movieForm, image: movieForm.poster,
        isNowPlaying: movieForm.status === "now" ? 1 : 0,
        upcoming: movieForm.status === "upcoming" ? 1 : 0
      });
      setShowMovieForm(false);
      fetchData();
    } catch { alert("Lỗi thêm phim"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-cinema-900 text-yellow-500 font-black italic animate-pulse text-2xl">SYCHRONIZING...</div>;

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-cinema-800 p-6 border-r border-white/5 fixed h-full z-50">
        <h2 className="text-xl font-black text-yellow-500 italic mb-10">ADMIN CONTROL</h2>
        <nav className="space-y-2">
          {["dashboard", "movies", "users"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as Tab)} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === tab ? "bg-yellow-500 text-black shadow-lg" : "text-gray-400 hover:bg-white/5"}`}>
              {tab === "dashboard" ? "📊 Dashboard" : tab === "movies" ? "🎬 Kho phim" : "👥 Khách hàng"}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 ml-64">
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="Doanh thu" value={`${stats.revenue.toLocaleString()}đ`} color="text-yellow-500" />
              <StatCard title="Vé bán" value={stats.tickets} color="text-blue-400" />
              <StatCard title="Tổng phim" value={stats.movieCount} color="text-purple-400" />
              <StatCard title="Thành viên" value={stats.userCount} color="text-green-400" />
            </div>
            {/* Top phim doanh thu cao */}
            <div className="bg-cinema-800 p-6 rounded-3xl border border-white/5">
                <h3 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest italic">Xếp hạng doanh thu</h3>
                <div className="space-y-4">
                    {movies.sort((a,b) => b.revenue - a.revenue).slice(0,5).map(m => (
                        <div key={m.id} className="flex items-center justify-between text-xs font-bold">
                            <span>{m.title}</span>
                            <span className="text-yellow-500">{m.revenue.toLocaleString()}đ</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === "movies" && (
          <div className="animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Quản lý kho phim</h2>
              <button onClick={() => setShowMovieForm(true)} className="bg-green-600 px-8 py-3 rounded-xl font-black text-xs hover:bg-green-500 transition-all shadow-lg shadow-green-600/20">+ THÊM PHIM</button>
            </div>

            <div className="grid grid-cols-4 gap-8">
              {movies.map((m) => (
                <div key={m.id} className="bg-cinema-800 rounded-[32px] overflow-hidden border border-white/5 flex flex-col group hover:border-yellow-500/40 transition-all duration-500">
                  <div className="relative aspect-[3/4.5] overflow-hidden">
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    
                    {/* ✅ BADGE THỂ LOẠI - Hiển thị "Action, Superhero" */}
                    <div className="absolute bottom-4 left-4 right-4 px-3 py-2 rounded-xl text-[10px] font-black bg-yellow-500 text-black text-center uppercase shadow-2xl">
                      {m.genre || "Chưa phân loại"}
                    </div>

                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[9px] font-black bg-black/80 backdrop-blur-md uppercase border border-white/10">
                      {m.isNowPlaying ? <span className="text-green-400">Đang chiếu</span> : <span className="text-blue-400">Sắp chiếu</span>}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-base line-clamp-2 mb-4 h-12 italic uppercase leading-tight tracking-tighter">{m.title}</h4>
                      <div className="bg-cinema-900/50 p-4 rounded-2xl mb-6 space-y-2 text-[11px] border border-white/5 font-bold italic text-gray-400">
                        <p className="flex justify-between">Thời lượng: <span className="text-white">{m.duration}m</span></p>
                        <p className="flex justify-between text-yellow-500">Doanh thu: <span>{m.revenue.toLocaleString()}đ</span></p>
                      </div>
                    </div>
                    <button onClick={() => deleteMovieApi(m.id).then(fetchData)} className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-3.5 rounded-xl font-black text-[10px] uppercase transition-all">Gỡ bỏ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL THÊM PHIM */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAddMovie} className="bg-cinema-800 p-10 rounded-[40px] w-full max-w-lg space-y-5 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-black text-yellow-500 italic text-center uppercase tracking-widest mb-4">Cấu hình phim mới</h3>
            <input className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none focus:border-yellow-500 font-bold" placeholder="Tên phim" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required />
            <select className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl font-bold outline-none" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input className="w-full p-4 bg-cinema-900 border border-white/5 rounded-2xl outline-none" placeholder="File ảnh (endgame.jpg)" value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" className="p-4 bg-cinema-900 border border-white/5 rounded-2xl font-bold" placeholder="Giá vé" value={movieForm.price} onChange={(e) => setMovieForm({...movieForm, price: Number(e.target.value)})} />
                <input type="number" className="p-4 bg-cinema-900 border border-white/5 rounded-2xl font-bold" placeholder="Phút" value={movieForm.duration} onChange={(e) => setMovieForm({...movieForm, duration: Number(e.target.value)})} />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowMovieForm(false)} className="flex-1 bg-white/5 py-5 rounded-2xl font-bold">HỦY</button>
              <button type="submit" className="flex-1 bg-yellow-500 text-black py-5 rounded-2xl font-black uppercase text-xs">XÁC NHẬN LƯU</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <div className="bg-cinema-800 p-8 rounded-[32px] border border-white/5 shadow-xl transition-all hover:border-white/10">
    <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">{title}</p>
    <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
  </div>
);

export default AdminDashboard;

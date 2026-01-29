import React, { useEffect, useMemo, useState, useCallback } from "react";
import { 
  Users, 
  Film, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  DollarSign, 
  Ticket, 
  X 
} from "lucide-react";
import { User } from "../types";
import {
  getAllUsers,
  deleteUser,
  addMovieApi,
  deleteMovieApi,
  getRevenueAdmin,
} from "../services/api";

/* --- Types & Constants --- */
type Tab = "dashboard" | "movies" | "users";

interface Movie {
  id: number;
  title: string;
  genre: string;
  director: string;
  description: string;
  duration: number;
  poster: string;
  price: number;
  rating: number;
  upcoming: boolean;
  isNowPlaying: boolean;
  sold: number;
  revenue: number;
}

const FALLBACK_POSTER = "https://via.placeholder.com/300x450?text=No+Image";
const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovieForm, setShowMovieForm] = useState(false);

  const [movieForm, setMovieForm] = useState({
    title: "",
    genre: "",
    director: "",
    description: "",
    poster: "",
    duration: 120,
    price: 55000,
    rating: 0,
    status: "now" as "now" | "upcoming",
  });

  /* --- Data Fetching --- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, revenueData] = await Promise.all([
        getAllUsers(),
        getRevenueAdmin(),
      ]);

      setUsers(Array.isArray(userData) ? userData : []);

      const mappedMovies: Movie[] = (revenueData || []).map((m: any) => ({
        ...m,
        id: m.id,
        duration: Number(m.duration),
        poster: m.image 
          ? (m.image.startsWith("http") ? m.image : `${BASE_URL}/uploads/${m.image}`)
          : FALLBACK_POSTER,
        price: Number(m.price),
        rating: Number(m.rating || 0),
        upcoming: Boolean(m.upcoming),
        isNowPlaying: Boolean(m.isNowPlaying),
        sold: Number(m.sold || 0),
        revenue: Number(m.revenue || 0),
      }));

      setMovies(mappedMovies);
    } catch (err) {
      console.error("Lỗi load dữ liệu quản trị:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* --- Computed Stats --- */
  const stats = useMemo(() => ({
    revenue: movies.reduce((s, m) => s + m.revenue, 0),
    tickets: movies.reduce((s, m) => s + m.sold, 0),
    movieCount: movies.length,
    userCount: users.length,
  }), [movies, users]);

  /* --- Event Handlers --- */
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...movieForm,
      image: movieForm.poster,
      isNowPlaying: movieForm.status === "now" ? 1 : 0,
      upcoming: movieForm.status === "upcoming" ? 1 : 0,
    };

    try {
      await addMovieApi(payload);
      setShowMovieForm(false);
      fetchData();
    } catch {
      alert("Lỗi thêm phim mới");
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-yellow-500 font-bold">
      <div className="animate-pulse">ĐANG TẢI DỮ LIỆU...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-black tracking-tighter text-yellow-500">CINEMA <span className="text-white">PRO</span></h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === 'movies'} 
            onClick={() => setActiveTab('movies')}
            icon={<Film size={20} />}
            label="Quản lý Phim" 
          />
          <NavButton 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            icon={<Users size={20} />}
            label="Người dùng" 
          />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold capitalize">{activeTab}</h2>
          <div className="text-sm text-zinc-400">Chào Admin, {new Date().toLocaleDateString('vi-VN')}</div>
        </header>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tổng doanh thu" value={formatCurrency(stats.revenue)} icon={<DollarSign className="text-emerald-500" />} />
            <StatCard title="Vé đã bán" value={stats.tickets} icon={<Ticket className="text-blue-500" />} />
            <StatCard title="Số lượng phim" value={stats.movieCount} icon={<Film className="text-purple-500" />} />
            <StatCard title="Thành viên" value={stats.userCount} icon={<Users className="text-yellow-500" />} />
          </div>
        )}

        {activeTab === "movies" && (
          <section className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <p className="text-zinc-400">Danh sách các phim đang quản lý trên hệ thống.</p>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Thêm phim mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} onDelete={deleteMovieApi} onRefresh={fetchData} />
              ))}
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 animate-in slide-in-from-bottom-4">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-zinc-400 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== "admin" && (
                        <button 
                          onClick={async () => { if(confirm('Xóa user?')) { await deleteUser(u.id); fetchData(); }}}
                          className="text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* MODAL FORM */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setShowMovieForm(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6">Thêm Phim Mới</h3>
            <form onSubmit={handleAddMovie} className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 space-y-1">
                <label className="text-zinc-400">Tên phim</label>
                <input required className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500" 
                  value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Thể loại</label>
                <input required className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500" 
                  value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400">Đạo diễn</label>
                <input required className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500" 
                  value={movieForm.director} onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-zinc-400">Mô tả ngắn</label>
                <textarea rows={3} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500" 
                  value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-zinc-400">Link ảnh Poster</label>
                <input className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500" 
                  value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} />
              </div>
              <button type="submit" className="col-span-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-all mt-4">
                XÁC NHẬN LƯU PHIM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Sub-Components --- */

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? "bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20" : "text-zinc-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) => (
  <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
    </div>
    <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">{title}</p>
    <p className="text-2xl font-black mt-1">{value}</p>
  </div>
);

const MovieCard = ({ movie, onDelete, onRefresh }: { movie: Movie; onDelete: any; onRefresh: any }) => (
  <div className="group bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all">
    <div className="relative h-72 overflow-hidden">
      <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-500">
        ⭐ {movie.rating}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-lg truncate mb-1">{movie.title}</h3>
      <div className="flex justify-between text-xs text-zinc-400 mb-4">
        <span>{movie.genre}</span>
        <span>{movie.duration} phút</span>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-xs uppercase text-zinc-500">Doanh thu: <span className="text-zinc-100 block font-bold">{movie.revenue.toLocaleString()}đ</span></div>
        <button 
          onClick={async () => { if(confirm('Xóa phim?')) { await onDelete(movie.id); onRefresh(); }}}
          className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  </div>
);

export default AdminDashboard;

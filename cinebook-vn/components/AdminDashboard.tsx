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
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

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

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, revenueData] = await Promise.all([
        getAllUsers(),
        getRevenueAdmin(),
      ]);

      setUsers(Array.isArray(userData) ? userData : []);

      const mappedMovies: Movie[] = (revenueData || []).map((m: any) => {
        const poster = m.image
          ? m.image.startsWith("http")
            ? m.image
            : `${BASE_URL}/uploads/${m.image}`
          : FALLBACK_POSTER;

        return {
          id: m.id,
          title: m.title,
          genre: m.genre,
          director: m.director,
          description: m.description,
          duration: Number(m.duration),
          poster,
          price: Number(m.price),
          rating: Number(m.rating || 0),
          upcoming: Boolean(m.upcoming),
          isNowPlaying: Boolean(m.isNowPlaying),
          sold: Number(m.sold || 0),
          revenue: Number(m.revenue || 0),
        };
      });

      setMovies(mappedMovies);
    } catch (err) {
      console.error("Lỗi load admin data:", err);
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
      revenue: movies.reduce((s, m) => s + m.revenue, 0),
      tickets: movies.reduce((s, m) => s + m.sold, 0),
      movieCount: movies.length,
      userCount: users.length,
    };
  }, [movies, users]);

  /* ================= ACTIONS ================= */
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: movieForm.title,
      genre: movieForm.genre,
      director: movieForm.director,
      description: movieForm.description,
      duration: movieForm.duration,
      image: movieForm.poster,
      rating: movieForm.rating,
      price: movieForm.price,
      isNowPlaying: movieForm.status === "now" ? 1 : 0,
      upcoming: movieForm.status === "upcoming" ? 1 : 0,
    };

    try {
      await addMovieApi(payload);
      setShowMovieForm(false);
      fetchData();
    } catch {
      alert("Lỗi thêm phim");
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Xóa phim?")) return;
    try {
      await deleteMovieApi(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Không thể xóa phim");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Xóa user?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Không thể xóa user");
    }
  };

  /* ================= UI ================= */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading admin...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-72 bg-cinema-800 p-6">
        {["dashboard", "movies", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`block w-full mb-3 p-4 rounded-xl font-bold ${
              activeTab === tab
                ? "bg-yellow-500 text-black"
                : "hover:bg-white/5"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-black mb-8">DASHBOARD</h1>
            <div className="grid grid-cols-4 gap-6">
              <StatCard title="Doanh thu" value={`${stats.revenue}đ`} />
              <StatCard title="Vé bán" value={stats.tickets} />
              <StatCard title="Phim" value={stats.movieCount} />
              <StatCard title="User" value={stats.userCount} />
            </div>
          </>
        )}

        {/* MOVIES */}
        {activeTab === "movies" && (
          <>
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-black">QUẢN LÝ PHIM</h2>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-green-500 px-6 py-3 rounded-xl"
              >
                + Thêm phim
              </button>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="bg-cinema-800 rounded-2xl overflow-hidden"
                >
                  <img src={m.poster} className="h-64 w-full object-cover" />
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold">{m.title}</h3>
                    <p className="text-xs text-gray-400">{m.genre}</p>
                    <p className="text-xs">🎬 {m.director}</p>
                    <p className="text-yellow-400">⭐ {m.rating}</p>
                    <button
                      onClick={() => handleDeleteMovie(m.id)}
                      className="mt-3 text-red-400"
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
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role !== "admin" && (
                      <button onClick={() => handleDeleteUser(u.id)}>
                        Xóa
                      </button>
                    )}
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
            className="bg-cinema-800 p-8 rounded-2xl w-[600px] space-y-4"
          >
            <input placeholder="Title" onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} />
            <input placeholder="Genre" onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} />
            <input placeholder="Director" onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })} />
            <textarea placeholder="Description" onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} />
            <input placeholder="Poster" onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} />
            <button className="bg-yellow-500 w-full py-3 rounded-xl text-black">
              Lưu phim
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: any }) => (
  <div className="bg-cinema-800 p-6 rounded-xl">
    <p className="text-gray-400 text-sm">{title}</p>
    <p className="text-2xl font-black">{value}</p>
  </div>
);

export default AdminDashboard;

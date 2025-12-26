import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Movie, User } from "../types";
import { getAllUsers, deleteUser } from "../services/api";

type Tab = "dashboard" | "movies" | "users";

interface AdminDashboardProps {
  movies?: Movie[];
  onAddMovie: (movie: Movie) => Promise<void>;
  onDeleteMovie: (id: string) => Promise<void>;
}

const FALLBACK_POSTER =
  "https://via.placeholder.com/300x450?text=No+Image";

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  movies = [],
  onAddMovie,
  onDeleteMovie,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovieForm, setShowMovieForm] = useState(false);

  const [movieForm, setMovieForm] = useState<Partial<Movie>>({
    title: "",
    poster: "",
    price: 80000,
    duration: 120,
  });

  /* ================= USERS ================= */
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return setLoading(false);

    try {
      const data = await getAllUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ================= DELETE USER ================= */
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xoá người dùng này?")) return;

    const token = localStorage.getItem("userToken");
    if (!token) return;

    await deleteUser(id, token);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  /* ================= ADD MOVIE ================= */
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!movieForm.title) return;

    const payload: Movie = {
      id: crypto.randomUUID(),
      title: movieForm.title,
      poster: movieForm.poster || FALLBACK_POSTER,
      price: Number(movieForm.price),
      duration: Number(movieForm.duration),
      rating: 0,
      description: "",
      director: "",
      cast: [],
      genre: [],
      isNowPlaying: 1,
      image: "",
      backdrop: ""
    };

    await onAddMovie(payload);

    setShowMovieForm(false);
    setMovieForm({
      title: "",
      poster: "",
      price: 80000,
      duration: 120,
    });
  };

  /* ================= STATS ================= */
  const stats = useMemo(
    () => ({
      users: users.length,
      movies: movies.length,
    }),
    [users, movies]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Đang tải dữ liệu quản trị...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cinema-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-cinema-800 p-6 space-y-3">
        <h2 className="text-xl font-bold text-yellow-500">Admin Panel</h2>

        {[
          ["dashboard", "📊 Dashboard"],
          ["movies", "🎬 Quản lý phim"],
          ["users", "👥 Người dùng"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as Tab)}
            className={`w-full text-left px-4 py-2 rounded transition
              ${activeTab === key
                ? "bg-yellow-500 text-black font-semibold"
                : "hover:bg-white/10"
              }`}
          >
            {label}
          </button>
        ))}
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-2 gap-6">
            <StatCard title="Người dùng" value={stats.users} />
            <StatCard title="Phim" value={stats.movies} />
          </div>
        )}

        {/* MOVIES */}
        {activeTab === "movies" && (
          <>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Danh sách phim</h2>
              <button
                onClick={() => setShowMovieForm(true)}
                className="bg-green-600 px-4 py-2 rounded"
              >
                + Thêm phim
              </button>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="bg-cinema-800 rounded-xl overflow-hidden shadow"
                >
                  <img
                    src={m.poster || FALLBACK_POSTER}
                    alt={m.title}
                    className="h-44 w-full object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = FALLBACK_POSTER)
                    }
                  />

                  <div className="p-4 space-y-1">
                    <h4 className="font-semibold">{m.title}</h4>
                    <p className="text-sm text-gray-400">
                      {m.price.toLocaleString()} đ
                    </p>

                    <button
                      onClick={() => onDeleteMovie(m.id)}
                      className="text-red-400 text-sm mt-2"
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
          <table className="w-full bg-cinema-800 rounded-xl overflow-hidden">
            <thead className="bg-cinema-900 text-gray-400">
              <tr>
                <th className="p-4 text-left">Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="p-4">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td className="text-right p-4">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-400 text-sm"
                      >
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

      {/* MODAL ADD MOVIE */}
      {showMovieForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <form
            onSubmit={handleAddMovie}
            className="bg-cinema-800 p-6 rounded-xl w-96 space-y-3"
          >
            <h3 className="text-lg font-bold">Thêm phim mới</h3>

            <input
              className="w-full p-2 bg-cinema-900"
              placeholder="Tên phim"
              value={movieForm.title}
              onChange={(e) =>
                setMovieForm({ ...movieForm, title: e.target.value })
              }
              required
            />

            <input
              className="w-full p-2 bg-cinema-900"
              placeholder="Poster URL"
              value={movieForm.poster}
              onChange={(e) =>
                setMovieForm({ ...movieForm, poster: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full p-2 bg-cinema-900"
              placeholder="Giá vé"
              value={movieForm.price}
              onChange={(e) =>
                setMovieForm({ ...movieForm, price: Number(e.target.value) })
              }
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMovieForm(false)}
                className="flex-1 bg-gray-600 py-2 rounded"
              >
                Hủy
              </button>
              <button className="flex-1 bg-yellow-500 text-black py-2 rounded">
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-cinema-800 p-6 rounded-xl">
    <p className="text-gray-400">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;

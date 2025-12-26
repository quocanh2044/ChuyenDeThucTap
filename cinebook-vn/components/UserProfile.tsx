import React from 'react';
import { User } from '../types';

interface UserProfileProps {
  user: User | null | undefined;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {

  // Nếu không có user → tránh crash
  if (!user) {
    return (
      <div className="text-center text-gray-400 py-20">
        🚫 Không tải được thông tin người dùng.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="bg-gradient-to-r from-cinema-800 to-cinema-900 rounded-3xl p-8 border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {(user.name?.charAt(0) || "U").toUpperCase()}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">{user.name || "Unknown User"}</h2>
            <p className="text-gray-400">{user.email || "No email"}</p>

            <div className="mt-2 inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-lg">
              <span className="text-yellow-500 font-bold">
                Thành viên {user.role === "admin" ? "Admin" : "Thân thiết"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-2xl border border-white/5 min-w-[200px] text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">CinePoints</p>
          <p className="text-4xl font-bold text-yellow-500">{(user.points || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Dùng điểm để đổi quà</p>
        </div>
      </div>

      {/* Booking History */}
      <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-yellow-500 pl-4">
        Lịch Sử Đặt Vé
      </h3>

      {(user.history?.length || 0) === 0 ? (
        <div className="text-center py-16 bg-cinema-800/50 rounded-2xl border border-dashed border-gray-700">
          <span className="text-4xl block mb-2">🎟️</span>
          <p className="text-gray-400">Bạn chưa có lịch sử đặt vé nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...user.history].reverse().map((booking) => (
            <div
              key={booking.id}
              className="bg-cinema-800 rounded-xl p-5 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-colors"
            >
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-1">
                  {booking.movieTitle}
                </h4>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                  <span>📅 {booking.date}</span>
                  <span>⏰ {booking.time}</span>
                  <span>💺 {booking.seats?.join(", ")}</span>
                </div>

                {booking.concessions?.length > 0 && (
                  <div className="text-xs text-gray-500">
                    🥤 Combo:{" "}
                    {booking.concessions
                      .map((c) => `${c.quantity}x ${c.name}`)
                      .join(", ")}
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {booking.totalPrice.toLocaleString()} đ
                </p>
                <p className="text-sm text-green-400">
                  + {booking.pointsEarned.toLocaleString()} Points
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(booking.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;

import React from "react";
import { UserProfile as UserProfileType } from "../types";
import { Calendar, Clock, CreditCard, User, Mail, Ticket } from "lucide-react";

interface UserProfileProps {
  user: UserProfileType | null | undefined;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) return <div className="text-center text-gray-400 py-20">🚫 Không tải được thông tin.</div>;

  const { name = "Người dùng", email = "", bookingHistory = [] } = user;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Cụm Header: Profile Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 mb-10 shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl font-black text-black shadow-lg shadow-orange-500/20">
            {(name?.charAt(0) || "?").toUpperCase()}
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-extrabold text-white mb-2">{name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="flex items-center gap-2 text-gray-400 text-sm bg-black/30 px-3 py-1 rounded-full border border-white/5">
                <Mail size={14} /> {email}
              </span>
              <span className="flex items-center gap-2 text-yellow-500 text-sm bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                <User size={14} /> Thành viên Bạc
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử đặt vé */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
          <Ticket size={24} />
        </div>
        <h3 className="text-2xl font-bold text-white">Lịch sử giao dịch</h3>
      </div>

      {bookingHistory.length === 0 ? (
        <div className="bg-gray-800/50 border border-dashed border-gray-700 rounded-2xl p-20 text-center">
          <p className="text-gray-500">Bạn chưa có giao dịch nào gần đây.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookingHistory.map((b) => (
            <div
              key={b.id}
              className="group bg-gray-800/40 hover:bg-gray-800/80 border border-white/5 hover:border-yellow-500/30 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center transition-all duration-300"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="hidden md:flex w-12 h-12 bg-white/5 rounded-xl items-center justify-center text-gray-400 group-hover:text-yellow-500 transition-colors">
                  <Ticket size={24} />
                </div>
                <div>
                  <p className="text-white font-bold text-lg group-hover:text-yellow-400 transition-colors">
                    {b.movieTitle}
                  </p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(b.date).toLocaleDateString('vi-VN')}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {b.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                <p className="text-xl font-black text-white flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-normal">Tổng:</span>
                  {Number(b.totalAmount).toLocaleString()} <span className="text-sm underline">đ</span>
                </p>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Mã vé: #{b.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
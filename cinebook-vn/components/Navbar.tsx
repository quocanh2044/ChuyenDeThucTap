// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { ViewState, User } from '../types';
import {
  Menu,
  ChevronDown,
  User as UserIcon,
  Ticket,
  LogOut,
  UserCircle,
  Settings,
  LayoutDashboard,
  Popcorn
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hiệu ứng đổi màu nền khi cuộn trang
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = user?.name || "Người dùng";
  const role = user?.role === "admin" ? "admin" : "user";

  const checkAuthAndNavigate = (targetView: ViewState, actionName: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(`Vui lòng đăng nhập để ${actionName}.`);
      onNavigate('LOGIN');
      return;
    }
    onNavigate(targetView);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-gray-950/90 backdrop-blur-md shadow-2xl border-b border-white/5 py-2'
        : 'bg-gray-950 py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* LEFT: Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('BOOKING_ROOT')}
          >
            <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
              <Ticket className="text-white" size={24} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter text-white">
                CINE<span className="text-red-500">BOOK</span>
              </span>
              <span className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Vietnam</span>
            </div>
          </div>

          {/* CENTER: Main Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('BOOKING_ROOT')}
              className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Phim đang chiếu
            </button>
            <button
              onClick={() => checkAuthAndNavigate('CONCESSIONS', 'đặt bắp nước')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-400/5"
            >
              <Popcorn size={18} />
              Bắp nước
            </button>
          </div>

          {/* RIGHT: User Actions */}
          <div className="flex items-center gap-4">

            {/* Language Switcher (Optional) */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
              <span>🇻🇳</span>
              <span>VN</span>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center gap-3 p-1 pr-3 rounded-full transition-all border ${isMenuOpen
                      ? 'bg-white/10 border-red-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-tr from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                    <span className="text-xs font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-bold text-gray-200">
                    {displayName}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu hiện đại */}
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-60 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/[0.02]">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Thành viên</p>
                        <p className="text-sm font-bold text-white truncate">{displayName}</p>
                      </div>

                      {role === "admin" && (
                        <button
                          onClick={() => checkAuthAndNavigate('ADMIN', 'truy cập quản trị')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LayoutDashboard size={18} />
                          Trang quản trị
                        </button>
                      )}

                      <button
                        onClick={() => checkAuthAndNavigate('PROFILE', 'xem hồ sơ')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <UserCircle size={18} />
                        Hồ sơ & Lịch sử
                      </button>

                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                        <Settings size={18} />
                        Cài đặt
                      </button>

                      <div className="h-px bg-white/5 my-1"></div>

                      <button
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-red-600 transition-all"
                      >
                        <LogOut size={18} />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('REGISTER')}
                  className="hidden lg:block px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => onNavigate('LOGIN')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-red-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  ĐĂNG NHẬP
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// components/Navbar.tsx
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { Search, MapPin, Menu, ChevronDown, User as UserIcon, Ticket } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  // 🟢 THÊM PROP XỬ LÝ TÌM KIẾM
  onSearch: (term: string) => void;
}

// 🟢 NHẬN PROP ONSEARCH
const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const displayName = user?.name || "User";
  const points = user?.points ?? 0;
  const role = user?.role === "admin" ? "admin" : "user";

  const checkAuthAndNavigate = (targetView: ViewState, actionName: string) => {
    const token = localStorage.getItem("token");

    if (!token || token.length === 0) {
      alert(`Vui lòng đăng nhập để ${actionName}.`);
      onNavigate('LOGIN');
      return;
    }

    onNavigate(targetView);
    setIsMenuOpen(false);
  };

  // 🟢 GỌI PROP ONSEARCH
  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      onSearch(searchTerm.trim());
      // Sau khi tìm kiếm, có thể reset ô tìm kiếm: 
      // setSearchTerm(''); 
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-cinema-900/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Cụm LEFT: Logo và Nút chức năng */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center cursor-pointer p-2"
              onClick={() => onNavigate('BOOKING_ROOT')}
            >
              <span className="text-3xl mr-2">🎬</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 text-transparent bg-clip-text">
                CineBook VN
              </span>
            </div>

            {/* NÚT ĐẶT VÉ NGAY */}
            <button
              onClick={() => checkAuthAndNavigate('BOOKING_ROOT', 'đặt vé')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg 
                         bg-red-600 hover:bg-red-700 transition-all text-white font-bold text-sm"
            >
              <Ticket size={20} />
              ĐẶT VÉ NGAY
            </button>


            {/* NÚT ĐẶT BẮP NƯỚC */}
            <button
              onClick={() => checkAuthAndNavigate('CONCESSIONS', 'đặt bắp nước')}
              className="hidden lg:flex items-center gap-2 p-2 rounded-xl shadow-lg 
                         bg-orange-500 hover:bg-orange-600 transition-all text-black font-bold"
            >
              <span className="text-lg">🍿</span>
              ĐẶT BẮP NƯỚC
            </button>

          </div>


          {/* Cụm CENTER/RIGHT: Tìm kiếm và Tài khoản */}
          <div className="flex items-center space-x-4">

            {/* THANH TÌM KIẾM */}
            <div className="hidden md:flex w-full max-w-xs relative">
              <input
                type="text"
                placeholder="Tìm phim, rạp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-gray-200/90 text-black py-2 pl-4 pr-10 rounded-full 
                               border border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/50 
                               focus:outline-none transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-700 hover:text-cyan-500 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>


            {/* Nút Ngôn ngữ/Vị trí */}
            <div className="flex items-center text-white text-sm cursor-pointer hover:opacity-80 transition-opacity">
              <span className="mr-1">🇻🇳</span>
              <span className="hidden sm:block">VN</span>
            </div>


            {/* DESKTOP USER/LOGIN MENU */}
            <div className="hidden md:flex items-center space-x-6">

              {user ? (
                <div className="flex items-center gap-4">
                  {/* Points */}
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full">
                    <span className="text-yellow-500">💎</span>
                    <span className="text-yellow-500 font-bold text-sm">
                      {points.toLocaleString()} CP
                    </span>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-2 text-white hover:text-yellow-500 transition-colors"
                    >
                      <div className="w-8 h-8 bg-cinema-800 rounded-full flex items-center justify-center border border-gray-600">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm max-w-[100px] truncate hidden lg:block">
                        {displayName}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-cinema-800 rounded-xl shadow-xl border border-white/10 overflow-hidden py-1 animate-fade-in z-50">
                        {/* Admin Menu */}
                        {role === "admin" && (
                          <button
                            onClick={() => checkAuthAndNavigate('ADMIN', 'truy cập trang quản trị')}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                          >
                            ⚡ Quản trị (Admin)
                          </button>
                        )}

                        {/* Profile */}
                        <button
                          onClick={() => checkAuthAndNavigate('PROFILE', 'xem hồ sơ')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                        >
                          👤 Tài khoản & Lịch sử
                        </button>

                        <div className="h-px bg-white/10 my-1"></div>

                        {/* Logout */}
                        <button
                          onClick={() => {
                            onLogout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                        >
                          🚪 Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onNavigate('REGISTER')}
                    className="text-gray-300 hover:text-white text-sm font-medium hidden lg:block"
                  >
                    Đăng Ký
                  </button>

                  <button
                    onClick={() => onNavigate('LOGIN')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-full text-sm font-bold transition-transform transform hover:scale-105"
                  >
                    <UserIcon size={18} className="md:hidden" />
                    <span className="hidden md:inline">Đăng Nhập</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
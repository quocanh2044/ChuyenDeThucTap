import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cinema-900 border-t border-white/10 pt-16 pb-8 mt-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎬</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 text-transparent bg-clip-text">
                CineBook VN
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao với hệ thống rạp chiếu phim hiện đại, âm thanh sống động và màn hình sắc nét nhất Việt Nam.
            </p>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'youtube', 'twitter'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all"
                >
                  <img 
                    src={`https://cdn.simpleicons.org/${social}/${social === 'youtube' ? 'ff0000' : 'white'}`} 
                    alt={social} 
                    className="w-5 h-5 filter hover:brightness-0" 
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-yellow-500 pl-3">Về Chúng Tôi</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Tiện ích Online</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Thẻ quà tặng</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Liên hệ quảng cáo</a></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-yellow-500 pl-3">Điều Khoản</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Điều khoản chung</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Chính sách thanh toán</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Column 4: Contact & App */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-yellow-500 pl-3">Chăm Sóc Khách Hàng</h3>
            <div className="space-y-3 text-sm text-gray-400 mb-6">
              <p>Hotline: <span className="text-white font-bold">1900 1234</span></p>
              <p>Giờ làm việc: 8:00 - 22:00</p>
              <p>Email: <a href="mailto:support@cinebook.vn" className="text-yellow-500">support@cinebook.vn</a></p>
            </div>
            {/* App Store Badges (Mock) */}
            <div className="flex gap-2">
               <div className="h-10 bg-black border border-gray-700 rounded-lg flex items-center px-2 cursor-pointer hover:border-white">
                  <span className="text-xs text-gray-400">Download on the</span>
                  <span className="text-white font-bold ml-1">App Store</span>
               </div>
               <div className="h-10 bg-black border border-gray-700 rounded-lg flex items-center px-2 cursor-pointer hover:border-white">
                  <span className="text-xs text-gray-400">Get it on</span>
                  <span className="text-white font-bold ml-1">Google Play</span>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 CineBook VN. All rights reserved.</p>
          <div className="flex gap-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Da_thong_bao_bo_cong_thuong_website_thuong_mai_dien_tu_sales_noti_logo.png" alt="Bo Cong Thuong" className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState } from 'react';
import { User, Mail, Lock, UserCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

interface AuthProps {
  mode: 'LOGIN' | 'REGISTER';
  onSuccess: (user: any) => void;
  onNavigate: (path: string) => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = mode === 'REGISTER'
        ? await registerUser(formData)
        : await loginUser({ email: formData.email, password: formData.password });

      const token = response.token || response.accessToken;
      if (!token) throw new Error("Không nhận được mã xác thực!");

      localStorage.setItem("token", token);
      onSuccess(response.user);
      onNavigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-950">
      {/* Card Container */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            {mode === 'LOGIN' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'LOGIN' 
              ? 'Vui lòng nhập thông tin để truy cập hệ thống' 
              : 'Tham gia cùng chúng tôi để trải nghiệm dịch vụ tốt nhất'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field: Name (Only for Register) */}
          {mode === 'REGISTER' && (
            <div className="relative group">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
              <input
                required
                name="name"
                type="text"
                placeholder="Họ và tên"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all"
                onChange={handleChange}
              />
            </div>
          )}

          {/* Field: Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input
              required
              name="email"
              type="email"
              placeholder="Địa chỉ Email"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all"
              onChange={handleChange}
            />
          </div>

          {/* Field: Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input
              required
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-11 pr-12 py-3.5 text-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all"
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-yellow-500/10"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {mode === 'LOGIN' ? 'Đăng Nhập' : 'Bắt Đầu Ngay'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          {mode === 'LOGIN' ? (
            <p>Chưa có tài khoản? <button onClick={() => onNavigate('/register')} className="text-yellow-500 hover:underline font-semibold">Đăng ký miễn phí</button></p>
          ) : (
            <p>Đã có tài khoản? <button onClick={() => onNavigate('/login')} className="text-yellow-500 hover:underline font-semibold">Đăng nhập ngay</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
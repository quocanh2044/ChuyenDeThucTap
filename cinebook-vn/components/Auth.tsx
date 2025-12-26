import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/api';

interface AuthProps {
  mode: 'LOGIN' | 'REGISTER';
  onSuccess: (user: User) => void;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response =
        mode === 'REGISTER'
          ? await registerUser(formData)
          : await loginUser({
            email: formData.email,
            password: formData.password,
          });

      const token = response.token || response.accessToken;
      const user = response.user;

      if (!token) throw new Error("Server không trả token");

      localStorage.setItem("token", token);

      onSuccess(user);
      onNavigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Đã xảy ra lỗi!"
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {mode === 'LOGIN' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <input
              required
              type="text"
              placeholder="Họ và tên"
              className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          )}

          <input
            required
            type="email"
            placeholder="Email"
            className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            required
            type="password"
            placeholder="Mật khẩu"
            className="w-full bg-gray-900 rounded-lg px-4 py-3 text-white"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg"
          >
            {mode === 'LOGIN' ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

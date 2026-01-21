import { ChatMessage } from '../types';

// Xóa API_KEY ở đây để bảo mật, chỉ dùng Backend để gọi Gemini
export const getMovieRecommendation = async (history: ChatMessage[]) => {
  // Đổi URL này thành URL Backend của bạn (ví dụ trên Render hoặc localhost)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }) // Gửi lịch sử chat lên server
    });

    if (response.ok) {
      const data = await response.json();
      return data.text; // Backend trả về { text: "..." }
    }

    // Nếu lỗi 403 từ backend, kiểm tra lại API KEY trong file .env của BACKEND
    return "CineBot đang bận xíu (Lỗi Server), bạn thử lại nhé! 🎬";
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    return "Lỗi kết nối CineBook AI.";
  }
};
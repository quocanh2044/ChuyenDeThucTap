import { ChatMessage } from '../types';

// 1. Lấy URL gốc từ môi trường
const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

// 2. Logic làm sạch URL để tránh lỗi /api/api/chat
const getCleanUrl = (baseUrl: string) => {
  let url = baseUrl.trim();
  if (url.endsWith('/')) url = url.slice(0, -1); // Xóa dấu / ở cuối nếu có
  if (url.endsWith('/api')) url = url.slice(0, -4); // Xóa /api nếu bạn đã lỡ điền trong env
  return `${url}/api/chat`;
};

const FINAL_API_URL = getCleanUrl(RAW_API_URL);

// DỮ LIỆU PHIM (GIỮ NGUYÊN 100%)
export const CINEBOOK_MOVIES = [
  { id: 11, title: "Avengers: Endgame", genre: "Action, Superhero", desc: "Sau khi Thanos xóa sổ một nửa vũ trụ, nhóm Avenger tập hợp lại...", duration: 180, rating: 4.5, isNowPlaying: 1, price: "55.000đ" },
  { id: 12, title: "Spider-Man: No Way Home", genre: "Action, Adventure, Superhero", desc: "Peter Parker đối mặt đa vũ trụ khi danh tính bị lộ...", duration: 150, rating: 4.0, isNowPlaying: 1, price: "55.000đ" },
  { id: 13, title: "Mai", genre: "Drama, Romance", desc: "Câu chuyện cảm động về hành trình chữa lành và tìm lại bản thân...", duration: 125, rating: 4.5, isNowPlaying: 1, price: "55.000đ" },
  { id: 14, title: "Lật Mặt 7", genre: "Action, Drama", desc: "Câu chuyện độc lập với nhiều yếu tố hành động, kịch tính...", duration: 130, rating: 4.3, isNowPlaying: 1, price: "55.000đ" },
  { id: 15, title: "Godzilla x Kong: The New Empire", genre: "Action, Monster", desc: "Godzilla và Kong hợp tác đối đầu thế lực cổ đại...", duration: 115, rating: 5.0, isNowPlaying: 1, price: "55.000đ" },
  { id: 16, title: "Inside Out 2", genre: "Animation, Family", desc: "Riley bước vào tuổi dậy thì với những cảm xúc mới...", duration: 95, rating: 4.5, isNowPlaying: 1, price: "55.000đ" },
  { id: 17, title: "Dune: Part Two", genre: "Sci-Fi, Action", desc: "Paul Atreides hợp sức với người Fremen để chống lại...", duration: 166, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 18, title: "Deadpool & Wolverine", genre: "Action, Superhero", desc: "Deadpool hợp tác với Wolverine trong nhiệm vụ đa vũ trụ...", duration: 128, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 19, title: "How to Train Your Dragon (Live Action)", genre: "Adventure, Family", desc: "Phiên bản live-action về hành trình của Hiccup và Răng Sún...", duration: 130, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 20, title: "Thanh Gươm Diệt Quỷ: Infinity Castle", genre: "Animation, Action", desc: "Tanjirou và các trụ cột bước vào trận chiến cuối cùng...", duration: 100, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 22, title: "Tấm Cám: Chuyện chưa kể", genre: "Fantasy, Drama", desc: "Phiên bản mới của truyện Tấm Cám theo phong cách u tối...", duration: 120, rating: 0.0, isNowPlaying: 0, price: "55.000đ" }
];

// DỮ LIỆU BẮP NƯỚC (GIỮ NGUYÊN 100%)
export const CINEBOOK_CONCESSIONS = [
  { id: 1, name: "Combo Bắp Phô Mai", desc: "Bắp rang phô mai nóng giòn + 1 nước ngọt lớn", price: "45.000đ" },
  { id: 2, name: "Combo Bắp Caramel", desc: "Bắp caramel ngọt dịu + 1 Pepsi", price: "48.000đ" },
  { id: 3, name: "Combo Couple", desc: "2 bắp lớn + 2 nước ngọt dành cho cặp đôi", price: "115.000đ" },
  { id: 4, name: "Bắp Rang Truyền Thống", desc: "Bắp rang bơ truyền thống, vị mặn nhẹ", price: "30.000đ" },
  { id: 5, name: "Nước Ngọt Pepsi", desc: "Pepsi lon lạnh 330ml", price: "25.000đ" },
  { id: 6, name: "Trà Chanh Mật Ong", desc: "Trà chanh mát lạnh pha mật ong", price: "28.000đ" }
];

export const getMovieRecommendation = async (history: ChatMessage[]) => {
  try {
    // Gọi đến URL đã được làm sạch
    const response = await fetch(FINAL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        history: history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          text: msg.text
        }))
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.text; 
    }

    const errorData = await response.json().catch(() => ({}));
    console.error("Backend Error Detail:", errorData);
    return "CineBot đang bận xíu, bạn thử lại nhé! 🎬";

  } catch (error) {
    console.error("Network Error:", error);
    return "Lỗi kết nối CineBook AI. Vui lòng kiểm tra Server!";
  }
};
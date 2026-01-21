import { ChatMessage } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// PHẢI EXPORT mảng này để ChatBot.tsx có thể dùng chung ID
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

export const CINEBOOK_CONCESSIONS = [
  { id: 1, name: "Combo Bắp Phô Mai", desc: "Bắp rang phô mai nóng giòn + 1 nước ngọt lớn", price: "45.000đ" },
  { id: 2, name: "Combo Bắp Caramel", desc: "Bắp caramel ngọt dịu + 1 Pepsi", price: "48.000đ" },{ id: 3, name: "Combo Couple", desc: "2 bắp lớn + 2 nước ngọt dành cho cặp đôi", price: "115.000đ" },
  { id: 4, name: "Bắp Rang Truyền Thống", desc: "Bắp rang bơ truyền thống, vị mặn nhẹ", price: "30.000đ" },
  { id: 5, name: "Nước Ngọt Pepsi", desc: "Pepsi lon lạnh 330ml", price: "25.000đ" },
  { id: 6, name: "Trà Chanh Mật Ong", desc: "Trà chanh mát lạnh pha mật ong", price: "28.000đ" }
];

export const getMovieRecommendation = async (history: ChatMessage[]) => {
  if (!API_KEY) return "Vui lòng cấu hình API Key.";

  const systemPrompt = `Bạn là CineBot - Trợ lý siêu nhiệt tình của CineBook.
  DANH SÁCH PHIM: ${JSON.stringify(CINEBOOK_MOVIES)}.
  DANH SÁCH BẮP NƯỚC: ${JSON.stringify(CINEBOOK_CONCESSIONS)}.

  QUY TẮC CỨNG:
  1. Khi khách chốt phim muốn đặt, PHẢI trả về tên phim trong thẻ [[Tên Phim]]. Tên phim phải khớp 100% với danh sách.
  Ví dụ: "Dạ! Em chuyển anh/chị đến trang đặt vé phim [[Lật Mặt 7]] ngay đây ạ! ✨"
  2. Trả lời bằng tiếng Việt, thân thiện, trôi chảy, có icon 🎬.`;

  const maxRetries = 3;
  let retryCount = 0;
  let waitTime = 3000;

  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: history.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            })),
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }

      if (response.status === 429) {
        await new Promise(res => setTimeout(res, waitTime));
        retryCount++;
        waitTime *= 2;
        continue;
      }
      return "CineBot đang bận xíu, bạn thử lại nhé!";
    } catch (error) {
      return "Lỗi kết nối CineBook AI.";
    }
  }
};
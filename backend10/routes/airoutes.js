import express from "express";
// Không cần import GoogleGenerativeAI nữa vì mình dùng fetch trực tiếp
const router = express.Router();

// 1️⃣ DỮ LIỆU ĐỒNG BỘ 100% VỚI FRONTEND
const CINEBOOK_MOVIES = [
  { id: 11, title: "Avengers: Endgame", genre: "Action, Superhero", desc: "Sau khi Thanos xóa sổ một nửa vũ trụ...", duration: 180, rating: 4.5, isNowPlaying: 1, price: "55.000đ" },
  { id: 12, title: "Spider-Man: No Way Home", genre: "Action, Adventure, Superhero", desc: "Peter Parker đối mặt đa vũ trụ...", duration: 150, rating: 4.0, isNowPlaying: 1, price: "55.000đ" },
  { id: 13, title: "Mai", genre: "Drama, Romance", desc: "Câu chuyện cảm động về hành trình chữa lành...", duration: 125, rating: 4.5, isNowPlaying: 1, price: "55.000đ" },
  { id: 14, title: "Lật Mặt 7", genre: "Action, Drama", desc: "Câu chuyện độc lập với nhiều yếu tố hành động...", duration: 130, rating: 4.3, isNowPlaying: 1, price: "55.000đ" },
  { id: 15, title: "Godzilla x Kong: The New Empire", genre: "Action, Monster", desc: "Godzilla và Kong hợp tác...", duration: 115, rating: 5.0, isNowPlaying: 1, price: "55.000đ" },
  { id: 16, title: "Inside Out 2", genre: "Animation, Family", desc: "Riley bước vào tuổi dậy thì...", duration: 95, rating: 4.5, isNowPlaying: 1, price: "55.000đ" },
  { id: 17, title: "Dune: Part Two", genre: "Sci-Fi, Action", desc: "Paul Atreides hợp sức với người Fremen...", duration: 166, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 18, title: "Deadpool & Wolverine", genre: "Action, Superhero", desc: "Deadpool hợp tác với Wolverine...", duration: 128, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 19, title: "How to Train Your Dragon (Live Action)", genre: "Adventure, Family", desc: "Phiên bản live-action...", duration: 130, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 20, title: "Thanh Gươm Diệt Quỷ: Infinity Castle", genre: "Animation, Action", desc: "Tanjirou và các trụ cột...", duration: 100, rating: 0.0, isNowPlaying: 0, price: "55.000đ" },
  { id: 22, title: "Tấm Cám: Chuyện chưa kể", genre: "Fantasy, Drama", desc: "Phiên bản mới của truyện Tấm Cám...", duration: 120, rating: 0.0, isNowPlaying: 0, price: "55.000đ" }
];

const CINEBOOK_CONCESSIONS = [
  { id: 1, name: "Combo Bắp Phô Mai", desc: "Bắp rang phô mai nóng giòn + 1 nước ngọt lớn", price: "45.000đ" },
  { id: 2, name: "Combo Bắp Caramel", desc: "Bắp caramel ngọt dịu + 1 Pepsi", price: "48.000đ" },
  { id: 3, name: "Combo Couple", desc: "2 bắp lớn + 2 nước ngọt dành cho cặp đôi", price: "115.000đ" },
  { id: 4, name: "Bắp Rang Truyền Thống", desc: "Bắp rang bơ truyền thống, vị mặn nhẹ", price: "30.000đ" },
  { id: 5, name: "Nước Ngọt Pepsi", desc: "Pepsi lon lạnh 330ml", price: "25.000đ" },
  { id: 6, name: "Trà Chanh Mật Ong", desc: "Trà chanh mát lạnh pha mật ong", price: "28.000đ" }
];

// 2️⃣ API CHAT DÙNG GEMINI 3 FLASH PREVIEW
router.post("/", async (req, res) => {
  const { history } = req.body;
  const API_KEY = process.env.VITE_GEMINI_API_KEY; // Đảm bảo đã khai báo trong file .env

  if (!API_KEY) {
    return res.status(500).json({ error: "Vui lòng cấu hình API Key ở Backend." });
  }

  const systemPrompt = `Bạn là CineBot - Trợ lý siêu nhiệt tình của CineBook.
  DANH SÁCH PHIM: ${JSON.stringify(CINEBOOK_MOVIES)}.
  DANH SÁCH BẮP NƯỚC: ${JSON.stringify(CINEBOOK_CONCESSIONS)}.

  QUY TẮC CỨNG:
  1. Khi khách chốt phim muốn đặt, PHẢI trả về tên phim trong thẻ [[Tên Phim]]. Tên phim phải khớp 100% với danh sách.
  Ví dụ: "Dạ! Em chuyển anh/chị đến trang đặt vé phim [[Lật Mặt 7]] ngay đây ạ! ✨"
  2. Trả lời bằng tiếng Việt, thân thiện, trôi chảy, có icon 🎬.`;

  try {
    // Dùng fetch y hệt như Frontend để gọi đúng model gemini-3-flash-preview
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

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        return res.status(response.status).json({ error: "Lỗi từ Gemini API" });
    }

    const data = await response.json();
    const botText = data.candidates[0].content.parts[0].text;
    
    res.json({ text: botText });

  } catch (error) {
    console.error("BACKEND ERROR:", error);
    res.status(500).json({ error: "Lỗi kết nối CineBook AI từ server." });
  }
});

export default router;
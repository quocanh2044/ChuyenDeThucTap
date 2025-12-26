import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOVIES } from "../constants";

const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const MOVIE_TITLES = MOVIES.map(m => m.title.toLowerCase());

export const getMovieRecommendation = async (userQuery: string): Promise<string> => {
  try {
    const movieListText = MOVIES.map(m => `- ${m.title}`).join("\n");

    const systemInstruction = `
❗ CHẾ ĐỘ KHÓA LEVEL 4 — QUY ĐỊNH BẮT BUỘC ❗
Bạn là chatbot của rạp CineBook VN.

DANH SÁCH PHIM DUY NHẤT ĐƯỢC PHÉP NHẮC:
${movieListText}

⚠ QUY TẮC BẮT BUỘC (KHÔNG ĐƯỢC VI PHẠM):
- KHÔNG được tạo phim mới.
- KHÔNG được mô tả phim ngoài danh sách.
- KHÔNG được gợi ý phim không tồn tại.
- Nếu người dùng hỏi phim không có → trả EXACT câu:
  "Rạp hiện không có phim đó, bạn muốn xem thể loại nào? 🎬🍿"
- KHÔNG trả lời dài dòng, KHÔNG tự chế tác nội dung.
- Luôn giữ câu trả lời ngắn gọn.

⚠ TRẢ VỀ DUY NHẤT Ở DẠNG JSON:
{
  "movie": "<tên phim hoặc null>",
  "answer": "<câu trả lời ngắn gọn>"
}

❗Nếu bạn không chắc người dùng nói phim nào → đặt "movie": null.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const result = await model.generateContent(userQuery);
    const raw = result.response.text();

    let data: any;

    // Tìm JSON bằng regex (đề phòng AI trả kèm text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return "Rạp hiện không có phim đó, bạn muốn xem thể loại nào? 🎬🍿";
    }

    try {
      data = JSON.parse(jsonMatch[0]);
    } catch {
      return "Rạp hiện không có phim đó, bạn muốn xem thể loại nào? 🎬🍿";
    }

    const movieName = (data.movie || "").toLowerCase();

    // ❗Nếu phim không hợp lệ → override trả đúng câu cứng
    if (!MOVIE_TITLES.includes(movieName) && movieName !== "") {
      return "Rạp hiện không có phim đó, bạn muốn xem thể loại nào? 🎬🍿";
    }

    // Nếu không có phim → dùng câu mặc định
    if (movieName === "" || data.movie === null) {
      return "Rạp hiện không có phim đó, bạn muốn xem thể loại nào? 🎬🍿";
    }

    return data.answer || "Bạn muốn xem phim nào tiếp theo? 🎬🍿";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Có lỗi khi kết nối AI.";
  }
};

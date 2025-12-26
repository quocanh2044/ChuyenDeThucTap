import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "../db.js"; // Tự sửa theo ORM bạn dùng (Prisma / Sequelize)

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get("/movies/search", async (req, res) => {
    try {
        const query = req.query.q || "";

        // 1️⃣ Lấy phim từ database 
        const moviesFromDB = await db.movie.findMany({
            where: {
                title: { contains: query, mode: "insensitive" },
            },
        });

        if (moviesFromDB.length === 0) {
            return res.json([]);
        }

        // 2️⃣ Tạo prompt RAG cho AI (chỉ cho dùng dữ liệu này)
        const prompt = `
Tôi cung cấp cho bạn danh sách phim bên dưới.
Bạn chỉ được dùng các phim trong danh sách này. KHÔNG ĐƯỢC BỊA.

Danh sách phim:
${JSON.stringify(moviesFromDB, null, 2)}

Nhiệm vụ:
- Hãy chọn những phim phù hợp nhất với từ khóa: "${query}"
- Trả về dạng JSON, chỉ gồm: id, title, genre, description, poster.
- Không trả phim không tồn tại trong danh sách trên.
    `;

        // 3️⃣ Gọi AI
        const aiResponse = await model.generateContent(prompt);

        // 4️⃣ Parse JSON từ AI
        const text = aiResponse.response.text().trim();
        let result;

        try {
            result = JSON.parse(text);
        } catch {
            // fallback nếu AI trả về text có markdown
            result = JSON.parse(
                text.replace(/```json/g, "").replace(/```/g, "")
            );
        }

        return res.json(result);

    } catch (error) {
        console.error("AI ERROR:", error);
        res.status(500).json({ error: "AI processing error" });
    }
});

export default router;

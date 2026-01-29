import db from "../config/db.js";

// ✅ FIX: Format lại dữ liệu trả về đồng nhất
export const formatMovies = (req, data) => {
    if (!Array.isArray(data)) {
        data = [data];
    }

    return data.map(m => {
        // Xử lý genre: Nếu là mảng thì join, nếu là chuỗi có dấu phẩy thì giữ nguyên
        let displayGenre = "Chưa phân loại";
        if (m.genre) {
            displayGenre = Array.isArray(m.genre) ? m.genre.join(", ") : m.genre;
        }

        return {
            ...m,
            genre: displayGenre, // Trả về chuỗi để Frontend hiển thị ngay
            upcoming: Boolean(m.upcoming),
            isNowPlaying: Boolean(m.isNowPlaying),
            ageRating: m.ageRating || 'C13',
            rating: m.rating || 0,
            description: m.description || 'Đang cập nhật tóm tắt phim.',
            duration: m.duration || 90,
            image: m.image
                ? (m.image.startsWith("http") 
                    ? m.image 
                    : `${req.protocol}://${req.get("host")}/uploads/${m.image}`)
                : null,
        };
    });
};

// ✅ FIX: Hàm thêm phim đảm bảo lưu genre vào DB
export const addMovie = async (req, res) => {
    try {
        const { title, genre, director, description, duration, image, upcoming = 0, isNowPlaying = 0 } = req.body;
        
        // Chuẩn bị dữ liệu genre trước khi insert
        const finalGenre = Array.isArray(genre) ? genre.join(", ") : (genre || "Chưa phân loại");

        const sql = `INSERT INTO movies (title, genre, director, description, duration, image, upcoming, isNowPlaying) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [
            title,
            finalGenre, // Lưu vào cột genre
            director || "",
            description || "",
            duration || 120,
            image || "",
            upcoming ? 1 : 0,
            isNowPlaying ? 1 : 0
        ]);

        return res.json({ message: "Thêm phim thành công!" });
    } catch (err) {
        console.error("Lỗi thêm phim:", err);
        return res.status(500).json({ message: "Lỗi server khi thêm phim!", error: err.message });
    }
};

// Các hàm khác (getMovies, deleteMovie...) giữ nguyên nhưng đảm bảo dùng formatMovies(req, data) trước khi res.json

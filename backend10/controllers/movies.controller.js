import db from "../config/db.js";

// ✅ HÀM FORMAT CHUẨN (Dữ liệu SQL của bạn)
export const formatMovies = (req, data) => {
    if (!Array.isArray(data)) data = [data];

    return data.map(m => {
        let displayGenre = "Chưa phân loại";
        if (m.genre) {
            // Nếu là mảng thì join, nếu là chuỗi (như SQL của bạn) thì giữ nguyên
            displayGenre = Array.isArray(m.genre) ? m.genre.join(", ") : m.genre;
        }

        return {
            ...m,
            genre: displayGenre,
            upcoming: Boolean(m.upcoming),
            isNowPlaying: Boolean(m.isNowPlaying),
            image: m.image
                ? (m.image.startsWith("http") 
                    ? m.image 
                    : `${req.protocol}://${req.get("host")}/uploads/${m.image}`)
                : null,
        };
    });
};

// ✅ FIX: Hàm lấy doanh thu cho Admin (Dashboard gọi hàm này)
export const getRevenueAdmin = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id, 
                m.title, 
                m.genre,        -- Bắt buộc phải có
                m.image, 
                m.duration,
                m.isNowPlaying, 
                m.upcoming,
                m.price,
                COUNT(t.id) as sold, 
                IFNULL(SUM(m.price), 0) as revenue
            FROM movies m
            LEFT JOIN tickets t ON m.id = t.movie_id
            GROUP BY m.id
            ORDER BY revenue DESC
        `;
        const [data] = await db.query(sql);
        
        // Gọi hàm format để xử lý ảnh và thể loại
        const formattedMovies = formatMovies(req, data);

        // Map lại để giữ cột sold và revenue vì formatMovies có thể làm mất nếu không cẩn thận
        const finalData = formattedMovies.map((movie, index) => ({
            ...movie,
            sold: Number(data[index].sold) || 0,
            revenue: Number(data[index].revenue) || 0
        }));

        res.json(finalData);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy doanh thu", error: err.message });
    }
};

// ✅ Hàm thêm phim (đã fix)
export const addMovie = async (req, res) => {
    try {
        const { title, genre, director, description, duration, image, upcoming, isNowPlaying } = req.body;
        const finalGenre = Array.isArray(genre) ? genre.join(", ") : (genre || "Chưa phân loại");

        const sql = `INSERT INTO movies (title, genre, director, description, duration, image, upcoming, isNowPlaying) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [
            title, finalGenre, director || "", description || "", 
            duration || 120, image || "", upcoming ? 1 : 0, isNowPlaying ? 1 : 0
        ]);
        res.json({ message: "Thêm phim thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

import db from "../config/db.js";

// ================================================
// FORMAT MOVIE FUNCTION
// ================================================
export const formatMovies = (req, data) => {
    if (!Array.isArray(data)) {
        data = [data];
    }

    return data.map(m => ({
        ...m,
        genre: m.genre ? m.genre.split(",") : [],
        upcoming: Boolean(m.upcoming),
        isNowPlaying: Boolean(m.isNowPlaying),
        ageRating: m.ageRating || 'C13',
        rating: m.rating || 0,
        description: m.description || 'Đang cập nhật tóm tắt phim.',
        duration: m.duration || 90,
        // 🟢 FIX: Đảm bảo đường dẫn ảnh chính xác
        image: m.image
            ? (
                m.image.startsWith("http")
                    ? m.image
                    : `${req.protocol}://${req.get("host")}/uploads/${m.image}`
            )
            : null,
    }));
};

// ================================================
// GET ALL MOVIES
// ================================================
export const getMovies = async (req, res) => {
    try {
        const sql = `SELECT * FROM movies ORDER BY id DESC`;
        // ✅ Dùng await thay vì callback
        const [data] = await db.query(sql);

        return res.json({
            message: "Danh sách phim",
            movies: formatMovies(req, data),
        });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// ================================================
// GET MOVIE BY ID
// ================================================
export const getMovieById = async (req, res) => {
    try {
        const movieId = req.params.id;
        const sql = `SELECT * FROM movies WHERE id = ?`;
        const [data] = await db.query(sql, [movieId]);

        if (data.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy phim!" });
        }

        const movie = formatMovies(req, data)[0];
        return res.json(movie);
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// ================================================
// GET NOW PLAYING
// ================================================
export const getNowPlaying = async (req, res) => {
    try {
        const sql = `SELECT * FROM movies WHERE isNowPlaying = 1 ORDER BY id DESC`;
        const [data] = await db.query(sql);

        return res.json({
            message: "Phim đang chiếu",
            movies: formatMovies(req, data),
        });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// ================================================
// GET UPCOMING
// ================================================
export const getUpcoming = async (req, res) => {
    try {
        const sql = `SELECT * FROM movies WHERE upcoming = 1 ORDER BY id DESC`;
        const [data] = await db.query(sql);

        return res.json({
            message: "Phim sắp chiếu",
            movies: formatMovies(req, data),
        });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server!", error: err.message });
    }
};

// ================================================
// GET SHOWTIMES BY MOVIE ID
// ================================================
export const getShowtimesByMovieId = async (req, res) => {
    try {
        const movieId = req.params.id;
        if (!movieId) return res.status(400).json({ message: "Thiếu ID phim." });

        const sql = `SELECT id, time, booked_seats FROM showtimes WHERE movie_id = ? ORDER BY time ASC`;
        const [data] = await db.query(sql, [movieId]);

        const formattedShowtimes = data.map(st => ({
            id: st.id,
            time: st.time,
            bookedSeats: st.booked_seats
                ? st.booked_seats.split(',').filter(s => s.trim() !== '')
                : [],
        }));

        return res.json(formattedShowtimes);
    } catch (err) {
        return res.status(500).json({ message: "Lỗi Server!", error: err.message });
    }
};

// ================================================
// ADD MOVIE
// ================================================
export const addMovie = async (req, res) => {
    try {
        const { title, genre, director, description, duration, image, upcoming = 0, isNowPlaying = 0 } = req.body;
        const sql = `INSERT INTO movies (title, genre, director, description, duration, image, upcoming, isNowPlaying) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [
            title,
            Array.isArray(genre) ? genre.join(",") : genre,
            director || "",
            description || "",
            duration,
            image || "",
            upcoming ? 1 : 0,
            isNowPlaying ? 1 : 0
        ]);

        return res.json({ message: "Thêm phim thành công!" });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi khi thêm phim!", error: err.message });
    }
};

// ================================================
// DELETE MOVIE
// ================================================
export const deleteMovie = async (req, res) => {
    try {
        const id = req.params.id;
        await db.query(`DELETE FROM movies WHERE id = ?`, [id]);
        return res.json({ message: "Xóa phim thành công!" });
    } catch (err) {
        return res.status(500).json({ message: "Không thể xóa phim!", error: err.message });
    }
};
// ================================================
// SEARCH MOVIES (Thêm lại hàm bị thiếu)
// ================================================
export const searchMovies = async (queryTerm) => {
    try {
        const sql = `SELECT * FROM movies WHERE title LIKE ? OR description LIKE ?`;
        const searchTerm = `%${queryTerm}%`;
        const [data] = await db.query(sql, [searchTerm, searchTerm]);
        return data;
    } catch (err) {
        throw err;
    }
};

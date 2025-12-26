import express from "express";
import {
    getMovies,
    getNowPlaying,
    getUpcoming,
    addMovie,
    deleteMovie,
    // Đã đổi tên để khớp với code Backend tôi cung cấp
    getMovieById, // Thay thế getMovieDetail (tôi dùng getMovieById trong controller)
    getShowtimesByMovieId, // Thay thế getShowtimesByMovie (tôi dùng getShowtimesByMovieId trong controller)
} from "../controllers/movies.controller.js"; // ⚠️ Đảm bảo đổi tên hàm trong controller thành getMovieById và getShowtimesByMovieId

const router = express.Router();

// Lấy tất cả phim
router.get("/", getMovies);

// Đang chiếu
router.get("/now-playing", getNowPlaying);

// Sắp chiếu
router.get("/upcoming", getUpcoming);

// =================================================================
// 🟢 FIX QUAN TRỌNG: ĐẶT ROUTE CÓ THAM SỐ PHỤ LÊN TRƯỚC
// =================================================================

// 1. Lấy suất chiếu theo ID phim (GET /movies/:id/showtimes)
// Route cụ thể hơn nên được đặt trước.
router.get("/:id/showtimes", getShowtimesByMovieId);

// 2. Lấy chi tiết phim (GET /movies/:id)
// Route chung chung nên đặt sau.
router.get("/:id", getMovieById);

// Thêm phim
router.post("/", addMovie);

// Xóa phim (Giữ nguyên)
router.delete("/:id", deleteMovie);

export default router;
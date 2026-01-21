import db from "../config/db.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1️⃣ USER INFO - Đã sửa lỗi: JOIN với bảng cinepoint để lấy points
        // 1️⃣ FIX: Sử dụng LEFT JOIN để lấy points từ bảng cinepoint
        // Lấy thông tin user kèm điểm cinepoint mới nhất
        const [[user]] = await db.query(`
    SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        IFNULL(c.points, 0) AS points 
    FROM users u
    LEFT JOIN cinepoint c ON u.id = c.user_id
    WHERE u.id = ?
`, [userId]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ BOOKING HISTORY (Giữ nguyên phần này)
        // 2️⃣ BOOKING HISTORY - Đã sửa lỗi JOIN để lấy ngày giờ từ bảng showtimes
        // 2️⃣ BOOKING HISTORY - Đã sửa theo đúng tên cột: date và time
        // 2️⃣ BOOKING HISTORY - Sắp xếp theo id thay vì created_at
        const [bookings] = await db.query(`
            SELECT 
                b.id,
                m.title AS movieTitle,
                s.date AS date,
                s.time AS time,
                b.total_amount AS totalAmount
            FROM bookings b
            JOIN movies m ON b.movie_id = m.id
            JOIN showtimes s ON b.showtime_id = s.id
            WHERE b.user_id = ?
            ORDER BY b.id DESC
        `, [userId]);
        res.json({
            ...user,
            bookingHistory: bookings
        });

    } catch (err) {
        console.error("PROFILE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

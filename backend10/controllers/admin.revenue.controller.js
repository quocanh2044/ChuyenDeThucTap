// File: controllers/admin.revenue.controller.js
import db from "../config/db.js";

export const getRevenueStats = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                m.id, 
                m.title, 
                m.image, 
                m.price,
                m.duration,
                COALESCE(SUM(b.total_amount), 0) AS revenue, 
                COALESCE(COUNT(b.id), 0) AS sold
            FROM movies m
            LEFT JOIN bookings b ON m.id = b.movie_id AND b.payment_status = 'completed'
            GROUP BY m.id
            ORDER BY revenue DESC
        `);

        // Log để kiểm tra Backend có thực sự lấy được số tiền không
        console.log("Dữ liệu doanh thu gửi đi:", results);
        
        res.json(results); 
    } catch (err) {
        console.error("Lỗi SQL:", err);
        res.status(500).json({ message: "Lỗi tính toán doanh thu" });
    }
};
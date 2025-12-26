import db from "../config/db.js";

// Lấy danh sách ghế theo movieId
export const getSeats = (req, res) => {
    const { movieId } = req.params;

    const sql = `
        SELECT * 
        FROM seats 
        WHERE movie_id = ? 
        ORDER BY seat_number
    `;

    db.query(sql, [movieId], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server!", err });
        res.json(data);
    });
};

// Cập nhật trạng thái ghế
export const updateSeatStatus = (req, res) => {
    const { seatId } = req.params;

    const sql = `
        UPDATE seats 
        SET status = 'booked'
        WHERE id = ?
    `;

    db.query(sql, [seatId], (err) => {
        if (err)
            return res.status(400).json({ message: "Không thể cập nhật trạng thái ghế!", err });
        res.json({ message: "Cập nhật ghế thành công!" });
    });
};

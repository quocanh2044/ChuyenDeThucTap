import db from "../config/db.js";

/* =========================
   CREATE BOOKING
========================= */
export const createBooking = async (req, res) => {
    try {
        console.log("========== CREATE BOOKING ==========");
        console.log("USER:", req.user);
        console.log("BODY:", req.body);

        const userId = req.user?.id;
        const { movieId, showtimeId, seatNumber, concessions, totalAmount } = req.body;

        // ✅ VALIDATE
        if (!userId || !movieId || !showtimeId || !seatNumber || !totalAmount) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        /* =========================
           🔒 CHECK GHẾ ĐÃ ĐẶT
        ========================= */
        const newSeats = seatNumber.split(",");

        const [rows] = await db.execute(
            "SELECT seat_number FROM bookings WHERE showtime_id = ?",
            [showtimeId]
        );

        const bookedSeats = rows.flatMap(r => r.seat_number.split(","));

        const hasBookedSeat = newSeats.some(seat =>
            bookedSeats.includes(seat)
        );

        if (hasBookedSeat) {
            return res.status(400).json({
                message: "❌ Ghế đã có người đặt, vui lòng chọn ghế khác"
            });
        }

        /* =========================
           INSERT BOOKING
        ========================= */
        const sql = `
            INSERT INTO bookings
            (user_id, movie_id, showtime_id, seat_number, concessions, total_amount, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, 'completed')
        `;

        const [result] = await db.execute(sql, [
            userId,
            movieId,
            showtimeId,
            seatNumber, // VARCHAR
            JSON.stringify(concessions || []),
            totalAmount
        ]);

        return res.status(201).json({
            success: true,
            bookingId: result.insertId
        });

    } catch (err) {
        console.error("❌ BOOKING ERROR:", err);
        return res.status(500).json({
            message: err.message
        });
    }
};


/* =========================
   GET BOOKINGS BY USER
========================= */
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.execute(
            "SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_time DESC",
            [userId]
        );

        return res.json({
            bookings: rows.map(b => ({
                ...b,
                concessions: b.concessions ? JSON.parse(b.concessions) : []
            }))
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


/* =========================
   GET BOOKED SEATS
========================= */
export const getBookedSeats = async (req, res) => {
    try {
        const { showtimeId } = req.params;

        const [rows] = await db.execute(
            "SELECT seat_number FROM bookings WHERE showtime_id = ?",
            [showtimeId]
        );

        const bookedSeats = rows.flatMap(r => r.seat_number.split(","));

        return res.json({ bookedSeats });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

import { db } from "../db.js";

export const getUserProfile = (userId) => {
    return new Promise((resolve, reject) => {

        // 1️⃣ Lấy thông tin user
        const userQuery = `
      SELECT id, name, email, role
      FROM users
      WHERE id = ?
    `;

        // 2️⃣ Lấy tổng điểm
        const pointQuery = `
      SELECT SUM(points) AS total_points
      FROM cinepoint
      WHERE user_id = ?
    `;

        // 3️⃣ Lịch sử đặt vé
        const bookingQuery = `
      SELECT 
        b.id AS booking_id,
        b.movie_id,
        b.showtime_id,
        b.seat_number,
        b.total_amount,
        b.booking_time,
        b.payment_status,
        c.points
      FROM bookings b
      LEFT JOIN cinepoint c ON b.id = c.booking_id
      WHERE b.user_id = ?
      ORDER BY b.booking_time DESC
    `;

        db.query(userQuery, [userId], (err, userData) => {
            if (err) return reject(err);
            if (!userData.length) return reject("User not found");

            db.query(pointQuery, [userId], (err, pointData) => {
                if (err) return reject(err);

                db.query(bookingQuery, [userId], (err, bookingData) => {
                    if (err) return reject(err);

                    resolve({
                        user: userData[0],
                        total_points: pointData[0].total_points || 0,
                        bookings: bookingData
                    });
                });
            });
        });
    });
};

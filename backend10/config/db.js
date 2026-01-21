import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    // Sử dụng process.env để đọc các biến từ Render thay vì ghi đè localhost
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // Mặc định là 3306 nếu không có biến PORT
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Thêm đoạn này để kiểm tra kết nối trong Logs của Render
db.getConnection()
    .then(connection => {
        console.log("✅ Kết nối Database Railway thành công!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Lỗi kết nối Database:", err.message);
    });

export default db;
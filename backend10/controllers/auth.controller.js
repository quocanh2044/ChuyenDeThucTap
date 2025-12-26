import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

/* =====================
   REGISTER
===================== */
export const register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], async (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server" });

        if (data.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertSql =
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

        db.query(
            insertSql,
            [name, email, hashedPassword, "user"],
            (err2, result) => {
                if (err2) {
                    return res.status(500).json({ message: "Lỗi tạo tài khoản" });
                }

                res.status(201).json({
                    message: "Đăng ký thành công",
                    user: {
                        id: result.insertId,
                        name,
                        email,
                        role: "user",
                    },
                });
            }
        );
    });
};

/* =====================
   LOGIN
===================== */
export const login = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi server" });

        if (data.length === 0) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }

        const user = data[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({ message: "Sai mật khẩu" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    });
};

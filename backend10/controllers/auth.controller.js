import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const [rows] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (rows.length) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
            [name, email, hashedPassword]
        );

        return res.status(201).json({ message: "REGISTER OK" });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query(
            "SELECT id, name, email, password, role FROM users WHERE email = ?",
            [email]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            message: "LOGIN OK",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

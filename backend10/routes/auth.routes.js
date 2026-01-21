import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing fields!" });
        }

        // Check email exists
        const [exists] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (exists.length > 0) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
            [name, email, hashed]
        );

        res.json({ message: "Register success" });
    } catch (err) {
        console.log("REGISTER ERROR =>", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: "User not found!" });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: "Wrong password!" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login success",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.log("LOGIN ERROR =>", err);
        res.status(500).json({ message: "Server Error" });
    }
});


export default router;

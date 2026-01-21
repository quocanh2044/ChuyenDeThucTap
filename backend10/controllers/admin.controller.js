import db from "../config/db.js";

/* =========================
   GET ALL USERS (ADMIN)
========================= */
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, role FROM users"
        );
        res.status(200).json(users);
    } catch (err) {
        console.error("GET USERS ERROR:", err);
        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
};

/* =========================
   DELETE USER (ADMIN)
========================= */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // xóa point trước
        await db.query("DELETE FROM cinepoint WHERE user_id = ?", [id]);

        // xóa user
        await db.query("DELETE FROM users WHERE id = ?", [id]);

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("DELETE USER ERROR:", err);
        res.status(500).json({ message: "Delete failed" });
    }
};

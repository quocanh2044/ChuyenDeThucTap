import db from "../config/db.js";

/* =======================
   GET ALL USERS
======================= */
export const getUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, created_at FROM users"
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy danh sách user" });
    }
};

/* =======================
   DELETE USER
======================= */
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "Xóa user thành công" });
    } catch (err) {
        res.status(500).json({ message: "Xóa user thất bại" });
    }
};

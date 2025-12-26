import db from "../config/db.js";

export const getAll = async (req, res) => {
    const [rows] = await db.query("SELECT * FROM concessions");
    res.json(rows);
};

export const createConcession = async (req, res) => {
    const { name, price } = req.body;

    const [result] = await db.query(
        "INSERT INTO concessions (name, price) VALUES (?, ?)",
        [name, price]
    );

    res.status(201).json({
        message: "Tạo concession thành công",
        id: result.insertId
    });
};

export const updateConcession = async (req, res) => {
    const { name, price } = req.body;

    await db.query(
        "UPDATE concessions SET name = ?, price = ? WHERE id = ?",
        [name, price, req.params.id]
    );

    res.json({ message: "Cập nhật thành công" });
};

export const deleteConcession = async (req, res) => {
    await db.query("DELETE FROM concessions WHERE id = ?", [req.params.id]);
    res.json({ message: "Xóa thành công" });
};

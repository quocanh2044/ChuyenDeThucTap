import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Không có token!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ!" });
        }

        // ✅ ÉP CẤU TRÚC CHUẨN
        req.user = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    });
};

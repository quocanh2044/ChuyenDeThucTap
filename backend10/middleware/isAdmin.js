const isAdmin = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only",
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            message: "Authorization error",
        });
    }
};

export default isAdmin;

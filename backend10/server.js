// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Controllers
import { searchMovies, formatMovies } from "./controllers/movies.controller.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import concessionRoutes from "./routes/concession.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminMovieRoutes from "./routes/admin.movie.route.js";
import revenueRoute from "./routes/admin.revenue.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ========= 1. FIX CORS (Cho phép Vercel truy cập) ========= */
app.use(cors({
    origin: function (origin, callback) {
        // Cho phép tất cả các domain của Vercel và Localhost
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://frontend-gold-eight-93.vercel.app" // Domain chính xác của bạn
        ];
        // Cho phép origin nằm trong danh sách hoặc các request không có origin (như Postman/Server-side)
        if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.includes("vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

/* ========= BODY PARSER ========= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ========= STATIC FILES (UPLOADS) ========= */
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

/* ========= 2. TEST ROUTE (Kiểm tra server sống) ========= */
app.get("/", (req, res) => {
    res.send("Backend is running successfully!");
});

/* ========= ROUTES ========= */
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/concessions", concessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/movies", adminMovieRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/revenue", revenueRoute);

/* ========= SEARCH API ========= */
app.get("/api/search", async (req, res) => {
    const queryTerm = req.query.q;
    if (!queryTerm || typeof queryTerm !== "string") {
        return res.json({ movies: [] });
    }
    try {
        const rawResults = await searchMovies(queryTerm);
        const formattedMovies = formatMovies(req, rawResults);
        res.json({ movies: formattedMovies });
    } catch (err) {
        console.log("SEARCH ERROR:", err);
        res.status(500).json({ message: "Search error" });
    }
});

/* ========= 3. FIX PORT (Render yêu cầu 0.0.0.0) ========= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
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

/* ========= CORS ========= */
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL // 🟢 VERCEL DOMAIN
    ],
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

/* ========= PORT (Render fix) ========= */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

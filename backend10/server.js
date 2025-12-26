// server.js
import dotenv from "dotenv";
dotenv.config(); // 🔥 PHẢI ĐẶT DÒNG ĐẦU TIÊN

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Middleware
app.use(express.json());

// Static uploads
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/concessions", concessionRoutes);
app.use("/api/bookings", bookingRoutes);

// Search
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
        res.status(500).json({ message: "Search error" });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

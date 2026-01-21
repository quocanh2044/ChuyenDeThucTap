import db from "../config/db.js";

const BASE = process.env.BASE_URL || "http://localhost:5001";

/* =========================
   GET ALL MOVIES (ADMIN)
========================= */
export const getAllMovies = async (req, res) => {
    try {
        const [movies] = await db.query(`
            SELECT 
                id,
                title,
                genre,
                director,
                description,
                duration,
                image,
                upcoming,
                rating,
                isNowPlaying,
                price
            FROM movies
            ORDER BY id DESC
        `);

        const result = movies.map(movie => ({
            ...movie,
            image: movie.image
                ? `${BASE}/uploads/${movie.image}`
                : `${BASE}/uploads/no-image.png`,
            price: Number(movie.price) || 0
        }));

        res.json(result);
    } catch (err) {
        console.error("GET MOVIES ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

/* =========================
   CREATE MOVIE
========================= */
export const createMovie = async (req, res) => {
    try {
        const {
            title,
            genre,
            director,
            description,
            duration,
            image,
            upcoming = 0,
            rating = 0,
            isNowPlaying = 1,
            price = 0
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        await db.query(
            `INSERT INTO movies 
            (title, genre, director, description, duration, image, upcoming, rating, isNowPlaying, price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                genre,
                director,
                description,
                duration,
                image ?? null,
                upcoming,
                rating,
                isNowPlaying,
                price
            ]
        );

        res.json({ message: "Movie created successfully" });
    } catch (err) {
        console.error("CREATE MOVIE ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

/* =========================
   UPDATE MOVIE
========================= */
export const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            genre,
            director,
            description,
            duration,
            image,
            upcoming,
            rating,
            isNowPlaying,
            price
        } = req.body;

await db.query(
    `UPDATE movies SET
        title = COALESCE(?, title),
        genre = COALESCE(?, genre),
        director = COALESCE(?, director),
        description = COALESCE(?, description),
        duration = COALESCE(?, duration),
        image = COALESCE(?, image),
        upcoming = COALESCE(?, upcoming),
        rating = COALESCE(?, rating),
        isNowPlaying = COALESCE(?, isNowPlaying),
        price = COALESCE(?, price)
     WHERE id = ?`,
     [
        title || null,
        genre || null,
        director || null,
        description || null,
        duration || null,
        image || null,
        upcoming ?? null,
        rating ?? null,
        isNowPlaying ?? null,
        price ?? null,
        id
     ]
);


        res.json({ message: "Movie updated successfully" });
    } catch (err) {
        console.error("UPDATE MOVIE ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

/* =========================
   DELETE MOVIE
========================= */
export const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM movies WHERE id=?", [id]);
        res.json({ message: "Movie deleted" });
    } catch (err) {
        console.error("DELETE MOVIE ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

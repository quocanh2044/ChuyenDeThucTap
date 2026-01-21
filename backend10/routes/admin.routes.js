import express from "express";
import verifyToken from "../middleware/veryToken.js";
import isAdmin from "../middleware/isAdmin.js";

// USERS
import {
    getAllUsers,
    deleteUser,
} from "../controllers/admin.controller.js";

// MOVIES
import {
    getAllMovies,
    createMovie,
    updateMovie,
    deleteMovie,
} from "../controllers/admin.movie.controller.js";

const router = express.Router();

/* ===== USERS ===== */
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

/* ===== MOVIES ===== */
router.get("/movies", verifyToken, isAdmin, getAllMovies);
router.post("/movies", verifyToken, isAdmin, createMovie);
router.put("/movies/:id", verifyToken, isAdmin, updateMovie);
router.delete("/movies/:id", verifyToken, isAdmin, deleteMovie);

export default router;

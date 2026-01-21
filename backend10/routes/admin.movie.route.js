import express from "express";
import {
    getAllMovies,
    createMovie,
    updateMovie,
    deleteMovie
} from "../controllers/admin.movie.controller.js";

import verifyToken from "../middleware/veryToken.js";
import isAdmin from "../middleware/isAdmin.js";
import upload from "../middleware/uploadMovie.js"; 
const router = express.Router();

router.get("/", verifyToken, isAdmin, getAllMovies);
router.post("/", verifyToken, isAdmin, createMovie);
router.put("/:id", verifyToken, isAdmin, updateMovie);
router.delete("/:id", verifyToken, isAdmin, deleteMovie);
router.put("/:id",
    verifyToken,
    isAdmin,
    upload.single("image"),
    updateMovie
);
export default router;

import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { getUsers, deleteUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", verifyToken, isAdmin, getUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

export default router;

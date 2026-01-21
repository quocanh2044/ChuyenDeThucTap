import express from "express";
import { getRevenueStats } from "../controllers/admin.revenue.controller.js";
import verifyToken from "../middleware/veryToken.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getRevenueStats);

export default router;

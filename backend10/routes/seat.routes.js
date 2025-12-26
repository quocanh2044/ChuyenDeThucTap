import express from "express";
import { getSeats, updateSeatStatus } from "../controllers/seat.controller.js";

const router = express.Router();

// Lấy danh sách ghế theo movieId
router.get("/:movieId", getSeats);

// Cập nhật trạng thái ghế
router.put("/:seatId", updateSeatStatus);

export default router;

import express from "express";
import {
    createBooking,
    getMyBookings,
    getBookedSeats
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/me", verifyToken, getMyBookings);
router.get("/booked-seats/:showtimeId", getBookedSeats);
export default router;

// services/api.ts
import axios from "axios";
import { Movie } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   AXIOS INSTANCE
========================= */
const API = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/* =========================
   INTERCEPTOR (JWT TOKEN)
========================= */
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* =========================
   AUTH
========================= */
export const loginUser = (data: {
    email: string;
    password: string;
}) => API.post("/auth/login", data).then((res) => res.data);

export const registerUser = (data: {
    name: string;
    email: string;
    password: string;
}) => API.post("/auth/register", data).then((res) => res.data);

/* =========================
   MOVIES
========================= */
export const getMovies = () =>
    API.get("/movies").then((res) => res.data);

export const getNowPlaying = () =>
    API.get("/movies/now-playing").then((res) => res.data);

export const getUpcoming = () =>
    API.get("/movies/upcoming").then((res) => res.data);

export const fetchMovieById = (id: string) =>
    API.get(`/movies/${id}`).then((res) => res.data);

export const searchMovies = (
    query: string
): Promise<{ movies: Movie[] }> =>
    API.get(`/search?q=${encodeURIComponent(query)}`).then((res) => ({
        movies: res.data.movies ?? [],
    }));

/* =========================
   SHOWTIME
========================= */
export const getShowtimes = (movieId: string | number) =>
    API.get(`/movies/${movieId}/showtimes`).then((res) => res.data);

/* =========================
   BOOKING  (RẤT QUAN TRỌNG)
========================= */
export interface CreateBookingPayload {
    movieId: number;
    showtimeId: number;
    seatNumber: string; // "A1,A2"
    concessions: {
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
}

export const createBooking = (data: CreateBookingPayload) =>
    API.post("/bookings", data).then((res) => res.data);

export const getMyBookings = () =>
    API.get("/bookings/me").then((res) => res.data);

/* =========================
   ADMIN
========================= */
export const getAllUsers = (token: string) =>
    API.get("/admin/users").then((res) => res.data);

export const deleteUser = (userId: string | number, token: string) =>
    API.delete(`/admin/users/${userId}`).then((res) => res.data);

export const addMovieApi = (data: FormData) =>
    API.post("/movies", data, {
        headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => res.data);

export const deleteMovieApi = (movieId: string | number) =>
    API.delete(`/movies/${movieId}`).then((res) => res.data);

/* =========================
   CONCESSIONS
========================= */
export const getConcessions = () =>
    API.get("/concessions").then((res) => res.data);
/* =========================
   BOOKED SEATS
========================= */
export const getBookedSeats = (showtimeId: number) =>
    API.get(`/bookings/booked-seats/${showtimeId}`)
        .then(res => res.data);

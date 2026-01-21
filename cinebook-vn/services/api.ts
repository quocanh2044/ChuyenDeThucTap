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
        Accept: "application/json",
    },
});

/* =========================
   INTERCEPTOR (JWT TOKEN)
========================= */
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

/* =========================
   AUTH
========================= */
export const loginUser = (data: { email: string; password: string }) =>
    API.post("/auth/login", data).then(res => res.data);

export const registerUser = (data: { name: string; email: string; password: string }) =>
    API.post("/auth/register", data).then(res => res.data);

/* =========================
   PUBLIC MOVIES
========================= */
export const getMovies = () =>
    API.get("/movies").then(res => res.data);

export const getNowPlaying = () =>
    API.get("/movies/now-playing").then(res => res.data);

export const getUpcoming = () =>
    API.get("/movies/upcoming").then(res => res.data);

export const fetchMovieById = (id: string | number) =>
    API.get(`/movies/${id}`).then(res => res.data);

export const searchMovies = (query: string): Promise<{ movies: Movie[] }> =>
    API.get(`/search?q=${encodeURIComponent(query)}`)
        .then(res => ({ movies: res.data.movies ?? [] }));

/* =========================
   SHOWTIME & BOOKING
========================= */
export const getShowtimes = (movieId: string | number) =>
    API.get(`/movies/${movieId}/showtimes`).then(res => res.data);

export interface CreateBookingPayload {
    movieId: number;
    showtimeId: number;
    seatNumber: string;
    concessions: { name: string; price: number; quantity: number }[];
    totalAmount: number;
}

export const createBooking = (data: CreateBookingPayload) =>
    API.post("/bookings", data).then(res => res.data);

export const getMyBookings = () =>
    API.get("/bookings/me").then(res => res.data);

export const getBookedSeats = (showtimeId: number) =>
    API.get(`/bookings/booked-seats/${showtimeId}`).then(res => res.data);

/* =========================
   ADMIN - USERS
========================= */
export const getAllUsers = () =>
    API.get("/admin/users").then(res => res.data);

export const deleteUser = (userId: string | number) =>
    API.delete(`/admin/users/${userId}`).then(res => res.data);

/* =========================
   ADMIN - MOVIES & REVENUE
========================= */

/**
 * ⚠️ FIX QUAN TRỌNG:
 * ADMIN TABLE trả image field khác → normalize posterUrl
 */
export const getAllMoviesAdmin = async () => {
    const res = await API.get("/admin/movies");

    console.log("RAW ADMIN MOVIES:", res.data);

    return res.data.map((m: any) => {
        // Tìm field có khả năng là hình
        const imgKey = Object.keys(m).find(k =>
            ["poster", "image", "img", "picture", "thumbnail", "cover", "path", "url", "file"]
                .some(v => k.toLowerCase().includes(v))
        );

        let raw = imgKey ? m[imgKey] : null;
        let posterUrl = "";

        if (raw) {
            // nếu đã là http -> giữ nguyên
            if (raw.startsWith("http")) {
                posterUrl = raw;
            } else {
                // test 3 trường hợp phổ biến
                const test1 = `${API_URL}${raw}`;
                const test2 = `${API_URL}/uploads/${raw}`;
                const test3 = `${API_URL}/files/${raw}`;

                console.log("TEST IMAGE LINKS:", { test1, test2, test3 });

                posterUrl = test1; // tạm default
            }
        }

        // fallback
        if (!posterUrl) {
            posterUrl = "https://via.placeholder.com/300x450?text=No+Image";
        }

        return { ...m, posterUrl };
    });
};



/**
 * 🔥 Doanh thu phải gọi đúng endpoint /admin/revenue
 */
export const getRevenueAdmin = () =>
    API.get("/admin/revenue").then(res => res.data);

export const addMovieApi = (data: any) =>
    API.post("/admin/movies", data).then(res => res.data);

export const updateMovieApi = (movieId: string | number, data: any) =>
    API.put(`/admin/movies/${movieId}`, data).then(res => res.data);

export const deleteMovieApi = (movieId: string | number) =>
    API.delete(`/admin/movies/${movieId}`).then(res => res.data);

/* =========================
   USER INFO / POINTS
========================= */
export const getMyProfile = () =>
    API.get("/user/me").then(res => res.data);

export const getMyPoints = () =>
    API.get("/user/me/points").then(res => res.data);

export const getMyPointHistory = () =>
    API.get("/user/me/points/history").then(res => res.data);

/* =========================
   CONCESSIONS
========================= */
export const getConcessions = () =>
    API.get("/concessions").then(res => res.data);

export default API;

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";
import BookingPage from "./components/BookingPage";
import PaymentGateway from "./components/PaymentGateway";
import UserProfile from "./components/UserProfile";
import AdminDashboard from "./components/AdminDashboard";
import Auth from "./components/Auth";
import Footer from "./components/Footer";
import HeroBanner from "./components/HeroBanner";
import ChatBot from "./components/ChatBot";
import SearchResultsPage from "./components/SearchResultsPage";
import ConcessionsPage from "./components/ConcessionSelector";

import { Movie, Seat, User, SelectedConcession } from "./types";
import { getMovies } from "./services/api";

const BASE_TICKET_PRICE = 55000;

interface BookingDetails {
  movie: Movie | undefined;
  time: string;
  seats: Seat[];
  concessions: SelectedConcession[];
  total: number;
  showtimeId: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentBooking, setCurrentBooking] = useState<BookingDetails>({
    movie: undefined,
    time: "",
    seats: [],
    concessions: [],
    total: 0,
    showtimeId: 0,
  });

  const navigate = useNavigate();

  /* =========================
     LOAD MOVIES
  ========================= */
  useEffect(() => {
    getMovies()
      .then((data) => {
        // backend có thể trả mảng hoặc { movies: [] }
        setMovies(data.movies ?? data);
      })
      .catch((err) => console.error("Lỗi load phim:", err));
  }, []);

  /* =========================
     AUTO LOGIN (TOKEN)
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // fallback tạm
      setUser({
        id: 0,
        name: "Người dùng",
        email: "",
        points: 0,
        role: "user",
      });
    }
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  /* =========================
     BOOKING FLOW
  ========================= */
  const handleBookingComplete = (
    movie: Movie,
    selectedShowtimeId: number,
    selectedSeat: string,
    concessions: SelectedConcession[],
    finalTotal: number,
    time: string
  ) => {
    setCurrentBooking({
      movie,
      time,
      seats: [
        {
          id: selectedSeat,
          price: BASE_TICKET_PRICE,
          type: "standard",
          row: "",
          number: 0,
          isReserved: false,
        },
      ],
      concessions,
      total: finalTotal,
      showtimeId: selectedShowtimeId,
    });

    navigate("/payment");
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigate={(view) =>
          navigate(view === "BOOKING_ROOT" ? "/" : `/${view.toLowerCase()}`)
        }
        onSearch={(term) =>
          navigate(`/search?q=${encodeURIComponent(term)}`)
        }
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroBanner
                movies={movies}
                onBookNow={(m) => navigate(`/movie/${m.id}`)}
              />
              <MovieList
                onBookNow={(id) => navigate(`/movie/${id}`)}
              />
            </>
          }
        />

        <Route
          path="/movie/:id"
          element={
            <BookingPage onCompleteBooking={handleBookingComplete} />
          }
        />

        <Route path="/search" element={<SearchResultsPage />} />

        <Route
          path="/payment"
          element={
            user ? (
              <PaymentGateway
                movie={currentBooking.movie}
                seats={currentBooking.seats}
                concessions={currentBooking.concessions}
                time={currentBooking.time}
                total={currentBooking.total}
                showtimeId={currentBooking.showtimeId}
                onConfirmPayment={() => navigate("/")}
                onBack={() => navigate(-1)}
              />
            ) : (
              <Navigate to="/login" state={{ from: "/payment" }} />
            )
          }
        />

        <Route
          path="/login"
          element={
            <Auth
              mode="LOGIN"
              onSuccess={(userData) => {
                setUser(userData);
                localStorage.setItem(
                  "user",
                  JSON.stringify(userData)
                );
                navigate("/");
              }}
              onNavigate={(path) => navigate(path)}
            />
          }
        />

        <Route
          path="/register"
          element={
            <Auth
              mode="REGISTER"
              onSuccess={(userData) => {
                setUser(userData);
                localStorage.setItem(
                  "user",
                  JSON.stringify(userData)
                );
                navigate("/");
              }}
              onNavigate={(path) => navigate(path)}
            />
          }
        />

        <Route
          path="/profile"
          element={
            user ? <UserProfile user={user} /> : <Navigate to="/login" />
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/concessions"
          element={
            user ? (
              <ConcessionsPage
                onBack={() => navigate(-1)}
                onContinue={(selected, total) => {
                  setCurrentBooking((prev) => ({
                    ...prev,
                    concessions: selected,
                    total: prev.total + total,
                  }));
                  navigate("/payment");
                }}
              />
            ) : (
              <Navigate
                to="/login"
                state={{ from: "/concessions" }}
              />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ChatBot />
      <Footer />
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;

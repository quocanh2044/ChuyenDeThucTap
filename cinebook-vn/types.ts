export interface Movie {
  isNowPlaying: number;
  image: string;
  id: string;
  title: string;
  genre: string[];
  duration: number; // in minutes
  rating: number; // 0-10
  poster: string;
  backdrop: string;
  description: string;
  director: string;
  cast: string[];
  price: number;
  releaseDate?: string; // New field for Coming Soon movies
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip';
  price: number;
  isReserved: boolean;
}

export interface Showtime {
  id: string;
  movieId: string;
  time: string;
  room: string;
  seats: Seat[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface ConcessionItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: 'food' | 'drink' | 'combo';
}

export interface SelectedConcession extends ConcessionItem {
  quantity: number;
}

export interface BookingRecord {
  id: string;
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  concessions: { name: string; quantity: number }[]; // Added field
  totalPrice: number;
  pointsEarned: number;
  timestamp: number;
}

export interface User {
  isAdmin: boolean;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  history: BookingRecord[];
}

export type ViewState =
  | 'HOME'
  | 'MOVIE'
  | 'BOOKING'
  | 'CONCESSIONS'
  | 'PROFILE'
  | 'ADMIN'
  | 'LOGIN'
  | 'REGISTER'
  | 'BOOKING_ROOT'; 
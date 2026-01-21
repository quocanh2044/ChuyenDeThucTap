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

/* ------ EXISTING BOOKING RECORD ------ */
export interface BookingRecord {
  showtime: any;
  id: string;
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  concessions: { name: string; quantity: number }[];
  totalPrice: number;
  pointsEarned: number;
  timestamp: number;
}

/* ------ ADD: USER POINT HISTORY ------ */
export interface PointHistory {
  id: number;
  points: number;
  reason: string;
  created_at: string;
}

/* ------ ADD: BOOKING ITEM FOR PROFILE ------ */
export interface BookingItem {
  id: number;
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  concessions: { name: string; quantity: number }[];
  totalAmount: number;
  pointsEarned: number;
}

/* ------ ADD: PROFILE STRUCTURE ------ */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  points: number;
  bookingHistory: BookingItem[];
  pointHistory: PointHistory[];
}

/* ------ ORIGINAL USER OBJECT ------ */
export interface User {
  isAdmin: boolean;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  history: BookingRecord[]; // vẫn giữ nguyên để không lỗi phần cũ
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

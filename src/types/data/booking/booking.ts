export interface MovieBooking {
  movie: string;
  showtime: string;
  cinema: string;
  seats: string;
  totalPrice: number;
}

export interface Seat {
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple' | 'selected' | 'booked';
  price: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

export interface BookingState {
  step: number;
  movie: string;
  showtime: string;
  cinema: string;
  seats: string[];
  paymentMethod: 'momo' | 'vnpay' | null;
  combos: Combo[];
  bookingFee: number;
}

export type PaymentMethod = {
  id: 'momo' | 'vnpay';
  name: string;
  description: string;
  icon: string;
};

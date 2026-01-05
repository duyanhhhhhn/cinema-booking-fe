'use client';

import { BookingState, Combo } from '@/types/data/booking/booking';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  bookingState: BookingState;
  setStep: (step: number) => void;
  setPaymentMethod: (method: 'momo' | 'vnpay') => void;
  setSeats: (seats: string[]) => void;
  setCombos: (combos: Combo[]) => void;
  updateComboQuantity: (comboId: string, quantity: number) => void;
  getTotalPrice: () => number;
  getSeatPrice: () => number;
  getComboPrice: () => number;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialBookingState: BookingState = {
  step: 1,
  movie: 'Avatar: The Way of Water',
  showtime: '19:30 - 24/12/2024',
  cinema: 'Cinema Star - Rap 5',
  seats: [],
  paymentMethod: null,
  combos: [],
  bookingFee: 10000,
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingState, setBookingState] = useState<BookingState>(initialBookingState);

  const setStep = (step: number) => {
    setBookingState(prev => ({ ...prev, step }));
  };

  const setPaymentMethod = (method: 'momo' | 'vnpay') => {
    setBookingState(prev => ({ ...prev, paymentMethod: method }));
  };

  const setSeats = (seats: string[]) => {
    setBookingState(prev => ({ ...prev, seats }));
  };

  const setCombos = (combos: Combo[]) => {
    setBookingState(prev => ({ ...prev, combos }));
  };

  const updateComboQuantity = (comboId: string, quantity: number) => {
    setBookingState(prev => ({
      ...prev,
      combos: prev.combos.map(combo =>
        combo.id === comboId ? { ...combo, quantity } : combo
      ),
    }));
  };

  const getSeatPrice = () => {
    return bookingState.seats.length * 90000;
  };

  const getComboPrice = () => {
    return bookingState.combos.reduce((total, combo) => total + combo.price * combo.quantity, 0);
  };

  const getTotalPrice = () => {
    return getSeatPrice() + getComboPrice() + bookingState.bookingFee;
  };

  const resetBooking = () => {
    setBookingState(initialBookingState);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        setStep,
        setPaymentMethod,
        setSeats,
        setCombos,
        updateComboQuantity,
        getTotalPrice,
        getSeatPrice,
        getComboPrice,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

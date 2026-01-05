"use client";

import React from "react";
import { BookingProvider } from "@/contexts/BookingContext";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookingProvider>{children}</BookingProvider>;
}

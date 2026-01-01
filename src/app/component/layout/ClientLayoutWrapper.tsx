"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Header from "./client/Header";
import Footer from "./client/Footer";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Nếu là admin route, chỉ render children với background trắng
  if (isAdminRoute) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        {children}
      </Box>
    );
  }

  // Nếu là client route, render với Header và Footer, background đen
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#000000" }}>
      <Header />
      <div className="min-h-[calc(100vh-64px)]">{children}</div>
      <Footer />
    </Box>
  );
}


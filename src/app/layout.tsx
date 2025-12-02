import React from "react";

import { Outfit } from "next/font/google";
import { Box } from "@mui/material";
import "./globals.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import Header from "./component/layout/client/Header";
import Footer from "./component/layout/client/Footer";
import { Metadata } from "next";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cinema Booking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Box sx={{ minHeight: '100vh' }}>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </Box>
      </body>
    </html>
  );
}

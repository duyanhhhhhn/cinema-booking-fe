import React from "react";
import { Outfit } from "next/font/google";
import "./globals.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ClientLayoutWrapper from "./component/layout/ClientLayoutWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalRouteGuard } from "@/guards";
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
      <body className={`${outfit.className} `}>
        <QueryProvider>
          <AuthProvider>
            <GlobalRouteGuard>
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </GlobalRouteGuard>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

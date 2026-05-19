import React from "react";
import { Outfit } from "next/font/google";
import "./globals.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Toaster as SonnerToaster } from "sonner";
import ClientLayoutWrapper from "./component/layout/ClientLayoutWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import StoreProvider from "@/providers/StoreProvider";
import { GlobalRouteGuard } from "@/guards";
import { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });


const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cinema Booking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html >
      <body className={`${beVietnamPro.className} `}>
        <QueryProvider>
          <StoreProvider>
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
                <SonnerToaster richColors closeButton position="top-right" />
              </GlobalRouteGuard>
            </AuthProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
